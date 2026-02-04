import { NextRequest, NextResponse } from "next/server";
import { getReferralByCode } from "@/lib/customer-success/loyalty-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/referrals/[code]
 * Validate a referral code and get referrer info
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const referrer = await getReferralByCode(code.toUpperCase());

    if (!referrer) {
      return NextResponse.json(
        { valid: false, error: "Invalid referral code" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      referralCode: referrer.referralCode,
      referrer: {
        id: referrer.clientId,
        name: referrer.clientName,
      },
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate referral code" },
      { status: 500 }
    );
  }
}
