/**
 * Shared AI Chat Processor
 * Core chat logic used by both web chat and WhatsApp channels
 */

import { executeToolCall } from "@/lib/agents/tool-executor";
import { TOOL_DEFINITIONS } from "@/lib/agents/tool-definitions";
import { FALLBACK_SYSTEM_PROMPT } from "@/lib/agents/fallback-rate-research";
import { processConversationForScoring } from "@/lib/lead-intelligence/scoring-engine";
import {
  loadClientProfile,
  loadConversationMemory,
  saveConversationMessage,
  buildPersonalizedSystemPrompt,
} from "@/lib/agents/expedition-architect-enhanced";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// ─── PRICING SANITISER ──────────────────────────────────────────────────────
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
  // Individual sell price fields
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
 * Recursively sanitize sensitive fields from objects
 */
function sanitizeForClient(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(sanitizeForClient);
  }

  if (typeof value === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) continue;
      clean[key] = sanitizeForClient(val);
    }
    return clean;
  }

  return value;
}

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are the Expedition Architect for CuratedAscents, a luxury adventure travel company specializing in Nepal, Tibet, Bhutan, and India.

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

### Language Rules:
1. Detect the language of the user's message and ALWAYS respond in that same language.
2. If the user switches language mid-conversation, switch with them immediately.
3. Keep tool calls (function names and arguments) in English — only your natural-language responses should be in the user's language.
4. Use number/date formatting conventions appropriate to the user's language and locale.
5. If you cannot determine the language from the first message, default to English.
6. All pricing rules and security constraints apply regardless of language. NEVER reveal cost, margin, or internal pricing data in ANY language.

${FALLBACK_SYSTEM_PROMPT}

## Destinations You Specialize In:
- **Nepal**: Kathmandu, Pokhara, Everest Region, Annapurna Region, Chitwan, Lumbini
- **Tibet**: Lhasa, Shigatse, Everest North, Mount Kailash
- **Bhutan**: Paro, Thimphu, Punakha, Bumthang
- **India**: Darjeeling, Sikkim, Ladakh, Varanasi

Remember: You're not just booking travel - you're crafting life-changing adventures!`;

// WhatsApp-specific additions to the system prompt
const WHATSAPP_PROMPT_ADDITIONS = `

