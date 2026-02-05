import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplierRankings, destinations } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import {
  getRankedSuppliers,
  updateSupplierRankings,
} from "@/lib/suppliers/supplier-relations-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/supplier-rankings
 * Get supplier rankings by service type
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType");
    const destinationId = searchParams.get("destinationId");
    const agencyId = searchParams.get("agencyId");

    if (serviceType) {
      // Get specific ranking
      const rankedSuppliers = await getRankedSuppliers(
        serviceType,
        destinationId ? parseInt(destinationId) : undefined,
        agencyId ? parseInt(agencyId) : undefined
      );

      return NextResponse.json({
        success: true,
        serviceType,
        rankedSuppliers,
      });
    }

    // Get all rankings
    const rankings = await db
      .select({
        id: supplierRankings.id,
        serviceType: supplierRankings.serviceType,
        destinationId: supplierRankings.destinationId,
        destinationCity: destinations.city,
        rankedSuppliers: supplierRankings.rankedSuppliers,
        isAutoCalculated: supplierRankings.isAutoCalculated,
        manualOverride: supplierRankings.manualOverride,
        lastCalculatedAt: supplierRankings.lastCalculatedAt,
        updatedAt: supplierRankings.updatedAt,
      })
      .from(supplierRankings)
      .leftJoin(destinations, eq(supplierRankings.destinationId, destinations.id))
      .orderBy(supplierRankings.serviceType)
      .limit(100);

    // Get unique service types
    const serviceTypes = [...new Set(rankings.map((r) => r.serviceType))];

    return NextResponse.json({
      success: true,
      rankings,
      serviceTypes,
    });
  } catch (error) {
    console.error("Error fetching supplier rankings:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier rankings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/supplier-rankings
 * Recalculate supplier rankings for a service type
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, destinationId, agencyId } = body;

    if (!serviceType) {
      return NextResponse.json(
        { error: "serviceType is required" },
        { status: 400 }
      );
    }

    const result = await updateSupplierRankings(
      serviceType,
      destinationId,
      agencyId
    );

    // Get updated rankings to return
    const rankedSuppliers = await getRankedSuppliers(
      serviceType,
      destinationId,
      agencyId
    );

    return NextResponse.json({
      success: true,
      rankingId: result.rankingId,
      rankedSuppliers,
      message: "Rankings updated successfully",
    });
  } catch (error) {
    console.error("Error updating supplier rankings:", error);
    return NextResponse.json(
      { error: "Failed to update supplier rankings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/supplier-rankings
 * Manually override supplier rankings
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      rankingId,
      rankedSuppliers,
      overrideReason,
      overrideBy,
    } = body;

    if (!rankingId || !rankedSuppliers) {
      return NextResponse.json(
        { error: "rankingId and rankedSuppliers are required" },
        { status: 400 }
      );
    }

    // Validate rankedSuppliers format
    if (!Array.isArray(rankedSuppliers)) {
      return NextResponse.json(
        { error: "rankedSuppliers must be an array" },
        { status: 400 }
      );
    }

    // Update with manual override
    await db
      .update(supplierRankings)
      .set({
        rankedSuppliers,
        manualOverride: true,
        overrideReason,
        overrideBy,
        isAutoCalculated: false,
        updatedAt: new Date(),
      })
      .where(eq(supplierRankings.id, rankingId));

    return NextResponse.json({
      success: true,
      message: "Rankings manually updated",
    });
  } catch (error) {
    console.error("Error manually updating supplier rankings:", error);
    return NextResponse.json(
      { error: "Failed to update supplier rankings" },
      { status: 500 }
    );
  }
}
