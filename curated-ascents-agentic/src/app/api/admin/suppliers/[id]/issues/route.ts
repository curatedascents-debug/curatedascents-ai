import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplierIssues, bookings } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  reportSupplierIssue,
  resolveSupplierIssue,
} from "@/lib/suppliers/supplier-relations-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/suppliers/[id]/issues
 * Get issues reported for a supplier
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereConditions = [eq(supplierIssues.supplierId, supplierId)];

    if (status) {
      whereConditions.push(eq(supplierIssues.status, status));
    }

    const issues = await db
      .select({
        id: supplierIssues.id,
        issueType: supplierIssues.issueType,
        severity: supplierIssues.severity,
        description: supplierIssues.description,
        status: supplierIssues.status,
        resolution: supplierIssues.resolution,
        resolvedAt: supplierIssues.resolvedAt,
        resolvedBy: supplierIssues.resolvedBy,
        financialImpact: supplierIssues.financialImpact,
        clientImpacted: supplierIssues.clientImpacted,
        compensationProvided: supplierIssues.compensationProvided,
        compensationAmount: supplierIssues.compensationAmount,
        bookingId: supplierIssues.bookingId,
        bookingReference: bookings.bookingReference,
        reportedBy: supplierIssues.reportedBy,
        createdAt: supplierIssues.createdAt,
      })
      .from(supplierIssues)
      .leftJoin(bookings, eq(supplierIssues.bookingId, bookings.id))
      .where(and(...whereConditions))
      .orderBy(desc(supplierIssues.createdAt))
      .limit(limit);

    // Get stats
    const stats = {
      total: issues.length,
      open: issues.filter((i) => i.status === "open").length,
      resolved: issues.filter((i) => i.status === "resolved" || i.status === "closed").length,
      critical: issues.filter((i) => i.severity === "critical").length,
      totalFinancialImpact: issues
        .filter((i) => i.financialImpact)
        .reduce((sum, i) => sum + parseFloat(i.financialImpact || "0"), 0),
    };

    return NextResponse.json({
      success: true,
      issues,
      stats,
    });
  } catch (error) {
    console.error("Error fetching supplier issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/suppliers/[id]/issues
 * Report a new issue with supplier
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      issueType,
      severity,
      description,
      bookingId,
      confirmationRequestId,
      financialImpact,
      clientImpacted,
      reportedBy,
      agencyId,
    } = body;

    if (!issueType || !description) {
      return NextResponse.json(
        { error: "issueType and description are required" },
        { status: 400 }
      );
    }

    const result = await reportSupplierIssue({
      supplierId,
      issueType,
      severity: severity || "medium",
      description,
      bookingId,
      confirmationRequestId,
      financialImpact,
      clientImpacted,
      reportedBy,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      issueId: result.issueId,
      message: "Issue reported successfully",
    });
  } catch (error) {
    console.error("Error reporting supplier issue:", error);
    return NextResponse.json(
      { error: "Failed to report issue" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/suppliers/[id]/issues
 * Resolve an issue
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      issueId,
      resolution,
      compensationProvided,
      compensationAmount,
      resolvedBy,
    } = body;

    if (!issueId || !resolution) {
      return NextResponse.json(
        { error: "issueId and resolution are required" },
        { status: 400 }
      );
    }

    const result = await resolveSupplierIssue(
      issueId,
      resolution,
      compensationProvided,
      compensationAmount,
      resolvedBy
    );

    return NextResponse.json({
      success: true,
      message: "Issue resolved successfully",
    });
  } catch (error) {
    console.error("Error resolving supplier issue:", error);
    return NextResponse.json(
      { error: "Failed to resolve issue" },
      { status: 500 }
    );
  }
}
