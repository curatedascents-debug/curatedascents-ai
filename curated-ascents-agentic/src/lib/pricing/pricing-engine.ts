/**
 * Dynamic Pricing Engine
 * Handles demand-based pricing, yield management, and price optimization
 */

import { db } from "@/db";
import {
  pricingRules,
  demandMetrics,
  priceAdjustments,
  priceHistory,
  seasons,
  destinations,
} from "@/db/schema";
import { eq, and, gte, lte, sql, desc, isNull, or } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

export type RuleType =
  | "seasonal"
  | "demand"
  | "early_bird"
  | "last_minute"
  | "group"
  | "loyalty"
  | "promotional"
  | "weekend"
  | "peak_day";

export type AdjustmentType = "percentage" | "fixed_amount";

export interface PricingContext {
  serviceType: string;
  serviceId: number;
  serviceName?: string;
  basePrice: number;
  currency?: string;
  travelDate: Date;
  bookingDate?: Date;
  destinationId?: number;
  supplierId?: number;
  paxCount?: number;
  loyaltyTier?: string;
  agencyId?: number;
}

export interface PricingResult {
  originalPrice: number;
  finalPrice: number;
  currency: string;
  appliedRules: AppliedRule[];
  demandScore?: number;
  seasonName?: string;
  savings?: number;
  savingsPercent?: number;
}

export interface AppliedRule {
  ruleId: number;
  ruleName: string;
  ruleType: RuleType;
  adjustmentType: AdjustmentType;
  adjustmentValue: number;
  priceBeforeRule: number;
  priceAfterRule: number;
}

// ============================================
// CONSTANTS
// ============================================

// Demand score thresholds for automatic adjustments
export const DEMAND_THRESHOLDS = {
  VERY_LOW: 20, // Below 20: -10% discount
  LOW: 40, // 20-40: -5% discount
  NORMAL: 60, // 40-60: no adjustment
  HIGH: 80, // 60-80: +5% premium
  VERY_HIGH: 100, // 80-100: +15% premium
} as const;

// Demand-based adjustment percentages
export const DEMAND_ADJUSTMENTS = {
  VERY_LOW: -10,
  LOW: -5,
  NORMAL: 0,
  HIGH: 5,
  VERY_HIGH: 15,
} as const;

// Early bird discount tiers (days in advance)
export const EARLY_BIRD_TIERS = [
  { daysAhead: 90, discount: 15 }, // 90+ days: 15% off
  { daysAhead: 60, discount: 10 }, // 60-89 days: 10% off
  { daysAhead: 30, discount: 5 }, // 30-59 days: 5% off
] as const;

// Last minute discount tiers
export const LAST_MINUTE_TIERS = [
  { daysAhead: 3, discount: 20 }, // 0-3 days: 20% off (if available)
  { daysAhead: 7, discount: 15 }, // 4-7 days: 15% off
  { daysAhead: 14, discount: 10 }, // 8-14 days: 10% off
] as const;

// Group discount tiers
export const GROUP_DISCOUNT_TIERS = [
  { minPax: 20, discount: 15 }, // 20+ pax: 15% off
  { minPax: 10, discount: 10 }, // 10-19 pax: 10% off
  { minPax: 6, discount: 5 }, // 6-9 pax: 5% off
] as const;

// Loyalty tier discounts
export const LOYALTY_DISCOUNTS: Record<string, number> = {
  bronze: 2,
  silver: 5,
  gold: 8,
  platinum: 12,
} as const;

// ============================================
// CORE PRICING FUNCTIONS
// ============================================

/**
 * Calculate dynamic price for a service
 */
