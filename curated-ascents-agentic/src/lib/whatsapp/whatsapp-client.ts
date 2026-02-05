/**
 * WhatsApp Business API Client
 * Wrapper for Meta Cloud API for WhatsApp Business
 */

import crypto from 'crypto';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

// Environment variables
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET;

// Types for WhatsApp API
export interface WhatsAppTextMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

export interface WhatsAppTemplateMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: TemplateComponent[];
  };
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: { link: string };
  document?: { link: string };
  video?: { link: string };
}

export interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: WebhookValue;
      field: string;
    }>;
  }>;
}

export interface WebhookValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile: {
      name: string;
    };
    wa_id: string;
  }>;
  messages?: Array<WebhookMessage>;
  statuses?: Array<WebhookStatus>;
}

export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  document?: {
    caption?: string;
    filename: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
    voice?: boolean;
  };
  video?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin?: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: {
      details: string;
    };
  }>;
}

/**
 * Verify webhook signature from Meta
 */
export function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature || !WHATSAPP_APP_SECRET) {
    console.warn('Missing signature or app secret for webhook verification');
    return false;
  }

  const signatureHash = signature.replace('sha256=', '');
  const expectedHash = crypto
    .createHmac('sha256', WHATSAPP_APP_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signatureHash),
    Buffer.from(expectedHash)
  );
}

/**
 * Verify webhook challenge for Meta webhook registration
 */
export function verifyWebhookChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null
): { valid: boolean; challenge?: string } {
  if (mode === 'subscribe' && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return { valid: true, challenge: challenge || '' };
  }
  return { valid: false };
}

/**
 * Send a text message via WhatsApp
 */
export async function sendTextMessage(
  to: string,
  text: string
): Promise<WhatsAppMessageResponse | null> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp configuration missing');
    return null;
  }

  const message: WhatsAppTextMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: true,
      body: text,
    },
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API error:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return null;
  }
}

/**
 * Send a template message via WhatsApp
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components?: TemplateComponent[]
): Promise<WhatsAppMessageResponse | null> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp configuration missing');
    return null;
  }

  const message: WhatsAppTemplateMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      ...(components && { components }),
    },
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API error:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send WhatsApp template message:', error);
    return null;
  }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp configuration missing');
    return false;
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    return false;
  }
}

/**
 * Get media URL from media ID
 */
export async function getMediaUrl(mediaId: string): Promise<string | null> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp access token missing');
    return null;
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${mediaId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to get media URL:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Failed to get media URL:', error);
    return null;
  }
}

/**
 * Download media from URL (requires auth token)
 */
export async function downloadMedia(mediaUrl: string): Promise<Buffer | null> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp access token missing');
    return null;
  }

  try {
    const response = await fetch(mediaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to download media:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Failed to download media:', error);
    return null;
  }
}

/**
 * Extract message details from webhook payload
 */
export function parseWebhookPayload(payload: WhatsAppWebhookPayload): {
  messages: Array<{
    from: string;
    fromName: string;
    messageId: string;
    timestamp: Date;
    type: string;
    text?: string;
    mediaId?: string;
    mediaType?: string;
    caption?: string;
  }>;
  statuses: Array<{
    messageId: string;
    status: string;
    timestamp: Date;
    recipientId: string;
    errorCode?: string;
    errorMessage?: string;
  }>;
} {
  const result: {
    messages: Array<{
      from: string;
      fromName: string;
      messageId: string;
      timestamp: Date;
      type: string;
      text?: string;
      mediaId?: string;
      mediaType?: string;
      caption?: string;
    }>;
    statuses: Array<{
      messageId: string;
      status: string;
      timestamp: Date;
      recipientId: string;
      errorCode?: string;
      errorMessage?: string;
    }>;
  } = {
    messages: [],
    statuses: [],
  };

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;

      // Process messages
      if (value.messages) {
        for (const msg of value.messages) {
          const contact = value.contacts?.find(c => c.wa_id === msg.from);

          const parsedMessage: {
            from: string;
            fromName: string;
            messageId: string;
            timestamp: Date;
            type: string;
            text?: string;
            mediaId?: string;
            mediaType?: string;
            caption?: string;
          } = {
            from: msg.from,
            fromName: contact?.profile?.name || '',
            messageId: msg.id,
            timestamp: new Date(parseInt(msg.timestamp) * 1000),
            type: msg.type,
          };

          // Extract content based on type
          if (msg.type === 'text' && msg.text) {
            parsedMessage.text = msg.text.body;
          } else if (msg.type === 'image' && msg.image) {
            parsedMessage.mediaId = msg.image.id;
            parsedMessage.mediaType = msg.image.mime_type;
            parsedMessage.caption = msg.image.caption;
          } else if (msg.type === 'document' && msg.document) {
            parsedMessage.mediaId = msg.document.id;
            parsedMessage.mediaType = msg.document.mime_type;
            parsedMessage.caption = msg.document.caption;
          } else if (msg.type === 'audio' && msg.audio) {
            parsedMessage.mediaId = msg.audio.id;
            parsedMessage.mediaType = msg.audio.mime_type;
          } else if (msg.type === 'video' && msg.video) {
            parsedMessage.mediaId = msg.video.id;
            parsedMessage.mediaType = msg.video.mime_type;
            parsedMessage.caption = msg.video.caption;
          } else if (msg.type === 'interactive' && msg.interactive) {
            // Handle button replies
            if (msg.interactive.button_reply) {
              parsedMessage.text = msg.interactive.button_reply.title;
            } else if (msg.interactive.list_reply) {
              parsedMessage.text = msg.interactive.list_reply.title;
            }
          }

          result.messages.push(parsedMessage);
        }
      }

      // Process status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          result.statuses.push({
            messageId: status.id,
            status: status.status,
            timestamp: new Date(parseInt(status.timestamp) * 1000),
            recipientId: status.recipient_id,
            errorCode: status.errors?.[0]?.code?.toString(),
            errorMessage: status.errors?.[0]?.message,
          });
        }
      }
    }
  }

  return result;
}

/**
 * Check if WhatsApp is configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(
    WHATSAPP_PHONE_NUMBER_ID &&
    WHATSAPP_ACCESS_TOKEN &&
    WHATSAPP_WEBHOOK_VERIFY_TOKEN
  );
}
