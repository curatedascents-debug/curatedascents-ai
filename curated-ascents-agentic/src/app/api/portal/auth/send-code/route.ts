import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, customerVerificationCodes } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { generateVerificationCode, hashCode } from "@/lib/auth/customer-auth";
import { sendEmail } from "@/lib/email/send-email";
import VerificationCodeEmail from "@/lib/email/templates/verification-code";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per 15 minutes per IP
  const limit = rateLimit(request, { window: 900, max: 5, identifier: "send-code" });
  if (!limit.success) {
    return rateLimitResponse(limit, "Too many verification requests. Please wait before trying again.");
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit: max 3 codes per email per 15 min
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentCodes = await db
      .select()
      .from(customerVerificationCodes)
      .where(
        and(
          eq(customerVerificationCodes.email, normalizedEmail),
          gte(customerVerificationCodes.createdAt, fifteenMinAgo)
        )
      );

    if (recentCodes.length >= 3) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 15 minutes." },
        { status: 429 }
      );
    }

    // Find or create client
    let client = await db
      .select()
      .from(clients)
      .where(eq(clients.email, normalizedEmail))
      .then((rows) => rows[0]);

    if (!client) {
      const result = await db
        .insert(clients)
        .values({ email: normalizedEmail, source: "portal" })
        .returning();
      client = result[0];
    }

    // Generate and save code
    const code = generateVerificationCode();
    const hashed = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.insert(customerVerificationCodes).values({
      clientId: client.id,
      email: normalizedEmail,
      code: hashed,
      expiresAt,
    });

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: "Your CuratedAscents verification code",
      react: VerificationCodeEmail({ code, name: client.name || undefined }),
      logContext: {
        templateType: "verification_code",
        toName: client.name || undefined,
        clientId: client.id,
      },
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
