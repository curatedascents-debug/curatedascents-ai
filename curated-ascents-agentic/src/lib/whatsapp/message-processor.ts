/**
 * WhatsApp Message Processor
 * Handles incoming messages, creates conversations, and orchestrates AI responses
 */

import { db } from '@/db';
import { whatsappConversations, whatsappMessages, clients } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { processWhatsAppMessage, type Message } from '@/lib/agents/chat-processor';
import { startOrRefreshSession } from './session-manager';
import { autoLinkConversation, createClientFromWhatsApp } from './client-linker';
import { sendAIResponse } from './message-sender';
import { markMessageAsRead, type WhatsAppWebhookPayload, parseWebhookPayload } from './whatsapp-client';

export interface ProcessedMessage {
  conversationId: number;
  messageId: number;
  from: string;
  text: string;
  aiResponse: string | null;
  clientId: number | null;
}

export interface ProcessResult {
  success: boolean;
  messages: ProcessedMessage[];
  errors: string[];
}

/**
 * Process incoming webhook payload from Meta
 */
export async function processWebhookPayload(
  payload: WhatsAppWebhookPayload
): Promise<ProcessResult> {
  const result: ProcessResult = {
    success: true,
    messages: [],
    errors: [],
  };

  try {
    const parsed = parseWebhookPayload(payload);

    // Process status updates first
    for (const status of parsed.statuses) {
      await updateMessageStatus(status.messageId, status.status, {
        errorCode: status.errorCode,
        errorMessage: status.errorMessage,
      });
    }

    // Process incoming messages
    for (const msg of parsed.messages) {
      try {
        const processed = await processIncomingMessage(
          msg.from,
          msg.fromName,
          msg.messageId,
          msg.type,
          msg.text,
          msg.mediaId,
          msg.mediaType,
          msg.caption
        );

        result.messages.push(processed);
      } catch (error) {
        console.error(`Error processing message from ${msg.from}:`, error);
        result.errors.push(
          `Failed to process message ${msg.messageId}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    console.error('Error processing webhook payload:', error);
    result.success = false;
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  return result;
}

/**
 * Process a single incoming message
 */
async function processIncomingMessage(
  from: string,
  fromName: string,
  whatsappMessageId: string,
  messageType: string,
  text?: string,
  mediaId?: string,
  mediaType?: string,
  caption?: string
): Promise<ProcessedMessage> {
  // 1. Find or create conversation
  const conversation = await findOrCreateConversation(from, fromName);

  // 2. Record the incoming message
  const [message] = await db
    .insert(whatsappMessages)
    .values({
      conversationId: conversation.id,
      whatsappMessageId,
      direction: 'inbound',
      messageType,
      content: text || caption,
      mediaId,
      mediaType,
      mediaCaption: caption,
      status: 'delivered',
    })
    .returning({ id: whatsappMessages.id });

  // 3. Update conversation stats
  await db
    .update(whatsappConversations)
    .set({
      messageCount: sql`${whatsappConversations.messageCount} + 1`,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(whatsappConversations.id, conversation.id));

  // 4. Refresh the session window (24-hour timer)
  await startOrRefreshSession(conversation.id);

  // 5. Mark message as read (non-blocking)
  markMessageAsRead(whatsappMessageId).catch((err) =>
    console.error('Failed to mark message as read:', err)
  );

  // 6. Get AI response (for text messages only)
  let aiResponse: string | null = null;

  if (messageType === 'text' && text) {
    // Load conversation history for context
    const history = await loadConversationHistory(conversation.id);

    // Process through AI
    const aiResult = await processWhatsAppMessage(
      text,
      conversation.clientId || undefined,
      history
    );

    if (aiResult.success && aiResult.response) {
      aiResponse = aiResult.response;

      // Send the response
      await sendAIResponse(conversation.id, aiResponse);
    }
  } else if (messageType === 'image' || messageType === 'document') {
    // Acknowledge media messages through AI so it respects the user's language
    const history = await loadConversationHistory(conversation.id);
    const mediaPrompt = `[The user sent a ${messageType}. Briefly acknowledge it and ask how you can help with their travel plans.]`;
    const aiResult = await processWhatsAppMessage(
      mediaPrompt,
      conversation.clientId || undefined,
      history
    );
    if (aiResult.success && aiResult.response) {
      aiResponse = aiResult.response;
    } else {
      aiResponse = "Thank you for sharing that. How can I help with your travel plans?";
    }
    await sendAIResponse(conversation.id, aiResponse);
  }

  return {
    conversationId: conversation.id,
    messageId: message.id,
    from,
    text: text || caption || '',
    aiResponse,
    clientId: conversation.clientId,
  };
}

/**
 * Find or create a conversation for a phone number
 */
async function findOrCreateConversation(
  phoneNumber: string,
  displayName: string
): Promise<{
  id: number;
  clientId: number | null;
  isNew: boolean;
}> {
  // Check if conversation exists
  const [existing] = await db
    .select({
      id: whatsappConversations.id,
      clientId: whatsappConversations.clientId,
    })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.whatsappPhoneNumber, phoneNumber))
    .limit(1);

  if (existing) {
    // Update display name if changed
    if (displayName) {
      await db
        .update(whatsappConversations)
        .set({
          whatsappDisplayName: displayName,
          updatedAt: new Date(),
        })
        .where(eq(whatsappConversations.id, existing.id));
    }

    return {
      id: existing.id,
      clientId: existing.clientId,
      isNew: false,
    };
  }

  // Create new conversation
  const [newConversation] = await db
    .insert(whatsappConversations)
    .values({
      whatsappPhoneNumber: phoneNumber,
      whatsappDisplayName: displayName,
      isSessionActive: true,
      sessionWindowStart: new Date(),
      messageCount: 0,
    })
    .returning({
      id: whatsappConversations.id,
    });

  // Try to auto-link to existing client
  const linkResult = await autoLinkConversation(newConversation.id, phoneNumber);

  let clientId: number | null = null;

  if (linkResult.linked && linkResult.clientId) {
    clientId = linkResult.clientId;
  } else {
    // Create new client if no match found
    const createResult = await createClientFromWhatsApp(phoneNumber, displayName);
    if (createResult.success && createResult.clientId) {
      clientId = createResult.clientId;

      // Link conversation to new client
      await db
        .update(whatsappConversations)
        .set({ clientId })
        .where(eq(whatsappConversations.id, newConversation.id));
    }
  }

  return {
    id: newConversation.id,
    clientId,
    isNew: true,
  };
}

/**
 * Load conversation history for AI context
 */
async function loadConversationHistory(
  conversationId: number,
  limit: number = 20
): Promise<Message[]> {
  const messages = await db
    .select({
      direction: whatsappMessages.direction,
      content: whatsappMessages.content,
      aiResponse: whatsappMessages.aiResponse,
    })
    .from(whatsappMessages)
    .where(eq(whatsappMessages.conversationId, conversationId))
    .orderBy(whatsappMessages.createdAt)
    .limit(limit);

  const history: Message[] = [];

  for (const msg of messages) {
    if (msg.direction === 'inbound' && msg.content) {
      history.push({ role: 'user', content: msg.content });
      // Add AI response if available
      if (msg.aiResponse) {
        history.push({ role: 'assistant', content: msg.aiResponse });
      }
    } else if (msg.direction === 'outbound' && msg.content) {
      // Only add if not already added as aiResponse
      const lastMsg = history[history.length - 1];
      if (!lastMsg || lastMsg.content !== msg.content) {
        history.push({ role: 'assistant', content: msg.content });
      }
    }
  }

  // Return only the last N messages to fit context window
  return history.slice(-limit);
}

/**
 * Update message status from webhook
 */
async function updateMessageStatus(
  whatsappMessageId: string,
  status: string,
  errorInfo?: { errorCode?: string; errorMessage?: string }
): Promise<void> {
  const statusTimestampField =
    status === 'sent'
      ? { sentAt: new Date() }
      : status === 'delivered'
      ? { deliveredAt: new Date() }
      : status === 'read'
      ? { readAt: new Date() }
      : {};

  await db
    .update(whatsappMessages)
    .set({
      status,
      ...statusTimestampField,
      ...(errorInfo?.errorCode && { errorCode: errorInfo.errorCode }),
      ...(errorInfo?.errorMessage && { errorMessage: errorInfo.errorMessage }),
    })
    .where(eq(whatsappMessages.whatsappMessageId, whatsappMessageId));
}

/**
 * Get conversation details by ID
 */
export async function getConversation(conversationId: number): Promise<{
  id: number;
  phoneNumber: string;
  displayName: string | null;
  clientId: number | null;
  clientName: string | null;
  clientEmail: string | null;
  messageCount: number;
  isSessionActive: boolean;
  lastMessageAt: Date | null;
} | null> {
  const [conversation] = await db
    .select({
      id: whatsappConversations.id,
      phoneNumber: whatsappConversations.whatsappPhoneNumber,
      displayName: whatsappConversations.whatsappDisplayName,
      clientId: whatsappConversations.clientId,
      messageCount: whatsappConversations.messageCount,
      isSessionActive: whatsappConversations.isSessionActive,
      lastMessageAt: whatsappConversations.lastMessageAt,
    })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.id, conversationId))
    .limit(1);

  if (!conversation) return null;

  // Get client info if linked
  let clientName: string | null = null;
  let clientEmail: string | null = null;

  if (conversation.clientId) {
    const [client] = await db
      .select({
        name: clients.name,
        email: clients.email,
      })
      .from(clients)
      .where(eq(clients.id, conversation.clientId))
      .limit(1);

    if (client) {
      clientName = client.name;
      clientEmail = client.email;
    }
  }

  return {
    id: conversation.id,
    phoneNumber: conversation.phoneNumber,
    displayName: conversation.displayName,
    clientId: conversation.clientId,
    messageCount: conversation.messageCount ?? 0,
    isSessionActive: conversation.isSessionActive ?? false,
    lastMessageAt: conversation.lastMessageAt,
    clientName,
    clientEmail,
  };
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: number,
  limit: number = 50,
  offset: number = 0
): Promise<
  Array<{
    id: number;
    whatsappMessageId: string | null;
    direction: string;
    messageType: string;
    content: string | null;
    status: string;
    createdAt: Date | null;
  }>
> {
  const messages = await db
    .select({
      id: whatsappMessages.id,
      whatsappMessageId: whatsappMessages.whatsappMessageId,
      direction: whatsappMessages.direction,
      messageType: whatsappMessages.messageType,
      content: whatsappMessages.content,
      status: whatsappMessages.status,
      createdAt: whatsappMessages.createdAt,
    })
    .from(whatsappMessages)
    .where(eq(whatsappMessages.conversationId, conversationId))
    .orderBy(whatsappMessages.createdAt)
    .limit(limit)
    .offset(offset);

  return messages;
}
