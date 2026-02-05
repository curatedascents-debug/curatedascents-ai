import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { nurtureEnrollments, nurtureSequences, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - List all enrollments with client and sequence info
export async function GET() {
  try {
    const enrollments = await db
      .select({
        id: nurtureEnrollments.id,
        clientId: nurtureEnrollments.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        sequenceId: nurtureEnrollments.sequenceId,
        sequenceName: nurtureSequences.name,
        currentStep: nurtureEnrollments.currentStep,
        status: nurtureEnrollments.status,
        emailsSent: nurtureEnrollments.emailsSent,
        emailsOpened: nurtureEnrollments.emailsOpened,
        linksClicked: nurtureEnrollments.linksClicked,
        enrolledAt: nurtureEnrollments.enrolledAt,
        lastEmailSentAt: nurtureEnrollments.lastEmailSentAt,
        nextEmailAt: nurtureEnrollments.nextEmailAt,
      })
      .from(nurtureEnrollments)
      .leftJoin(clients, eq(nurtureEnrollments.clientId, clients.id))
      .leftJoin(nurtureSequences, eq(nurtureEnrollments.sequenceId, nurtureSequences.id))
      .orderBy(desc(nurtureEnrollments.enrolledAt));

    return NextResponse.json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

// POST - Enroll a client in a sequence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, sequenceId } = body;

    if (!clientId || !sequenceId) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, sequenceId" },
        { status: 400 }
      );
    }

    const [newEnrollment] = await db
      .insert(nurtureEnrollments)
      .values({
        clientId,
        sequenceId,
        currentStep: 0,
        status: "active",
        emailsSent: 0,
        emailsOpened: 0,
        linksClicked: 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      enrollment: newEnrollment,
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
