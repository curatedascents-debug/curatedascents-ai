import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { resend, EMAIL_FROM } from "@/lib/email/resend-client";
import { sendEmail } from "@/lib/email/send-email";
import WelcomeEmail from "@/lib/email/templates/welcome";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/email-test?to=email@example.com
 * Sends a test welcome email and returns the result.
 * Protected by admin middleware.
 */
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get("to");

  // Check configuration
  const config = {
    resendConfigured: !!resend,
    emailFrom: EMAIL_FROM,
    hasApiKey: !!process.env.RESEND_API_KEY,
  };

  if (!to) {
    return NextResponse.json({
      ...config,
      message: "Add ?to=your@email.com to send a test email",
    });
  }

  // Send test email
  const result = await sendEmail({
    to,
    subject: "CuratedAscents Email Test — Configuration Verified!",
    react: React.createElement(WelcomeEmail, {
      clientName: "UAT Tester",
    }),
    logContext: {
      templateType: "email_test",
      toName: "UAT Tester",
    },
  });

  return NextResponse.json({
    ...config,
    testResult: result,
    sentTo: to,
  });
}
