import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hotels, suppliers, destinations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";
import { handleApiError } from "@/lib/api/error-handler";

// GET all hotels with supplier info
export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const result = await db
      .select({
        id: hotels.id,
        name: hotels.name,
        starRating: hotels.starRating,
        category: hotels.category,
        address: hotels.address,
        description: hotels.description,
        amenities: hotels.amenities,
        checkInTime: hotels.checkInTime,
        checkOutTime: hotels.checkOutTime,
        images: hotels.images,
        isActive: hotels.isActive,
        createdAt: hotels.createdAt,
        supplierId: hotels.supplierId,
        supplierName: suppliers.name,
        destinationId: hotels.destinationId,
        destinationCity: destinations.city,
        destinationCountry: destinations.country,
        destinationRegion: destinations.region,
      })
      .from(hotels)
      .leftJoin(suppliers, eq(hotels.supplierId, suppliers.id))
      .leftJoin(destinations, eq(hotels.destinationId, destinations.id))
      .orderBy(desc(hotels.createdAt));

    return NextResponse.json({
      success: true,
      hotels: result,
    });
  } catch (error) {
    return handleApiError(error, "admin-hotels-get");
  }
}

// POST - Create new hotel
export async function POST(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const body = await req.json();

    const result = await db
      .insert(hotels)
      .values({
        name: body.name,
        supplierId: body.supplierId ? parseInt(body.supplierId) : null,
        destinationId: body.destinationId ? parseInt(body.destinationId) : null,
        starRating: body.starRating ? parseInt(body.starRating) : null,
        category: body.category,
        address: body.address,
        description: body.description,
        amenities: body.amenities,
        checkInTime: body.checkInTime,
        checkOutTime: body.checkOutTime,
        images: body.images,
        isActive: body.isActive ?? true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Hotel created successfully",
      hotel: result[0],
    });
  } catch (error) {
    return handleApiError(error, "admin-hotels-post");
  }
}
