/**
 * Points Expiry Cron Job
 * Runs monthly to expire points for inactive accounts and send warning emails
 * Schedule: 1st of each month at 2 AM UTC
 */

import { NextRequest, NextResponse } from "next/server";
import {
  expireInactivePoints,
  getAccountsAtExpiryRisk,
} from "@/lib/customer-success/loyalty-engine";
import { sendEmail } from "@/lib/email/send-email";
import { createElement } from "react";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for Vercel
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting points expiry cron job...");

    // 1. Expire points for fully inactive accounts
    const expiryResult = await expireInactivePoints();
    console.log(
      `Points expiry: ${expiryResult.accountsExpired} accounts expired, ` +
      `${expiryResult.totalPointsExpired} total points expired`
    );

    // 2. Get accounts at risk and send warning emails
    const atRiskAccounts = await getAccountsAtExpiryRisk(3); // 3 months warning
    let warningsSent = 0;

    for (const account of atRiskAccounts) {
      if (!account.clientEmail) continue;

      try {
        await sendEmail({
          to: account.clientEmail,
          subject: `Your ${account.totalPoints} Loyalty Points Will Expire Soon`,
          react: createElement("div", {
            style: { fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" },
            children: [
              createElement("h2", { key: "h2", style: { color: "#1a365d" } }, "Don't Lose Your Points!"),
              createElement("p", { key: "p1" }, `Dear ${account.clientName || "Valued Customer"},`),
              createElement("div", {
                key: "alert",
                style: {
                  backgroundColor: "#fef3c7",
                  padding: "16px",
                  borderLeft: "4px solid #f59e0b",
                  margin: "16px 0",
                },
                children: [
                  createElement("p", { key: "points", style: { fontWeight: "bold", margin: 0 } },
                    `You have ${account.totalPoints} points that will expire in ${account.monthsUntilExpiry} months.`
                  ),
                ],
              }),
              createElement("p", { key: "p2" },
                "Points expire after 24 months of inactivity. To keep your points active, simply:"
              ),
              createElement("ul", { key: "ul" }, [
                createElement("li", { key: "li1" }, "Book your next adventure with us"),
                createElement("li", { key: "li2" }, "Refer a friend"),
                createElement("li", { key: "li3" }, "Complete a feedback survey"),
              ]),
              createElement("p", { key: "p3" },
                "Any activity will reset your expiry clock and keep your points safe!"
              ),
              createElement("p", { key: "p4" }, "Best regards,"),
              createElement("p", { key: "p5", style: { fontWeight: "bold" } }, "The CuratedAscents Team"),
            ],
          }),
          logContext: {
            templateType: "points_expiry_warning",
            toName: account.clientName || undefined,
            clientId: account.clientId,
            metadata: {
              totalPoints: account.totalPoints,
              monthsUntilExpiry: account.monthsUntilExpiry,
            },
          },
        });
        warningsSent++;
      } catch (error) {
        console.error(`Failed to send expiry warning to client ${account.clientId}:`, error);
      }
    }

    console.log(`Points expiry warnings: ${warningsSent} emails sent to at-risk accounts`);

    return NextResponse.json({
      success: true,
      expiry: {
        accountsProcessed: expiryResult.accountsProcessed,
        accountsExpired: expiryResult.accountsExpired,
        totalPointsExpired: expiryResult.totalPointsExpired,
      },
      warnings: {
        accountsAtRisk: atRiskAccounts.length,
        warningsSent,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Points expiry cron error:", error);
    return NextResponse.json(
      { error: "Points expiry failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
