import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  hotels,
  hotelRoomRates,
  transportation,
  guides,
  porters,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  miscellaneousServices,
  packages,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSupplierContext, SupplierAuthError } from "@/lib/api/supplier-context";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceType: string; id: string }> }
) {
  try {
    const ctx = await requireSupplierContext();
    const { serviceType, id } = await params;
    const rateId = parseInt(id, 10);

    if (isNaN(rateId)) {
      return NextResponse.json({ error: "Invalid rate ID" }, { status: 400 });
    }

    const rate = await getRateByTypeAndId(serviceType, rateId, ctx.supplierId);

    if (!rate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json({ rate });
  } catch (error) {
    if (error instanceof SupplierAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching rate:", error);
    return NextResponse.json({ error: "Failed to fetch rate" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ serviceType: string; id: string }> }
) {
  try {
    const ctx = await requireSupplierContext();
    const { serviceType, id } = await params;
    const rateId = parseInt(id, 10);

    if (isNaN(rateId)) {
      return NextResponse.json({ error: "Invalid rate ID" }, { status: 400 });
    }

    const body = await request.json();

    // Verify ownership and update
    const updatedRate = await updateRateByTypeAndId(serviceType, rateId, ctx.supplierId, body);

    if (!updatedRate) {
      return NextResponse.json({ error: "Rate not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ rate: updatedRate });
  } catch (error) {
    if (error instanceof SupplierAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error updating rate:", error);
    return NextResponse.json({ error: "Failed to update rate" }, { status: 500 });
  }
}

async function getRateByTypeAndId(serviceType: string, rateId: number, supplierId: number) {
  switch (serviceType) {
    case "hotel_room": {
      const [rate] = await db
        .select()
        .from(hotelRoomRates)
        .where(eq(hotelRoomRates.id, rateId))
        .limit(1);

      if (!rate) return null;

      // Verify hotel belongs to supplier
      const [hotel] = await db
        .select()
        .from(hotels)
        .where(and(eq(hotels.id, rate.hotelId), eq(hotels.supplierId, supplierId)))
        .limit(1);

      return hotel ? rate : null;
    }

    case "transportation": {
      const [rate] = await db
        .select()
        .from(transportation)
        .where(and(eq(transportation.id, rateId), eq(transportation.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    case "guide": {
      const [rate] = await db
        .select()
        .from(guides)
        .where(and(eq(guides.id, rateId), eq(guides.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    case "porter": {
      const [rate] = await db
        .select()
        .from(porters)
        .where(and(eq(porters.id, rateId), eq(porters.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    case "flight": {
      const [rate] = await db
        .select()
        .from(flightsDomestic)
        .where(and(eq(flightsDomestic.id, rateId), eq(flightsDomestic.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    case "helicopter_sharing": {
      const [rate] = await db
        .select()
        .from(helicopterSharing)
        .where(and(eq(helicopterSharing.id, rateId), eq(helicopterSharing.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    case "helicopter_charter": {
      const [rate] = await db
        .select()
        .from(helicopterCharter)
        .where(and(eq(helicopterCharter.id, rateId), eq(helicopterCharter.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    case "miscellaneous": {
      const [rate] = await db
        .select()
        .from(miscellaneousServices)
        .where(and(eq(miscellaneousServices.id, rateId), eq(miscellaneousServices.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    case "package": {
      const [rate] = await db
        .select()
        .from(packages)
        .where(and(eq(packages.id, rateId), eq(packages.supplierId, supplierId)))
        .limit(1);
      return rate || null;
    }

    default:
      return null;
  }
}

async function updateRateByTypeAndId(
  serviceType: string,
  rateId: number,
  supplierId: number,
  updateData: Record<string, any>
) {
  // Common fields that can be updated
  const { costPrice, sellPrice, validFrom, validTo, inclusions, exclusions, notes, isActive } = updateData;

  switch (serviceType) {
    case "hotel_room": {
      // First verify ownership
      const [existingRate] = await db
        .select({ id: hotelRoomRates.id, hotelId: hotelRoomRates.hotelId })
        .from(hotelRoomRates)
        .where(eq(hotelRoomRates.id, rateId))
        .limit(1);

      if (!existingRate) return null;

      const [hotel] = await db
        .select({ id: hotels.id })
        .from(hotels)
        .where(and(eq(hotels.id, existingRate.hotelId), eq(hotels.supplierId, supplierId)))
        .limit(1);

      if (!hotel) return null;

      const [updated] = await db
        .update(hotelRoomRates)
        .set({
          ...(costPrice !== undefined && { costDouble: costPrice }),
          ...(sellPrice !== undefined && { sellDouble: sellPrice }),
          ...(updateData.costSingle !== undefined && { costSingle: updateData.costSingle }),
          ...(updateData.sellSingle !== undefined && { sellSingle: updateData.sellSingle }),
          ...(updateData.costTriple !== undefined && { costTriple: updateData.costTriple }),
          ...(updateData.sellTriple !== undefined && { sellTriple: updateData.sellTriple }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(hotelRoomRates.id, rateId))
        .returning();

      return updated;
    }

    case "transportation": {
      const [existing] = await db
        .select({ id: transportation.id })
        .from(transportation)
        .where(and(eq(transportation.id, rateId), eq(transportation.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(transportation)
        .set({
          ...(costPrice !== undefined && { costPrice }),
          ...(sellPrice !== undefined && { sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(transportation.id, rateId))
        .returning();

      return updated;
    }

    case "guide": {
      const [existing] = await db
        .select({ id: guides.id })
        .from(guides)
        .where(and(eq(guides.id, rateId), eq(guides.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(guides)
        .set({
          ...(costPrice !== undefined && { costPerDay: costPrice }),
          ...(sellPrice !== undefined && { sellPerDay: sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(guides.id, rateId))
        .returning();

      return updated;
    }

    case "porter": {
      const [existing] = await db
        .select({ id: porters.id })
        .from(porters)
        .where(and(eq(porters.id, rateId), eq(porters.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(porters)
        .set({
          ...(costPrice !== undefined && { costPerDay: costPrice }),
          ...(sellPrice !== undefined && { sellPerDay: sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(porters.id, rateId))
        .returning();

      return updated;
    }

    case "flight": {
      const [existing] = await db
        .select({ id: flightsDomestic.id })
        .from(flightsDomestic)
        .where(and(eq(flightsDomestic.id, rateId), eq(flightsDomestic.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(flightsDomestic)
        .set({
          ...(costPrice !== undefined && { costPrice }),
          ...(sellPrice !== undefined && { sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(flightsDomestic.id, rateId))
        .returning();

      return updated;
    }

    case "helicopter_sharing": {
      const [existing] = await db
        .select({ id: helicopterSharing.id })
        .from(helicopterSharing)
        .where(and(eq(helicopterSharing.id, rateId), eq(helicopterSharing.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(helicopterSharing)
        .set({
          ...(costPrice !== undefined && { costPerSeat: costPrice }),
          ...(sellPrice !== undefined && { sellPerSeat: sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(helicopterSharing.id, rateId))
        .returning();

      return updated;
    }

    case "helicopter_charter": {
      const [existing] = await db
        .select({ id: helicopterCharter.id })
        .from(helicopterCharter)
        .where(and(eq(helicopterCharter.id, rateId), eq(helicopterCharter.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(helicopterCharter)
        .set({
          ...(costPrice !== undefined && { costPerCharter: costPrice }),
          ...(sellPrice !== undefined && { sellPerCharter: sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(helicopterCharter.id, rateId))
        .returning();

      return updated;
    }

    case "miscellaneous": {
      const [existing] = await db
        .select({ id: miscellaneousServices.id })
        .from(miscellaneousServices)
        .where(and(eq(miscellaneousServices.id, rateId), eq(miscellaneousServices.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(miscellaneousServices)
        .set({
          ...(costPrice !== undefined && { costPrice }),
          ...(sellPrice !== undefined && { sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(miscellaneousServices.id, rateId))
        .returning();

      return updated;
    }

    case "package": {
      const [existing] = await db
        .select({ id: packages.id })
        .from(packages)
        .where(and(eq(packages.id, rateId), eq(packages.supplierId, supplierId)))
        .limit(1);

      if (!existing) return null;

      const [updated] = await db
        .update(packages)
        .set({
          ...(costPrice !== undefined && { costPrice }),
          ...(sellPrice !== undefined && { sellPrice }),
          ...(validFrom !== undefined && { validFrom }),
          ...(validTo !== undefined && { validTo }),
          ...(inclusions !== undefined && { inclusions }),
          ...(exclusions !== undefined && { exclusions }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(packages.id, rateId))
        .returning();

      return updated;
    }

    default:
      return null;
  }
}
