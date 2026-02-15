/**
 * Agency-specific AI Chat Processor
 * B2B chat for agencies with 20% margin pricing and per-service price visibility
 */

import { executeToolCall } from "@/lib/agents/tool-executor";
import { TOOL_DEFINITIONS } from "@/lib/agents/tool-definitions";
import { FALLBACK_SYSTEM_PROMPT } from "@/lib/agents/fallback-rate-research";
import { getRateDetails } from "@/lib/agents/database-tools";
import { db } from "@/db";
import {
  agencyMarginOverrides,
  quotes,
  bookings,
  clients,
} from "@/db/schema";
import { eq, and, isNull, or, lte, gte, sql } from "drizzle-orm";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// ─── AGENCY SYSTEM PROMPT ────────────────────────────────────────────────────
const AGENCY_SYSTEM_PROMPT = `You are the Expedition Architect for CuratedAscents, a luxury adventure travel company specializing in Nepal, Tibet, Bhutan, and India. You are currently assisting a B2B travel agency partner.

## Your Role
You help agency partners build customized travel packages for their clients by:
- Understanding their client's travel preferences and requirements
- Searching our database for hotels, transportation, guides, packages, and services
- Providing accurate total package pricing at wholesale/agency rates
- Creating detailed itineraries with included services that the agency can use to build their own client proposals

## Important Rules

### Pricing Rules (CRITICAL — MUST FOLLOW EXACTLY):
1. **NEVER show per-service, per-item, or per-night price breakdowns.** Do NOT attach individual prices to hotels, flights, guides, transport, permits, or any other service.
2. **ONLY present the total package price and per-person price.** For example: "14-day Nepal package for 4 travelers: **$3,200 per person** ($12,800 total) at agency wholesale rates."
3. List the services **included** by name (hotel names, activities, flights, guides, etc.) but NEVER put a dollar amount next to any individual service.
4. Do NOT create pricing tables, cost breakdowns, or itemized price lists. No "Hotel: $X", "Guide: $Y", "Flight: $Z" format.
5. Present prices as "agency wholesale rate" — the agency adds their own markup for their end clients.
6. Never use phrases like "our cost is" or "retail price is".
7. For groups of 20+ people (MICE), mention that additional group discounts may be available.
8. If tool results contain individual service prices, IGNORE them in your response. Only use the total from calculate_quote.

### Client Information:
1. Agencies book on behalf of their own clients. Always ask for the end-client's name and email when building quotes.
2. The agency is already authenticated — no need to collect agency details.

### When Searching:
1. Always search the database FIRST for any rate inquiries
2. Use the search_rates tool for hotels, transportation, guides, flights, helicopters, packages
3. Use search_hotels tool to find properties by location or category
4. If asked about specific prices, always query the database

### Communication Style:
- Be professional and efficient — agencies value speed and accuracy
- Provide detailed service descriptions with pricing
- Suggest complementary services and upsell opportunities
- Be transparent about inclusions and exclusions

### Quote Building:
- When building quotes, use the calculate_quote tool
- Always confirm number of travelers and nights
- Present ONLY the total package price and per-person price — no per-service pricing
- List what's included and excluded by service name (without prices)
- Offer to save the quote for the agency's records

### Language Rules:
1. Detect the language of the user's message and ALWAYS respond in that same language.
2. If the user switches language mid-conversation, switch with them immediately.
3. Keep tool calls (function names and arguments) in English — only your natural-language responses should be in the user's language.
4. All pricing rules and security constraints apply regardless of language.

${FALLBACK_SYSTEM_PROMPT}

## Destinations You Specialize In:
- **Nepal**: Kathmandu, Pokhara, Everest Region, Annapurna Region, Chitwan, Lumbini
- **Tibet**: Lhasa, Shigatse, Everest North, Mount Kailash
- **Bhutan**: Paro, Thimphu, Punakha, Bumthang
- **India**: Darjeeling, Sikkim, Ladakh, Varanasi

Remember: You're helping a professional travel agency build exceptional experiences for their clients!`;

