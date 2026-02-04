/**
 * Availability & Inventory Engine
 * Handles real-time availability, permit tracking, and capacity management
 */

import { db } from "@/db";
import {
  availabilityCalendar,
  blackoutDates,
  permitInventory,
  inventoryHolds,
  capacityConfig,
  availabilitySyncLog,
  suppliers,
  destinations,
  bookings,
} from "@/db/schema";
import { eq, and, gte, lte, sql, desc, or, isNull } from "drizzle-orm";
import { randomBytes } from "crypto";

// ============================================
// TYPES
// ============================================

export type AvailabilityStatus = "available" | "limited" | "sold_out" | "blocked";
export type HoldStatus = "active" | "converted" | "released" | "expired";
export type BlackoutType = "full" | "partial";

export interface AvailabilityCheck {
  serviceType: string;
  serviceId: number;
  startDate: Date;
  endDate: Date;
  quantity?: number;
  agencyId?: number;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  status: AvailabilityStatus;
  availableCapacity: number;
  totalCapacity: number;
  bookedCapacity: number;
  heldCapacity: number;
  blackoutReason?: string;
  priceOverride?: number;
  dates: DateAvailability[];
}

export interface DateAvailability {
  date: string;
  isAvailable: boolean;
  status: AvailabilityStatus;
  availableCapacity: number;
  blackoutReason?: string;
  priceOverride?: number;
}

export interface HoldRequest {
  serviceType: string;
  serviceId: number;
  holdDate: Date;
  quantity?: number;
  quoteId?: number;
  clientId?: number;
  holdDurationMinutes?: number;
  agencyId?: number;
  createdBy?: string;
}

export interface HoldResult {
  success: boolean;
  holdId?: number;
  holdReference?: string;
  expiresAt?: Date;
  error?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_HOLD_DURATION_MINUTES = 30;
export const LIMITED_THRESHOLD_PERCENT = 20; // Below 20% capacity = limited

// ============================================
// AVAILABILITY CHECKING
// ============================================

/**
 * Check availability for a service over a date range
 */
export async function checkAvailability(
  params: AvailabilityCheck
): Promise<AvailabilityResult> {
  const {
    serviceType,
    serviceId,
    startDate,
    endDate,
    quantity = 1,
    agencyId,
  } = params;

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  // Get calendar entries for the date range
  const calendarEntries = await db
    .select()
    .from(availabilityCalendar)
    .where(
      and(
        eq(availabilityCalendar.serviceType, serviceType),
        eq(availabilityCalendar.serviceId, serviceId),
        gte(availabilityCalendar.availabilityDate, startDateStr),
        lte(availabilityCalendar.availabilityDate, endDateStr),
        agencyId ? eq(availabilityCalendar.agencyId, agencyId) : sql`1=1`
      )
    )
    .orderBy(availabilityCalendar.availabilityDate);

  // Get blackout dates for the range
  const blackouts = await getBlackoutDates({
    serviceType,
    serviceId,
    startDate,
    endDate,
    agencyId,
  });

  // Get capacity config
  const config = await getCapacityConfig(serviceType, serviceId, agencyId);
  const defaultCapacity = config?.defaultCapacity || 1;

  // Build date availability map
  const dateMap = new Map<string, DateAvailability>();
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];

    // Check if date is blacked out
    const blackout = blackouts.find(
      (b) => dateStr >= b.startDate && dateStr <= b.endDate
    );

