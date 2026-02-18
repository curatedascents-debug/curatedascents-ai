import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, customerVerificationCodes, customerSessions } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  hashCode,
  createCustomerSession,
  setCustomerSessionCookie,
} from "@/lib/auth/customer-auth";
import { createHash } from "crypto";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limit: 10 attempts per 15 minutes per IP
  const limit = rateLimit(request, { window: 900, max: 10, identifier: "verify-code" });
  if (!limit.success) {
    return rateLimitResponse(limit, "Too many verification attempts. Please wait before trying again.");
  }

  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedCode = hashCode(code);

    // Find the latest unused code for this email
    const records = await db
      .select()
      .from(customerVerificationCodes)
      .where(
        and(
          eq(customerVerificationCodes.email, normalizedEmail),
          isNull(customerVerificationCodes.usedAt)
        )
      )
      .orderBy(desc(customerVerificationCodes.createdAt))
      .limit(1);

    const record = records[0];

    if (!record) {
      return NextResponse.json({ error: "No pending verification code" }, { status: 400 });
    }

    // Check attempts
    if ((record.attempts ?? 0) >= 5) {
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    // Increment attempts
    await db
      .update(customerVerificationCodes)
      .set({ attempts: (record.attempts ?? 0) + 1 })
      .where(eq(customerVerificationCodes.id, record.id));

    // Check expiry
    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
    }

    // Verify code
    if (record.code !== hashedCode) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Mark as used
    await db
      .update(customerVerificationCodes)
      .set({ usedAt: new Date() })
      .where(eq(customerVerificationCodes.id, record.id));

    // Get client
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.email, normalizedEmail))
      .then((rows) => rows[0]);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Create JWT
    const token = await createCustomerSession({
      clientId: client.id,
      email: client.email,
      name: client.name || "",
    });

    // Save session record
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const userAgent = request.headers.get("user-agent") || "unknown";
    await db.insert(customerSessions).values({
      clientId: client.id,
      tokenHash,
      deviceInfo: userAgent.slice(0, 256),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Set cookie
    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        email: client.email,
        name: client.name,
      },
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
