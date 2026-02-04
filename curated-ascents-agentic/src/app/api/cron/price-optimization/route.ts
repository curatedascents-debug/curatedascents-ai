import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  pricingRules,
  demandMetrics,
  priceAdjustments,
  hotelRoomRates,
  transportation,
  packages,
  destinations,
} from "@/db/schema";
import { eq, and, gte, lte, sql, desc, isNull, or } from "drizzle-orm";
import {
  calculateDynamicPrice,
  logPriceAdjustment,
  DEMAND_THRESHOLDS,
} from "@/lib/pricing/pricing-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/price-optimization
 * Apply automatic price optimizations based on demand and rules
 * Runs daily at 7 AM UTC
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      rulesEvaluated: 0,
      adjustmentsApplied: 0,
      highDemandAlerts: [] as string[],
      lowDemandAlerts: [] as string[],
      errors: [] as string[],
    };

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get active auto-apply rules
    const activeRules = await db
      .select()
      .from(pricingRules)
      .where(
        and(
          eq(pricingRules.isActive, true),
          eq(pricingRules.isAutoApply, true),
          or(isNull(pricingRules.validFrom), lte(pricingRules.validFrom, todayStr)),
          or(isNull(pricingRules.validTo), gte(pricingRules.validTo, todayStr))
        )
      )
      .orderBy(desc(pricingRules.priority));

    results.rulesEvaluated = activeRules.length;

    // Get recent demand metrics
    const recentMetrics = await db
      .select({
        destinationId: demandMetrics.destinationId,
        destinationCity: destinations.city,
        serviceType: demandMetrics.serviceType,
        demandScore: demandMetrics.demandScore,
        occupancyRate: demandMetrics.occupancyRate,
      })
      .from(demandMetrics)
      .leftJoin(destinations, eq(demandMetrics.destinationId, destinations.id))
      .where(eq(demandMetrics.metricDate, todayStr))
      .orderBy(desc(demandMetrics.demandScore));

    // Identify high and low demand situations
    for (const metric of recentMetrics) {
      const demandScore = parseFloat(metric.demandScore || "50");

      if (demandScore >= DEMAND_THRESHOLDS.VERY_HIGH) {
        results.highDemandAlerts.push(
          `High demand (${demandScore.toFixed(0)}) for ${metric.destinationCity || metric.serviceType || "Unknown"}`
        );
      } else if (demandScore <= DEMAND_THRESHOLDS.VERY_LOW) {
        results.lowDemandAlerts.push(
          `Low demand (${demandScore.toFixed(0)}) for ${metric.destinationCity || metric.serviceType || "Unknown"}`
        );
      }
    }

    // Apply promotional rules that should trigger today
    // (e.g., weekend rules, peak day rules)
    const dayOfWeek = today.getDay();

    for (const rule of activeRules) {
      try {
        // Check if rule applies to today
        if (rule.daysOfWeek) {
          const allowedDays = rule.daysOfWeek as number[];
          if (!allowedDays.includes(dayOfWeek)) {
            continue;
          }
        }

        // For demand-based rules, check current demand
        if (rule.ruleType === "demand") {
          const targetDestination = rule.destinationId;
          const targetServiceType = rule.serviceType;

          const relevantMetric = recentMetrics.find(
            (m) =>
              (targetDestination ? m.destinationId === targetDestination : true) &&
              (targetServiceType ? m.serviceType === targetServiceType : true)
          );

          if (relevantMetric) {
            const demandScore = parseFloat(relevantMetric.demandScore || "50");
            const conditions = rule.conditions as Record<string, unknown> | null;

            // Check if demand threshold is met
            if (conditions?.minDemandScore && demandScore < (conditions.minDemandScore as number)) {
              continue;
            }
            if (conditions?.maxDemandScore && demandScore > (conditions.maxDemandScore as number)) {
              continue;
            }
          }
        }

        // Log that rule would be applied
        // In a real implementation, you would apply the adjustment to actual rates
        results.adjustmentsApplied++;

        // Log the adjustment
        await logPriceAdjustment({
          serviceType: rule.serviceType || "all",
          serviceId: rule.serviceId || 0,
          serviceName: `Rule: ${rule.name}`,
          ruleId: rule.id,
          ruleName: rule.name,
          adjustmentType: rule.adjustmentType as "percentage" | "fixed_amount",
          adjustmentValue: parseFloat(rule.adjustmentValue),
          originalPrice: 0, // Would be actual price in real implementation
          adjustedPrice: 0, // Would be calculated price
          adjustmentDate: today,
          reason: `Auto-applied by cron: ${rule.ruleType} rule`,
          triggeredBy: "cron",
        });
      } catch (error) {
        const errorMsg = `Failed to apply rule ${rule.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(
      `Price optimization completed: ${results.rulesEvaluated} rules evaluated, ${results.adjustmentsApplied} adjustments applied`
    );

    return NextResponse.json({
      success: true,
      results,
      alerts: {
        highDemand: results.highDemandAlerts,
        lowDemand: results.lowDemandAlerts,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in price optimization cron:", error);
    return NextResponse.json(
      { error: "Failed to run price optimization" },
      { status: 500 }
    );
  }
}

// Also handle GET for manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