## WhatsApp Communication Guidelines:
- Keep responses concise and mobile-friendly
- Use bullet points for lists
- Break long responses into digestible paragraphs
- Avoid excessive formatting - WhatsApp has limited markdown
- If sharing links, put them on their own line
- Offer to send detailed quotes via email when appropriate`;

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatProcessorParams {
  messages: Message[];
  conversationHistory?: Message[];
  clientId?: number;
  conversationId?: string;
  source: "web" | "whatsapp";
}

export interface ChatProcessorResult {
  success: boolean;
  response: string;
  error?: string;
}

// ─── LANGUAGE DETECTION ─────────────────────────────────────────────────────
/**
 * Detect non-Latin scripts using Unicode ranges.
 * Returns a BCP 47 language hint or null for Latin/unknown scripts.
 */
function detectLanguageScript(text: string): string | null {
  // Strip whitespace and punctuation for analysis
  const cleaned = text.replace(/[\s\p{P}\p{S}\d]/gu, "");
  if (cleaned.length === 0) return null;

  const scriptTests: Array<{ pattern: RegExp; lang: string }> = [
    { pattern: /[\u0900-\u097F]/u, lang: "hi" },       // Devanagari (Hindi/Nepali)
    { pattern: /[\u4E00-\u9FFF]/u, lang: "zh" },       // CJK Unified (Chinese)
    { pattern: /[\u3040-\u309F\u30A0-\u30FF]/u, lang: "ja" }, // Hiragana + Katakana (Japanese)
    { pattern: /[\uAC00-\uD7AF]/u, lang: "ko" },       // Hangul (Korean)
    { pattern: /[\u0600-\u06FF]/u, lang: "ar" },       // Arabic
    { pattern: /[\u0400-\u04FF]/u, lang: "ru" },       // Cyrillic (Russian default)
    { pattern: /[\u0E00-\u0E7F]/u, lang: "th" },       // Thai
    { pattern: /[\u0980-\u09FF]/u, lang: "bn" },       // Bengali
    { pattern: /[\u0A80-\u0AFF]/u, lang: "gu" },       // Gujarati
    { pattern: /[\u0B80-\u0BFF]/u, lang: "ta" },       // Tamil
    { pattern: /[\u0C00-\u0C7F]/u, lang: "te" },       // Telugu
    { pattern: /[\u0C80-\u0CFF]/u, lang: "kn" },       // Kannada
    { pattern: /[\u0D00-\u0D7F]/u, lang: "ml" },       // Malayalam
    { pattern: /[\u0A00-\u0A7F]/u, lang: "pa" },       // Gurmukhi (Punjabi)
    { pattern: /[\u1200-\u137F]/u, lang: "am" },       // Ethiopic (Amharic)
    { pattern: /[\u0D80-\u0DFF]/u, lang: "si" },       // Sinhala
    { pattern: /[\u1000-\u109F]/u, lang: "my" },       // Myanmar (Burmese)
    { pattern: /[\u0F00-\u0FFF]/u, lang: "bo" },       // Tibetan
  ];

  for (const { pattern, lang } of scriptTests) {
    if (pattern.test(cleaned)) return lang;
  }

  return null; // Latin or undetermined
}

/**
 * Process a chat message through the AI
 */
export async function processChatMessage(
  params: ChatProcessorParams
): Promise<ChatProcessorResult> {
  const { messages, conversationHistory = [], clientId, conversationId, source } = params;

  if (!DEEPSEEK_API_KEY) {
    return {
      success: false,
      response: "",
      error: "DeepSeek API key not configured",
    };
  }

  try {
    // ── Lead scoring (non-blocking) ─────────────────────────────────────────
    if (clientId && messages.length > 0) {
      const latestUserMessage = messages[messages.length - 1];
      if (latestUserMessage.role === "user" && latestUserMessage.content) {
        processConversationForScoring(
          clientId,
          latestUserMessage.content,
          conversationId
        ).catch((err) => console.error("Lead scoring failed:", err));

        saveConversationMessage(clientId, {
          role: "user",
          content: latestUserMessage.content,
        }).catch((err) => console.error("Failed to save message:", err));

        // Detect non-English language and update client locale
        const detectedLang = detectLanguageScript(latestUserMessage.content);
        if (detectedLang && detectedLang !== "en") {
          db.update(clients)
            .set({ locale: detectedLang })
            .where(eq(clients.id, clientId))
            .catch((err) => console.error("Failed to update client locale:", err));
        }
      }
    }

    // ── Build system prompt ─────────────────────────────────────────────────
    let systemPrompt = BASE_SYSTEM_PROMPT;

    // Add WhatsApp-specific guidelines
    if (source === "whatsapp") {
      systemPrompt += WHATSAPP_PROMPT_ADDITIONS;
    }

    // Personalize with client data
    if (clientId) {
      try {
        const [clientProfile, conversationMemory] = await Promise.all([
          loadClientProfile(clientId),
          loadConversationMemory(clientId, conversationId),
        ]);

        systemPrompt = buildPersonalizedSystemPrompt(
          systemPrompt,
          clientProfile,
          conversationMemory
        );

        console.log(
          `[${source}] Loaded profile for client ${clientId}:`,
          clientProfile?.name || "Unknown",
          `Score: ${clientProfile?.leadScore?.score || "N/A"}`
        );
      } catch (err) {
        console.error("Failed to load client profile:", err);
      }
    }

    // Build messages array
    const apiMessages: Array<{ role: string; content: string } | Record<string, unknown>> = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      ...messages,
    ];

    // ── Initial API call ────────────────────────────────────────────────────
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
        max_tokens: source === "whatsapp" ? 1500 : 2000, // Shorter for WhatsApp
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      return {
        success: false,
        response: "",
        error: "Failed to get AI response",
      };
    }

    let data = await response.json();
    let assistantMessage = data.choices[0].message;

    // ── Tool calling loop ───────────────────────────────────────────────────
    const maxIterations = 10;
    let iterations = 0;

    while (assistantMessage.tool_calls && iterations < maxIterations) {
      iterations++;

      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall: { id: string; function: { name: string; arguments: string } }) => {
          console.log(`[${source}] Executing tool: ${toolCall.function.name}`);

          try {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await executeToolCall(toolCall.function.name, args);

            const resultData =
              typeof result === "string" ? JSON.parse(result) : result;

            const sanitized = sanitizeForClient(resultData);

            if (
              (sanitized as Record<string, unknown>)?.rates &&
              Array.isArray((sanitized as Record<string, unknown>).rates) &&
              ((sanitized as Record<string, unknown>).rates as unknown[]).length === 0
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
            console.error(`Tool execution error:`, error);
            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: JSON.stringify({
                error: "Tool execution failed",
                message: error instanceof Error ? error.message : "Unknown error",
                fallback_hint:
                  "Database query failed. Use your knowledge to provide approximate market rates.",
              }),
            };
          }
        })
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
          max_tokens: source === "whatsapp" ? 1500 : 2000,
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

    // Save assistant response
    if (clientId && assistantMessage.content) {
      saveConversationMessage(clientId, {
        role: "assistant",
        content: assistantMessage.content,
      }).catch((err) => console.error("Failed to save assistant message:", err));
    }

    return {
      success: true,
      response: assistantMessage.content || "",
    };
  } catch (error) {
    console.error(`[${source}] Chat processing error:`, error);
    return {
      success: false,
      response: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Simple message processing for WhatsApp
 * Wraps processChatMessage with WhatsApp defaults
 */
export async function processWhatsAppMessage(
  userMessage: string,
  clientId?: number,
  conversationHistory: Message[] = []
): Promise<ChatProcessorResult> {
  return processChatMessage({
    messages: [{ role: "user", content: userMessage }],
    conversationHistory,
    clientId,
    source: "whatsapp",
  });
}

/**
 * Check if API is configured
 */
export function isAIConfigured(): boolean {
  return !!DEEPSEEK_API_KEY;
}
