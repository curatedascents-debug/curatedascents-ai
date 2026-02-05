/**
 * Admin WhatsApp Conversation Detail API
 * Get conversation details and messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConversation, getConversationMessages } from '@/lib/whatsapp/message-processor';
import { checkSessionStatus, formatRemainingTime } from '@/lib/whatsapp/session-manager';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - Get conversation detail with messages
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get conversation details
    const conversation = await getConversation(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get session status
    const sessionStatus = await checkSessionStatus(conversationId);

    // Get messages
    const messages = await getConversationMessages(conversationId, limit, offset);

    return NextResponse.json({
      conversation: {
        ...conversation,
        session: {
          isActive: sessionStatus.isActive,
          remainingTime: formatRemainingTime(sessionStatus.remainingMs),
          requiresTemplate: sessionStatus.requiresTemplate,
          windowStart: sessionStatus.windowStart,
          windowEnd: sessionStatus.windowEnd,
        },
      },
      messages,
    });
  } catch (error) {
    console.error('[Admin WhatsApp] Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
