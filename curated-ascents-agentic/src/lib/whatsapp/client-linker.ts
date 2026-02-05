/**
 * WhatsApp Client Linker
 * Links WhatsApp phone numbers to existing client records
 */

import { db } from '@/db';
import { clients, whatsappConversations, leadScores, leadEvents } from '@/db/schema';
import { eq, or, ilike } from 'drizzle-orm';

export interface LinkedClient {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  whatsappPhoneNumber: string | null;
}

export interface LinkResult {
  success: boolean;
  linked: boolean;
  clientId: number | null;
  client: LinkedClient | null;
  message: string;
}

/**
 * Normalize phone number to E.164 format
 * WhatsApp requires numbers without + prefix, just digits
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // If starts with 0, likely a local number - can't normalize without country code
  // If starts with 00, replace with nothing (international prefix)
  if (normalized.startsWith('00')) {
    normalized = normalized.substring(2);
  }

  return normalized;
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  if (phone.length < 10) return phone;

  // Basic international format
  return `+${phone}`;
}

/**
 * Try to find an existing client by phone number
 */
export async function findClientByPhone(phoneNumber: string): Promise<LinkedClient | null> {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  // Search by whatsappPhoneNumber or phone
  const [client] = await db
    .select({
      id: clients.id,
      email: clients.email,
      name: clients.name,
      phone: clients.phone,
      whatsappPhoneNumber: clients.whatsappPhoneNumber,
    })
    .from(clients)
    .where(
      or(
        eq(clients.whatsappPhoneNumber, normalizedPhone),
        eq(clients.whatsappPhoneNumber, phoneNumber),
        ilike(clients.phone, `%${normalizedPhone.slice(-10)}%`) // Last 10 digits
      )
    )
    .limit(1);

  return client || null;
}

/**
 * Link a WhatsApp conversation to an existing client
 */
