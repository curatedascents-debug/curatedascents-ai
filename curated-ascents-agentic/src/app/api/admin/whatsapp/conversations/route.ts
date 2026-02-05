/**
 * Admin WhatsApp Conversations API
 * List and manage WhatsApp conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { whatsappConversations, whatsappMessages, clients } from '@/db/schema';
import { eq, desc, sql, and, isNull, isNotNull, ilike, or } from 'drizzle-orm';
import { linkConversationToClient } from '@/lib/whatsapp/client-linker';

/**
 * GET - List all WhatsApp conversations
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter'); // 'all', 'unlinked', 'active'
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build query
    let whereClause;
    if (filter === 'unlinked') {
      whereClause = isNull(whatsappConversations.clientId);
    } else if (filter === 'active') {
      whereClause = eq(whatsappConversations.isSessionActive, true);
    }

    // Get conversations with client info
    const conversationsQuery = db
      .select({
        id: whatsappConversations.id,
        phoneNumber: whatsappConversations.whatsappPhoneNumber,
        displayName: whatsappConversations.whatsappDisplayName,
        clientId: whatsappConversations.clientId,
        isSessionActive: whatsappConversations.isSessionActive,
        messageCount: whatsappConversations.messageCount,
        lastMessageAt: whatsappConversations.lastMessageAt,
        createdAt: whatsappConversations.createdAt,
      })
      .from(whatsappConversations)
      .orderBy(desc(whatsappConversations.lastMessageAt))
      .limit(limit)
      .offset(offset);

    const conversations = await conversationsQuery;

    // Get client info for linked conversations
    const clientIds = conversations
      .filter((c) => c.clientId)
      .map((c) => c.clientId as number);

    let clientsMap: Record<number, { name: string | null; email: string }> = {};
    if (clientIds.length > 0) {
      const clientsList = await db
        .select({
          id: clients.id,
          name: clients.name,
          email: clients.email,
        })
        .from(clients)
        .where(sql`${clients.id} = ANY(${clientIds})`);

      clientsMap = clientsList.reduce((acc, c) => {
        acc[c.id] = { name: c.name, email: c.email };
        return acc;
      }, {} as Record<number, { name: string | null; email: string }>);
    }

    // Get last message for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const [lastMessage] = await db
          .select({
            content: whatsappMessages.content,
            direction: whatsappMessages.direction,
          })
          .from(whatsappMessages)
          .where(eq(whatsappMessages.conversationId, conv.id))
          .orderBy(desc(whatsappMessages.createdAt))
          .limit(1);

        return {
          ...conv,
          clientName: conv.clientId ? clientsMap[conv.clientId]?.name : null,
          clientEmail: conv.clientId ? clientsMap[conv.clientId]?.email : null,
          lastMessage: lastMessage?.content?.slice(0, 100) || null,
          lastMessageDirection: lastMessage?.direction || null,
        };
      })
    );

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(whatsappConversations);

    return NextResponse.json({
      conversations: conversationsWithDetails,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('[Admin WhatsApp] Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST - Link a conversation to a client
 */
export async function POST(req: NextRequest) {
  try {
    const { conversationId, clientId, action } = await req.json();

    if (action === 'link') {
      if (!conversationId || !clientId) {
        return NextResponse.json(
          { error: 'conversationId and clientId are required' },
          { status: 400 }
        );
      }

      const result = await linkConversationToClient(conversationId, clientId);

      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        client: result.client,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Admin WhatsApp] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
