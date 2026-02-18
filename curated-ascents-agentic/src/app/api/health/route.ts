import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const APP_VERSION = process.env.npm_package_version || "0.1.0";

/**
 * GET /api/health
 * Basic uptime monitoring endpoint for external services (e.g., UptimeRobot)
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  });
}