// ─── AGENCY SANITIZATION ─────────────────────────────────────────────────────
// Strips raw cost and retail margin fields but preserves agency-calculated prices
const AGENCY_SENSITIVE_FIELDS = [
  // Cost fields
  "cost", "costprice", "costperday", "costpertrip", "costperseat",
  "costpercharter", "costperunit", "basecost", "costsingle", "costdouble",
  "costtriple", "costextrabed", "costchildwithbed", "costchildnobed",
  // Margin fields
  "margin", "margin_percent", "marginpercent", "margin%",
  "totalcostprice", "totalmargin",
  // Commission/credit fields
  "commissionpercent", "creditlimit",
  // Retail sell fields (agency gets agency prices, not retail)
  "sellprice", "sellsingle", "selldouble", "selltriple",
  "sellextrabed", "sellchildwithbed", "sellchildnobed",
  "sellperday", "sellperseat", "sellpercharter",
  "unitprice", "subtotal",
  "pricetiers", "pricingtiers", "singlesupplement",
];

function sanitizeForAgency(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(sanitizeForAgency);
  }

  if (typeof value === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (AGENCY_SENSITIVE_FIELDS.includes(key.toLowerCase())) continue;
      clean[key] = sanitizeForAgency(val);
    }
    return clean;
  }

  return value;
}

// ─── AGENCY MARGIN LOOKUP ────────────────────────────────────────────────────
const DEFAULT_AGENCY_MARGIN = 0.20; // 20%

async function getAgencyMarginMultiplier(
  agencyId: number,
  serviceType?: string
): Promise<number> {
  try {
    // Look for service-type-specific override first, then general override
    const overrides = await db
      .select({ marginPercent: agencyMarginOverrides.marginPercent })
      .from(agencyMarginOverrides)
      .where(
        and(
          eq(agencyMarginOverrides.agencyId, agencyId),
          serviceType
            ? or(
                eq(agencyMarginOverrides.serviceType, serviceType),
                isNull(agencyMarginOverrides.serviceType)
              )
            : isNull(agencyMarginOverrides.serviceType),
          or(
            isNull(agencyMarginOverrides.validFrom),
            lte(agencyMarginOverrides.validFrom, sql`CURRENT_DATE`)
          ),
          or(
            isNull(agencyMarginOverrides.validTo),
            gte(agencyMarginOverrides.validTo, sql`CURRENT_DATE`)
          )
        )
      )
      .limit(2);

    if (overrides.length > 0) {
      // Prefer service-type-specific override
      const specificOverride = serviceType
        ? overrides.find((o) => true) // first match (ordered by specificity from query)
        : overrides[0];
      if (specificOverride) {
        return parseFloat(specificOverride.marginPercent) / 100;
      }
    }

    return DEFAULT_AGENCY_MARGIN;
  } catch (error) {
    console.error("Error looking up agency margin:", error);
    return DEFAULT_AGENCY_MARGIN;
  }
}

