/**
 * Loyalty Engine - Points, Tiers, and Rewards Management
 */

import { db } from "@/db";
import {
  loyaltyAccounts,
  loyaltyTransactions,
  referrals,
  clients,
  bookings,
} from "@/db/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// ============================================
// CONSTANTS
// ============================================

// Tier thresholds (lifetime points)
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
} as const;

// Tier benefits
export const TIER_BENEFITS = {
  bronze: { discount: 0, prioritySupport: false, exclusiveOffers: false },
  silver: { discount: 5, prioritySupport: false, exclusiveOffers: true },
  gold: { discount: 10, prioritySupport: true, exclusiveOffers: true },
  platinum: { discount: 15, prioritySupport: true, exclusiveOffers: true },
} as const;

// Points earning rules
export const POINTS_RULES = {
  BOOKING_PER_100_USD: 1, // 1 point per $100 spent
  REFERRAL_SUCCESSFUL: 500, // Referrer gets 500 points
  REFERRAL_NEW_CLIENT: 250, // New client gets 250 points
  REVIEW_SUBMITTED: 100, // Submit a review
  SURVEY_COMPLETED: 50, // Complete post-trip survey
  ANNIVERSARY_BONUS: 200, // Annual membership anniversary
  FIRST_BOOKING_BONUS: 100, // Welcome bonus
} as const;

// Referral settings
export const REFERRAL_SETTINGS = {
  EXPIRY_DAYS: 90, // Referral links valid for 90 days
  MIN_BOOKING_VALUE: 500, // Minimum booking value for referral to count
} as const;

export type LoyaltyTier = keyof typeof TIER_THRESHOLDS;

export type TransactionType =
  | "earned_booking"
  | "earned_referral"
  | "earned_review"
  | "earned_survey"
  | "earned_bonus"
  | "redeemed"
  | "expired"
  | "adjusted";

// ============================================
// LOYALTY ACCOUNT MANAGEMENT
// ============================================

/**
 * Generate a unique referral code
 */
function generateReferralCode(clientName?: string): string {
  const prefix = clientName
    ? clientName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "X")
    : "REF";
  return `${prefix}${nanoid(6).toUpperCase()}`;
}

/**
 * Get or create a loyalty account for a client
 */
export async function getOrCreateLoyaltyAccount(clientId: number) {
  // Check for existing account
  const existing = await db
    .select()
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.clientId, clientId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Get client name for referral code
  const [client] = await db
    .select({ name: clients.name })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  // Create new account
  const referralCode = generateReferralCode(client?.name || undefined);

  const [newAccount] = await db
    .insert(loyaltyAccounts)
    .values({
      clientId,
      referralCode,
      totalPoints: 0,
      lifetimePoints: 0,
      redeemedPoints: 0,
      tier: "bronze",
    })
    .returning();

  return newAccount;
}

/**
 * Get loyalty account summary for a client
 */
export async function getLoyaltyAccountSummary(clientId: number) {
  const account = await getOrCreateLoyaltyAccount(clientId);

  // Get recent transactions
  const recentTransactions = await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.loyaltyAccountId, account.id))
    .orderBy(sql`${loyaltyTransactions.createdAt} DESC`)
    .limit(10);

  // Calculate points to next tier
  const tiers = Object.entries(TIER_THRESHOLDS) as [LoyaltyTier, number][];
  const currentTierIndex = tiers.findIndex(([tier]) => tier === account.tier);
  const nextTier = tiers[currentTierIndex + 1];

  const pointsToNextTier = nextTier
    ? nextTier[1] - account.lifetimePoints
    : null;

  return {
    account: {
      id: account.id,
      clientId: account.clientId,
      totalPoints: account.totalPoints,
      lifetimePoints: account.lifetimePoints,
      tier: account.tier as LoyaltyTier,
      referralCode: account.referralCode,
      referralCount: account.referralCount,
      totalBookings: account.totalBookings,
      totalSpent: account.totalSpent,
    },
    benefits: TIER_BENEFITS[account.tier as LoyaltyTier],
    pointsToNextTier,
    nextTier: nextTier ? nextTier[0] : null,
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      points: t.points,
      reason: t.reason,
      createdAt: t.createdAt,
    })),
  };
}

// ============================================
// POINTS TRANSACTIONS
// ============================================

/**
 * Add points to a loyalty account
 */
