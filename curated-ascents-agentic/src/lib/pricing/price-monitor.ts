import { db } from "@/db";
import {
  hotels,
  hotelRoomRates,
  priceAlerts,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Market rate estimates by category (USD per night, double occupancy)
const MARKET_RATE_ESTIMATES: Record<string, { low: number; mid: number; high: number }> = {
  luxury: { low: 100, mid: 150, high: 250 },
  business: { low: 50, mid: 80, high: 120 },
  boutique: { low: 60, mid: 90, high: 150 },
  mountain_lodge: { low: 25, mid: 40, high: 70 },
  safari_lodge: { low: 80, mid: 120, high: 200 },
  heritage: { low: 35, mid: 55, high: 90 },
  budget: { low: 15, mid: 25, high: 40 },
};

// Seasonal multipliers for Nepal
function getSeasonMultiplier(): { multiplier: number; season: string } {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 10 && month <= 11) return { multiplier: 1.3, season: "peak (Oct-Nov)" };
  if (month >= 3 && month <= 5) return { multiplier: 1.2, season: "spring (Mar-May)" };
  if (month >= 6 && month <= 8) return { multiplier: 0.7, season: "monsoon (Jun-Aug)" };
  if (month === 12 || month <= 2) return { multiplier: 0.9, season: "winter (Dec-Feb)" };
  return { multiplier: 1.0, season: "shoulder" };
}

interface MonitorResults {
  hotelsAnalyzed: number;
  alertsGenerated: number;
  errors: string[];
}

export async function runPriceMonitoring(): Promise<MonitorResults> {
  const results: MonitorResults = {
    hotelsAnalyzed: 0,
    alertsGenerated: 0,
    errors: [],
  };

  try {
    // Get all active hotels with their rates
    const allHotels = await db
      .select({
        id: hotels.id,
        name: hotels.name,
        category: hotels.category,
        starRating: hotels.starRating,
        destinationId: hotels.destinationId,
      })
      .from(hotels)
      .where(eq(hotels.isActive, true));

    const { multiplier, season } = getSeasonMultiplier();

    for (const hotel of allHotels) {
      try {
        results.hotelsAnalyzed++;

        // Get current room rates
        const rates = await db
          .select()
          .from(hotelRoomRates)
          .where(
            and(
              eq(hotelRoomRates.hotelId, hotel.id),
              eq(hotelRoomRates.isActive, true)
            )
          );

        if (rates.length === 0) continue;

        const category = hotel.category || "business";
        const marketEstimate = MARKET_RATE_ESTIMATES[category] || MARKET_RATE_ESTIMATES.business;
        const adjustedMarketMid = marketEstimate.mid * multiplier;

        for (const rate of rates) {
          const costDouble = parseFloat(rate.costDouble || "0");
          const sellDouble = parseFloat(rate.sellDouble || "0");

          if (costDouble <= 0) continue;

          // Check 1: Cost above market estimate (negotiation opportunity)
          if (costDouble > adjustedMarketMid * 1.2) {
            const overpayPercent = Math.round(((costDouble - adjustedMarketMid) / adjustedMarketMid) * 100);
            await createAlert({
              alertType: "negotiation_opportunity",
              serviceType: "hotel",
              serviceName: `${hotel.name} (${rate.roomType} / ${rate.mealPlan})`,
              hotelId: hotel.id,
              currentPrice: costDouble,
              marketAverage: adjustedMarketMid,
              changePercent: overpayPercent,
              priority: overpayPercent > 40 ? "high" : "medium",
              recommendation: `Cost $${costDouble}/night is ${overpayPercent}% above estimated market rate of $${adjustedMarketMid.toFixed(0)}/night. Negotiate for a ${Math.min(overpayPercent, 30)}% reduction during ${season}.`,
            });
            results.alertsGenerated++;
          }

          // Check 2: Margin too low (< 30%)
          const actualMargin = sellDouble > 0 ? ((sellDouble - costDouble) / costDouble) * 100 : 0;
          if (actualMargin < 30 && actualMargin > 0) {
            await createAlert({
              alertType: "price_increase",
              serviceType: "hotel",
              serviceName: `${hotel.name} (${rate.roomType} / ${rate.mealPlan})`,
              hotelId: hotel.id,
              currentPrice: sellDouble,
              previousPrice: costDouble,
              changePercent: Math.round(actualMargin),
              priority: actualMargin < 20 ? "high" : "medium",
              recommendation: `Current margin is only ${actualMargin.toFixed(1)}% (sell $${sellDouble} vs cost $${costDouble}). Consider increasing sell price to $${(costDouble * 1.5).toFixed(0)} for standard 50% margin.`,
            });
            results.alertsGenerated++;
          }

          // Check 3: Seasonal opportunity (monsoon/low season — renegotiate)
          if (multiplier < 0.9) {
            const suggestedCost = costDouble * multiplier;
            await createAlert({
              alertType: "seasonal_trend",
              serviceType: "hotel",
              serviceName: `${hotel.name} (${rate.roomType} / ${rate.mealPlan})`,
              hotelId: hotel.id,
              currentPrice: costDouble,
              marketAverage: suggestedCost,
              changePercent: Math.round((1 - multiplier) * 100),
              priority: "low",
              recommendation: `Low season (${season}): negotiate temporary rate reduction to ~$${suggestedCost.toFixed(0)}/night (${Math.round((1 - multiplier) * 100)}% off). Hotels typically offer seasonal discounts during this period.`,
            });
            results.alertsGenerated++;
          }

          // Check 4: Price drop detection — cost significantly below market (great deal, lock it in)
          if (costDouble < adjustedMarketMid * 0.7 && costDouble > 0) {
            await createAlert({
              alertType: "price_drop",
              serviceType: "hotel",
              serviceName: `${hotel.name} (${rate.roomType} / ${rate.mealPlan})`,
              hotelId: hotel.id,
              currentPrice: costDouble,
              marketAverage: adjustedMarketMid,
              changePercent: Math.round(((adjustedMarketMid - costDouble) / adjustedMarketMid) * 100),
              priority: "medium",
              recommendation: `Excellent rate: $${costDouble}/night is ${Math.round(((adjustedMarketMid - costDouble) / adjustedMarketMid) * 100)}% below market average ($${adjustedMarketMid.toFixed(0)}). Consider locking in this rate with a longer-term contract.`,
            });
            results.alertsGenerated++;
          }
        }
      } catch (err) {
        const msg = `Error analyzing ${hotel.name}: ${err instanceof Error ? err.message : "Unknown"}`;
        console.error(msg);
        results.errors.push(msg);
      }
    }
  } catch (err) {
    const msg = `Price monitoring failed: ${err instanceof Error ? err.message : "Unknown"}`;
    console.error(msg);
    results.errors.push(msg);
  }

  return results;
}

