import { NextResponse } from "next/server";
import { clearAgencySessionCookie } from "@/lib/auth/agency-auth";

export async function POST() {
  try {
    await clearAgencySessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agency logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