export async function linkConversationToClient(
  conversationId: number,
  clientId: number
): Promise<LinkResult> {
  try {
    // Get the conversation
    const [conversation] = await db
      .select({
        phoneNumber: whatsappConversations.whatsappPhoneNumber,
        currentClientId: whatsappConversations.clientId,
      })
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return {
        success: false,
        linked: false,
        clientId: null,
        client: null,
        message: 'Conversation not found',
      };
    }

    // Get the client
    const [client] = await db
      .select({
        id: clients.id,
        email: clients.email,
        name: clients.name,
        phone: clients.phone,
        whatsappPhoneNumber: clients.whatsappPhoneNumber,
      })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      return {
        success: false,
        linked: false,
        clientId: null,
        client: null,
        message: 'Client not found',
      };
    }

    // Update conversation with client link
    await db
      .update(whatsappConversations)
      .set({
        clientId,
        updatedAt: new Date(),
      })
      .where(eq(whatsappConversations.id, conversationId));

    // Update client with WhatsApp phone number if not set
    if (!client.whatsappPhoneNumber) {
      await db
        .update(clients)
        .set({
          whatsappPhoneNumber: conversation.phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, clientId));
    }

    // Record lead event for WhatsApp connection
    await recordWhatsAppLeadEvent(clientId, 'whatsapp_linked');

    return {
      success: true,
      linked: true,
      clientId: client.id,
      client: {
        ...client,
        whatsappPhoneNumber: client.whatsappPhoneNumber || conversation.phoneNumber,
      },
      message: 'Successfully linked conversation to client',
    };
  } catch (error) {
    console.error('Error linking conversation to client:', error);
    return {
      success: false,
      linked: false,
      clientId: null,
      client: null,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Auto-link a conversation to a client if a match is found
 */
export async function autoLinkConversation(
  conversationId: number,
  phoneNumber: string
): Promise<LinkResult> {
  // Try to find existing client
  const existingClient = await findClientByPhone(phoneNumber);

  if (existingClient) {
    return linkConversationToClient(conversationId, existingClient.id);
  }

  return {
    success: true,
    linked: false,
    clientId: null,
    client: null,
    message: 'No matching client found',
  };
}

/**
 * Create a new client from WhatsApp conversation data
 */
export async function createClientFromWhatsApp(
  phoneNumber: string,
  displayName: string | null,
  email?: string
): Promise<LinkResult> {
  try {
    // Generate a placeholder email if not provided
    const clientEmail = email || `whatsapp+${normalizePhoneNumber(phoneNumber)}@placeholder.curatedascents.com`;

    const [newClient] = await db
      .insert(clients)
      .values({
        email: clientEmail,
        name: displayName,
        phone: formatPhoneForDisplay(phoneNumber),
        whatsappPhoneNumber: normalizePhoneNumber(phoneNumber),
        source: 'whatsapp',
        isActive: true,
      })
      .returning({
        id: clients.id,
        email: clients.email,
        name: clients.name,
        phone: clients.phone,
        whatsappPhoneNumber: clients.whatsappPhoneNumber,
      });

    // Initialize lead score for the new client
    await db.insert(leadScores).values({
      clientId: newClient.id,
      currentScore: 10, // Starting score for WhatsApp contact
      status: 'new',
      source: 'whatsapp',
      totalConversations: 1,
    });

    return {
      success: true,
      linked: true,
      clientId: newClient.id,
      client: newClient,
      message: 'Created new client from WhatsApp',
    };
  } catch (error) {
    console.error('Error creating client from WhatsApp:', error);
    return {
      success: false,
      linked: false,
      clientId: null,
      client: null,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unlink a conversation from a client
 */
export async function unlinkConversation(conversationId: number): Promise<boolean> {
  try {
    await db
      .update(whatsappConversations)
      .set({
        clientId: null,
        updatedAt: new Date(),
      })
      .where(eq(whatsappConversations.id, conversationId));

    return true;
  } catch (error) {
    console.error('Error unlinking conversation:', error);
    return false;
  }
}

/**
 * Record a WhatsApp-related lead event
 */
async function recordWhatsAppLeadEvent(
  clientId: number,
  eventType: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  try {
    // Get current score
    const [score] = await db
      .select({
        currentScore: leadScores.currentScore,
      })
      .from(leadScores)
      .where(eq(leadScores.clientId, clientId))
      .limit(1);

    const scoreBefore = score?.currentScore || 0;
    const scoreChange = eventType === 'whatsapp_linked' ? 5 : 2;
    const scoreAfter = scoreBefore + scoreChange;

    // Record the event
    await db.insert(leadEvents).values({
      clientId,
      eventType,
      eventData: eventData || {},
      scoreChange,
      scoreBefore,
      scoreAfter,
      source: 'whatsapp',
    });

    // Update lead score if exists
    if (score) {
      await db
        .update(leadScores)
        .set({
          currentScore: scoreAfter,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(leadScores.clientId, clientId));
    }
  } catch (error) {
    console.error('Error recording lead event:', error);
  }
}

/**
 * Get all unlinked conversations (for admin to review)
 */
export async function getUnlinkedConversations(): Promise<
  Array<{
    id: number;
    phoneNumber: string;
    displayName: string | null;
    messageCount: number;
    lastMessageAt: Date | null;
    createdAt: Date | null;
  }>
> {
  const allConversations = await db
    .select({
      id: whatsappConversations.id,
      phoneNumber: whatsappConversations.whatsappPhoneNumber,
      displayName: whatsappConversations.whatsappDisplayName,
      messageCount: whatsappConversations.messageCount,
      lastMessageAt: whatsappConversations.lastMessageAt,
      createdAt: whatsappConversations.createdAt,
      clientId: whatsappConversations.clientId,
    })
    .from(whatsappConversations);

  return allConversations
    .filter((c) => !c.clientId)
    .map(({ clientId, ...rest }) => ({
      ...rest,
      messageCount: rest.messageCount ?? 0,
    }));
}

/**
 * Search for clients to link (for admin UI)
 */
export async function searchClientsForLinking(
  query: string
): Promise<LinkedClient[]> {
  const searchQuery = `%${query}%`;

  const results = await db
    .select({
      id: clients.id,
      email: clients.email,
      name: clients.name,
      phone: clients.phone,
      whatsappPhoneNumber: clients.whatsappPhoneNumber,
    })
    .from(clients)
    .where(
      or(
        ilike(clients.email, searchQuery),
        ilike(clients.name, searchQuery),
        ilike(clients.phone, searchQuery)
      )
    )
    .limit(10);

  return results;
}
