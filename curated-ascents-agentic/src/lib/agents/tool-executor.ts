// src/lib/agents/tool-executor.ts
// Executes tool calls from the AI - Fully corrected for new schema

import {
  searchRates,
  getRateDetails,
  calculateQuote,
  getDestinations,
  getCategories,
  saveQuote,
  getBookingStatus,
  getPaymentSchedule,
  convertQuoteToBooking,
  checkSupplierConfirmations,
  getTripBriefing,
} from "./database-tools";
import { researchExternalRates } from "./fallback-rate-research";
import {
  checkAvailability,
  validateAcclimatization,
  validatePermits,
  generateUpsellSuggestions,
  loadClientProfile,
} from "./expedition-architect-enhanced";
import {
  convertCurrency,
  formatCurrency,
  getSupportedCurrencies,
  BASE_CURRENCY,
} from "@/lib/currency/currency-service";
import {
  calculateDynamicPrice,
  DEMAND_ADJUSTMENTS,
  EARLY_BIRD_TIERS,
  GROUP_DISCOUNT_TIERS,
  LOYALTY_DISCOUNTS,
} from "@/lib/pricing/pricing-engine";
import { db } from "@/db";
import { pricingRules, seasons } from "@/db/schema";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";

// Strip all pricing fields from an object before sending to the AI
const PRICE_FIELD_PATTERNS = [
  /^cost/i, /^sell/i, /^margin/i, /^base_?cost/i,
  /price/i, /^unit_?price/i, /^subtotal/i,
  /^single_?supplement/i, /^pricing_?tiers/i, /^price_?tiers/i,
  /^commission/i, /^credit_?limit/i,
  /^vat/i, /^service_?charge/i,
];

function stripPricing(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripPricing);
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (PRICE_FIELD_PATTERNS.some(p => p.test(key))) continue;
      clean[key] = stripPricing(val);
    }
    return clean;
  }
  return obj;
}

