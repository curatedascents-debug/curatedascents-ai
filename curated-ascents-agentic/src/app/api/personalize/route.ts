// src/app/api/personalize/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import WelcomeEmail from "@/lib/email/templates/welcome";
import AdminNotificationEmail from "@/lib/email/templates/admin-notification";
import {
  getOrCreateLeadScore,
  recordLeadEvent,
} from "@/lib/lead-intelligence/scoring-engine";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limiter";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "curatedascents@gmail.com";

export async function POST(req: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const limit = rateLimit(req, { window: 60, max: 10, identifier: "personalize" });
  if (!limit.success) {
    return rateLimitResponse(limit);
  }

  try {
    const { name, email } = await req.json();

    // ── validation ──────────────────────────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // ── persist ─────────────────────────────────────────────────────────
    let clientId: number | undefined;
    let isNewClient = false;

    try {
      const result = await db
        .insert(clients)
        .values({
          name: trimmedName,
          email: trimmedEmail,
          source: "chat",
        })
        .onConflictDoUpdate({
          target: clients.email,
          set: { name: trimmedName, updatedAt: new Date() },
        })
        .returning({ id: clients.id });

      clientId = result[0]?.id;

      // Check if this was a new insert (simple heuristic: we just created it)
      const existingCheck = await db
        .select({ createdAt: clients.createdAt, updatedAt: clients.updatedAt })
        .from(clients)
        .where(require("drizzle-orm").eq(clients.id, clientId))
        .limit(1);

      if (existingCheck[0]) {
        const created = existingCheck[0].createdAt?.getTime() || 0;
        const updated = existingCheck[0].updatedAt?.getTime() || 0;
        // If created within last 5 seconds, consider it new
        isNewClient = Date.now() - created < 5000;
      }
    } catch (dbError: unknown) {
      console.warn(
        "[personalize] clients table write skipped:",
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    // ── initialize lead scoring for new clients ─────────────────────────
    if (clientId && isNewClient) {
      getOrCreateLeadScore(clientId)
        .then(() => recordLeadEvent(clientId, "conversation_started", {}, "chat"))
        .catch((err) => console.error("Lead scoring init failed:", err));
    }

    // ── send welcome email to client (fire-and-forget) ──────────────────
    sendEmail({
      to: trimmedEmail,
      subject: "Welcome to CuratedAscents — Your Adventure Awaits!",
      react: React.createElement(WelcomeEmail, {
        clientName: trimmedName,
      }),
      logContext: {
        templateType: "welcome",
        toName: trimmedName,
        clientId,
      },
    }).catch((err) => console.error("Welcome email failed:", err));

    // ── send admin notification for new clients ──────────────────────────
    if (isNewClient) {
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Client: ${trimmedName} — CuratedAscents`,
        react: React.createElement(AdminNotificationEmail, {
          notificationType: "new_client",
          clientName: trimmedName,
          clientEmail: trimmedEmail,
        }),
        logContext: {
          templateType: "admin_notification",
          toName: "Admin",
          clientId,
          metadata: { notificationType: "new_client" },
        },
      }).catch((err) => console.error("Admin notification failed:", err));
    }

    return NextResponse.json({
      success: true,
      message: `Welcome aboard, ${trimmedName}! Your details have been saved.`,
      clientId, // Return clientId for lead scoring integration
    });
  } catch (error) {
    console.error("[personalize] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