export async function calculateDynamicPrice(
  context: PricingContext
): Promise<PricingResult> {
  const {
    serviceType,
    serviceId,
    serviceName,
    basePrice,
    currency = "USD",
    travelDate,
    bookingDate = new Date(),
    destinationId,
    supplierId,
    paxCount = 1,
    loyaltyTier,
    agencyId,
  } = context;

  const appliedRules: AppliedRule[] = [];
  let currentPrice = basePrice;
  let demandScore: number | undefined;
  let seasonName: string | undefined;

  // 1. Get applicable pricing rules from database
  const dbRules = await getApplicableRules({
    serviceType,
    destinationId,
    supplierId,
    serviceId,
    travelDate,
    agencyId,
  });

  // 2. Get current season
  const season = await getCurrentSeason(travelDate, destinationId);
  if (season) {
    seasonName = season.name;
    const multiplier = parseFloat(season.priceMultiplier || "1.00");
    if (multiplier !== 1) {
      const priceBeforeRule = currentPrice;
      currentPrice = currentPrice * multiplier;
      appliedRules.push({
        ruleId: 0,
        ruleName: `${season.name} Season`,
        ruleType: "seasonal",
        adjustmentType: "percentage",
        adjustmentValue: (multiplier - 1) * 100,
        priceBeforeRule,
        priceAfterRule: currentPrice,
      });
    }
  }

  // 3. Get demand metrics
  const metrics = await getDemandMetrics(travelDate, destinationId, serviceType);
  if (metrics) {
    demandScore = parseFloat(metrics.demandScore || "50");
  }

  // 4. Apply database rules (sorted by priority)
  for (const rule of dbRules) {
    const result = applyRule(rule, currentPrice, context);
    if (result.applied) {
      currentPrice = result.newPrice;
      appliedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.ruleType as RuleType,
        adjustmentType: rule.adjustmentType as AdjustmentType,
        adjustmentValue: parseFloat(rule.adjustmentValue),
        priceBeforeRule: result.priceBeforeRule,
        priceAfterRule: result.newPrice,
      });
    }
  }

  // 5. Apply built-in rules if no conflicting DB rules

  // Early bird discount
  if (!appliedRules.some((r) => r.ruleType === "early_bird")) {
    const daysAhead = Math.floor(
      (travelDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    for (const tier of EARLY_BIRD_TIERS) {
      if (daysAhead >= tier.daysAhead) {
        const priceBeforeRule = currentPrice;
        currentPrice = currentPrice * (1 - tier.discount / 100);
        appliedRules.push({
          ruleId: -1,
          ruleName: `Early Bird (${tier.daysAhead}+ days)`,
          ruleType: "early_bird",
          adjustmentType: "percentage",
          adjustmentValue: -tier.discount,
          priceBeforeRule,
          priceAfterRule: currentPrice,
        });
        break;
      }
    }
  }

  // Group discount
  if (!appliedRules.some((r) => r.ruleType === "group") && paxCount > 1) {
    for (const tier of GROUP_DISCOUNT_TIERS) {
      if (paxCount >= tier.minPax) {
        const priceBeforeRule = currentPrice;
        currentPrice = currentPrice * (1 - tier.discount / 100);
        appliedRules.push({
          ruleId: -2,
          ruleName: `Group Discount (${tier.minPax}+ pax)`,
          ruleType: "group",
          adjustmentType: "percentage",
          adjustmentValue: -tier.discount,
          priceBeforeRule,
          priceAfterRule: currentPrice,
        });
        break;
      }
    }
  }

  // Loyalty discount
  if (!appliedRules.some((r) => r.ruleType === "loyalty") && loyaltyTier) {
    const discount = LOYALTY_DISCOUNTS[loyaltyTier.toLowerCase()];
    if (discount) {
      const priceBeforeRule = currentPrice;
      currentPrice = currentPrice * (1 - discount / 100);
      appliedRules.push({
        ruleId: -3,
        ruleName: `${loyaltyTier} Member Discount`,
        ruleType: "loyalty",
        adjustmentType: "percentage",
        adjustmentValue: -discount,
        priceBeforeRule,
        priceAfterRule: currentPrice,
      });
    }
  }

  // Demand-based adjustment (only if enabled and no manual promotional rule)
  if (
    demandScore !== undefined &&
    !appliedRules.some((r) => r.ruleType === "promotional" || r.ruleType === "demand")
  ) {
    const demandAdjustment = getDemandAdjustment(demandScore);
    if (demandAdjustment !== 0) {
      const priceBeforeRule = currentPrice;
      currentPrice = currentPrice * (1 + demandAdjustment / 100);
      appliedRules.push({
        ruleId: -4,
        ruleName: `Demand-Based Pricing`,
        ruleType: "demand",
        adjustmentType: "percentage",
        adjustmentValue: demandAdjustment,
        priceBeforeRule,
        priceAfterRule: currentPrice,
      });
    }
  }

  // Round to 2 decimal places
  currentPrice = Math.round(currentPrice * 100) / 100;

  // Calculate savings
  const savings = basePrice - currentPrice;
  const savingsPercent =
    basePrice > 0 ? Math.round((savings / basePrice) * 100 * 10) / 10 : 0;

  return {
    originalPrice: basePrice,
    finalPrice: currentPrice,
    currency,
    appliedRules,
    demandScore,
    seasonName,
    savings: savings > 0 ? savings : undefined,
    savingsPercent: savingsPercent > 0 ? savingsPercent : undefined,
  };
}

/**
 * Get demand-based adjustment percentage
 */
function getDemandAdjustment(demandScore: number): number {
  if (demandScore < DEMAND_THRESHOLDS.VERY_LOW) {
    return DEMAND_ADJUSTMENTS.VERY_LOW;
  } else if (demandScore < DEMAND_THRESHOLDS.LOW) {
    return DEMAND_ADJUSTMENTS.LOW;
  } else if (demandScore < DEMAND_THRESHOLDS.NORMAL) {
    return DEMAND_ADJUSTMENTS.NORMAL;
  } else if (demandScore < DEMAND_THRESHOLDS.HIGH) {
    return DEMAND_ADJUSTMENTS.HIGH;
  } else {
    return DEMAND_ADJUSTMENTS.VERY_HIGH;
  }
}

/**
 * Apply a single pricing rule
 */
function applyRule(
  rule: typeof pricingRules.$inferSelect,
  currentPrice: number,
  context: PricingContext
): { applied: boolean; newPrice: number; priceBeforeRule: number } {
  const priceBeforeRule = currentPrice;

  // Check rule conditions
  const conditions = rule.conditions as Record<string, unknown> | null;
  if (conditions) {
    // Check days in advance
    if (conditions.daysInAdvance && context.bookingDate) {
      const daysAhead = Math.floor(
        (context.travelDate.getTime() - context.bookingDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysAhead < (conditions.daysInAdvance as number)) {
        return { applied: false, newPrice: currentPrice, priceBeforeRule };
      }
    }

    // Check min pax
    if (conditions.minPax && context.paxCount) {
      if (context.paxCount < (conditions.minPax as number)) {
        return { applied: false, newPrice: currentPrice, priceBeforeRule };
      }
    }

    // Check loyalty tier
    if (conditions.loyaltyTier && context.loyaltyTier) {
      const requiredTier = (conditions.loyaltyTier as string).toLowerCase();
      if (context.loyaltyTier.toLowerCase() !== requiredTier) {
        return { applied: false, newPrice: currentPrice, priceBeforeRule };
      }
    }
  }

  // Check day of week
  if (rule.daysOfWeek) {
    const dayOfWeek = context.travelDate.getDay();
    const allowedDays = rule.daysOfWeek as number[];
    if (!allowedDays.includes(dayOfWeek)) {
      return { applied: false, newPrice: currentPrice, priceBeforeRule };
    }
  }

  // Apply adjustment
  const adjustmentValue = parseFloat(rule.adjustmentValue);
  let newPrice: number;

  if (rule.adjustmentType === "percentage") {
    newPrice = currentPrice * (1 + adjustmentValue / 100);
  } else {
    newPrice = currentPrice + adjustmentValue;
  }

  // Apply floor/ceiling
  if (rule.minPrice) {
    newPrice = Math.max(newPrice, parseFloat(rule.minPrice));
  }
  if (rule.maxPrice) {
    newPrice = Math.min(newPrice, parseFloat(rule.maxPrice));
  }

  return { applied: true, newPrice, priceBeforeRule };
}

// ============================================
// DATABASE QUERIES
// ============================================

/**
 * Get applicable pricing rules
 */
async function getApplicableRules(params: {
  serviceType: string;
  destinationId?: number;
  supplierId?: number;
  serviceId?: number;
  travelDate: Date;
  agencyId?: number;
}) {
  const { serviceType, destinationId, supplierId, serviceId, travelDate, agencyId } =
    params;
  const travelDateStr = travelDate.toISOString().split("T")[0];

  const rules = await db
    .select()
    .from(pricingRules)
    .where(
      and(
        eq(pricingRules.isActive, true),
        or(isNull(pricingRules.serviceType), eq(pricingRules.serviceType, serviceType)),
        or(isNull(pricingRules.destinationId), destinationId ? eq(pricingRules.destinationId, destinationId) : sql`1=1`),
        or(isNull(pricingRules.supplierId), supplierId ? eq(pricingRules.supplierId, supplierId) : sql`1=1`),
        or(isNull(pricingRules.serviceId), serviceId ? eq(pricingRules.serviceId, serviceId) : sql`1=1`),
        or(isNull(pricingRules.validFrom), lte(pricingRules.validFrom, travelDateStr)),
        or(isNull(pricingRules.validTo), gte(pricingRules.validTo, travelDateStr)),
        agencyId ? or(isNull(pricingRules.agencyId), eq(pricingRules.agencyId, agencyId)) : isNull(pricingRules.agencyId)
      )
    )
    .orderBy(desc(pricingRules.priority));

  return rules;
}

/**
 * Get current season
 */
async function getCurrentSeason(travelDate: Date, destinationId?: number) {
  const month = travelDate.getMonth() + 1;

  let destination: { country: string | null } | undefined;
  if (destinationId) {
    const [dest] = await db
      .select({ country: destinations.country })
      .from(destinations)
      .where(eq(destinations.id, destinationId))
      .limit(1);
    destination = dest;
  }

  const [season] = await db
    .select()
    .from(seasons)
    .where(
      and(
        lte(seasons.startMonth, month),
        gte(seasons.endMonth, month),
        destination?.country
          ? or(isNull(seasons.country), eq(seasons.country, destination.country))
          : sql`1=1`
      )
    )
    .limit(1);

  return season;
}

/**
 * Get demand metrics for a date
 */
async function getDemandMetrics(
  travelDate: Date,
  destinationId?: number,
  serviceType?: string
) {
  const travelDateStr = travelDate.toISOString().split("T")[0];

  const [metrics] = await db
    .select()
    .from(demandMetrics)
    .where(
      and(
        eq(demandMetrics.metricDate, travelDateStr),
        destinationId ? eq(demandMetrics.destinationId, destinationId) : sql`1=1`,
        serviceType ? eq(demandMetrics.serviceType, serviceType) : sql`1=1`
      )
    )
    .limit(1);

  return metrics;
}

// ============================================
// RULE MANAGEMENT
// ============================================

/**
 * Create a new pricing rule
 */
export async function createPricingRule(params: {
  name: string;
  description?: string;
  ruleType: RuleType;
  serviceType?: string;
  destinationId?: number;
  supplierId?: number;
  serviceId?: number;
  conditions?: Record<string, unknown>;
  adjustmentType: AdjustmentType;
  adjustmentValue: number;
  minPrice?: number;
  maxPrice?: number;
  validFrom?: Date;
  validTo?: Date;
  daysOfWeek?: number[];
  priority?: number;
  isActive?: boolean;
  isAutoApply?: boolean;
  agencyId?: number;
}): Promise<{ ruleId: number }> {
  const [rule] = await db
    .insert(pricingRules)
    .values({
      name: params.name,
      description: params.description,
      ruleType: params.ruleType,
      serviceType: params.serviceType,
      destinationId: params.destinationId,
      supplierId: params.supplierId,
      serviceId: params.serviceId,
      conditions: params.conditions,
      adjustmentType: params.adjustmentType,
      adjustmentValue: params.adjustmentValue.toString(),
      minPrice: params.minPrice?.toString(),
      maxPrice: params.maxPrice?.toString(),
      validFrom: params.validFrom?.toISOString().split("T")[0],
      validTo: params.validTo?.toISOString().split("T")[0],
      daysOfWeek: params.daysOfWeek,
      priority: params.priority || 0,
      isActive: params.isActive ?? true,
      isAutoApply: params.isAutoApply ?? true,
      agencyId: params.agencyId,
    })
    .returning({ id: pricingRules.id });

  return { ruleId: rule.id };
}

/**
 * Update pricing rule
 */
export async function updatePricingRule(
  ruleId: number,
  updates: Partial<{
    name: string;
    description: string;
    adjustmentValue: number;
    minPrice: number;
    maxPrice: number;
    validFrom: Date;
    validTo: Date;
    priority: number;
    isActive: boolean;
  }>
): Promise<void> {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.adjustmentValue !== undefined)
    updateData.adjustmentValue = updates.adjustmentValue.toString();
  if (updates.minPrice !== undefined) updateData.minPrice = updates.minPrice.toString();
  if (updates.maxPrice !== undefined) updateData.maxPrice = updates.maxPrice.toString();
  if (updates.validFrom !== undefined)
    updateData.validFrom = updates.validFrom.toISOString().split("T")[0];
  if (updates.validTo !== undefined)
    updateData.validTo = updates.validTo.toISOString().split("T")[0];
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

  await db.update(pricingRules).set(updateData).where(eq(pricingRules.id, ruleId));
}

// ============================================
// DEMAND METRICS MANAGEMENT
// ============================================

/**
 * Update demand metrics for a date
 */
export async function updateDemandMetrics(params: {
  metricDate: Date;
  serviceType?: string;
  destinationId?: number;
  searchCount?: number;
  inquiryCount?: number;
  quoteRequestCount?: number;
  quotesGenerated?: number;
  bookingsConfirmed?: number;
  totalRevenue?: number;
  availableInventory?: number;
  bookedInventory?: number;
}): Promise<void> {
  const metricDateStr = params.metricDate.toISOString().split("T")[0];

  // Check if metrics exist for this date
  const [existing] = await db
    .select()
    .from(demandMetrics)
    .where(
      and(
        eq(demandMetrics.metricDate, metricDateStr),
        params.destinationId
          ? eq(demandMetrics.destinationId, params.destinationId)
          : isNull(demandMetrics.destinationId),
        params.serviceType
          ? eq(demandMetrics.serviceType, params.serviceType)
          : isNull(demandMetrics.serviceType)
      )
    )
    .limit(1);

  if (existing) {
    // Update existing
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (params.searchCount !== undefined)
      updateData.searchCount = (existing.searchCount || 0) + params.searchCount;
    if (params.inquiryCount !== undefined)
      updateData.inquiryCount = (existing.inquiryCount || 0) + params.inquiryCount;
    if (params.quoteRequestCount !== undefined)
      updateData.quoteRequestCount =
        (existing.quoteRequestCount || 0) + params.quoteRequestCount;
    if (params.quotesGenerated !== undefined)
      updateData.quotesGenerated =
        (existing.quotesGenerated || 0) + params.quotesGenerated;
    if (params.bookingsConfirmed !== undefined)
      updateData.bookingsConfirmed =
        (existing.bookingsConfirmed || 0) + params.bookingsConfirmed;
    if (params.totalRevenue !== undefined)
      updateData.totalRevenue = (
        parseFloat(existing.totalRevenue || "0") + params.totalRevenue
      ).toString();
    if (params.availableInventory !== undefined)
      updateData.availableInventory = params.availableInventory;
    if (params.bookedInventory !== undefined)
      updateData.bookedInventory = params.bookedInventory;

    // Recalculate metrics
    const totalQuotes =
      (updateData.quotesGenerated as number) || existing.quotesGenerated || 0;
    const totalBookings =
      (updateData.bookingsConfirmed as number) || existing.bookingsConfirmed || 0;
    if (totalQuotes > 0) {
      updateData.conversionRate = ((totalBookings / totalQuotes) * 100).toFixed(2);
    }

    const revenue = parseFloat((updateData.totalRevenue as string) || existing.totalRevenue || "0");
    if (totalBookings > 0) {
      updateData.averageOrderValue = (revenue / totalBookings).toFixed(2);
    }

    const available =
      (updateData.availableInventory as number) || existing.availableInventory || 0;
    const booked = (updateData.bookedInventory as number) || existing.bookedInventory || 0;
    if (available > 0) {
      updateData.occupancyRate = ((booked / available) * 100).toFixed(2);
    }

    // Calculate demand score (weighted formula)
    const searchScore = Math.min(100, ((updateData.searchCount as number) || existing.searchCount || 0) / 10);
    const conversionScore = parseFloat((updateData.conversionRate as string) || "0");
    const occupancyScore = parseFloat((updateData.occupancyRate as string) || "0");
    updateData.demandScore = (
      searchScore * 0.3 +
      conversionScore * 0.3 +
      occupancyScore * 0.4
    ).toFixed(2);

    await db
      .update(demandMetrics)
      .set(updateData)
      .where(eq(demandMetrics.id, existing.id));
  } else {
    // Create new
    await db.insert(demandMetrics).values({
      metricDate: metricDateStr,
      serviceType: params.serviceType,
      destinationId: params.destinationId,
      searchCount: params.searchCount || 0,
      inquiryCount: params.inquiryCount || 0,
      quoteRequestCount: params.quoteRequestCount || 0,
      quotesGenerated: params.quotesGenerated || 0,
      bookingsConfirmed: params.bookingsConfirmed || 0,
      totalRevenue: params.totalRevenue?.toString() || "0",
      availableInventory: params.availableInventory,
      bookedInventory: params.bookedInventory,
      demandScore: "50.00", // Default neutral score
    });
  }
}

// ============================================
// PRICE ADJUSTMENT LOGGING
// ============================================

/**
 * Log a price adjustment
 */
export async function logPriceAdjustment(params: {
  serviceType: string;
  serviceId: number;
  serviceName?: string;
  ruleId?: number;
  ruleName?: string;
  adjustmentType: AdjustmentType | "manual";
  adjustmentValue: number;
  originalPrice: number;
  adjustedPrice: number;
  currency?: string;
  adjustmentDate?: Date;
  travelDate?: Date;
  reason?: string;
  triggeredBy: string;
  approvedBy?: string;
  quoteId?: number;
  bookingId?: number;
  agencyId?: number;
}): Promise<{ adjustmentId: number }> {
  const [adjustment] = await db
    .insert(priceAdjustments)
    .values({
      serviceType: params.serviceType,
      serviceId: params.serviceId,
      serviceName: params.serviceName,
      ruleId: params.ruleId,
      ruleName: params.ruleName,
      adjustmentType: params.adjustmentType,
      adjustmentValue: params.adjustmentValue.toString(),
      originalPrice: params.originalPrice.toString(),
      adjustedPrice: params.adjustedPrice.toString(),
      currency: params.currency || "USD",
      adjustmentDate: (params.adjustmentDate || new Date()).toISOString().split("T")[0],
      travelDate: params.travelDate?.toISOString().split("T")[0],
      reason: params.reason,
      triggeredBy: params.triggeredBy,
      approvedBy: params.approvedBy,
      quoteId: params.quoteId,
      bookingId: params.bookingId,
      agencyId: params.agencyId,
    })
    .returning({ id: priceAdjustments.id });

  return { adjustmentId: adjustment.id };
}

/**
 * Record price history snapshot
 */
export async function recordPriceHistory(params: {
  serviceType: string;
  serviceId: number;
  serviceName?: string;
  recordDate?: Date;
  basePrice: number;
  adjustedPrice: number;
  currency?: string;
  seasonId?: number;
  demandScore?: number;
  occupancyRate?: number;
  appliedRules?: AppliedRule[];
}): Promise<void> {
  await db.insert(priceHistory).values({
    serviceType: params.serviceType,
    serviceId: params.serviceId,
    serviceName: params.serviceName,
    recordDate: (params.recordDate || new Date()).toISOString().split("T")[0],
    basePrice: params.basePrice.toString(),
    adjustedPrice: params.adjustedPrice.toString(),
    currency: params.currency || "USD",
    seasonId: params.seasonId,
    demandScore: params.demandScore?.toString(),
    occupancyRate: params.occupancyRate?.toString(),
    appliedRules: params.appliedRules,
  });
}

// ============================================
// SIMULATION & ANALYSIS
// ============================================

/**
 * Simulate pricing for multiple dates
 */
export async function simulatePricing(params: {
  serviceType: string;
  serviceId: number;
  serviceName?: string;
  basePrice: number;
  startDate: Date;
  endDate: Date;
  paxCount?: number;
  loyaltyTier?: string;
  destinationId?: number;
}): Promise<
  Array<{
    date: string;
    basePrice: number;
    finalPrice: number;
    appliedRules: AppliedRule[];
    demandScore?: number;
  }>
> {
  const results: Array<{
    date: string;
    basePrice: number;
    finalPrice: number;
    appliedRules: AppliedRule[];
    demandScore?: number;
  }> = [];

  const currentDate = new Date(params.startDate);
  while (currentDate <= params.endDate) {
    const pricing = await calculateDynamicPrice({
      serviceType: params.serviceType,
      serviceId: params.serviceId,
      serviceName: params.serviceName,
      basePrice: params.basePrice,
      travelDate: new Date(currentDate),
      destinationId: params.destinationId,
      paxCount: params.paxCount,
      loyaltyTier: params.loyaltyTier,
    });

    results.push({
      date: currentDate.toISOString().split("T")[0],
      basePrice: params.basePrice,
      finalPrice: pricing.finalPrice,
      appliedRules: pricing.appliedRules,
      demandScore: pricing.demandScore,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
}

/**
 * Get pricing analytics for a period
 */
export async function getPricingAnalytics(params: {
  startDate: Date;
  endDate: Date;
  serviceType?: string;
  destinationId?: number;
}): Promise<{
  totalAdjustments: number;
  averageAdjustment: number;
  ruleBreakdown: Record<string, { count: number; totalImpact: number }>;
  dailyTrends: Array<{ date: string; avgPrice: number; adjustmentCount: number }>;
}> {
  const startDateStr = params.startDate.toISOString().split("T")[0];
  const endDateStr = params.endDate.toISOString().split("T")[0];

  // Get all adjustments in period
  const adjustments = await db
    .select()
    .from(priceAdjustments)
    .where(
      and(
        gte(priceAdjustments.adjustmentDate, startDateStr),
        lte(priceAdjustments.adjustmentDate, endDateStr),
        params.serviceType
          ? eq(priceAdjustments.serviceType, params.serviceType)
          : sql`1=1`
      )
    );

  // Calculate metrics
  const totalAdjustments = adjustments.length;
  const averageAdjustment =
    totalAdjustments > 0
      ? adjustments.reduce((sum, a) => sum + parseFloat(a.adjustmentValue), 0) /
        totalAdjustments
      : 0;

  // Rule breakdown
  const ruleBreakdown: Record<string, { count: number; totalImpact: number }> = {};
  for (const adj of adjustments) {
    const ruleName = adj.ruleName || adj.adjustmentType;
    if (!ruleBreakdown[ruleName]) {
      ruleBreakdown[ruleName] = { count: 0, totalImpact: 0 };
    }
    ruleBreakdown[ruleName].count++;
    ruleBreakdown[ruleName].totalImpact +=
      parseFloat(adj.adjustedPrice) - parseFloat(adj.originalPrice);
  }

  // Daily trends from price history
  const history = await db
    .select()
    .from(priceHistory)
    .where(
      and(
        gte(priceHistory.recordDate, startDateStr),
        lte(priceHistory.recordDate, endDateStr),
        params.serviceType ? eq(priceHistory.serviceType, params.serviceType) : sql`1=1`
      )
    );

  const dailyMap: Record<string, { totalPrice: number; count: number }> = {};
  for (const h of history) {
    if (!dailyMap[h.recordDate]) {
      dailyMap[h.recordDate] = { totalPrice: 0, count: 0 };
    }
    dailyMap[h.recordDate].totalPrice += parseFloat(h.adjustedPrice);
    dailyMap[h.recordDate].count++;
  }

  const dailyTrends = Object.entries(dailyMap)
    .map(([date, data]) => ({
      date,
      avgPrice: data.totalPrice / data.count,
      adjustmentCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalAdjustments,
    averageAdjustment,
    ruleBreakdown,
    dailyTrends,
  };
}
