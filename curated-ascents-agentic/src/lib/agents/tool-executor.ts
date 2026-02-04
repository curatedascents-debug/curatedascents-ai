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