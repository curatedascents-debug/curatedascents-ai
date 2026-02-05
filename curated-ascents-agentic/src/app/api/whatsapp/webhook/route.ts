/**
 * WhatsApp Webhook API Route
 * Handles Meta webhook verification and incoming messages
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookChallenge,
  verifyWebhookSignature,
  isWhatsAppConfigured,
  type WhatsAppWebhookPayload,
} from '@/lib/whatsapp/whatsapp-client';
import { processWebhookPayload } from '@/lib/whatsapp/message-processor';

/**
 * GET - Webhook Verification (Meta challenge-response)
 * Meta sends a GET request to verify the webhook URL during setup
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('[WhatsApp Webhook] Verification request:', { mode, token: token?.slice(0, 5) + '...' });

  const result = verifyWebhookChallenge(mode, token, challenge);

  if (result.valid) {
    console.log('[WhatsApp Webhook] Verification successful');
    // Return the challenge as plain text
    return new NextResponse(result.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[WhatsApp Webhook] Verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST - Incoming Webhooks (messages and status updates)
 * Returns 200 immediately, processes async
 */
export async function POST(req: NextRequest) {
  // Check if WhatsApp is configured
  if (!isWhatsAppConfigured()) {
    console.warn('[WhatsApp Webhook] WhatsApp not configured, ignoring webhook');
    return NextResponse.json({ status: 'not_configured' }, { status: 200 });
  }

  // Get raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  // Verify webhook signature (optional but recommended)
  // Note: In production, you should verify the signature
  // For development, we'll log a warning but continue
  if (process.env.WHATSAPP_APP_SECRET) {
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[WhatsApp Webhook] Invalid signature - proceeding anyway for dev');
      // In production, you might want to reject:
      // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  // Parse the payload
  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error('[WhatsApp Webhook] Failed to parse payload:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Log the webhook (for debugging)
  console.log('[WhatsApp Webhook] Received:', JSON.stringify(payload, null, 2).slice(0, 500));

  // Verify this is a WhatsApp webhook
  if (payload.object !== 'whatsapp_business_account') {
    console.log('[WhatsApp Webhook] Not a WhatsApp webhook, ignoring');
    return NextResponse.json({ status: 'ignored' }, { status: 200 });
  }

  // Process async - return 200 immediately to acknowledge receipt
  // This is important! Meta expects a quick response
  processWebhookAsync(payload);

  return NextResponse.json({ status: 'received' }, { status: 200 });
}

/**
 * Process webhook payload asynchronously
 * This runs after we've returned 200 to Meta
 */
async function processWebhookAsync(payload: WhatsAppWebhookPayload): Promise<void> {
  try {
    const result = await processWebhookPayload(payload);

    if (result.success) {
      console.log(
        `[WhatsApp Webhook] Processed ${result.messages.length} messages successfully`
      );
    } else {
      console.error(
        `[WhatsApp Webhook] Processing had errors:`,
        result.errors
      );
    }

    // Log processed messages
    for (const msg of result.messages) {
      console.log(
        `[WhatsApp] From: ${msg.from}, Text: "${msg.text?.slice(0, 50)}...", ` +
          `AI Response: ${msg.aiResponse ? 'sent' : 'none'}`
      );
    }
  } catch (error) {
    console.error('[WhatsApp Webhook] Async processing failed:', error);
  }
}