async function createAlert(data: {
  alertType: string;
  serviceType: string;
  serviceName: string;
  hotelId?: number;
  supplierId?: number;
  currentPrice?: number;
  previousPrice?: number;
  changePercent?: number;
  marketAverage?: number;
  priority: string;
  recommendation: string;
}) {
  // Avoid duplicate alerts for the same hotel/type within 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await db
    .select({ id: priceAlerts.id })
    .from(priceAlerts)
    .where(
      and(
        eq(priceAlerts.serviceName, data.serviceName),
        eq(priceAlerts.alertType, data.alertType),
        sql`${priceAlerts.createdAt} > ${oneDayAgo}`
      )
    );

  if (existing.length > 0) return;

  await db.insert(priceAlerts).values({
    alertType: data.alertType,
    serviceType: data.serviceType,
    serviceName: data.serviceName,
    hotelId: data.hotelId,
    supplierId: data.supplierId,
    currentPrice: data.currentPrice?.toString(),
    previousPrice: data.previousPrice?.toString(),
    changePercent: data.changePercent?.toString(),
    marketAverage: data.marketAverage?.toString(),
    priority: data.priority,
    status: "new",
    recommendation: data.recommendation,
  });
}

export async function getAlertStats() {
  const [stats] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      newCount: sql<number>`COUNT(*) FILTER (WHERE ${priceAlerts.status} = 'new')::int`,
      highPriority: sql<number>`COUNT(*) FILTER (WHERE ${priceAlerts.priority} = 'high' AND ${priceAlerts.status} = 'new')::int`,
    })
    .from(priceAlerts);

  return stats;
}
