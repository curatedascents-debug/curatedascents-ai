/**
 * Web Chat API Route
 * Uses the shared chat processor for AI conversation handling
 */

import { NextRequest, NextResponse } from "next/server";
import { processChatMessage, isAIConfigured } from "@/lib/agents/chat-processor";

export async function POST(req: NextRequest) {
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
