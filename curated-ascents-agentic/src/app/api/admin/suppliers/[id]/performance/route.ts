import { NextRequest, NextResponse } from "next/server";
import {
  getSupplierPerformance,
  calculateSupplierPerformance,
  saveSupplierPerformance,
} from "@/lib/suppliers/supplier-relations-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/suppliers/[id]/performance
 * Get supplier performance metrics and history
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId");

    const performance = await getSupplierPerformance(
      supplierId,
      agencyId ? parseInt(agencyId) : undefined
    );

    return NextResponse.json({
      success: true,
      supplierId,
      current: performance.current,
      history: performance.history,
    });
  } catch (error) {
    console.error("Error fetching supplier performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier performance" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/suppliers/[id]/performance
 * Calculate and save supplier performance for a period
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { periodStart, periodEnd, agencyId } = body;

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "periodStart and periodEnd are required" },
        { status: 400 }
      );
    }

    // Calculate performance
    const metrics = await calculateSupplierPerformance(
      supplierId,
      new Date(periodStart),
      new Date(periodEnd),
      agencyId
    );

    // Save to database
    const result = await saveSupplierPerformance(
      metrics,
      new Date(periodStart),
      new Date(periodEnd),
      agencyId
    );

    return NextResponse.json({
      success: true,
      performanceId: result.performanceId,
      metrics: {
        totalRequests: metrics.totalRequests,
        confirmedRequests: metrics.confirmedRequests,
        confirmationRate: metrics.confirmationRate.toFixed(2),
        avgResponseTimeHours: metrics.avgResponseTimeHours.toFixed(2),
        performanceScore: metrics.performanceScore.toFixed(2),
        overallScore: metrics.overallScore.toFixed(2),
        performanceTier: metrics.performanceTier,
      },
    });
  } catch (error) {
    console.error("Error calculating supplier performance:", error);
    return NextResponse.json(
      { error: "Failed to calculate supplier performance" },
      { status: 500 }
    );
  }
}
