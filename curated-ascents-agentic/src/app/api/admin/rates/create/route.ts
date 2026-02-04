import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  hotelRoomRates,
  transportation,
  guides,
  porters,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  permitsFees,
  packages,
  miscellaneousServices,
} from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, ...data } = body;

    let result;

    switch (serviceType) {
      case "hotel":
        if (!data.hotelId) {
          return NextResponse.json({ error: "hotelId is required for hotel rates" }, { status: 400 });
        }
        result = await db.insert(hotelRoomRates).values({
          hotelId: parseInt(data.hotelId),
          roomType: data.roomType,
          mealPlan: data.mealPlan,
          costSingle: data.costSingle || undefined,
          costDouble: data.costDouble || undefined,
          costTriple: data.costTriple || undefined,
          costExtraBed: data.costExtraBed || undefined,
          costChildWithBed: data.costChildWithBed || undefined,
          costChildNoBed: data.costChildNoBed || undefined,
          sellSingle: data.sellSingle || undefined,
          sellDouble: data.sellDouble || undefined,
          sellTriple: data.sellTriple || undefined,
          sellExtraBed: data.sellExtraBed || undefined,
          sellChildWithBed: data.sellChildWithBed || undefined,
          sellChildNoBed: data.sellChildNoBed || undefined,
          marginPercent: data.marginPercent || "50",
          currency: data.currency || "USD",
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          vatPercent: data.vatPercent || "13",
          serviceChargePercent: data.serviceChargePercent || "10",
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "transportation":
        result = await db.insert(transportation).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          vehicleType: data.vehicleType,
          vehicleName: data.vehicleName || undefined,
          capacity: data.capacity ? parseInt(data.capacity) : undefined,
          routeFrom: data.routeFrom || undefined,
          routeTo: data.routeTo || undefined,
          routeDescription: data.routeDescription || undefined,
          distanceKm: data.distanceKm ? parseInt(data.distanceKm) : undefined,
          durationHours: data.durationHours || undefined,
          costPrice: data.costPrice || undefined,
          sellPrice: data.sellPrice || undefined,
          marginPercent: data.marginPercent || "50",
          priceType: data.priceType || "per_vehicle",
          currency: data.currency || "USD",
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "guide":
        result = await db.insert(guides).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          guideType: data.guideType,
          destination: data.destination || undefined,
          licenseNumber: data.licenseNumber || undefined,
          languages: data.languages || undefined,
          specializations: data.specializations || undefined,
          experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
          costPerDay: data.costPerDay || undefined,
          sellPerDay: data.sellPerDay || undefined,
          marginPercent: data.marginPercent || "50",
          currency: data.currency || "USD",
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          maxGroupSize: data.maxGroupSize ? parseInt(data.maxGroupSize) : undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "porter":
        result = await db.insert(porters).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          region: data.region || undefined,
          maxWeightKg: data.maxWeightKg ? parseInt(data.maxWeightKg) : 25,
          costPerDay: data.costPerDay || undefined,
          sellPerDay: data.sellPerDay || undefined,
          marginPercent: data.marginPercent || "50",
          currency: data.currency || "USD",
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "flight":
        result = await db.insert(flightsDomestic).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          airlineName: data.airlineName,
          flightSector: data.flightSector,
          departureCity: data.departureCity || undefined,
          arrivalCity: data.arrivalCity || undefined,
          flightDuration: data.flightDuration || undefined,
          baggageAllowanceKg: data.baggageAllowanceKg ? parseInt(data.baggageAllowanceKg) : undefined,
          aircraftType: data.aircraftType || undefined,
          costPrice: data.costPrice || undefined,
          sellPrice: data.sellPrice || undefined,
          marginPercent: data.marginPercent || "50",
          currency: data.currency || "USD",
          fareClass: data.fareClass || "economy",
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "helicopter_sharing":
        result = await db.insert(helicopterSharing).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          routeName: data.routeName,
          routeFrom: data.routeFrom || undefined,
          routeTo: data.routeTo || undefined,
          flightDuration: data.flightDuration || undefined,
          helicopterType: data.helicopterType || undefined,
          seatsAvailable: data.seatsAvailable ? parseInt(data.seatsAvailable) : undefined,
          minPassengers: data.minPassengers ? parseInt(data.minPassengers) : undefined,
          costPerSeat: data.costPerSeat || undefined,
          sellPerSeat: data.sellPerSeat || undefined,
          marginPercent: data.marginPercent || "50",
          currency: data.currency || "USD",
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "helicopter_charter":
        result = await db.insert(helicopterCharter).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          routeName: data.routeName,
          routeFrom: data.routeFrom || undefined,
          routeTo: data.routeTo || undefined,
          flightDuration: data.flightDuration || undefined,
          helicopterType: data.helicopterType || undefined,
          maxPassengers: data.maxPassengers ? parseInt(data.maxPassengers) : undefined,
          maxPayloadKg: data.maxPayloadKg ? parseInt(data.maxPayloadKg) : undefined,
          costPerCharter: data.costPerCharter || undefined,
          sellPerCharter: data.sellPerCharter || undefined,
          marginPercent: data.marginPercent || "50",
          currency: data.currency || "USD",
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "permit":
        result = await db.insert(permitsFees).values({
          name: data.name,
          type: data.type,
          country: data.country || undefined,
          region: data.region || undefined,
          applicableTo: data.applicableTo || undefined,
          costPrice: data.costPrice || undefined,
          sellPrice: data.sellPrice || undefined,
          currency: data.currency || "USD",
          priceType: data.priceType || "per_person",
          description: data.description || undefined,
          requiredDocuments: data.requiredDocuments || undefined,
          processingTime: data.processingTime || undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "package":
        result = await db.insert(packages).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          name: data.name,
          packageType: data.packageType,
          country: data.country || undefined,
          region: data.region || undefined,
          durationDays: data.durationDays ? parseInt(data.durationDays) : undefined,
          durationNights: data.durationNights ? parseInt(data.durationNights) : undefined,
          difficulty: data.difficulty || undefined,
          maxAltitude: data.maxAltitude ? parseInt(data.maxAltitude) : undefined,
          groupSizeMin: data.groupSizeMin ? parseInt(data.groupSizeMin) : undefined,
          groupSizeMax: data.groupSizeMax ? parseInt(data.groupSizeMax) : undefined,
          itinerarySummary: data.itinerarySummary || undefined,
          itineraryDetailed: data.itineraryDetailed || undefined,
          costPrice: data.costPrice || undefined,
          sellPrice: data.sellPrice || undefined,
          marginPercent: data.marginPercent || "50",
          priceType: data.priceType || "per_person",
          currency: data.currency || "USD",
          pricingTiers: data.pricingTiers || undefined,
          singleSupplement: data.singleSupplement || undefined,
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          departureDates: data.departureDates || undefined,
          isFixedDeparture: data.isFixedDeparture ?? false,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      case "miscellaneous":
        result = await db.insert(miscellaneousServices).values({
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          name: data.name,
          category: data.category,
          destination: data.destination || undefined,
          description: data.description || undefined,
          duration: data.duration || undefined,
          capacity: data.capacity ? parseInt(data.capacity) : undefined,
          minParticipants: data.minParticipants ? parseInt(data.minParticipants) : undefined,
          costPrice: data.costPrice || undefined,
          sellPrice: data.sellPrice || undefined,
          marginPercent: data.marginPercent || "50",
          priceType: data.priceType || "per_person",
          currency: data.currency || "USD",
          inclusions: data.inclusions || undefined,
          exclusions: data.exclusions || undefined,
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
          notes: data.notes || undefined,
          isActive: data.isActive ?? true,
        }).returning();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown service type: ${serviceType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${serviceType} rate created successfully`,
      rate: result[0],
    });
  } catch (error) {
    console.error("Error creating rate:", error);
    return NextResponse.json(
      {
        error: "Failed to create rate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
