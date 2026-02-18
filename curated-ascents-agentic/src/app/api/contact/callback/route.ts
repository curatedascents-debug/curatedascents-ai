import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import AdminNotificationEmail from "@/lib/email/templates/admin-notification";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limiter";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "curatedascents@gmail.com";

export async function POST(req: NextRequest) {
  // Rate limit: 3 requests per hour per IP
  const limit = rateLimit(req, { window: 3600, max: 3, identifier: "callback" });
  if (!limit.success) {
    return rateLimitResponse(limit, "You\u2019ve already submitted a callback request. We\u2019ll be in touch soon.");
  }

  try {
    const { name, email, preferredTime, message } = await req.json();

    // Validation
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
    const trimmedTime = preferredTime?.trim() || null;
    const trimmedMessage = message?.trim() || null;

    // Upsert client
    const result = await db
      .insert(clients)
      .values({
        name: trimmedName,
        email: trimmedEmail,
        source: "callback_request",
      })
      .onConflictDoUpdate({
        target: clients.email,
        set: { name: trimmedName, updatedAt: new Date() },
      })
      .returning({ id: clients.id });

    const clientId = result[0]?.id;

    // Store callback details in preferences JSONB
    if (clientId) {
      const existing = await db
        .select({ preferences: clients.preferences })
        .from(clients)
        .where(eq(clients.id, clientId))
        .limit(1);

      const currentPrefs =
        (existing[0]?.preferences as Record<string, unknown>) || {};

      await db
        .update(clients)
        .set({
          preferences: {
            ...currentPrefs,
            callbackRequested: true,
            preferredTime: trimmedTime,
            callbackMessage: trimmedMessage,
            callbackRequestedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(clients.id, clientId));
    }

    // Send admin notification email
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `Callback Request: ${trimmedName} — CuratedAscents`,
      react: React.createElement(AdminNotificationEmail, {
        notificationType: "callback_request" as const,
        clientName: trimmedName,
        clientEmail: trimmedEmail,
        preferredTime: trimmedTime || undefined,
        callbackMessage: trimmedMessage || undefined,
      }),
      logContext: {
        templateType: "admin_notification",
        toName: "Admin",
        clientId,
        metadata: { notificationType: "callback_request" },
      },
    }).catch((err) => console.error("Callback admin notification failed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[callback] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