    if (blackout && blackout.blackoutType === "full") {
      dateMap.set(dateStr, {
        date: dateStr,
        isAvailable: false,
        status: "blocked",
        availableCapacity: 0,
        blackoutReason: blackout.reason,
      });
    } else {
      // Find calendar entry or use defaults
      const entry = calendarEntries.find((e) => e.availabilityDate === dateStr);

      let totalCapacity = entry?.totalCapacity || defaultCapacity;
      let bookedCapacity = entry?.bookedCapacity || 0;
      let heldCapacity = entry?.heldCapacity || 0;

      // Apply partial blackout reduction
      if (blackout && blackout.blackoutType === "partial" && blackout.reducedCapacity) {
        totalCapacity = Math.min(totalCapacity, blackout.reducedCapacity);
      }

      const availableCapacity = Math.max(0, totalCapacity - bookedCapacity - heldCapacity);
      const isAvailable = availableCapacity >= quantity;

      let status: AvailabilityStatus;
      if (entry?.isBlocked) {
        status = "blocked";
      } else if (availableCapacity === 0) {
        status = "sold_out";
      } else if (availableCapacity / totalCapacity <= LIMITED_THRESHOLD_PERCENT / 100) {
        status = "limited";
      } else {
        status = "available";
      }

      dateMap.set(dateStr, {
        date: dateStr,
        isAvailable,
        status,
        availableCapacity,
        blackoutReason: blackout?.reason,
        priceOverride: entry?.priceOverride ? parseFloat(entry.priceOverride) : undefined,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate overall availability
  const dates = Array.from(dateMap.values());
  const allAvailable = dates.every((d) => d.isAvailable);
  const minCapacity = Math.min(...dates.map((d) => d.availableCapacity));
  const totalCapacitySum = dates.reduce(
    (sum, d) => sum + (d.status !== "blocked" ? d.availableCapacity : 0),
    0
  );

  let overallStatus: AvailabilityStatus;
  if (dates.every((d) => d.status === "blocked")) {
    overallStatus = "blocked";
  } else if (dates.some((d) => d.status === "sold_out")) {
    overallStatus = "sold_out";
  } else if (dates.some((d) => d.status === "limited")) {
    overallStatus = "limited";
  } else {
    overallStatus = "available";
  }

  return {
    isAvailable: allAvailable,
    status: overallStatus,
    availableCapacity: minCapacity,
    totalCapacity: defaultCapacity,
    bookedCapacity: 0, // Aggregate
    heldCapacity: 0, // Aggregate
    dates,
  };
}

/**
 * Get blackout dates for a service
 */
async function getBlackoutDates(params: {
  serviceType?: string;
  serviceId?: number;
  startDate: Date;
  endDate: Date;
  agencyId?: number;
}) {
  const { serviceType, serviceId, startDate, endDate, agencyId } = params;
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  const blackouts = await db
    .select()
    .from(blackoutDates)
    .where(
      and(
        eq(blackoutDates.isActive, true),
        lte(blackoutDates.startDate, endDateStr),
        gte(blackoutDates.endDate, startDateStr),
        or(
          isNull(blackoutDates.serviceType),
          serviceType ? eq(blackoutDates.serviceType, serviceType) : sql`1=1`
        ),
        or(
          isNull(blackoutDates.serviceId),
          serviceId ? eq(blackoutDates.serviceId, serviceId) : sql`1=1`
        ),
        agencyId ? or(isNull(blackoutDates.agencyId), eq(blackoutDates.agencyId, agencyId)) : sql`1=1`
      )
    );

  return blackouts;
}

/**
 * Get capacity configuration for a service
 */
async function getCapacityConfig(
  serviceType: string,
  serviceId?: number,
  agencyId?: number
) {
  const [config] = await db
    .select()
    .from(capacityConfig)
    .where(
      and(
        eq(capacityConfig.serviceType, serviceType),
        eq(capacityConfig.isActive, true),
        serviceId
          ? or(isNull(capacityConfig.serviceId), eq(capacityConfig.serviceId, serviceId))
          : isNull(capacityConfig.serviceId),
        agencyId
          ? or(isNull(capacityConfig.agencyId), eq(capacityConfig.agencyId, agencyId))
          : sql`1=1`
      )
    )
    .orderBy(desc(capacityConfig.serviceId)) // Prefer specific config over general
    .limit(1);

  return config;
}

// ============================================
// INVENTORY HOLDS
// ============================================

/**
 * Create a hold on inventory
 */
export async function createHold(params: HoldRequest): Promise<HoldResult> {
  const {
    serviceType,
    serviceId,
    holdDate,
    quantity = 1,
    quoteId,
    clientId,
    holdDurationMinutes = DEFAULT_HOLD_DURATION_MINUTES,
    agencyId,
    createdBy,
  } = params;

  const holdDateStr = holdDate.toISOString().split("T")[0];

  // Check availability first
  const availability = await checkAvailability({
    serviceType,
    serviceId,
    startDate: holdDate,
    endDate: holdDate,
    quantity,
    agencyId,
  });

  if (!availability.isAvailable) {
    return {
      success: false,
      error: `Not enough availability. Requested: ${quantity}, Available: ${availability.availableCapacity}`,
    };
  }

  // Check hold limits per client
  if (clientId) {
    const config = await getCapacityConfig(serviceType, serviceId, agencyId);
    const maxHolds = config?.maxHoldsPerClient || 3;

    const [activeHolds] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(inventoryHolds)
      .where(
        and(
          eq(inventoryHolds.clientId, clientId),
          eq(inventoryHolds.status, "active"),
          eq(inventoryHolds.isExpired, false)
        )
      );

    if ((activeHolds?.count || 0) >= maxHolds) {
      return {
        success: false,
        error: `Maximum active holds (${maxHolds}) reached for this client`,
      };
    }
  }

  // Generate hold reference
  const holdReference = `HOLD-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;

  // Calculate expiration
  const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

  // Create the hold
  const [hold] = await db
    .insert(inventoryHolds)
    .values({
      holdType: "service",
      serviceType,
      serviceId,
      holdDate: holdDateStr,
      quantity,
      holdReference,
      quoteId,
      clientId,
      expiresAt,
      status: "active",
      agencyId,
      createdBy,
    })
    .returning({ id: inventoryHolds.id });

  // Update calendar held capacity
  await updateCalendarHeldCapacity(serviceType, serviceId, holdDateStr, quantity, "add", agencyId);

  return {
    success: true,
    holdId: hold.id,
    holdReference,
    expiresAt,
  };
}

/**
 * Release a hold
 */
export async function releaseHold(
  holdId: number,
  reason: string = "manual_release"
): Promise<{ success: boolean; error?: string }> {
  const [hold] = await db
    .select()
    .from(inventoryHolds)
    .where(eq(inventoryHolds.id, holdId))
    .limit(1);

  if (!hold) {
    return { success: false, error: "Hold not found" };
  }

  if (hold.status !== "active") {
    return { success: false, error: `Hold is already ${hold.status}` };
  }

  // Update hold status
  await db
    .update(inventoryHolds)
    .set({
      status: "released",
      releasedAt: new Date(),
      releaseReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(inventoryHolds.id, holdId));

  // Update calendar held capacity
  await updateCalendarHeldCapacity(
    hold.serviceType!,
    hold.serviceId!,
    hold.holdDate,
    hold.quantity,
    "subtract",
    hold.agencyId || undefined
  );

  return { success: true };
}

/**
 * Convert a hold to a booking
 */
export async function convertHoldToBooking(
  holdId: number,
  bookingId: number
): Promise<{ success: boolean; error?: string }> {
  const [hold] = await db
    .select()
    .from(inventoryHolds)
    .where(eq(inventoryHolds.id, holdId))
    .limit(1);

  if (!hold) {
    return { success: false, error: "Hold not found" };
  }

  if (hold.status !== "active") {
    return { success: false, error: `Hold is already ${hold.status}` };
  }

  // Update hold status
  await db
    .update(inventoryHolds)
    .set({
      status: "converted",
      convertedToBookingId: bookingId,
      convertedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(inventoryHolds.id, holdId));

  // Move from held to booked in calendar
  await updateCalendarHeldCapacity(
    hold.serviceType!,
    hold.serviceId!,
    hold.holdDate,
    hold.quantity,
    "subtract",
    hold.agencyId || undefined
  );

  await updateCalendarBookedCapacity(
    hold.serviceType!,
    hold.serviceId!,
    hold.holdDate,
    hold.quantity,
    "add",
    hold.agencyId || undefined
  );

  return { success: true };
}

/**
 * Process expired holds
 */
export async function processExpiredHolds(): Promise<{
  processed: number;
  released: number;
}> {
  const now = new Date();

  // Find expired holds
  const expiredHolds = await db
    .select()
    .from(inventoryHolds)
    .where(
      and(
        eq(inventoryHolds.status, "active"),
        eq(inventoryHolds.isExpired, false),
        lte(inventoryHolds.expiresAt, now)
      )
    );

  let released = 0;

  for (const hold of expiredHolds) {
    // Mark as expired
    await db
      .update(inventoryHolds)
      .set({
        status: "expired",
        isExpired: true,
        releasedAt: now,
        releaseReason: "auto_expired",
        updatedAt: now,
      })
      .where(eq(inventoryHolds.id, hold.id));

    // Release capacity
    await updateCalendarHeldCapacity(
      hold.serviceType!,
      hold.serviceId!,
      hold.holdDate,
      hold.quantity,
      "subtract",
      hold.agencyId || undefined
    );

    released++;
  }

  return { processed: expiredHolds.length, released };
}

// ============================================
// CALENDAR MANAGEMENT
// ============================================

/**
 * Update or create calendar entry
 */
export async function updateAvailabilityCalendar(params: {
  serviceType: string;
  serviceId: number;
  serviceName?: string;
  supplierId?: number;
  date: Date;
  totalCapacity?: number;
  isBlocked?: boolean;
  priceOverride?: number;
  priceOverrideReason?: string;
  notes?: string;
  agencyId?: number;
}): Promise<{ calendarId: number }> {
  const {
    serviceType,
    serviceId,
    serviceName,
    supplierId,
    date,
    totalCapacity,
    isBlocked,
    priceOverride,
    priceOverrideReason,
    notes,
    agencyId,
  } = params;

  const dateStr = date.toISOString().split("T")[0];

  // Check if entry exists
  const [existing] = await db
    .select()
    .from(availabilityCalendar)
    .where(
      and(
        eq(availabilityCalendar.serviceType, serviceType),
        eq(availabilityCalendar.serviceId, serviceId),
        eq(availabilityCalendar.availabilityDate, dateStr),
        agencyId ? eq(availabilityCalendar.agencyId, agencyId) : isNull(availabilityCalendar.agencyId)
      )
    )
    .limit(1);

  if (existing) {
    // Update existing
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (totalCapacity !== undefined) updateData.totalCapacity = totalCapacity;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
    if (priceOverride !== undefined) updateData.priceOverride = priceOverride?.toString();
    if (priceOverrideReason !== undefined) updateData.priceOverrideReason = priceOverrideReason;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate available capacity
    if (totalCapacity !== undefined) {
      updateData.availableCapacity = Math.max(
        0,
        totalCapacity - (existing.bookedCapacity || 0) - (existing.heldCapacity || 0)
      );
    }

    // Update status
    const newAvailable = (updateData.availableCapacity as number) ?? existing.availableCapacity ?? 0;
    const newTotal = totalCapacity ?? existing.totalCapacity ?? 1;

    if (isBlocked) {
      updateData.status = "blocked";
    } else if (newAvailable === 0) {
      updateData.status = "sold_out";
    } else if (newAvailable / newTotal <= LIMITED_THRESHOLD_PERCENT / 100) {
      updateData.status = "limited";
    } else {
      updateData.status = "available";
    }

    await db
      .update(availabilityCalendar)
      .set(updateData)
      .where(eq(availabilityCalendar.id, existing.id));

    return { calendarId: existing.id };
  } else {
    // Create new
    const capacity = totalCapacity || 1;
    const available = isBlocked ? 0 : capacity;

    const [entry] = await db
      .insert(availabilityCalendar)
      .values({
        serviceType,
        serviceId,
        serviceName,
        supplierId,
        availabilityDate: dateStr,
        totalCapacity: capacity,
        bookedCapacity: 0,
        heldCapacity: 0,
        availableCapacity: available,
        status: isBlocked ? "blocked" : "available",
        isBlocked: isBlocked || false,
        priceOverride: priceOverride?.toString(),
        priceOverrideReason,
        notes,
        agencyId,
      })
      .returning({ id: availabilityCalendar.id });

    return { calendarId: entry.id };
  }
}

/**
 * Update held capacity in calendar
 */
async function updateCalendarHeldCapacity(
  serviceType: string,
  serviceId: number,
  dateStr: string,
  quantity: number,
  operation: "add" | "subtract",
  agencyId?: number
) {
  const [existing] = await db
    .select()
    .from(availabilityCalendar)
    .where(
      and(
        eq(availabilityCalendar.serviceType, serviceType),
        eq(availabilityCalendar.serviceId, serviceId),
        eq(availabilityCalendar.availabilityDate, dateStr),
        agencyId ? eq(availabilityCalendar.agencyId, agencyId) : isNull(availabilityCalendar.agencyId)
      )
    )
    .limit(1);

  if (existing) {
    const newHeld =
      operation === "add"
        ? (existing.heldCapacity || 0) + quantity
        : Math.max(0, (existing.heldCapacity || 0) - quantity);

    const newAvailable = Math.max(
      0,
      (existing.totalCapacity || 1) - (existing.bookedCapacity || 0) - newHeld
    );

    await db
      .update(availabilityCalendar)
      .set({
        heldCapacity: newHeld,
        availableCapacity: newAvailable,
        status: newAvailable === 0 ? "sold_out" : existing.status,
        updatedAt: new Date(),
      })
      .where(eq(availabilityCalendar.id, existing.id));
  }
}

/**
 * Update booked capacity in calendar
 */
async function updateCalendarBookedCapacity(
  serviceType: string,
  serviceId: number,
  dateStr: string,
  quantity: number,
  operation: "add" | "subtract",
  agencyId?: number
) {
  const [existing] = await db
    .select()
    .from(availabilityCalendar)
    .where(
      and(
        eq(availabilityCalendar.serviceType, serviceType),
        eq(availabilityCalendar.serviceId, serviceId),
        eq(availabilityCalendar.availabilityDate, dateStr),
        agencyId ? eq(availabilityCalendar.agencyId, agencyId) : isNull(availabilityCalendar.agencyId)
      )
    )
    .limit(1);

  if (existing) {
    const newBooked =
      operation === "add"
        ? (existing.bookedCapacity || 0) + quantity
        : Math.max(0, (existing.bookedCapacity || 0) - quantity);

    const newAvailable = Math.max(
      0,
      (existing.totalCapacity || 1) - newBooked - (existing.heldCapacity || 0)
    );

    await db
      .update(availabilityCalendar)
      .set({
        bookedCapacity: newBooked,
        availableCapacity: newAvailable,
        status: newAvailable === 0 ? "sold_out" : existing.status,
        updatedAt: new Date(),
      })
      .where(eq(availabilityCalendar.id, existing.id));
  }
}

// ============================================
// BLACKOUT DATE MANAGEMENT
// ============================================

/**
 * Create a blackout period
 */
export async function createBlackout(params: {
  startDate: Date;
  endDate: Date;
  reason: string;
  description?: string;
  blackoutType?: BlackoutType;
  reducedCapacity?: number;
  serviceType?: string;
  serviceId?: number;
  supplierId?: number;
  destinationId?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
  agencyId?: number;
  createdBy?: string;
}): Promise<{ blackoutId: number }> {
  const [blackout] = await db
    .insert(blackoutDates)
    .values({
      startDate: params.startDate.toISOString().split("T")[0],
      endDate: params.endDate.toISOString().split("T")[0],
      reason: params.reason,
      description: params.description,
      blackoutType: params.blackoutType || "full",
      reducedCapacity: params.reducedCapacity,
      serviceType: params.serviceType,
      serviceId: params.serviceId,
      supplierId: params.supplierId,
      destinationId: params.destinationId,
      isRecurring: params.isRecurring || false,
      recurrencePattern: params.recurrencePattern,
      isActive: true,
      agencyId: params.agencyId,
      createdBy: params.createdBy,
    })
    .returning({ id: blackoutDates.id });

  return { blackoutId: blackout.id };
}

// ============================================
// PERMIT INVENTORY MANAGEMENT
// ============================================

/**
 * Update permit inventory for a date
 */
export async function updatePermitInventory(params: {
  permitType: string;
  permitName: string;
  validDate: Date;
  dailyQuota?: number;
  agencyAllocation?: number;
  permitCost?: number;
  permitSellPrice?: number;
  issuingAuthority?: string;
  destinationId?: number;
  agencyId?: number;
}): Promise<{ permitId: number }> {
  const {
    permitType,
    permitName,
    validDate,
    dailyQuota,
    agencyAllocation,
    permitCost,
    permitSellPrice,
    issuingAuthority,
    destinationId,
    agencyId,
  } = params;

  const dateStr = validDate.toISOString().split("T")[0];

  // Check if exists
  const [existing] = await db
    .select()
    .from(permitInventory)
    .where(
      and(
        eq(permitInventory.permitType, permitType),
        eq(permitInventory.validDate, dateStr),
        agencyId ? eq(permitInventory.agencyId, agencyId) : isNull(permitInventory.agencyId)
      )
    )
    .limit(1);

  if (existing) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (dailyQuota !== undefined) updateData.dailyQuota = dailyQuota;
    if (agencyAllocation !== undefined) {
      updateData.agencyAllocation = agencyAllocation;
      updateData.availableCount = agencyAllocation - (existing.bookedCount || 0) - (existing.heldCount || 0);
    }
    if (permitCost !== undefined) updateData.permitCost = permitCost.toString();
    if (permitSellPrice !== undefined) updateData.permitSellPrice = permitSellPrice.toString();

    await db
      .update(permitInventory)
      .set(updateData)
      .where(eq(permitInventory.id, existing.id));

    return { permitId: existing.id };
  } else {
    const allocation = agencyAllocation || 0;

    const [permit] = await db
      .insert(permitInventory)
      .values({
        permitType,
        permitName,
        validDate: dateStr,
        dailyQuota,
        agencyAllocation: allocation,
        bookedCount: 0,
        heldCount: 0,
        availableCount: allocation,
        permitCost: permitCost?.toString(),
        permitSellPrice: permitSellPrice?.toString(),
        issuingAuthority,
        destinationId,
        agencyId,
        status: allocation > 0 ? "available" : "not_required",
      })
      .returning({ id: permitInventory.id });

    return { permitId: permit.id };
  }
}

/**
 * Check permit availability
 */
export async function checkPermitAvailability(params: {
  permitType: string;
  startDate: Date;
  endDate: Date;
  quantity?: number;
  agencyId?: number;
}): Promise<{
  isAvailable: boolean;
  dates: Array<{ date: string; available: number; status: string }>;
}> {
  const { permitType, startDate, endDate, quantity = 1, agencyId } = params;

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  const permits = await db
    .select()
    .from(permitInventory)
    .where(
      and(
        eq(permitInventory.permitType, permitType),
        gte(permitInventory.validDate, startDateStr),
        lte(permitInventory.validDate, endDateStr),
        agencyId ? eq(permitInventory.agencyId, agencyId) : sql`1=1`
      )
    )
    .orderBy(permitInventory.validDate);

  const dates = permits.map((p) => ({
    date: p.validDate,
    available: p.availableCount || 0,
    status: p.status,
  }));

  const isAvailable = dates.every((d) => d.available >= quantity);

  return { isAvailable, dates };
}

// ============================================
// SYNC LOGGING
// ============================================

/**
 * Log an availability sync
 */
export async function logAvailabilitySync(params: {
  supplierId?: number;
  serviceType?: string;
  serviceId?: number;
  syncType: "manual" | "scheduled" | "webhook";
  syncStatus: "success" | "partial" | "failed";
  datesProcessed?: number;
  datesUpdated?: number;
  errorsCount?: number;
  errorDetails?: unknown;
  startedAt: Date;
  completedAt?: Date;
  triggeredBy?: string;
}): Promise<{ syncLogId: number }> {
  const durationMs = params.completedAt
    ? params.completedAt.getTime() - params.startedAt.getTime()
    : undefined;

  const [log] = await db
    .insert(availabilitySyncLog)
    .values({
      supplierId: params.supplierId,
      serviceType: params.serviceType,
      serviceId: params.serviceId,
      syncType: params.syncType,
      syncStatus: params.syncStatus,
      datesProcessed: params.datesProcessed || 0,
      datesUpdated: params.datesUpdated || 0,
      errorsCount: params.errorsCount || 0,
      errorDetails: params.errorDetails,
      startedAt: params.startedAt,
      completedAt: params.completedAt,
      durationMs,
      triggeredBy: params.triggeredBy,
    })
    .returning({ id: availabilitySyncLog.id });

  return { syncLogId: log.id };
}
