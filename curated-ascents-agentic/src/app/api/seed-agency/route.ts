import { NextResponse } from "next/server";
import { db } from "@/db";
import { agencies, agencyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/agency-auth";

export async function GET() {
  try {
    // Check if test agency already exists
    const [existingAgency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.slug, "adventure-travel"))
      .limit(1);

    if (existingAgency) {
      return NextResponse.json({
        message: "Test agency already exists",
        credentials: {
          agency: existingAgency.name,
          loginUrl: "/agency/login",
          email: "admin@adventuretravel.com",
          password: "test123",
        },
      });
    }

    // Create the agency
    const [agency] = await db
      .insert(agencies)
      .values({
        name: "Adventure Travel Co",
        slug: "adventure-travel",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e293b",
        accentColor: "#60a5fa",
        defaultMarginPercent: "45.00",
        miceMarginPercent: "35.00",
        currency: "USD",
        email: "info@adventuretravel.com",
        phone: "+1-555-0123",
        website: "https://adventuretravel.com",
        country: "USA",
        status: "active",
        canAccessAllSuppliers: true,
        maxUsers: 10,
      })
      .returning();

    console.log(`Created agency: ${agency.name} (ID: ${agency.id})`);

    // Hash the password
    const password = "test123";
    const passwordHash = await hashPassword(password);

    // Create the owner user
    const [user] = await db
      .insert(agencyUsers)
      .values({
        agencyId: agency.id,
        email: "admin@adventuretravel.com",
        passwordHash,
        name: "Test Admin",
        role: "owner",
        isActive: true,
      })
      .returning();

    console.log(`Created user: ${user.email} (ID: ${user.id})`);

    return NextResponse.json({
      success: true,
      message: "Test agency created successfully",
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
      },
      credentials: {
        loginUrl: "/agency/login",
        email: "admin@adventuretravel.com",
        password: "test123",
      },
    });
  } catch (error) {
    console.error("Error seeding test agency:", error);
    return NextResponse.json(
      { error: "Failed to seed test agency", details: String(error) },
      { status: 500 }
    );
  }
}
