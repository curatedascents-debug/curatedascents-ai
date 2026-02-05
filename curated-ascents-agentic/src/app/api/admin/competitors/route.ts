import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { competitorRates, destinations } from "@/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - List all competitor rates with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const competitorName = searchParams.get("competitor");
    const destinationId = searchParams.get("destinationId");

    const conditions = [];
    if (serviceType) conditions.push(eq(competitorRates.serviceType, serviceType));
    if (competitorName) conditions.push(eq(competitorRates.competitorName, competitorName));
    if (destinationId) conditions.push(eq(competitorRates.destinationId, parseInt(destinationId)));

    const rates = await db
      .select({
        id: competitorRates.id,
        competitorName: competitorRates.competitorName,
        competitorUrl: competitorRates.competitorUrl,
        serviceType: competitorRates.serviceType,
        serviceName: competitorRates.serviceName,
        destinationId: competitorRates.destinationId,
        destinationName: destinations.city,
        price: competitorRates.price,
        currency: competitorRates.currency,
        priceDate: competitorRates.priceDate,
        travelDateStart: competitorRates.travelDateStart,
        travelDateEnd: competitorRates.travelDateEnd,
        source: competitorRates.source,
        notes: competitorRates.notes,
        createdAt: competitorRates.createdAt,
      })
      .from(competitorRates)
      .leftJoin(destinations, eq(competitorRates.destinationId, destinations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(competitorRates.priceDate), competitorRates.competitorName);

    // Get unique competitor names for filters
    const competitors = await db
      .selectDistinct({ name: competitorRates.competitorName })
      .from(competitorRates)
      .orderBy(competitorRates.competitorName);

    // Get service types for filters
    const serviceTypes = await db
      .selectDistinct({ type: competitorRates.serviceType })
      .from(competitorRates)
      .orderBy(competitorRates.serviceType);

    return NextResponse.json({
      success: true,
      rates,
      filters: {
        competitors: competitors.map(c => c.name),
        serviceTypes: serviceTypes.map(s => s.type),
      },
    });
  } catch (error) {
    console.error("Error fetching competitor rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitor rates" },
      { status: 500 }
    );
  }
}

// POST - Create new competitor rate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      competitorName,
      competitorUrl,
      serviceType,
      serviceName,
      destinationId,
      price,
      currency = "USD",
      priceDate,
      travelDateStart,
      travelDateEnd,
      source = "manual",
      notes,
    } = body;

    if (!competitorName || !serviceType || !serviceName || !price || !priceDate) {
      return NextResponse.json(
        { error: "Missing required fields: competitorName, serviceType, serviceName, price, priceDate" },
        { status: 400 }
      );
    }

    const [newRate] = await db
      .insert(competitorRates)
      .values({
        competitorName,
        competitorUrl,
        serviceType,
        serviceName,
        destinationId: destinationId ? parseInt(destinationId) : null,
        price: price.toString(),
        currency,
        priceDate,
        travelDateStart,
        travelDateEnd,
        source,
        notes,
      })
      .returning();

    return NextResponse.json({
      success: true,
      rate: newRate,
    });
  } catch (error) {
    console.error("Error creating competitor rate:", error);
    return NextResponse.json(
      { error: "Failed to create competitor rate" },
      { status: 500 }
    );
  }
}
