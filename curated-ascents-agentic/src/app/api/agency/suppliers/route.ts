import { NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers, agencies, agencySuppliers } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { requireAgencyContext, AgencyAuthError } from "@/lib/api/agency-context";
import { hasPermission } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "suppliers", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get agency details
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, ctx.agencyId))
      .limit(1);

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    let supplierList;

    if (agency.canAccessAllSuppliers) {
      // Get all active suppliers
      supplierList = await db
        .select({
          id: suppliers.id,
          name: suppliers.name,
          type: suppliers.type,
          country: suppliers.country,
          city: suppliers.city,
          website: suppliers.website,
          isActive: suppliers.isActive,
          isPreferred: suppliers.isPreferred,
        })
        .from(suppliers)
        .where(eq(suppliers.isActive, true))
        .orderBy(suppliers.name);
    } else {
      // Get only assigned suppliers with agency-specific data
      const assignedSuppliers = await db
        .select({
          supplierId: agencySuppliers.supplierId,
          marginOverridePercent: agencySuppliers.marginOverridePercent,
          commissionPercent: agencySuppliers.commissionPercent,
          notes: agencySuppliers.notes,
        })
        .from(agencySuppliers)
        .where(
          and(
            eq(agencySuppliers.agencyId, ctx.agencyId),
            eq(agencySuppliers.isActive, true)
          )
        );

      if (assignedSuppliers.length === 0) {
        return NextResponse.json({
          suppliers: [],
          message: "No suppliers assigned to your agency",
        });
      }

      const supplierIds = assignedSuppliers.map((s) => s.supplierId);

      const baseSuppliers = await db
        .select({
          id: suppliers.id,
          name: suppliers.name,
          type: suppliers.type,
          country: suppliers.country,
          city: suppliers.city,
          website: suppliers.website,
          isActive: suppliers.isActive,
          isPreferred: suppliers.isPreferred,
        })
        .from(suppliers)
        .where(
          and(eq(suppliers.isActive, true), inArray(suppliers.id, supplierIds))
        )
        .orderBy(suppliers.name);

      // Merge agency-specific data
      supplierList = baseSuppliers.map((supplier) => {
        const agencyData = assignedSuppliers.find(
          (s) => s.supplierId === supplier.id
        );
        return {
          ...supplier,
          marginOverridePercent: agencyData?.marginOverridePercent,
          commissionPercent: agencyData?.commissionPercent,
          agencyNotes: agencyData?.notes,
        };
      });
    }

    return NextResponse.json({ suppliers: supplierList });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching agency suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}
