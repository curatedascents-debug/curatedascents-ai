/**
 * Web Chat API Route
 * Uses the shared chat processor for AI conversation handling
 */

import { NextRequest, NextResponse } from "next/server";
import { processChatMessage, isAIConfigured } from "@/lib/agents/chat-processor";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  // Rate limit: 20 requests/minute per IP
  const minuteLimit = rateLimit(req, { window: 60, max: 20, identifier: "chat-min" });
  if (!minuteLimit.success) {
    return rateLimitResponse(
      minuteLimit,
      "Our expedition architect is taking a brief rest. Please try again in a moment, or call us at +1-715-505-4964."
    );
  }

  // Rate limit: 100 requests/day per IP
  const dailyLimit = rateLimit(req, { window: 86400, max: 100, identifier: "chat-day" });
  if (!dailyLimit.success) {
    return rateLimitResponse(
      dailyLimit,
      "You\u2019ve reached the daily chat limit. Please call us at +1-715-505-4964 or try again tomorrow."
    );
  }

  try {
    const { messages, conversationHistory = [], clientId, conversationId } = await req.json();

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured" },
        { status: 500 }
      );
    }

    const result = await processChatMessage({
      messages,
      conversationHistory,
      clientId,
      conversationId,
      source: "web",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: result.response,
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
