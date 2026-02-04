import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all destinations
export async function GET() {
  try {
    const result = await db
      .select()
      .from(destinations)
      .orderBy(destinations.country, destinations.city);

    return NextResponse.json({
      success: true,
      destinations: result,
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}

// POST - Create new destination
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await db
      .insert(destinations)
      .values({
        country: body.country,
        region: body.region,
        city: body.city,
        description: body.description,
        altitude: body.altitude ? parseInt(body.altitude) : null,
        isActive: body.isActive ?? true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Destination created successfully",
      destination: result[0],
    });
  } catch (error) {
    console.error("Error creating destination:", error);
    return NextResponse.json(
      { error: "Failed to create destination" },
      { status: 500 }
    );
  }
}
