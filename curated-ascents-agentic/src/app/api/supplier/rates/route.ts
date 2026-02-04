import { NextResponse } from "next/server";
import { db } from "@/db";

export const dynamic = "force-dynamic";
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
import { eq } from "drizzle-orm";
import { requireSupplierContext, SupplierAuthError } from "@/lib/api/supplier-context";

export async function GET() {
  try {
    const ctx = await requireSupplierContext();
    const supplierId = ctx.supplierId;

    // Collect all rates from various service tables
    const allRates: any[] = [];

    // Hotels and room rates
    const supplierHotels = await db
      .select()
      .from(hotels)
      .where(eq(hotels.supplierId, supplierId));

    for (const hotel of supplierHotels) {
      const roomRates = await db
        .select()
        .from(hotelRoomRates)
        .where(eq(hotelRoomRates.hotelId, hotel.id));

      for (const rate of roomRates) {
        allRates.push({
          id: rate.id,
          hotelId: hotel.id,
          serviceType: "hotel_room",
          name: `${hotel.name} - ${rate.roomType} (${rate.mealPlan})`,
          roomType: rate.roomType,
          mealPlan: rate.mealPlan,
          costPrice: rate.costDouble,
          sellPrice: rate.sellDouble,
          costSingle: rate.costSingle,
          sellSingle: rate.sellSingle,
          costTriple: rate.costTriple,
          sellTriple: rate.sellTriple,
          currency: rate.currency,
          validFrom: rate.validFrom,
          validTo: rate.validTo,
          inclusions: rate.inclusions,
          exclusions: rate.exclusions,
          notes: rate.notes,
          isActive: rate.isActive,
        });
      }
    }

    // Transportation
    const transportRates = await db
      .select()
      .from(transportation)
      .where(eq(transportation.supplierId, supplierId));

    for (const rate of transportRates) {
      allRates.push({
        id: rate.id,
        serviceType: "transportation",
        name: rate.vehicleName || `${rate.vehicleType} - ${rate.routeFrom} to ${rate.routeTo}`,
        vehicleType: rate.vehicleType,
        vehicleName: rate.vehicleName,
        routeFrom: rate.routeFrom,
        routeTo: rate.routeTo,
        capacity: rate.capacity,
        costPrice: rate.costPrice,
        sellPrice: rate.sellPrice,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    // Guides
    const guideRates = await db
      .select()
      .from(guides)
      .where(eq(guides.supplierId, supplierId));

    for (const rate of guideRates) {
      allRates.push({
        id: rate.id,
        serviceType: "guide",
        name: `${rate.guideType} Guide - ${rate.destination || "General"}`,
        guideType: rate.guideType,
        destination: rate.destination,
        costPrice: rate.costPerDay,
        sellPrice: rate.sellPerDay,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    // Porters
    const porterRates = await db
      .select()
      .from(porters)
      .where(eq(porters.supplierId, supplierId));

    for (const rate of porterRates) {
      allRates.push({
        id: rate.id,
        serviceType: "porter",
        name: `Porter - ${rate.region || "General"}`,
        region: rate.region,
        costPrice: rate.costPerDay,
        sellPrice: rate.sellPerDay,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    // Domestic Flights
    const flightRates = await db
      .select()
      .from(flightsDomestic)
      .where(eq(flightsDomestic.supplierId, supplierId));

    for (const rate of flightRates) {
      allRates.push({
        id: rate.id,
        serviceType: "flight",
        name: `${rate.airlineName} - ${rate.flightSector}`,
        airlineName: rate.airlineName,
        flightSector: rate.flightSector,
        costPrice: rate.costPrice,
        sellPrice: rate.sellPrice,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    // Helicopter Sharing
    const heliSharingRates = await db
      .select()
      .from(helicopterSharing)
      .where(eq(helicopterSharing.supplierId, supplierId));

    for (const rate of heliSharingRates) {
      allRates.push({
        id: rate.id,
        serviceType: "helicopter_sharing",
        name: `Heli Sharing - ${rate.routeName}`,
        routeName: rate.routeName,
        routeFrom: rate.routeFrom,
        routeTo: rate.routeTo,
        costPrice: rate.costPerSeat,
        sellPrice: rate.sellPerSeat,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    // Helicopter Charter
    const heliCharterRates = await db
      .select()
      .from(helicopterCharter)
      .where(eq(helicopterCharter.supplierId, supplierId));

    for (const rate of heliCharterRates) {
      allRates.push({
        id: rate.id,
        serviceType: "helicopter_charter",
        name: `Heli Charter - ${rate.routeName}`,
        routeName: rate.routeName,
        routeFrom: rate.routeFrom,
        routeTo: rate.routeTo,
        costPrice: rate.costPerCharter,
        sellPrice: rate.sellPerCharter,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    // Miscellaneous Services
    const miscRates = await db
      .select()
      .from(miscellaneousServices)
      .where(eq(miscellaneousServices.supplierId, supplierId));

    for (const rate of miscRates) {
      allRates.push({
        id: rate.id,
        serviceType: "miscellaneous",
        name: rate.name,
        category: rate.category,
        description: rate.description,
        costPrice: rate.costPrice,
        sellPrice: rate.sellPrice,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    // Packages
    const packageRates = await db
      .select()
      .from(packages)
      .where(eq(packages.supplierId, supplierId));

    for (const rate of packageRates) {
      allRates.push({
        id: rate.id,
        serviceType: "package",
        name: rate.name,
        packageType: rate.packageType,
        durationDays: rate.durationDays,
        durationNights: rate.durationNights,
        costPrice: rate.costPrice,
        sellPrice: rate.sellPrice,
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        inclusions: rate.inclusions,
        exclusions: rate.exclusions,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    }

    return NextResponse.json({ rates: allRates });
  } catch (error) {
    if (error instanceof SupplierAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching supplier rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 }
    );
  }
}
