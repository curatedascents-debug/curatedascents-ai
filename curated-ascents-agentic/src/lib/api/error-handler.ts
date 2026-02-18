/**
 * Centralized API error handler
 * In production: returns generic messages, logs full errors server-side
 * In development: returns full error details for debugging
 */

import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Sanitize an error for client response.
 * NEVER returns: database connection strings, file paths, stack traces, env var names.
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse {
  // Always log full error server-side
  console.error(`[${context}]`, error);

  if (isProduction) {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again or contact support." },
      { status: 500 }
    );
  }

  // Development: return sanitized error details (no connection strings or env vars)
  let message = "Unknown error";
  if (error instanceof Error) {
    message = sanitizeErrorMessage(error.message);
  }

  return NextResponse.json(
    { error: message, context },
    { status: 500 }
  );
}

/**
 * Strip sensitive patterns from error messages even in development
 */
function sanitizeErrorMessage(message: string): string {
  return message
    // Strip postgres connection strings
    .replace(/postgres(ql)?:\/\/[^\s"']+/gi, "[DATABASE_URL]")
    // Strip generic connection strings
    .replace(/(?:mongodb|redis|mysql|amqp):\/\/[^\s"']+/gi, "[CONNECTION_STRING]")
    // Strip file paths
    .replace(/\/(?:Users|home|var|etc|opt|tmp)\/[^\s"':]+/g, "[FILE_PATH]")
    // Strip env var values that look like secrets
    .replace(/(?:sk|pk|rk|whsec)_[a-zA-Z0-9_-]{20,}/g, "[SECRET]")
    // Strip Bearer tokens
    .replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [TOKEN]");
}
