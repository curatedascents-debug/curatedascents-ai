/**
 * Emergency Contacts API
 * GET /api/admin/risk/emergency-contacts - List emergency contacts
 * POST /api/admin/risk/emergency-contacts - Create emergency contact
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emergencyContacts } from "@/db/schema";
import { eq, and, desc, or, isNull } from "drizzle-orm";
import { getEmergencyContacts } from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country") || undefined;
    const region = searchParams.get("region") || undefined;
    const destinationId = searchParams.get("destinationId")
      ? parseInt(searchParams.get("destinationId")!)
      : undefined;
    const contactType = searchParams.get("contactType") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    if (includeInactive) {
      // Return all contacts for admin management
      let whereConditions = [];

      if (country) {
        whereConditions.push(eq(emergencyContacts.country, country));
      }
      if (region) {
        whereConditions.push(
          or(
            isNull(emergencyContacts.region),
            eq(emergencyContacts.region, region)
          )
        );
      }
      if (destinationId) {
        whereConditions.push(
          or(
            isNull(emergencyContacts.destinationId),
            eq(emergencyContacts.destinationId, destinationId)
          )
        );
      }
      if (contactType) {
        whereConditions.push(eq(emergencyContacts.contactType, contactType));
      }

      const contacts = await db
        .select()
        .from(emergencyContacts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(emergencyContacts.priority, desc(emergencyContacts.createdAt));

      return NextResponse.json({ contacts });
    }

    // Need country for active query
    if (!country) {
      return NextResponse.json(
        { error: "Country parameter is required" },
        { status: 400 }
      );
    }

    const contacts = await getEmergencyContacts({ country, region, destinationId, contactType });
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      country,
      region,
      destinationId,
      contactType,
      contactName,
      organization,
      phoneNumber,
      alternatePhone,
      whatsapp,
      email,
      address,
      coordinates,
      availability,
      operatingHours,
      languages,
      specialInstructions,
      internalNotes,
      priority,
      agencyId,
    } = body;

    // Validate required fields
    if (!country || !contactType || !contactName) {
      return NextResponse.json(
        { error: "Missing required fields: country, contactType, contactName" },
        { status: 400 }
      );
    }

    const [contact] = await db
      .insert(emergencyContacts)
      .values({
        country,
        region,
        destinationId,
        contactType,
        contactName,
        organization,
        phoneNumber,
        alternatePhone,
        whatsapp,
        email,
        address,
        coordinates,
        availability,
        operatingHours,
        languages,
        specialInstructions,
        internalNotes,
        priority: priority || 1,
        isActive: true,
        agencyId,
      })
      .returning({ id: emergencyContacts.id });

    return NextResponse.json({
      success: true,
      contactId: contact.id,
    });
  } catch (error) {
    console.error("Error creating emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to create emergency contact" },
      { status: 500 }
    );
  }
}