export async function addPoints(
  clientId: number,
  points: number,
  type: TransactionType,
  reason: string,
  referenceType?: string,
  referenceId?: number,
  performedBy?: string
): Promise<{ newBalance: number; newTier: LoyaltyTier; tierChanged: boolean }> {
  const account = await getOrCreateLoyaltyAccount(clientId);
  const newBalance = account.totalPoints + points;
  const newLifetime =
    points > 0 ? account.lifetimePoints + points : account.lifetimePoints;

  // Record transaction
  await db.insert(loyaltyTransactions).values({
    loyaltyAccountId: account.id,
    type,
    points,
    balanceAfter: newBalance,
    reason,
    referenceType,
    referenceId,
    performedBy,
  });

  // Calculate new tier based on lifetime points
  const newTier = calculateTier(newLifetime);
  const tierChanged = newTier !== account.tier;

  // Update account
  await db
    .update(loyaltyAccounts)
    .set({
      totalPoints: newBalance,
      lifetimePoints: newLifetime,
      tier: newTier,
      tierUpdatedAt: tierChanged ? new Date() : account.tierUpdatedAt,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccounts.id, account.id));

  return { newBalance, newTier, tierChanged };
}

/**
 * Redeem points for a discount
 */
export async function redeemPoints(
  clientId: number,
  points: number,
  reason: string,
  bookingId?: number
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const account = await getOrCreateLoyaltyAccount(clientId);

  if (account.totalPoints < points) {
    return {
      success: false,
      newBalance: account.totalPoints,
      error: "Insufficient points",
    };
  }

  const newBalance = account.totalPoints - points;

  // Record transaction
  await db.insert(loyaltyTransactions).values({
    loyaltyAccountId: account.id,
    type: "redeemed",
    points: -points,
    balanceAfter: newBalance,
    reason,
    referenceType: bookingId ? "booking" : undefined,
    referenceId: bookingId,
  });

  // Update account
  await db
    .update(loyaltyAccounts)
    .set({
      totalPoints: newBalance,
      redeemedPoints: account.redeemedPoints + points,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccounts.id, account.id));

  return { success: true, newBalance };
}

/**
 * Calculate tier based on lifetime points
 */
function calculateTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return "platinum";
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return "gold";
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

// ============================================
// BOOKING REWARDS
// ============================================

/**
 * Award points for a completed booking
 */
export async function awardBookingPoints(
  clientId: number,
  bookingId: number,
  bookingValue: number
): Promise<{ pointsAwarded: number; tierChanged: boolean; newTier: LoyaltyTier }> {
  const account = await getOrCreateLoyaltyAccount(clientId);

  // Calculate points (1 per $100)
  const pointsEarned = Math.floor(bookingValue / 100) * POINTS_RULES.BOOKING_PER_100_USD;

  // Check if this is their first booking
  const isFirstBooking = account.totalBookings === 0;
  const bonusPoints = isFirstBooking ? POINTS_RULES.FIRST_BOOKING_BONUS : 0;

  const totalPoints = pointsEarned + bonusPoints;

  // Award the points
  const result = await addPoints(
    clientId,
    totalPoints,
    "earned_booking",
    isFirstBooking
      ? `First booking reward: ${pointsEarned} pts + ${bonusPoints} welcome bonus`
      : `Booking reward: ${pointsEarned} pts for $${bookingValue.toLocaleString()} booking`,
    "booking",
    bookingId
  );

  // Update booking stats
  await db
    .update(loyaltyAccounts)
    .set({
      totalBookings: (account.totalBookings || 0) + 1,
      totalSpent: sql`${loyaltyAccounts.totalSpent} + ${bookingValue}`,
      lastBookingAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccounts.id, account.id));

  return {
    pointsAwarded: totalPoints,
    tierChanged: result.tierChanged,
    newTier: result.newTier,
  };
}

// ============================================
// REFERRAL MANAGEMENT
// ============================================

/**
 * Create a referral tracking record
 */
