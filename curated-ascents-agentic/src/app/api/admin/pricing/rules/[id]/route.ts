import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pricingRules, destinations, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updatePricingRule } from "@/lib/pricing/pricing-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pricing/rules/[id]
 * Get pricing rule details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ruleId = parseInt(id);

    const [rule] = await db
      .select({
        id: pricingRules.id,
        name: pricingRules.name,
        description: pricingRules.description,
        ruleType: pricingRules.ruleType,
        serviceType: pricingRules.serviceType,
        destinationId: pricingRules.destinationId,
        destinationCity: destinations.city,
        supplierId: pricingRules.supplierId,
        supplierName: suppliers.name,
        serviceId: pricingRules.serviceId,
        conditions: pricingRules.conditions,
        adjustmentType: pricingRules.adjustmentType,
        adjustmentValue: pricingRules.adjustmentValue,
        minPrice: pricingRules.minPrice,
        maxPrice: pricingRules.maxPrice,
        validFrom: pricingRules.validFrom,
        validTo: pricingRules.validTo,
        daysOfWeek: pricingRules.daysOfWeek,
        priority: pricingRules.priority,
        isActive: pricingRules.isActive,
        isAutoApply: pricingRules.isAutoApply,
        agencyId: pricingRules.agencyId,
        createdAt: pricingRules.createdAt,
        updatedAt: pricingRules.updatedAt,
      })
      .from(pricingRules)
      .leftJoin(destinations, eq(pricingRules.destinationId, destinations.id))
      .leftJoin(suppliers, eq(pricingRules.supplierId, suppliers.id))
      .where(eq(pricingRules.id, ruleId))
      .limit(1);

    if (!rule) {
      return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error("Error fetching pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing rule" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/rules/[id]
 * Update pricing rule
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ruleId = parseInt(id);
    const body = await req.json();

    // Verify rule exists
    const [existing] = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.id, ruleId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
    }

    const {
      name,
      description,
      adjustmentValue,
      minPrice,
      maxPrice,
      validFrom,
      validTo,
      priority,
      isActive,
    } = body;

    await updatePricingRule(ruleId, {
      name,
      description,
      adjustmentValue,
      minPrice,
      maxPrice,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validTo: validTo ? new Date(validTo) : undefined,
      priority,
      isActive,
    });

    return NextResponse.json({
      success: true,
      message: "Pricing rule updated successfully",
    });
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to update pricing rule" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pricing/rules/[id]
 * Delete pricing rule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ruleId = parseInt(id);

    const [existing] = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.id, ruleId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
    }

    await db.delete(pricingRules).where(eq(pricingRules.id, ruleId));

    return NextResponse.json({
      success: true,
      message: "Pricing rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing rule" },
      { status: 500 }
    );
  }
}
