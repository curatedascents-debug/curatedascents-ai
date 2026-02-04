import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pricingRules, destinations, suppliers } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { createPricingRule, RuleType, AdjustmentType } from "@/lib/pricing/pricing-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pricing/rules
 * List all pricing rules
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleType = searchParams.get("ruleType");
    const serviceType = searchParams.get("serviceType");
    const isActive = searchParams.get("isActive");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions = [];

    if (ruleType) {
      whereConditions.push(eq(pricingRules.ruleType, ruleType));
    }
    if (serviceType) {
      whereConditions.push(eq(pricingRules.serviceType, serviceType));
    }
    if (isActive !== null && isActive !== undefined) {
      whereConditions.push(eq(pricingRules.isActive, isActive === "true"));
    }

    const rules = await db
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
        createdAt: pricingRules.createdAt,
        updatedAt: pricingRules.updatedAt,
      })
      .from(pricingRules)
      .leftJoin(destinations, eq(pricingRules.destinationId, destinations.id))
      .leftJoin(suppliers, eq(pricingRules.supplierId, suppliers.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(pricingRules.priority), desc(pricingRules.createdAt))
      .limit(limit)
      .offset(offset);

    // Get counts by rule type
    const typeCounts = await db
      .select({
        ruleType: pricingRules.ruleType,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(pricingRules)
      .where(eq(pricingRules.isActive, true))
      .groupBy(pricingRules.ruleType);

    const stats = {
      total: rules.length,
      byType: typeCounts.reduce(
        (acc, t) => ({ ...acc, [t.ruleType]: t.count }),
        {}
      ),
    };

    return NextResponse.json({
      success: true,
      rules,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: rules.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing rules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing/rules
 * Create a new pricing rule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      ruleType,
      serviceType,
      destinationId,
      supplierId,
      serviceId,
      conditions,
      adjustmentType,
      adjustmentValue,
      minPrice,
      maxPrice,
      validFrom,
      validTo,
      daysOfWeek,
      priority,
      isActive,
      isAutoApply,
      agencyId,
    } = body;

    if (!name || !ruleType || !adjustmentType || adjustmentValue === undefined) {
      return NextResponse.json(
        { error: "name, ruleType, adjustmentType, and adjustmentValue are required" },
        { status: 400 }
      );
    }

    // Validate rule type
    const validRuleTypes: RuleType[] = [
      "seasonal",
      "demand",
      "early_bird",
      "last_minute",
      "group",
      "loyalty",
      "promotional",
      "weekend",
      "peak_day",
    ];
    if (!validRuleTypes.includes(ruleType)) {
      return NextResponse.json(
        { error: `Invalid ruleType. Must be one of: ${validRuleTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate adjustment type
    const validAdjustmentTypes: AdjustmentType[] = ["percentage", "fixed_amount"];
    if (!validAdjustmentTypes.includes(adjustmentType)) {
      return NextResponse.json(
        { error: `Invalid adjustmentType. Must be one of: ${validAdjustmentTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await createPricingRule({
      name,
      description,
      ruleType,
      serviceType,
      destinationId,
      supplierId,
      serviceId,
      conditions,
      adjustmentType,
      adjustmentValue,
      minPrice,
      maxPrice,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validTo: validTo ? new Date(validTo) : undefined,
      daysOfWeek,
      priority,
      isActive,
      isAutoApply,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      ruleId: result.ruleId,
      message: `Pricing rule "${name}" created successfully`,
    });
  } catch (error) {
    console.error("Error creating pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to create pricing rule" },
      { status: 500 }
    );
  }
}
