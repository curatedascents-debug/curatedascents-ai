/**
 * WhatsApp Send Message API Route
 * Allows sending outbound messages to WhatsApp users
 */

import { NextRequest, NextResponse } from 'next/server';
import { isWhatsAppConfigured } from '@/lib/whatsapp/whatsapp-client';
import { sendMessage, sendMessageToPhone } from '@/lib/whatsapp/message-sender';

export async function POST(req: NextRequest) {
  try {
    // Check if WhatsApp is configured
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        { error: 'WhatsApp not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { conversationId, phoneNumber, message, templateName, templateVariables } = body;

    // Validate input
    if (!message && !templateName) {
      return NextResponse.json(
        { error: 'Either message or templateName is required' },
        { status: 400 }
      );
    }

    if (!conversationId && !phoneNumber) {
      return NextResponse.json(
        { error: 'Either conversationId or phoneNumber is required' },
        { status: 400 }
      );
    }

    let result;

    if (conversationId) {
      // Send to existing conversation
      result = await sendMessage(conversationId, message || '', {
        forceTemplate: !!templateName,
        templateName,
        templateVariables,
      });
    } else {
      // Send to phone number (will create conversation if needed)
      result = await sendMessageToPhone(phoneNumber, message || '', {
        forceTemplate: !!templateName,
        templateName,
        templateVariables,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageIds: result.messageIds,
      chunksCount: result.chunksCount,
      usedTemplate: result.usedTemplate,
    });
  } catch (error) {
    console.error('[WhatsApp Send] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
