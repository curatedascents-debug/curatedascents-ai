/**
 * Admin API Authentication Helper
 * Belt-and-suspenders inline auth for admin API routes.
 * Middleware should already protect these routes, but this provides defense-in-depth.
 */

import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";

interface AdminAuthResult {
  authenticated: boolean;
  error?: string;
}

/**
 * Generate admin session token (must match middleware's generateAdminToken)
 */
function generateAdminToken(password: string): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET || "curated-ascents-default-secret";
  let hash = 0;
  const str = password + secret;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `session_${Math.abs(hash).toString(36)}`;
}

/**
 * Verify admin session from request cookies.
 * Use this at the top of admin API route handlers for defense-in-depth.
 */
export function verifyAdminSession(req: NextRequest): AdminAuthResult {
  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return { authenticated: false, error: "Not authenticated" };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("[admin-api-auth] ADMIN_PASSWORD not configured");
    return { authenticated: false, error: "Server configuration error" };
  }

  const expectedToken = generateAdminToken(adminPassword);
  if (sessionCookie.value !== expectedToken) {
    return { authenticated: false, error: "Invalid session" };
  }

  return { authenticated: true };
}

/**
 * Helper to return a 401 response for unauthenticated admin API requests.
 */
export function adminUnauthorizedResponse(error: string = "Unauthorized"): NextResponse {
  return NextResponse.json({ error }, { status: 401 });
}