// ─── AGENCY QUOTE CALCULATION ────────────────────────────────────────────────
// Reads cost fields and applies agency margin. Returns per-service itemized pricing.
async function calculateAgencyQuote(
  agencyId: number,
  params: {
    services: Array<{
      serviceType: string;
      serviceId: number;
      quantity?: number;
      nights?: number;
    }>;
    numberOfPax: number;
    numberOfRooms?: number;
    occupancyType?: string;
  }
) {
  const { services, numberOfPax, numberOfRooms, occupancyType = "double" } = params;

  try {
    const lineItems: Array<{
      serviceType: string;
      name: string;
      agencyRate: number;
      quantity: number;
      subtotal: number;
      unit: string;
    }> = [];
    let grandTotal = 0;

    for (const svc of services) {
      const detail = await getRateDetails({
        rateId: svc.serviceId,
        serviceType: svc.serviceType,
      });
      if (!detail) {
        lineItems.push({
          serviceType: svc.serviceType,
          name: `Service #${svc.serviceId} (not found)`,
          agencyRate: 0,
          quantity: 0,
          subtotal: 0,
          unit: "N/A",
        });
        continue;
      }

      const marginMultiplier =
        1 + (await getAgencyMarginMultiplier(agencyId, svc.serviceType));
      const qty = svc.quantity || 1;
      const nights = svc.nights || 1;

      let costPrice = 0;
      let agencyRate = 0;
      let subtotal = 0;
      let unit = "";
      let name = "";

      switch (svc.serviceType) {
        case "hotel": {
          costPrice =
            occupancyType === "single"
              ? parseFloat((detail as any).costSingle || "0")
              : parseFloat((detail as any).costDouble || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          const rooms =
            numberOfRooms ||
            Math.ceil(numberOfPax / (occupancyType === "single" ? 1 : 2));
          subtotal = agencyRate * rooms * nights;
          unit = "per room/night";
          name = `${(detail as any).roomType || "Hotel Room"}`;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: rooms * nights,
            subtotal,
            unit,
          });
          break;
        }
        case "guide":
        case "porter": {
          costPrice = parseFloat((detail as any).costPerDay || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          const days = svc.nights || 1;
          subtotal = agencyRate * qty * days;
          unit = "per day";
          name =
            (detail as any).guideType ||
            (detail as any).region ||
            svc.serviceType;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: qty * days,
            subtotal,
            unit,
          });
          break;
        }
        case "transportation": {
          costPrice = parseFloat((detail as any).costPrice || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          subtotal = agencyRate * qty;
          unit = "per vehicle";
          name = `${(detail as any).vehicleName || (detail as any).vehicleType}: ${(detail as any).routeFrom} → ${(detail as any).routeTo}`;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: qty,
            subtotal,
            unit,
          });
          break;
        }
        case "flight": {
          costPrice = parseFloat((detail as any).costPrice || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          subtotal = agencyRate * numberOfPax;
          unit = "per person";
          name = `${(detail as any).airlineName}: ${(detail as any).flightSector}`;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: numberOfPax,
            subtotal,
            unit,
          });
          break;
        }
        case "helicopter_sharing": {
          costPrice = parseFloat((detail as any).costPerSeat || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          subtotal = agencyRate * numberOfPax;
          unit = "per seat";
          name = (detail as any).routeName;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: numberOfPax,
            subtotal,
            unit,
          });
          break;
        }
        case "helicopter_charter": {
          costPrice = parseFloat((detail as any).costPerCharter || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          subtotal = agencyRate * qty;
          unit = "per charter";
          name = (detail as any).routeName;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: qty,
            subtotal,
            unit,
          });
          break;
        }
        case "permit": {
          costPrice = parseFloat((detail as any).costPrice || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          subtotal = agencyRate * numberOfPax;
          unit = "per person";
          name = (detail as any).name;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: numberOfPax,
            subtotal,
            unit,
          });
          break;
        }
        case "package": {
          costPrice = parseFloat((detail as any).costPrice || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          subtotal = agencyRate * numberOfPax;
          unit = "per person";
          name = (detail as any).name;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: numberOfPax,
            subtotal,
            unit,
          });
          break;
        }
        default: {
          costPrice = parseFloat((detail as any).costPrice || "0");
          agencyRate = Math.round(costPrice * marginMultiplier * 100) / 100;
          subtotal = agencyRate * qty;
          unit = "per unit";
          name = (detail as any).name || svc.serviceType;
          lineItems.push({
            serviceType: svc.serviceType,
            name,
            agencyRate,
            quantity: qty,
            subtotal,
            unit,
          });
        }
      }

      grandTotal += subtotal;
    }

    return {
      numberOfPax,
      occupancyType,
      servicesIncluded: lineItems,
      grandTotal: Math.round(grandTotal * 100) / 100,
      perPersonTotal:
        numberOfPax > 0
          ? Math.round((grandTotal / numberOfPax) * 100) / 100
          : 0,
      currency: "USD",
      note: "These are agency wholesale rates. Final pricing subject to availability confirmation.",
    };
  } catch (error) {
    console.error("Error calculating agency quote:", error);
    return {
      error: "Quote calculation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── AGENCY TOOL EXECUTOR ────────────────────────────────────────────────────
// Wraps standard executeToolCall with agency-specific overrides for pricing tools
async function agencyExecuteToolCall(
  agencyId: number,
  toolName: string,
  args: Record<string, any>
): Promise<string> {
  switch (toolName) {
    case "calculate_quote":
      return JSON.stringify(
        await calculateAgencyQuote(agencyId, {
          services: args.services as Array<{
            serviceType: string;
            serviceId: number;
            quantity?: number;
            nights?: number;
          }>,
          numberOfPax: args.numberOfPax as number,
          numberOfRooms: args.numberOfRooms as number | undefined,
          occupancyType: args.occupancyType as string | undefined,
        })
      );

    case "save_quote": {
      // Call standard saveQuote then update with agencyId
      const result = await executeToolCall(toolName, args);
      const parsed = JSON.parse(result);
      if (parsed.quoteId) {
        try {
          await db
            .update(quotes)
            .set({ agencyId })
            .where(eq(quotes.id, parsed.quoteId));
        } catch (err) {
          console.error("Failed to set agencyId on quote:", err);
        }
      }
      return result;
    }

    case "convert_quote_to_booking": {
      // Call standard conversion then update booking with agencyId
      const result = await executeToolCall(toolName, args);
      const parsed = JSON.parse(result);
      if (parsed.success && args.quoteNumber) {
        try {
          // Find the booking by quoteNumber to set agencyId
          const quoteResult = await db
            .select({ id: quotes.id })
            .from(quotes)
            .where(eq(quotes.quoteNumber, args.quoteNumber as string))
            .limit(1);
          if (quoteResult.length > 0) {
            await db
              .update(bookings)
              .set({ agencyId })
              .where(eq(bookings.quoteId, quoteResult[0].id));
          }
        } catch (err) {
          console.error("Failed to set agencyId on booking:", err);
        }
      }
      return result;
    }

    default:
      return executeToolCall(toolName, args);
  }
}

// ─── INTERFACES ──────────────────────────────────────────────────────────────
export interface AgencyChatParams {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  conversationHistory?: Array<{ role: string; content: string }>;
  agencyId: number;
  agencyUserId: number;
  agencyName: string;
  conversationId?: string;
}

export interface AgencyChatResult {
  success: boolean;
  response: string;
  error?: string;
}

// ─── MAIN PROCESSOR ─────────────────────────────────────────────────────────
export async function processAgencyChatMessage(
  params: AgencyChatParams
): Promise<AgencyChatResult> {
  const {
    messages,
    conversationHistory = [],
    agencyId,
    agencyName,
    conversationId,
  } = params;

  if (!DEEPSEEK_API_KEY) {
    return {
      success: false,
      response: "",
      error: "DeepSeek API key not configured",
    };
  }

  try {
    // Build agency-specific system prompt
    const systemPrompt = `${AGENCY_SYSTEM_PROMPT}\n\n## Agency Context\nYou are currently assisting **${agencyName}** (Agency ID: ${agencyId}). All quotes and bookings will be associated with this agency.`;

    const apiMessages: Array<
      { role: string; content: string } | Record<string, unknown>
    > = [
      { role: "system", content: systemPrompt },
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
      console.error("DeepSeek API error (agency):", errorText);
      return {
        success: false,
        response: "",
        error: "Failed to get AI response",
      };
    }

    let data = await response.json();
    let assistantMessage = data.choices[0].message;

    // Tool calling loop
    const maxIterations = 10;
    let iterations = 0;

    while (assistantMessage.tool_calls && iterations < maxIterations) {
      iterations++;

      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(
          async (toolCall: {
            id: string;
            function: { name: string; arguments: string };
          }) => {
            console.log(
              `[agency] Executing tool: ${toolCall.function.name}`
            );

            try {
              const args = JSON.parse(toolCall.function.arguments);
              const result = await agencyExecuteToolCall(
                agencyId,
                toolCall.function.name,
                args
              );

              const resultData =
                typeof result === "string" ? JSON.parse(result) : result;

              // Use agency sanitization — strips raw cost/margin but keeps agency prices
              const sanitized = sanitizeForAgency(resultData);

              if (
                (sanitized as Record<string, unknown>)?.rates &&
                Array.isArray(
                  (sanitized as Record<string, unknown>).rates
                ) &&
                (
                  (sanitized as Record<string, unknown>)
                    .rates as unknown[]
                ).length === 0
              ) {
                (sanitized as Record<string, unknown>).fallback_hint =
                  "No rates found in database. Use your knowledge to provide approximate market rates. Clearly label as estimates and offer to get confirmed pricing.";
              }

              return {
                tool_call_id: toolCall.id,
                role: "tool" as const,
                content: JSON.stringify(sanitized),
              };
            } catch (error) {
              console.error(`Tool execution error (agency):`, error);
              return {
                tool_call_id: toolCall.id,
                role: "tool" as const,
                content: JSON.stringify({
                  error: "Tool execution failed",
                  message:
                    error instanceof Error
                      ? error.message
                      : "Unknown error",
                  fallback_hint:
                    "Database query failed. Use your knowledge to provide approximate market rates.",
                }),
              };
            }
          }
        )
      );

      apiMessages.push(assistantMessage);
      apiMessages.push(...toolResults);

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
        console.error("DeepSeek API error in tool loop (agency):", errorText);
        break;
      }

      data = await response.json();
      assistantMessage = data.choices[0].message;
    }

    return {
      success: true,
      response: assistantMessage.content || "",
    };
  } catch (error) {
    console.error("[agency] Chat processing error:", error);
    return {
      success: false,
      response: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function isAIConfigured(): boolean {
  return !!DEEPSEEK_API_KEY;
}
