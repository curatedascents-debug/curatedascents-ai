import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  loyaltyAccounts,
  referrals,
  tripCheckins,
  feedbackSurveys,
  clientMilestones,
  clients,
} from "@/db/schema";
import { sql, eq, and, gte, isNotNull } from "drizzle-orm";
import { calculateNPS } from "@/lib/customer-success/feedback-engine";
import { TIER_THRESHOLDS } from "@/lib/customer-success/loyalty-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/customer-success
 * Customer Success dashboard with comprehensive metrics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // ============================================
    // LOYALTY METRICS
    // ============================================

    // Tier distribution
    const tierDistribution = await db
      .select({
        tier: loyaltyAccounts.tier,
        count: sql<number>`COUNT(*)::int`,
        totalPoints: sql<number>`SUM(${loyaltyAccounts.totalPoints})::int`,
        avgPoints: sql<number>`AVG(${loyaltyAccounts.totalPoints})::int`,
      })
      .from(loyaltyAccounts)
      .groupBy(loyaltyAccounts.tier);

    // Points stats
    const [pointsStats] = await db
      .select({
        totalAccounts: sql<number>`COUNT(*)::int`,
        totalPointsInCirculation: sql<number>`SUM(${loyaltyAccounts.totalPoints})::int`,
        totalPointsEverIssued: sql<number>`SUM(${loyaltyAccounts.lifetimePoints})::int`,
        totalPointsRedeemed: sql<number>`SUM(${loyaltyAccounts.redeemedPoints})::int`,
        avgPointsPerMember: sql<number>`AVG(${loyaltyAccounts.totalPoints})::int`,
      })
      .from(loyaltyAccounts);

    // Top loyalty members
    const topMembers = await db
      .select({
        clientId: loyaltyAccounts.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        totalPoints: loyaltyAccounts.totalPoints,
        lifetimePoints: loyaltyAccounts.lifetimePoints,
        tier: loyaltyAccounts.tier,
        totalBookings: loyaltyAccounts.totalBookings,
        totalSpent: loyaltyAccounts.totalSpent,
      })
      .from(loyaltyAccounts)
      .innerJoin(clients, eq(loyaltyAccounts.clientId, clients.id))
      .orderBy(sql`${loyaltyAccounts.lifetimePoints} DESC`)
      .limit(10);

    // ============================================
    // REFERRAL METRICS
    // ============================================

    const referralStats = await db
      .select({
        status: referrals.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(referrals)
      .groupBy(referrals.status);

    const recentReferrals = await db
      .select({
        converted: sql<number>`COUNT(*) FILTER (WHERE ${referrals.status} = 'converted')::int`,
        total: sql<number>`COUNT(*)::int`,
      })
      .from(referrals)
      .where(gte(referrals.createdAt, startDate));

    // ============================================
    // CHECK-IN METRICS
    // ============================================

    const checkinStats = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        sent: sql<number>`COUNT(*) FILTER (WHERE ${tripCheckins.sentAt} IS NOT NULL)::int`,
        responded: sql<number>`COUNT(*) FILTER (WHERE ${tripCheckins.responseReceived} = true)::int`,
        avgRating: sql<number>`AVG(${tripCheckins.responseRating})::numeric(3,1)`,
        requireFollowup: sql<number>`COUNT(*) FILTER (WHERE ${tripCheckins.requiresFollowup} = true)::int`,
      })
      .from(tripCheckins)
      .where(gte(tripCheckins.createdAt, startDate));

    // Check-ins by type
    const checkinsByType = await db
      .select({
        type: tripCheckins.checkinType,
        count: sql<number>`COUNT(*)::int`,
        responseRate: sql<number>`(COUNT(*) FILTER (WHERE ${tripCheckins.responseReceived} = true)::float / NULLIF(COUNT(*) FILTER (WHERE ${tripCheckins.sentAt} IS NOT NULL), 0) * 100)::int`,
      })
      .from(tripCheckins)
      .where(gte(tripCheckins.createdAt, startDate))
      .groupBy(tripCheckins.checkinType);

    // ============================================
    // FEEDBACK & NPS METRICS
    // ============================================

    const npsData = await calculateNPS();

    const feedbackStats = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${feedbackSurveys.completedAt} IS NOT NULL)::int`,
        avgOverallRating: sql<number>`AVG(${feedbackSurveys.overallRating})::numeric(3,1)`,
        testimonials: sql<number>`COUNT(*) FILTER (WHERE ${feedbackSurveys.testimonial} IS NOT NULL)::int`,
        approvedTestimonials: sql<number>`COUNT(*) FILTER (WHERE ${feedbackSurveys.testimonialApproved} = true)::int`,
      })
      .from(feedbackSurveys)
      .where(gte(feedbackSurveys.createdAt, startDate));

    // ============================================
    // MILESTONE METRICS
    // ============================================

    const milestoneStats = await db
      .select({
        type: clientMilestones.milestoneType,
        count: sql<number>`COUNT(*)::int`,
        notified: sql<number>`COUNT(*) FILTER (WHERE ${clientMilestones.notificationSentAt} IS NOT NULL)::int`,
      })
      .from(clientMilestones)
      .groupBy(clientMilestones.milestoneType);

    const upcomingMilestones = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(clientMilestones)
      .where(
        and(
          sql`${clientMilestones.milestoneDate} >= CURRENT_DATE`,
          sql`${clientMilestones.milestoneDate} <= CURRENT_DATE + INTERVAL '30 days'`
        )
      );

    // ============================================
    // COMPILE RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,
      period: `Last ${days} days`,
      loyalty: {
        totalMembers: pointsStats.totalAccounts || 0,
        pointsInCirculation: pointsStats.totalPointsInCirculation || 0,
        pointsEverIssued: pointsStats.totalPointsEverIssued || 0,
        pointsRedeemed: pointsStats.totalPointsRedeemed || 0,
        avgPointsPerMember: pointsStats.avgPointsPerMember || 0,
        tierDistribution: tierDistribution.map((t) => ({
          tier: t.tier,
          count: t.count,
          totalPoints: t.totalPoints,
          avgPoints: t.avgPoints,
          threshold: TIER_THRESHOLDS[t.tier as keyof typeof TIER_THRESHOLDS],
        })),
        topMembers: topMembers.map((m) => ({
          clientId: m.clientId,
          name: m.clientName || m.clientEmail,
          tier: m.tier,
          lifetimePoints: m.lifetimePoints,
          currentPoints: m.totalPoints,
          totalBookings: m.totalBookings,
          totalSpent: m.totalSpent,
        })),
      },
      referrals: {
        byStatus: referralStats.reduce(
          (acc, r) => ({ ...acc, [r.status]: r.count }),
          {}
        ),
        total: referralStats.reduce((sum, r) => sum + r.count, 0),
        recentPeriod: {
          total: recentReferrals[0]?.total || 0,
          converted: recentReferrals[0]?.converted || 0,
          conversionRate:
            recentReferrals[0]?.total > 0
              ? (
                  (recentReferrals[0].converted / recentReferrals[0].total) *
                  100
                ).toFixed(1) + "%"
              : "0%",
        },
      },
      checkins: {
        total: checkinStats[0]?.total || 0,
        sent: checkinStats[0]?.sent || 0,
        responded: checkinStats[0]?.responded || 0,
        responseRate:
          checkinStats[0]?.sent > 0
            ? (
                (checkinStats[0].responded / checkinStats[0].sent) *
                100
              ).toFixed(1) + "%"
            : "0%",
        avgRating: checkinStats[0]?.avgRating || null,
        requireFollowup: checkinStats[0]?.requireFollowup || 0,
        byType: checkinsByType,
      },
      feedback: {
        nps: {
          score: npsData.nps,
          promoters: npsData.promoters,
          passives: npsData.passives,
          detractors: npsData.detractors,
          totalResponses: npsData.total,
        },
        surveys: {
          total: feedbackStats[0]?.total || 0,
          completed: feedbackStats[0]?.completed || 0,
          completionRate:
            feedbackStats[0]?.total > 0
              ? (
                  (feedbackStats[0].completed / feedbackStats[0].total) *
                  100
                ).toFixed(1) + "%"
              : "0%",
          avgOverallRating: feedbackStats[0]?.avgOverallRating || null,
        },
        testimonials: {
          total: feedbackStats[0]?.testimonials || 0,
          approved: feedbackStats[0]?.approvedTestimonials || 0,
        },
      },
      milestones: {
        byType: milestoneStats,
        upcoming30Days: upcomingMilestones[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching customer success metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer success metrics" },
      { status: 500 }
    );
  }
}
