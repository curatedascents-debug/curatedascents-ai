import { NextResponse } from "next/server";
import { clearSupplierSessionCookie } from "@/lib/auth/supplier-auth";

export async function POST() {
  try {
    await clearSupplierSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Supplier logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