export async function executeToolCall(
  toolName: string,
  args: Record<string, any>
): Promise<string> {
  console.log(`Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      case "search_rates":
        return JSON.stringify(await searchRates({
          destination: args.destination as string | undefined,
          // Tool definition uses serviceType; map to category for searchRates
          category: (args.serviceType || args.category) as string | undefined,
          minPrice: args.minPrice as number | undefined,
          maxPrice: args.maxPrice as number | undefined,
        }));

      case "search_hotels":
        return JSON.stringify(await searchRates({
          destination: args.destination as string | undefined,
          category: "hotel",
          minPrice: args.minPrice as number | undefined,
          maxPrice: args.maxPrice as number | undefined,
          starRating: args.starRating as number | undefined,
          hotelName: args.hotelName as string | undefined,
        }));

      case "search_packages":
        return JSON.stringify(await searchRates({
          destination: args.destination as string | undefined,
          category: "package",
          minPrice: args.minPrice as number | undefined,
          maxPrice: args.maxPrice as number | undefined,
          packageType: args.packageType as string | undefined,
          difficulty: args.difficulty as string | undefined,
          maxDays: args.maxDays as number | undefined,
          region: args.region as string | undefined,
        }));

      case "calculate_quote":
        return JSON.stringify(await calculateQuote({
          services: args.services as Array<{
            serviceType: string;
            serviceId: number;
            quantity?: number;
            nights?: number;
          }>,
          numberOfPax: args.numberOfPax as number,
          numberOfRooms: args.numberOfRooms as number | undefined,
          occupancyType: args.occupancyType as string | undefined,
        }));

      case "get_destinations":
        return JSON.stringify(await getDestinations(
          args.country ? { country: args.country as string } : undefined
        ));

      case "get_categories":
        return JSON.stringify(await getCategories(args.destination as string | undefined));

      case "get_service_details":
      case "get_rate_details":
        // Tool definition uses serviceId; also accept rateId for backward compat
        // Strip all pricing — AI should only describe services, not show per-item prices
        return JSON.stringify(stripPricing(await getRateDetails({
          rateId: (args.serviceId || args.rateId) as number,
          serviceType: args.serviceType as string | undefined,
        })));

      case "save_quote":
        return JSON.stringify(await saveQuote({
          clientEmail: args.clientEmail as string | undefined,
          clientName: args.clientName as string | undefined,
          quoteName: args.quoteName as string | undefined,
          destination: args.destination as string | undefined,
          numberOfPax: args.numberOfPax as number | undefined,
          items: args.items as Array<{
            serviceType: string;
            serviceName: string;
            description?: string;
            quantity?: number;
            sellPrice: number;
          }>,
        }));

      case "research_external_rates":
        return JSON.stringify(await researchExternalRates({
          serviceType: args.serviceType as string,
          serviceName: args.serviceName as string,
          location: args.location as string,
          category: args.category as string | undefined,
          additionalContext: args.additionalContext as string | undefined,
        }));

      // Booking Operations Tools
      case "get_booking_status":
        return JSON.stringify(await getBookingStatus({
          bookingReference: args.bookingReference as string,
        }));

      case "get_payment_schedule":
        return JSON.stringify(await getPaymentSchedule({
          bookingReference: args.bookingReference as string,
        }));

      case "convert_quote_to_booking":
        return JSON.stringify(await convertQuoteToBooking({
          quoteNumber: args.quoteNumber as string,
          clientEmail: args.clientEmail as string | undefined,
        }));

      case "check_supplier_confirmations":
        return JSON.stringify(await checkSupplierConfirmations({
          bookingReference: args.bookingReference as string,
        }));

      case "get_trip_briefing":
        return JSON.stringify(await getTripBriefing({
          bookingReference: args.bookingReference as string,
        }));

      // Enhanced Expedition Architect Tools
      case "check_availability":
        return JSON.stringify(await checkAvailability(
          args.serviceType as string,
          args.serviceId as number,
          args.startDate as string,
          args.endDate as string,
          args.quantity as number | undefined
        ));

      case "validate_trek_acclimatization":
        return JSON.stringify(validateAcclimatization(
          args.itinerary as Array<{ day: number; location: string; overnightAltitude?: number }>
        ));

      case "validate_permits":
        return JSON.stringify(await validatePermits(
          args.destinationRegion as string,
          args.tripStartDate as string,
          args.nationality as string | undefined
        ));

      case "get_upsell_suggestions":
        // Load client profile if clientId is available in context
        const clientProfile = args.clientId
          ? await loadClientProfile(args.clientId as number)
          : undefined;
        return JSON.stringify(generateUpsellSuggestions(
          args.tripType as string,
          args.destination as string,
          clientProfile || undefined,
          args.currentServices as string[] | undefined
        ));

      // Currency Tools
      case "convert_currency":
        const conversionResult = await convertCurrency(
          args.amount as number,
          (args.fromCurrency as string) || BASE_CURRENCY,
          args.toCurrency as string
        );
        return JSON.stringify({
          originalAmount: conversionResult.originalAmount,
          originalCurrency: conversionResult.originalCurrency,
          originalFormatted: formatCurrency(conversionResult.originalAmount, conversionResult.originalCurrency),
          convertedAmount: conversionResult.convertedAmount,
          targetCurrency: conversionResult.targetCurrency,
          convertedFormatted: formatCurrency(conversionResult.convertedAmount, conversionResult.targetCurrency),
          exchangeRate: conversionResult.rate,
          rateTimestamp: conversionResult.rateTimestamp.toISOString(),
        });

      case "get_supported_currencies":
        const currencies = await getSupportedCurrencies();
        return JSON.stringify({
          currencies: currencies.map(c => ({
            code: c.code,
            name: c.name,
            symbol: c.symbol,
          })),
          baseCurrency: BASE_CURRENCY,
          note: "All prices are in USD by default. We can show prices in your preferred currency upon request.",
        });

      // Dynamic Pricing Tools
      case "get_dynamic_price":
        const dynamicPriceResult = await calculateDynamicPrice({
          serviceType: args.serviceType as string,
          serviceId: args.serviceId as number,
          basePrice: args.basePrice as number,
          travelDate: new Date(args.travelDate as string),
          paxCount: args.paxCount as number | undefined,
          loyaltyTier: args.loyaltyTier as string | undefined,
        });
        return JSON.stringify({
          originalPrice: dynamicPriceResult.originalPrice,
          finalPrice: dynamicPriceResult.finalPrice,
          currency: dynamicPriceResult.currency,
          savings: dynamicPriceResult.savings,
          savingsPercent: dynamicPriceResult.savingsPercent,
          seasonName: dynamicPriceResult.seasonName,
          appliedDiscounts: dynamicPriceResult.appliedRules.map(r => ({
            name: r.ruleName,
            type: r.ruleType,
            adjustment: r.adjustmentValue > 0 ? `+${r.adjustmentValue}%` : `${r.adjustmentValue}%`,
          })),
          note: dynamicPriceResult.savings
            ? `You save ${formatCurrency(dynamicPriceResult.savings, "USD")} (${dynamicPriceResult.savingsPercent}% off)!`
            : undefined,
        });

      case "check_pricing_promotions":
        const promoDestination = (args.destination as string || "").toLowerCase();
        const promoServiceType = args.serviceType as string | undefined;
        const promoMonth = args.travelMonth as string | undefined;

        // Get current month if not specified
        const monthNames = ["january", "february", "march", "april", "may", "june",
                          "july", "august", "september", "october", "november", "december"];
        const targetMonth = promoMonth
          ? monthNames.indexOf(promoMonth.toLowerCase()) + 1
          : new Date().getMonth() + 1;

        // Get active pricing rules
        const activeRules = await db
          .select()
          .from(pricingRules)
          .where(
            and(
              eq(pricingRules.isActive, true),
              promoServiceType && promoServiceType !== "all"
                ? or(isNull(pricingRules.serviceType), eq(pricingRules.serviceType, promoServiceType))
                : undefined
            )
          )
          .limit(10);

        // Get current season
        const currentSeason = await db
          .select()
          .from(seasons)
          .where(
            and(
              lte(seasons.startMonth, targetMonth),
              gte(seasons.endMonth, targetMonth)
            )
          )
          .limit(1);

        // Build response with promotions info
        const promotions = {
          destination: args.destination,
          month: promoMonth || monthNames[targetMonth - 1],
          seasonInfo: currentSeason[0] ? {
            name: currentSeason[0].name,
            priceMultiplier: parseFloat(currentSeason[0].priceMultiplier || "1.00"),
            isPeak: parseFloat(currentSeason[0].priceMultiplier || "1.00") > 1,
            note: parseFloat(currentSeason[0].priceMultiplier || "1.00") > 1
              ? "Peak season - prices may be higher"
              : parseFloat(currentSeason[0].priceMultiplier || "1.00") < 1
                ? "Low season - enjoy discounted rates!"
                : "Regular season pricing",
          } : null,
          activePromotions: activeRules.map(r => ({
            name: r.name,
            type: r.ruleType,
            discount: parseFloat(r.adjustmentValue) < 0
              ? `${Math.abs(parseFloat(r.adjustmentValue))}% off`
              : null,
            validUntil: r.validTo,
          })).filter(p => p.discount),
          standardDiscounts: {
            earlyBird: EARLY_BIRD_TIERS.map(t => ({
              daysAhead: `${t.daysAhead}+ days`,
              discount: `${t.discount}% off`,
            })),
            groupDiscounts: GROUP_DISCOUNT_TIERS.map(t => ({
              minPax: `${t.minPax}+ travelers`,
              discount: `${t.discount}% off`,
            })),
            loyaltyDiscounts: Object.entries(LOYALTY_DISCOUNTS).map(([tier, discount]) => ({
              tier: tier.charAt(0).toUpperCase() + tier.slice(1),
              discount: `${discount}% off`,
            })),
          },
          tip: "Book early (90+ days ahead) to get up to 15% off, or travel with a group of 20+ for maximum savings!",
        };

        return JSON.stringify(promotions);

      default:
        return JSON.stringify({
          error: `Unknown tool: ${toolName}`,
          availableTools: [
            "search_rates",
            "search_hotels",
            "search_packages",
            "calculate_quote",
            "get_destinations",
            "get_categories",
            "get_rate_details",
            "research_external_rates",
            "save_quote",
            "get_booking_status",
            "get_payment_schedule",
            "convert_quote_to_booking",
            "check_supplier_confirmations",
            "get_trip_briefing",
            "check_availability",
            "validate_trek_acclimatization",
            "validate_permits",
            "get_upsell_suggestions",
            "convert_currency",
            "get_supported_currencies",
            "get_dynamic_price",
            "check_pricing_promotions",
          ],
        });
    }
  } catch (error) {
    console.error(`Error executing ${toolName}:`, error);
    return JSON.stringify({
      error: "Tool execution failed",
      message: error instanceof Error ? error.message : "Unknown error",
      tool: toolName,
    });
  }
}

// Export with alternative name for compatibility
export const executeTool = executeToolCall;