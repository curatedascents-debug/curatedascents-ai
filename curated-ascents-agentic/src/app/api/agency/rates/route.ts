import { NextResponse } from "next/server";
import { db } from "@/db";

export const dynamic = "force-dynamic";
import {
  hotelRoomRates,
  hotels,
  transportation,
  guides,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  packages,
  permitsFees,
  miscellaneousServices,
  agencies,
  agencySuppliers,
  agencyMarginOverrides,
  destinations,
} from "@/db/schema";
import { eq, and, sql, inArray, or, isNull, gte, lte } from "drizzle-orm";
import { requireAgencyContext, AgencyAuthError } from "@/lib/api/agency-context";
import { hasPermission } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET(request: Request) {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "rates", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");

    // Get agency details for margin calculation
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, ctx.agencyId))
      .limit(1);

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Get supplier IDs this agency can access
    let supplierIds: number[] = [];
    if (!agency.canAccessAllSuppliers) {
      const agencySupplierRows = await db
        .select({ supplierId: agencySuppliers.supplierId })
        .from(agencySuppliers)
        .where(
          and(
            eq(agencySuppliers.agencyId, ctx.agencyId),
            eq(agencySuppliers.isActive, true)
          )
        );
      supplierIds = agencySupplierRows.map((r) => r.supplierId);

      if (supplierIds.length === 0) {
        return NextResponse.json({ rates: [], message: "No suppliers assigned" });
      }
    }

    // Get margin overrides for this agency
    const marginOverrides = await db
      .select()
      .from(agencyMarginOverrides)
      .where(
        and(
          eq(agencyMarginOverrides.agencyId, ctx.agencyId),
          or(
            isNull(agencyMarginOverrides.validFrom),
            lte(agencyMarginOverrides.validFrom, sql`CURRENT_DATE`)
          ),
          or(
            isNull(agencyMarginOverrides.validTo),
            gte(agencyMarginOverrides.validTo, sql`CURRENT_DATE`)
          )
        )
      );

    const defaultMargin = parseFloat(agency.defaultMarginPercent || "50");

    // Helper to apply margin and calculate sell price
    const applyAgencyMargin = (
      costPrice: string | null,
      srvType: string,
      supplierId: number | null,
      destinationId?: number | null
    ): string | null => {
      if (!costPrice) return null;

      const cost = parseFloat(costPrice);
      if (isNaN(cost)) return null;

      // Find applicable margin override
      const override = marginOverrides.find((m) => {
        const matchesServiceType = !m.serviceType || m.serviceType === srvType;
        const matchesSupplier = !m.supplierId || m.supplierId === supplierId;
        const matchesDestination = !m.destinationId || m.destinationId === destinationId;
        return matchesServiceType && matchesSupplier && matchesDestination;
      });

      const margin = override
        ? parseFloat(override.marginPercent)
        : defaultMargin;

      const sellPrice = cost * (1 + margin / 100);
      return sellPrice.toFixed(2);
    };

    let rates: Record<string, unknown>[] = [];

    // Fetch rates based on service type
    if (!serviceType || serviceType === "hotel") {
      const hotelRates = await db
        .select({
          id: hotelRoomRates.id,
          hotelId: hotelRoomRates.hotelId,
          hotelName: hotels.name,
          roomType: hotelRoomRates.roomType,
          mealPlan: hotelRoomRates.mealPlan,
          costDouble: hotelRoomRates.costDouble,
          currency: hotelRoomRates.currency,
          validFrom: hotelRoomRates.validFrom,
          validTo: hotelRoomRates.validTo,
          supplierId: hotels.supplierId,
          destinationId: hotels.destinationId,
        })
        .from(hotelRoomRates)
        .innerJoin(hotels, eq(hotelRoomRates.hotelId, hotels.id))
        .where(
          and(
            eq(hotelRoomRates.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(hotels.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        hotelRates.map((r) => ({
          ...r,
          serviceType: "hotel",
          sellPrice: applyAgencyMargin(r.costDouble, "hotel", r.supplierId, r.destinationId),
        }))
      );
    }

    if (!serviceType || serviceType === "transportation") {
      const transportRates = await db
        .select()
        .from(transportation)
        .where(
          and(
            eq(transportation.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(transportation.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        transportRates.map((r) => ({
          id: r.id,
          serviceType: "transportation",
          name: `${r.vehicleType} - ${r.routeFrom} to ${r.routeTo}`,
          vehicleType: r.vehicleType,
          routeFrom: r.routeFrom,
          routeTo: r.routeTo,
          capacity: r.capacity,
          sellPrice: applyAgencyMargin(r.costPrice, "transportation", r.supplierId),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );
    }

    if (!serviceType || serviceType === "guide") {
      const guideRates = await db
        .select()
        .from(guides)
        .where(
          and(
            eq(guides.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(guides.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        guideRates.map((r) => ({
          id: r.id,
          serviceType: "guide",
          name: `${r.guideType} Guide - ${r.destination}`,
          guideType: r.guideType,
          destination: r.destination,
          sellPricePerDay: applyAgencyMargin(r.costPerDay, "guide", r.supplierId),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );
    }

    if (!serviceType || serviceType === "flight") {
      const flightRates = await db
        .select()
        .from(flightsDomestic)
        .where(
          and(
            eq(flightsDomestic.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(flightsDomestic.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        flightRates.map((r) => ({
          id: r.id,
          serviceType: "flight",
          name: `${r.airlineName} - ${r.flightSector}`,
          airlineName: r.airlineName,
          flightSector: r.flightSector,
          sellPrice: applyAgencyMargin(r.costPrice, "flight", r.supplierId),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );
    }

    if (!serviceType || serviceType === "helicopter") {
      const heliShareRates = await db
        .select()
        .from(helicopterSharing)
        .where(
          and(
            eq(helicopterSharing.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(helicopterSharing.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        heliShareRates.map((r) => ({
          id: r.id,
          serviceType: "helicopter_sharing",
          name: r.routeName,
          routeFrom: r.routeFrom,
          routeTo: r.routeTo,
          sellPricePerSeat: applyAgencyMargin(r.costPerSeat, "helicopter", r.supplierId),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );

      const heliCharterRates = await db
        .select()
        .from(helicopterCharter)
        .where(
          and(
            eq(helicopterCharter.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(helicopterCharter.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        heliCharterRates.map((r) => ({
          id: r.id,
          serviceType: "helicopter_charter",
          name: r.routeName,
          routeFrom: r.routeFrom,
          routeTo: r.routeTo,
          sellPricePerCharter: applyAgencyMargin(r.costPerCharter, "helicopter", r.supplierId),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );
    }

    if (!serviceType || serviceType === "package") {
      const packageRates = await db
        .select()
        .from(packages)
        .where(
          and(
            eq(packages.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(packages.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        packageRates.map((r) => ({
          id: r.id,
          serviceType: "package",
          name: r.name,
          packageType: r.packageType,
          country: r.country,
          durationDays: r.durationDays,
          sellPrice: applyAgencyMargin(r.costPrice, "package", r.supplierId),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );
    }

    if (!serviceType || serviceType === "permit") {
      const permitRates = await db
        .select()
        .from(permitsFees)
        .where(eq(permitsFees.isActive, true));

      rates = rates.concat(
        permitRates.map((r) => ({
          id: r.id,
          serviceType: "permit",
          name: r.name,
          type: r.type,
          country: r.country,
          sellPrice: applyAgencyMargin(r.costPrice, "permit", null),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );
    }

    if (!serviceType || serviceType === "miscellaneous") {
      const miscRates = await db
        .select()
        .from(miscellaneousServices)
        .where(
          and(
            eq(miscellaneousServices.isActive, true),
            agency.canAccessAllSuppliers
              ? sql`1=1`
              : inArray(miscellaneousServices.supplierId, supplierIds)
          )
        );

      rates = rates.concat(
        miscRates.map((r) => ({
          id: r.id,
          serviceType: "miscellaneous",
          name: r.name,
          category: r.category,
          destination: r.destination,
          sellPrice: applyAgencyMargin(r.costPrice, "miscellaneous", r.supplierId),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        }))
      );
    }

    return NextResponse.json({ rates });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching agency rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 }
    );
  }
}
