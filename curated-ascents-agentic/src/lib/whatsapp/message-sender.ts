/**
 * WhatsApp Message Sender Service
 * Handles sending messages with formatting, chunking, and template fallback
 */

import { db } from '@/db';
import { whatsappMessages, whatsappConversations, whatsappTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  sendTextMessage,
  sendTemplateMessage,
  type TemplateComponent,
} from './whatsapp-client';
import { checkSessionStatus, getReengagementTemplateName } from './session-manager';
import { formatAIResponse, chunkMessage, convertToWhatsAppMarkdown } from './formatters';

export interface SendMessageResult {
  success: boolean;
  messageIds: string[];
  chunksCount: number;
  usedTemplate: boolean;
  error?: string;
}

/**
 * Send a message to a WhatsApp user
 * Automatically handles session checking, chunking, and template fallback
 */
export async function sendMessage(
  conversationId: number,
  text: string,
  options?: {
    forceTemplate?: boolean;
    templateName?: string;
    templateVariables?: string[];
    skipSessionCheck?: boolean;
  }
): Promise<SendMessageResult> {
  try {
    // Get conversation details
    const [conversation] = await db
      .select({
        phoneNumber: whatsappConversations.whatsappPhoneNumber,
      })
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return {
        success: false,
        messageIds: [],
        chunksCount: 0,
        usedTemplate: false,
        error: 'Conversation not found',
      };
    }

    // Check session status unless skipped
    let requiresTemplate = options?.forceTemplate ?? false;
    if (!options?.skipSessionCheck && !requiresTemplate) {
      const sessionStatus = await checkSessionStatus(conversationId);
      requiresTemplate = sessionStatus.requiresTemplate;
    }

    // If session is expired, send template message
    if (requiresTemplate) {
      return sendTemplateToConversation(
        conversationId,
        conversation.phoneNumber,
        options?.templateName || getReengagementTemplateName(),
        options?.templateVariables
      );
    }

    // Format and chunk the message
    const formattedChunks = formatAIResponse(text);
    const messageIds: string[] = [];

    // Send each chunk
    for (const chunk of formattedChunks) {
      const response = await sendTextMessage(conversation.phoneNumber, chunk);

      if (response && response.messages[0]) {
        const messageId = response.messages[0].id;
        messageIds.push(messageId);

        // Record the message
        await db.insert(whatsappMessages).values({
          conversationId,
          whatsappMessageId: messageId,
          direction: 'outbound',
          messageType: 'text',
          content: chunk,
          status: 'sent',
          sentAt: new Date(),
        });
      }
    }

    // Update conversation
    await db
      .update(whatsappConversations)
      .set({
        messageCount: conversation.phoneNumber ? undefined : 1, // Will increment separately
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(whatsappConversations.id, conversationId));

    return {
      success: messageIds.length > 0,
      messageIds,
      chunksCount: formattedChunks.length,
      usedTemplate: false,
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      messageIds: [],
      chunksCount: 0,
      usedTemplate: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a template message
 */
async function sendTemplateToConversation(
  conversationId: number,
  phoneNumber: string,
  templateName: string,
  variables?: string[]
): Promise<SendMessageResult> {
  try {
    // Get template details
    const [template] = await db
      .select({
        language: whatsappTemplates.language,
        variableCount: whatsappTemplates.variableCount,
        bodyText: whatsappTemplates.bodyText,
      })
      .from(whatsappTemplates)
      .where(eq(whatsappTemplates.templateName, templateName))
      .limit(1);

    // Build template components if variables provided
    let components: TemplateComponent[] | undefined;
    if (variables && variables.length > 0) {
      components = [
        {
          type: 'body',
          parameters: variables.map((text) => ({
            type: 'text' as const,
            text,
          })),
        },
      ];
    }

    const response = await sendTemplateMessage(
      phoneNumber,
      templateName,
      template?.language || 'en',
      components
    );

    if (response && response.messages[0]) {
      const messageId = response.messages[0].id;

      // Record the template message
      await db.insert(whatsappMessages).values({
        conversationId,
        whatsappMessageId: messageId,
        direction: 'outbound',
        messageType: 'template',
        content: template?.bodyText,
        templateName,
        templateVariables: variables || [],
        status: 'sent',
        sentAt: new Date(),
      });

      return {
        success: true,
        messageIds: [messageId],
        chunksCount: 1,
        usedTemplate: true,
      };
    }

    return {
      success: false,
      messageIds: [],
      chunksCount: 0,
      usedTemplate: true,
      error: 'Failed to send template message',
    };
  } catch (error) {
    console.error('Error sending template message:', error);
    return {
      success: false,
      messageIds: [],
      chunksCount: 0,
      usedTemplate: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a message by phone number (creates conversation if needed)
 */
export async function sendMessageToPhone(
  phoneNumber: string,
  text: string,
  options?: {
    forceTemplate?: boolean;
    templateName?: string;
    templateVariables?: string[];
  }
): Promise<SendMessageResult> {
  // Find or create conversation
  let [conversation] = await db
    .select({ id: whatsappConversations.id })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.whatsappPhoneNumber, phoneNumber))
    .limit(1);

  if (!conversation) {
    // Create new conversation
    const [newConv] = await db
      .insert(whatsappConversations)
      .values({
        whatsappPhoneNumber: phoneNumber,
        isSessionActive: false, // No active session for outbound-initiated
        messageCount: 0,
      })
      .returning({ id: whatsappConversations.id });

    conversation = newConv;
  }

  return sendMessage(conversation.id, text, {
    ...options,
    forceTemplate: options?.forceTemplate ?? true, // Default to template for cold outreach
  });
}

/**
 * Send AI response to a conversation
 */
export async function sendAIResponse(
  conversationId: number,
  aiResponse: string
): Promise<SendMessageResult> {
  // Record the AI response in the last inbound message
  const [lastMessage] = await db
    .select({ id: whatsappMessages.id })
    .from(whatsappMessages)
    .where(eq(whatsappMessages.conversationId, conversationId))
    .orderBy(whatsappMessages.createdAt)
    .limit(1);

  if (lastMessage) {
    await db
      .update(whatsappMessages)
      .set({
        aiProcessed: true,
        aiResponse: aiResponse,
      })
      .where(eq(whatsappMessages.id, lastMessage.id));
  }

  return sendMessage(conversationId, aiResponse);
}

/**
 * Send a quote notification via WhatsApp
 */
export async function sendQuoteNotification(
  phoneNumber: string,
  quoteNumber: string,
  totalAmount: number,
  currency: string = 'USD'
): Promise<SendMessageResult> {
  return sendMessageToPhone(phoneNumber, '', {
    forceTemplate: true,
    templateName: 'quote_ready',
    templateVariables: [
      quoteNumber,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
      }).format(totalAmount),
    ],
  });
}

/**
 * Send a booking confirmation via WhatsApp
 */
export async function sendBookingConfirmation(
  phoneNumber: string,
  bookingReference: string,
  destination: string,
  startDate: string
): Promise<SendMessageResult> {
  return sendMessageToPhone(phoneNumber, '', {
    forceTemplate: true,
    templateName: 'booking_confirmed',
    templateVariables: [bookingReference, destination, startDate],
  });
}

/**
 * Send a payment reminder via WhatsApp
 */
export async function sendPaymentReminder(
  phoneNumber: string,
  bookingReference: string,
  amount: number,
  dueDate: string,
  currency: string = 'USD'
): Promise<SendMessageResult> {
  return sendMessageToPhone(phoneNumber, '', {
    forceTemplate: true,
    templateName: 'payment_reminder',
    templateVariables: [
      bookingReference,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
      }).format(amount),
      dueDate,
    ],
  });
}

/**
 * Bulk send messages to multiple conversations
 */
export async function sendBulkMessage(
  conversationIds: number[],
  text: string,
  options?: {
    templateName?: string;
    templateVariables?: string[];
  }
): Promise<Map<number, SendMessageResult>> {
  const results = new Map<number, SendMessageResult>();

  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < conversationIds.length; i += batchSize) {
    const batch = conversationIds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (conversationId) => {
        const result = await sendMessage(conversationId, text, {
          forceTemplate: !!options?.templateName,
          templateName: options?.templateName,
          templateVariables: options?.templateVariables,
        });
        results.set(conversationId, result);
      })
    );

    // Small delay between batches
    if (i + batchSize < conversationIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