export async function createReferral(
  referrerClientId: number,
  referredEmail: string
): Promise<{ success: boolean; referralCode: string; error?: string }> {
  const account = await getOrCreateLoyaltyAccount(referrerClientId);

  // Check if this email was already referred
  const existingReferral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredEmail, referredEmail.toLowerCase()))
    .limit(1);

  if (existingReferral.length > 0) {
    return {
      success: false,
      referralCode: account.referralCode,
      error: "This email has already been referred",
    };
  }

  // Create referral record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFERRAL_SETTINGS.EXPIRY_DAYS);

  await db.insert(referrals).values({
    referrerClientId,
    referredEmail: referredEmail.toLowerCase(),
    referralCode: account.referralCode,
    status: "pending",
    expiresAt,
  });

  return { success: true, referralCode: account.referralCode };
}

/**
 * Process a referral when referred person registers
 */
export async function processReferralRegistration(
  referredClientId: number,
  referralCode: string
): Promise<{ success: boolean; referrerId?: number; error?: string }> {
  // Find the referral
  const [referral] = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referralCode, referralCode),
        eq(referrals.status, "pending")
      )
    )
    .limit(1);

  if (!referral) {
    return { success: false, error: "Invalid or expired referral code" };
  }

  // Check expiry
  if (referral.expiresAt && new Date() > new Date(referral.expiresAt)) {
    await db
      .update(referrals)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(referrals.id, referral.id));
    return { success: false, error: "Referral code has expired" };
  }

  // Update referral with registered client
  await db
    .update(referrals)
    .set({
      referredClientId,
      status: "registered",
      updatedAt: new Date(),
    })
    .where(eq(referrals.id, referral.id));

  // Award welcome points to new client
  await addPoints(
    referredClientId,
    POINTS_RULES.REFERRAL_NEW_CLIENT,
    "earned_referral",
    `Welcome bonus from referral by friend`,
    "referral",
    referral.id
  );

  // Mark new client reward as given
  await db
    .update(referrals)
    .set({ referredRewardGiven: true })
    .where(eq(referrals.id, referral.id));

  return { success: true, referrerId: referral.referrerClientId };
}

/**
 * Complete a referral when referred person makes a booking
 */
export async function completeReferral(
  referredClientId: number,
  bookingId: number,
  bookingValue: number
): Promise<{ success: boolean; referrerPointsAwarded?: number }> {
  // Find the pending referral
  const [referral] = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referredClientId, referredClientId),
        eq(referrals.status, "registered")
      )
    )
    .limit(1);

  if (!referral) {
    return { success: false };
  }

  // Check minimum booking value
  if (bookingValue < REFERRAL_SETTINGS.MIN_BOOKING_VALUE) {
    return { success: false };
  }

  // Award points to referrer
  await addPoints(
    referral.referrerClientId,
    POINTS_RULES.REFERRAL_SUCCESSFUL,
    "earned_referral",
    `Referral reward: Your friend completed their first booking!`,
    "referral",
    referral.id
  );

  // Update referral status
  await db
    .update(referrals)
    .set({
      status: "converted",
      convertedBookingId: bookingId,
      convertedAt: new Date(),
      referrerRewardGiven: true,
      updatedAt: new Date(),
    })
    .where(eq(referrals.id, referral.id));

  // Update referrer's referral count
  const referrerAccount = await getOrCreateLoyaltyAccount(referral.referrerClientId);
  await db
    .update(loyaltyAccounts)
    .set({
      referralCount: (referrerAccount.referralCount || 0) + 1,
      referralEarnings: (referrerAccount.referralEarnings || 0) + POINTS_RULES.REFERRAL_SUCCESSFUL,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccounts.id, referrerAccount.id));

  return { success: true, referrerPointsAwarded: POINTS_RULES.REFERRAL_SUCCESSFUL };
}

/**
 * Get referral by code (for validation)
 */
export async function getReferralByCode(code: string) {
  const [account] = await db
    .select({
      id: loyaltyAccounts.id,
      clientId: loyaltyAccounts.clientId,
      clientName: clients.name,
      referralCode: loyaltyAccounts.referralCode,
    })
    .from(loyaltyAccounts)
    .innerJoin(clients, eq(loyaltyAccounts.clientId, clients.id))
    .where(eq(loyaltyAccounts.referralCode, code))
    .limit(1);

  return account || null;
}

// ============================================
// TIER MANAGEMENT
// ============================================

/**
 * Recalculate tiers for all accounts (monthly cron job)
 */
