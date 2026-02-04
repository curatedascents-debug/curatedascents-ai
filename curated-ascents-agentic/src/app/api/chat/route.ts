// ============================================================
// FILE: src/app/api/chat/route.ts
// FULL REPLACEMENT — drop this in place of your current file.
// ============================================================
// Changes vs your current version:
//   1. Added sanitizeForClient() — strips cost, margin, costPer*
//      fields from every tool_result before it goes back to DeepSeek.
//      This is the ROOT CAUSE fix for pricing leakage.
//   2. Tightened the SYSTEM_PROMPT pricing rules with explicit
//      "you will never see cost/margin in tool results" instruction
//      so DeepSeek can't hallucinate those values.
//   3. Everything else (tool loop, fallback hints, error handling)
//      is unchanged.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { executeToolCall } from "@/lib/agents/tool-executor";
import { TOOL_DEFINITIONS } from "@/lib/agents/tool-definitions";
import { FALLBACK_SYSTEM_PROMPT } from "@/lib/agents/fallback-rate-research";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// ─── PRICING SANITISER ──────────────────────────────────────────────────────
// These are the exact field names your DB tables use for internal costs
// AND individual sell prices. All per-item pricing is confidential —
// clients should only see the total package price.
// Any field whose name matches (case-insensitive) is removed from the
// tool_result payload before DeepSeek ever sees it.
const SENSITIVE_FIELDS = [
  // Cost fields
  "cost",
  "costprice",
  "costperday",
  "costpertrip",
  "costperseat",
  "costpercharter",
  "costperunit",
  "basecost",
  "costsingle",
  "costdouble",
  "costtriple",
  "costextrabed",
  "costchildwithbed",
  "costchildnobed",
  // Margin fields
  "margin",
  "margin_percent",
  "marginpercent",
  "margin%",
  "totalcostprice",
  "totalmargin",
  "commissionpercent",
  "creditlimit",
  // Individual sell price fields (clients see only the total, not per-item)
  "sellprice",
  "sellsingle",
  "selldouble",
  "selltriple",
  "sellextrabed",
  "sellchildwithbed",
  "sellchildnobed",
  "sellperday",
  "sellperseat",
  "sellpercharter",
  "unitprice",
  "subtotal",
  "pricetiers",
  "pricingtiers",
  "singlesupplement",
];

/**
 * Recursively walks an object/array and deletes any key that matches
 * a sensitive field name.  Returns a new object — never mutates the original.
 */
function sanitizeForClient(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(sanitizeForClient);
  }

  if (typeof value === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) continue; // ← strip it
      clean[key] = sanitizeForClient(val); // ← recurse into nested objects
    }
    return clean;
  }

  // primitives pass through untouched
  return value;
}

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Expedition Architect for CuratedAscents, a luxury adventure travel company specializing in Nepal, Tibet, Bhutan, and India.

## Your Role
You help clients plan extraordinary journeys by:
- Understanding their travel preferences and requirements
- Searching our database for hotels, transportation, guides, packages, and services
- Providing accurate pricing from our supplier rates
- Creating customized itineraries

## Important Rules

### Pricing Rules (CRITICAL):
1. You will ONLY ever see SELL prices in tool results — cost and margin data has already been removed server-side.
2. Present all prices as the final package price. Do NOT invent or guess cost or margin figures.
3. For groups of 20+ people (MICE), mention that group discounts are available and suggest contacting the sales team for a tailored quote.
4. Never use phrases like "our cost is" or "we mark up by" — you don't have that data and must not fabricate it.
5. NEVER show per-service or per-item price breakdowns to the client. Only present the **total package price** and **per-person price**. List the services included by name, but do NOT attach individual prices to each service. The cost breakdown is confidential and for internal use only.

### When Searching:
1. Always search the database FIRST for any rate inquiries
2. Use the search_rates tool for hotels, transportation, guides, flights, helicopters, packages
3. Use search_hotels tool to find properties by location or category
4. If asked about specific prices, always query the database

### Communication Style:
- Be warm, professional, and knowledgeable
- Share your expertise about destinations
- Ask clarifying questions when needed (group size, dates, preferences)
- Suggest complementary services (guides, transportation, activities)

### Quote Building:
- When building quotes, use the calculate_quote tool
- Always confirm number of travelers and nights
- Mention what's included and excluded
- Offer to prepare a detailed proposal

${FALLBACK_SYSTEM_PROMPT}

## Destinations You Specialize In:
- **Nepal**: Kathmandu, Pokhara, Everest Region, Annapurna Region, Chitwan, Lumbini
- **Tibet**: Lhasa, Shigatse, Everest North, Mount Kailash
- **Bhutan**: Paro, Thimphu, Punakha, Bumthang
- **India**: Darjeeling, Sikkim, Ladakh, Varanasi

Remember: You're not just booking travel - you're crafting life-changing adventures!`;

// ─── MAIN HANDLER ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, conversationHistory = [] } = await req.json();

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured" },
        { status: 500 }
      );
    }

    // Build messages array with system prompt
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      ...messages,
    ];

    // Initial API call
    let response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: apiMessages,
        tools: TOOL_DEFINITIONS,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    let data = await response.json();
    let assistantMessage = data.choices[0].message;

    // ── Tool calling loop ─────────────────────────────────────────────────
    const maxIterations = 10;
    let iterations = 0;

    while (assistantMessage.tool_calls && iterations < maxIterations) {
      iterations++;

      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall: any) => {
          console.log(`Executing tool: ${toolCall.function.name}`);
          console.log(`Arguments: ${toolCall.function.arguments}`);

          try {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await executeToolCall(toolCall.function.name, args);

            // Parse result so we can inspect + sanitize it
            const resultData =
              typeof result === "string" ? JSON.parse(result) : result;

            // ── Sanitize: strip cost/margin before DeepSeek sees it ──────
            const sanitized = sanitizeForClient(resultData);

            // If no rates found, attach fallback hint (on the sanitized copy)
            if (
              (sanitized as any)?.rates &&
              Array.isArray((sanitized as any).rates) &&
              (sanitized as any).rates.length === 0
            ) {
              (sanitized as any).fallback_hint =
                "No rates found in database. Use your knowledge to provide approximate market rates. Clearly label as estimates and offer to get confirmed pricing.";
            }

            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: JSON.stringify(sanitized),
            };
          } catch (error) {
            console.error(`Tool execution error:`, error);
            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: JSON.stringify({
                error: "Tool execution failed",
                message:
                  error instanceof Error ? error.message : "Unknown error",
                fallback_hint:
                  "Database query failed. Use your knowledge to provide approximate market rates.",
              }),
            };
          }
        })
      );

      // Add assistant message and tool results to conversation
      apiMessages.push(assistantMessage);
      apiMessages.push(...toolResults);

      // Make another API call with tool results
      response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: apiMessages,
          tools: TOOL_DEFINITIONS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error in tool loop:", errorText);
        break;
      }

      data = await response.json();
      assistantMessage = data.choices[0].message;
    }

    // Return final response
    return NextResponse.json({
      message: assistantMessage.content,
      role: "assistant",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
