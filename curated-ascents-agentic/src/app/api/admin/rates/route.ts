import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  hotels,
  hotelRoomRates,
  transportation,
  guides,
  porters,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  permitsFees,
  packages,
  miscellaneousServices
} from "@/db/schema";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";
import { handleApiError } from "@/lib/api/error-handler";

// Get all rates with FULL details (for admin)
export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let results: any[] = [];

    // Hotels with room rates - FULL DATA
    if (!category || category === "hotels") {
      const hotelData = await db
        .select({
          // Rate fields
          id: hotelRoomRates.id,
          roomType: hotelRoomRates.roomType,
          mealPlan: hotelRoomRates.mealPlan,
          // Cost prices (internal)
          costSingle: hotelRoomRates.costSingle,
          costDouble: hotelRoomRates.costDouble,
          costTriple: hotelRoomRates.costTriple,
          costExtraBed: hotelRoomRates.costExtraBed,
          costChildWithBed: hotelRoomRates.costChildWithBed,
          costChildNoBed: hotelRoomRates.costChildNoBed,
          // Sell prices
          sellSingle: hotelRoomRates.sellSingle,
          sellDouble: hotelRoomRates.sellDouble,
          sellTriple: hotelRoomRates.sellTriple,
          sellExtraBed: hotelRoomRates.sellExtraBed,
          sellChildWithBed: hotelRoomRates.sellChildWithBed,
          sellChildNoBed: hotelRoomRates.sellChildNoBed,
          // Margins & taxes
          marginPercent: hotelRoomRates.marginPercent,
          vatPercent: hotelRoomRates.vatPercent,
          serviceChargePercent: hotelRoomRates.serviceChargePercent,
          // Other
          currency: hotelRoomRates.currency,
          inclusions: hotelRoomRates.inclusions,
          exclusions: hotelRoomRates.exclusions,
          validFrom: hotelRoomRates.validFrom,
          validTo: hotelRoomRates.validTo,
          notes: hotelRoomRates.notes,
          isActive: hotelRoomRates.isActive,
          // Hotel fields
          hotelId: hotels.id,
          hotelName: hotels.name,
          starRating: hotels.starRating,
          hotelCategory: hotels.category,
          description: hotels.description,
          amenities: hotels.amenities,
        })
        .from(hotelRoomRates)
        .leftJoin(hotels, eq(hotelRoomRates.hotelId, hotels.id));
      
      results.push(...hotelData.map(r => ({ ...r, serviceType: 'hotel' })));
    }

    // Transportation - FULL DATA
    if (!category || category === "transportation") {
      const transportData = await db
        .select()
        .from(transportation);
      
      results.push(...transportData.map(r => ({ ...r, serviceType: 'transportation' })));
    }

    // Guides - FULL DATA
    if (!category || category === "guides") {
      const guideData = await db
        .select()
        .from(guides);
      
      results.push(...guideData.map(r => ({ ...r, serviceType: 'guide' })));
    }

    // Porters - FULL DATA
    if (!category || category === "porters") {
      const porterData = await db
        .select()
        .from(porters);
      
      results.push(...porterData.map(r => ({ ...r, serviceType: 'porter' })));
    }

    // Domestic Flights - FULL DATA
    if (!category || category === "flights") {
      const flightData = await db
        .select()
        .from(flightsDomestic);
      
      results.push(...flightData.map(r => ({ ...r, serviceType: 'flight' })));
    }

    // Helicopter Sharing - FULL DATA
    if (!category || category === "helicopter") {
      const heliShareData = await db
        .select()
        .from(helicopterSharing);
      
      results.push(...heliShareData.map(r => ({ ...r, serviceType: 'helicopter_sharing' })));

      const heliCharterData = await db
        .select()
        .from(helicopterCharter);
      
      results.push(...heliCharterData.map(r => ({ ...r, serviceType: 'helicopter_charter' })));
    }

    // Permits & Fees - FULL DATA
    if (!category || category === "permits") {
      const permitData = await db
        .select()
        .from(permitsFees);
      
      results.push(...permitData.map(r => ({ ...r, serviceType: 'permit' })));
    }

    // Packages - FULL DATA
    if (!category || category === "packages") {
      const packageData = await db
        .select()
        .from(packages);
      
      results.push(...packageData.map(r => ({ ...r, serviceType: 'package' })));
    }

    // Miscellaneous Services - FULL DATA
    if (!category || category === "miscellaneous") {
      const miscData = await db
        .select()
        .from(miscellaneousServices);
      
      results.push(...miscData.map(r => ({ ...r, serviceType: 'miscellaneous' })));
    }

    return NextResponse.json({ 
      success: true,
      count: results.length,
      rates: results 
    });
  } catch (error) {
    return handleApiError(error, "admin-rates-get");
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { message: "Use specific endpoints for each service type" },
    { status: 400 }
  );
}