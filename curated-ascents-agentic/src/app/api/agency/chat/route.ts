/**
 * Agency Chat API Route
 * Protected by existing agency middleware — no additional auth needed
 */

import { NextRequest, NextResponse } from "next/server";
import {
  processAgencyChatMessage,
  isAIConfigured,
} from "@/lib/agents/agency-chat-processor";

export async function POST(req: NextRequest) {
  try {
    // Read agency context from middleware-injected headers
    const agencyId = req.headers.get("x-agency-id");
    const agencyUserId = req.headers.get("x-agency-user-id");
    const agencyName = req.headers.get("x-agency-name");

    if (!agencyId || !agencyUserId) {
      return NextResponse.json(
        { error: "Agency authentication required" },
        { status: 401 }
      );
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured" },
        { status: 500 }
      );
    }

    const { messages, conversationHistory = [], conversationId } =
      await req.json();

    const result = await processAgencyChatMessage({
      messages,
      conversationHistory,
      agencyId: parseInt(agencyId, 10),
      agencyUserId: parseInt(agencyUserId, 10),
      agencyName: agencyName || "Agency Partner",
      conversationId,
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
    console.error("Agency chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
