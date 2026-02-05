/**
 * WhatsApp Session Manager
 * Manages the 24-hour free-form messaging window for WhatsApp Business API
 */

import { db } from '@/db';
import { whatsappConversations } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Session window duration: 24 hours in milliseconds
const SESSION_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface SessionStatus {
  isActive: boolean;
  windowStart: Date | null;
  windowEnd: Date | null;
  remainingMs: number;
  requiresTemplate: boolean;
}

/**
 * Check if a conversation has an active session window
 * The 24-hour window starts when the user sends a message
 */
export async function checkSessionStatus(
  conversationId: number
): Promise<SessionStatus> {
  const [conversation] = await db
    .select({
      sessionWindowStart: whatsappConversations.sessionWindowStart,
      isSessionActive: whatsappConversations.isSessionActive,
    })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    return {
      isActive: false,
      windowStart: null,
      windowEnd: null,
      remainingMs: 0,
      requiresTemplate: true,
    };
  }

  const { sessionWindowStart, isSessionActive } = conversation;

  // No session has been started
  if (!sessionWindowStart || !isSessionActive) {
    return {
      isActive: false,
      windowStart: null,
      windowEnd: null,
      remainingMs: 0,
      requiresTemplate: true,
    };
  }

  const windowStart = new Date(sessionWindowStart);
  const windowEnd = new Date(windowStart.getTime() + SESSION_WINDOW_MS);
  const now = new Date();
  const remainingMs = Math.max(0, windowEnd.getTime() - now.getTime());
  const isActive = remainingMs > 0;

  // If window has expired, update the database
  if (!isActive && isSessionActive) {
    await db
      .update(whatsappConversations)
      .set({ isSessionActive: false })
      .where(eq(whatsappConversations.id, conversationId));
  }

  return {
    isActive,
    windowStart,
    windowEnd,
    remainingMs,
    requiresTemplate: !isActive,
  };
}

/**
 * Check session status by phone number
 */
export async function checkSessionStatusByPhone(
  phoneNumber: string
): Promise<SessionStatus & { conversationId: number | null }> {
  const [conversation] = await db
    .select({
      id: whatsappConversations.id,
      sessionWindowStart: whatsappConversations.sessionWindowStart,
      isSessionActive: whatsappConversations.isSessionActive,
    })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.whatsappPhoneNumber, phoneNumber))
    .limit(1);

  if (!conversation) {
    return {
      conversationId: null,
      isActive: false,
      windowStart: null,
      windowEnd: null,
      remainingMs: 0,
      requiresTemplate: true,
    };
  }

  const status = await checkSessionStatus(conversation.id);
  return {
    ...status,
    conversationId: conversation.id,
  };
}

/**
 * Start or refresh a session window
 * Called when a user sends a message
 */
export async function startOrRefreshSession(
  conversationId: number
): Promise<SessionStatus> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + SESSION_WINDOW_MS);

  await db
    .update(whatsappConversations)
    .set({
      sessionWindowStart: now,
      isSessionActive: true,
      lastMessageAt: now,
      updatedAt: now,
    })
    .where(eq(whatsappConversations.id, conversationId));

  return {
    isActive: true,
    windowStart: now,
    windowEnd,
    remainingMs: SESSION_WINDOW_MS,
    requiresTemplate: false,
  };
}

/**
 * End a session (called when we want to close the window manually)
 */
export async function endSession(conversationId: number): Promise<void> {
  await db
    .update(whatsappConversations)
    .set({
      isSessionActive: false,
      updatedAt: new Date(),
    })
    .where(eq(whatsappConversations.id, conversationId));
}

/**
 * Get all conversations with expired sessions
 * Useful for sending re-engagement templates
 */
export async function getExpiredSessions(): Promise<
  Array<{
    id: number;
    phoneNumber: string;
    displayName: string | null;
    clientId: number | null;
    lastMessageAt: Date | null;
    sessionWindowStart: Date | null;
  }>
> {
  const expiryThreshold = new Date(Date.now() - SESSION_WINDOW_MS);

  const conversations = await db
    .select({
      id: whatsappConversations.id,
      phoneNumber: whatsappConversations.whatsappPhoneNumber,
      displayName: whatsappConversations.whatsappDisplayName,
      clientId: whatsappConversations.clientId,
      lastMessageAt: whatsappConversations.lastMessageAt,
      sessionWindowStart: whatsappConversations.sessionWindowStart,
    })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.isSessionActive, true));

  // Filter to only expired sessions
  return conversations.filter((conv) => {
    if (!conv.sessionWindowStart) return true;
    return new Date(conv.sessionWindowStart) < expiryThreshold;
  });
}

/**
 * Format remaining session time as human-readable string
 */
export function formatRemainingTime(remainingMs: number): string {
  if (remainingMs <= 0) return 'expired';

  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Check if we should send a template message instead of free-form
 */
export async function shouldUseTemplate(conversationId: number): Promise<boolean> {
  const status = await checkSessionStatus(conversationId);
  return status.requiresTemplate;
}

/**
 * Get the default re-engagement template name
 */
export function getReengagementTemplateName(): string {
  return 'session_greeting';
}
