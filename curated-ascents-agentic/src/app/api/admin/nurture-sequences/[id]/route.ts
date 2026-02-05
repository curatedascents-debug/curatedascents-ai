/**
 * Single Nurture Sequence API
 * GET /api/admin/nurture-sequences/[id] - Get sequence details with enrollments
 * PUT /api/admin/nurture-sequences/[id] - Update sequence
 * DELETE /api/admin/nurture-sequences/[id] - Delete sequence
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { nurtureSequences, nurtureEnrollments, clients } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  updateNurtureSequence,
  getNurtureStats,
  enrollInSequence,
  cancelEnrollment,
  pauseEnrollment,
  resumeEnrollment,
} from "@/lib/lead-intelligence/nurture-engine";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sequenceId = parseInt(id);

    // Get sequence
    const [sequence] = await db
      .select()
      .from(nurtureSequences)
      .where(eq(nurtureSequences.id, sequenceId))
      .limit(1);

    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence not found" },
        { status: 404 }
      );
    }

    // Get stats for this sequence
    const stats = await getNurtureStats(sequenceId);

    // Get recent enrollments with client info
    const enrollments = await db
      .select({
        enrollment: nurtureEnrollments,
        client: {
          id: clients.id,
          name: clients.name,
          email: clients.email,
        },
      })
      .from(nurtureEnrollments)
      .innerJoin(clients, eq(nurtureEnrollments.clientId, clients.id))
      .where(eq(nurtureEnrollments.sequenceId, sequenceId))
      .orderBy(desc(nurtureEnrollments.enrolledAt))
      .limit(50);

    return NextResponse.json({
      sequence,
      stats: stats[0] || {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        cancelledEnrollments: 0,
        totalEmailsSent: 0,
        totalEmailsOpened: 0,
        totalLinksClicked: 0,
      },
      recentEnrollments: enrollments.map(({ enrollment, client }) => ({
        ...enrollment,
        client,
      })),
    });
  } catch (error) {
    console.error("Error fetching nurture sequence:", error);
    return NextResponse.json(
      { error: "Failed to fetch nurture sequence" },
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
    const sequenceId = parseInt(id);
    const body = await request.json();

    // Check if it's an enrollment action
    if (body.enrollmentAction) {
      const { enrollmentAction, enrollmentId, clientId, reason } = body;

      switch (enrollmentAction) {
        case "enroll":
          if (!clientId) {
            return NextResponse.json(
              { error: "clientId is required for enrollment" },
              { status: 400 }
            );
          }
          const enrollResult = await enrollInSequence(clientId, sequenceId);
          return NextResponse.json(enrollResult);

        case "cancel":
          if (!enrollmentId) {
            return NextResponse.json(
              { error: "enrollmentId is required" },
              { status: 400 }
            );
          }
          const cancelResult = await cancelEnrollment(enrollmentId, reason || "Manual cancellation");
          return NextResponse.json({ success: cancelResult });

        case "pause":
          if (!enrollmentId) {
            return NextResponse.json(
              { error: "enrollmentId is required" },
              { status: 400 }
            );
          }
          const pauseResult = await pauseEnrollment(enrollmentId);
          return NextResponse.json({ success: pauseResult });

        case "resume":
          if (!enrollmentId) {
            return NextResponse.json(
              { error: "enrollmentId is required" },
              { status: 400 }
            );
          }
          const resumeResult = await resumeEnrollment(enrollmentId);
          return NextResponse.json({ success: resumeResult });

        default:
          return NextResponse.json(
            { error: "Invalid enrollmentAction" },
            { status: 400 }
          );
      }
    }

    // Otherwise, update the sequence itself
    const { name, description, triggerConditions, emails, isActive } = body;

    const sequence = await updateNurtureSequence(sequenceId, {
      name,
      description,
      triggerConditions,
      emails,
      isActive,
    });

    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ sequence });
  } catch (error) {
    console.error("Error updating nurture sequence:", error);
    return NextResponse.json(
      { error: "Failed to update nurture sequence" },
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
    const sequenceId = parseInt(id);

    // Check if sequence has active enrollments
    const activeEnrollments = await db
      .select()
      .from(nurtureEnrollments)
      .where(
        and(
          eq(nurtureEnrollments.sequenceId, sequenceId),
          eq(nurtureEnrollments.status, "active")
        )
      )
      .limit(1);

    if (activeEnrollments.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete sequence with active enrollments. Deactivate it first." },
        { status: 400 }
      );
    }

    // Soft delete by deactivating
    const [updated] = await db
      .update(nurtureSequences)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(nurtureSequences.id, sequenceId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Sequence not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sequence deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting nurture sequence:", error);
    return NextResponse.json(
      { error: "Failed to delete nurture sequence" },
      { status: 500 }
    );
  }
}
