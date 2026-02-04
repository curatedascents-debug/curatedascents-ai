import { NextRequest, NextResponse } from "next/server";
import { checkAvailability } from "@/lib/availability/availability-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/availability/check
 * Check availability for a service over a date range
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, serviceId, startDate, endDate, quantity, agencyId } = body;

    if (!serviceType || !serviceId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "serviceType, serviceId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const result = await checkAvailability({
      serviceType,
      serviceId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quantity: quantity || 1,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      availability: {
        isAvailable: result.isAvailable,
        status: result.status,
        availableCapacity: result.availableCapacity,
        totalCapacity: result.totalCapacity,
        requestedQuantity: quantity || 1,
      },
      dates: result.dates,
      summary: {
        totalDates: result.dates.length,
        availableDates: result.dates.filter((d) => d.isAvailable).length,
        blockedDates: result.dates.filter((d) => d.status === "blocked").length,
        soldOutDates: result.dates.filter((d) => d.status === "sold_out").length,
      },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/availability/check
 * Quick availability check via query params
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType");
    const serviceId = searchParams.get("serviceId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const quantity = searchParams.get("quantity");
    const agencyId = searchParams.get("agencyId");

    if (!serviceType || !serviceId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "serviceType, serviceId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const result = await checkAvailability({
      serviceType,
      serviceId: parseInt(serviceId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quantity: quantity ? parseInt(quantity) : 1,
      agencyId: agencyId ? parseInt(agencyId) : undefined,
    });

    return NextResponse.json({
      success: true,
      isAvailable: result.isAvailable,
      status: result.status,
      availableCapacity: result.availableCapacity,
      dates: result.dates,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
