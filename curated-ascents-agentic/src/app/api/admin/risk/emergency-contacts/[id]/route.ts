/**
 * Single Emergency Contact API
 * GET /api/admin/risk/emergency-contacts/[id] - Get contact details
 * PUT /api/admin/risk/emergency-contacts/[id] - Update contact
 * DELETE /api/admin/risk/emergency-contacts/[id] - Deactivate contact
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emergencyContacts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactId = parseInt(id);

    const [contact] = await db
      .select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.id, contactId))
      .limit(1);

    if (!contact) {
      return NextResponse.json(
        { error: "Emergency contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Error fetching emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency contact" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.contactType) updateData.contactType = body.contactType;
    if (body.contactName) updateData.contactName = body.contactName;
    if (body.organization !== undefined) updateData.organization = body.organization;
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
    if (body.alternatePhone !== undefined) updateData.alternatePhone = body.alternatePhone;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.coordinates !== undefined) updateData.coordinates = body.coordinates;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.destinationId !== undefined) updateData.destinationId = body.destinationId;
    if (body.availability !== undefined) updateData.availability = body.availability;
    if (body.operatingHours !== undefined) updateData.operatingHours = body.operatingHours;
    if (body.languages !== undefined) updateData.languages = body.languages;
    if (body.specialInstructions !== undefined) updateData.specialInstructions = body.specialInstructions;
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await db
      .update(emergencyContacts)
      .set(updateData)
      .where(eq(emergencyContacts.id, contactId));

    const [updated] = await db
      .select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.id, contactId))
      .limit(1);

    return NextResponse.json({ contact: updated });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to update emergency contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactId = parseInt(id);

    // Soft delete - set isActive to false
    await db
      .update(emergencyContacts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(emergencyContacts.id, contactId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to delete emergency contact" },
      { status: 500 }
    );
  }
}