export async function recalculateAllTiers(): Promise<{
  processed: number;
  upgraded: number;
  downgraded: number;
}> {
  const allAccounts = await db.select().from(loyaltyAccounts);

  let upgraded = 0;
  let downgraded = 0;

  for (const account of allAccounts) {
    const newTier = calculateTier(account.lifetimePoints);

    if (newTier !== account.tier) {
      const isUpgrade =
        TIER_THRESHOLDS[newTier as LoyaltyTier] >
        TIER_THRESHOLDS[account.tier as LoyaltyTier];

      await db
        .update(loyaltyAccounts)
        .set({
          tier: newTier,
          tierUpdatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(loyaltyAccounts.id, account.id));

      if (isUpgrade) upgraded++;
      else downgraded++;
    }
  }

  return { processed: allAccounts.length, upgraded, downgraded };
}

// ============================================
// POINTS EXPIRY
// ============================================

// Points expire after 24 months of inactivity
const POINTS_EXPIRY_MONTHS = 24;

/**
 * Expire points for inactive accounts
 */
export async function expireInactivePoints(): Promise<{
  accountsProcessed: number;
  accountsExpired: number;
  totalPointsExpired: number;
}> {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - POINTS_EXPIRY_MONTHS);

  // Find accounts with no activity in the last 24 months and positive balance
  const inactiveAccounts = await db
    .select()
    .from(loyaltyAccounts)
    .where(
      and(
        sql`${loyaltyAccounts.totalPoints} > 0`,
        sql`COALESCE(${loyaltyAccounts.lastBookingAt}, ${loyaltyAccounts.createdAt}) < ${cutoffDate}`
      )
    );

  let accountsExpired = 0;
  let totalPointsExpired = 0;

  for (const account of inactiveAccounts) {
    // Check if there was recent transaction activity
    const recentActivity = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(loyaltyTransactions)
      .where(
        and(
          eq(loyaltyTransactions.loyaltyAccountId, account.id),
          sql`${loyaltyTransactions.createdAt} > ${cutoffDate}`
        )
      );

    if (recentActivity[0]?.count === 0) {
      const pointsToExpire = account.totalPoints;

      // Record expiry transaction
      await db.insert(loyaltyTransactions).values({
        loyaltyAccountId: account.id,
        type: "expired",
        points: -pointsToExpire,
        balanceAfter: 0,
        reason: `Points expired due to ${POINTS_EXPIRY_MONTHS} months of inactivity`,
      });

      // Update account
      await db
        .update(loyaltyAccounts)
        .set({
          totalPoints: 0,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyAccounts.id, account.id));

      accountsExpired++;
      totalPointsExpired += pointsToExpire;
    }
  }

  return {
    accountsProcessed: inactiveAccounts.length,
    accountsExpired,
    totalPointsExpired,
  };
}

/**
 * Get accounts at risk of points expiry (warning period)
 */
export async function getAccountsAtExpiryRisk(warningMonths: number = 3): Promise<
  Array<{
    clientId: number;
    clientName: string | null;
    clientEmail: string;
    totalPoints: number;
    lastActivity: Date | null;
    monthsUntilExpiry: number;
  }>
> {
  const warningCutoff = new Date();
  warningCutoff.setMonth(warningCutoff.getMonth() - (POINTS_EXPIRY_MONTHS - warningMonths));

  const expiryCutoff = new Date();
  expiryCutoff.setMonth(expiryCutoff.getMonth() - POINTS_EXPIRY_MONTHS);

  const atRiskAccounts = await db
    .select({
      clientId: loyaltyAccounts.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      totalPoints: loyaltyAccounts.totalPoints,
      lastActivity: loyaltyAccounts.lastBookingAt,
    })
    .from(loyaltyAccounts)
    .innerJoin(clients, eq(loyaltyAccounts.clientId, clients.id))
    .where(
      and(
        sql`${loyaltyAccounts.totalPoints} > 0`,
        sql`COALESCE(${loyaltyAccounts.lastBookingAt}, ${loyaltyAccounts.createdAt}) < ${warningCutoff}`,
        sql`COALESCE(${loyaltyAccounts.lastBookingAt}, ${loyaltyAccounts.createdAt}) > ${expiryCutoff}`
      )
    );

  return atRiskAccounts.map((account) => {
    const lastActivity = account.lastActivity || new Date();
    const monthsSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    return {
      ...account,
      monthsUntilExpiry: POINTS_EXPIRY_MONTHS - monthsSinceActivity,
    };
  });
}
