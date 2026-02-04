import { NextRequest, NextResponse } from "next/server";
import { calculateDynamicPrice, simulatePricing } from "@/lib/pricing/pricing-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/pricing/simulate
 * Simulate dynamic pricing for a service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceType,
      serviceId,
      serviceName,
      basePrice,
      travelDate,
      startDate,
      endDate,
      destinationId,
      supplierId,
      paxCount,
      loyaltyTier,
      agencyId,
    } = body;

    if (!serviceType || !serviceId || !basePrice) {
      return NextResponse.json(
        { error: "serviceType, serviceId, and basePrice are required" },
        { status: 400 }
      );
    }

    // Single date calculation
    if (travelDate) {
      const result = await calculateDynamicPrice({
        serviceType,
        serviceId,
        serviceName,
        basePrice,
        travelDate: new Date(travelDate),
        destinationId,
        supplierId,
        paxCount,
        loyaltyTier,
        agencyId,
      });

      return NextResponse.json({
        success: true,
        mode: "single",
        travelDate,
        pricing: {
          originalPrice: result.originalPrice,
          finalPrice: result.finalPrice,
          currency: result.currency,
          savings: result.savings,
          savingsPercent: result.savingsPercent,
          demandScore: result.demandScore,
          seasonName: result.seasonName,
          appliedRules: result.appliedRules.map((r) => ({
            name: r.ruleName,
            type: r.ruleType,
            adjustment: `${r.adjustmentValue > 0 ? "+" : ""}${r.adjustmentValue}${r.adjustmentType === "percentage" ? "%" : ""}`,
            priceAfter: r.priceAfterRule,
          })),
        },
      });
    }

    // Date range simulation
    if (startDate && endDate) {
      const results = await simulatePricing({
        serviceType,
        serviceId,
        serviceName,
        basePrice,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        destinationId,
        paxCount,
        loyaltyTier,
      });

      // Calculate summary stats
      const prices = results.map((r) => r.finalPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      return NextResponse.json({
        success: true,
        mode: "range",
        startDate,
        endDate,
        summary: {
          basePrice,
          minPrice: Math.round(minPrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          avgPrice: Math.round(avgPrice * 100) / 100,
          priceRange: Math.round((maxPrice - minPrice) * 100) / 100,
          datesCount: results.length,
        },
        dailyPricing: results.map((r) => ({
          date: r.date,
          basePrice: r.basePrice,
          finalPrice: r.finalPrice,
          discount: r.basePrice > r.finalPrice ? Math.round((r.basePrice - r.finalPrice) * 100) / 100 : 0,
          premium: r.finalPrice > r.basePrice ? Math.round((r.finalPrice - r.basePrice) * 100) / 100 : 0,
          demandScore: r.demandScore,
          rulesApplied: r.appliedRules.length,
        })),
      });
    }

    return NextResponse.json(
      { error: "Either travelDate or startDate/endDate range is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error simulating pricing:", error);
    return NextResponse.json(
      { error: "Failed to simulate pricing" },
      { status: 500 }
    );
  }
}
