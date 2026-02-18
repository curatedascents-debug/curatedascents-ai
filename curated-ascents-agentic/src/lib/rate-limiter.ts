/**
 * In-memory rate limiter for API endpoint protection.
 * Keys by IP address (x-forwarded-for on Vercel, fallback to x-real-ip).
 * Auto-cleans expired entries every 60 seconds.
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp ms
}

interface RateLimitConfig {
  /** Time window in seconds */
  window: number;
  /** Max requests allowed in the window */
  max: number;
  /** Optional identifier suffix (e.g. "daily" to create separate buckets) */
  identifier?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // seconds until reset
}

// Global store: key -> entry
const store = new Map<string, RateLimitEntry>();

// Auto-cleanup every 60 seconds
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60_000);
  // Don't block process exit
  if (cleanupInterval && typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }
}

/**
 * Extract client IP from request headers.
 */
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Check rate limit for a request.
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanup();

  const ip = getClientIP(req);
  const suffix = config.identifier ? `:${config.identifier}` : "";
  const key = `${ip}:${config.window}s:${config.max}m${suffix}`;
  const now = Date.now();
  const windowMs = config.window * 1000;

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: config.max - 1, reset: config.window };
  }

  // Existing window
  existing.count++;
  const reset = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > config.max) {
    return { success: false, remaining: 0, reset };
  }

  return { success: true, remaining: config.max - existing.count, reset };
}

/**
 * Create a 429 response with proper headers and branded message.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      error: message || "Too many requests. Please try again later.",
      retryAfter: result.reset,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.reset),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.reset),
      },
    }
  );
}

/**
 * Add rate limit headers to a successful response.
 */
export function withRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.reset));
  return response;
}
