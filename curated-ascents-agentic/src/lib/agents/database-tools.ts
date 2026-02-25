// src/lib/agents/database-tools.ts
// Database tools for AI - Updated for multi-table schema

import { db } from '@/db';
import {
  hotels,
  hotelRoomRates,
  transportation,
  guides,
  porters,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  permitsFees,
  miscellaneousServices,
  packages,
  destinations,
  suppliers,
  quotes,
  quoteItems,
  clients,
  bookings,
  paymentMilestones,
  supplierConfirmationRequests,
  tripBriefings
} from '@/db/schema';
import { eq, ilike, and, gte, lte, or, sql, desc } from 'drizzle-orm';
import { GATEWAY_AIRPORTS, type GatewayCountry } from '@/lib/constants/gateway-airports';
import { buildFlightSearchUrls } from '@/lib/utils/flight-url-builder';

// Tool 1: Search rates across all service types
export async function searchRates(params: {
  destination?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
  hotelName?: string;
  packageType?: string;
  difficulty?: string;
  maxDays?: number;
  region?: string;
}) {
  const results: any[] = [];
  const { destination, category, minPrice, maxPrice, starRating, hotelName, packageType, difficulty, maxDays, region } = params;
  
  try {
    // Search hotels if category matches or no category specified
    if (!category || category.toLowerCase().includes('hotel')) {
      const hotelResults = await db
        .select({
          id: hotelRoomRates.id,
          hotelId: hotelRoomRates.hotelId,
          hotelName: hotels.name,
          destination: destinations.city,
          country: destinations.country,
          roomType: hotelRoomRates.roomType,
          mealPlan: hotelRoomRates.mealPlan,
          sellDouble: hotelRoomRates.sellDouble,
          sellSingle: hotelRoomRates.sellSingle,
          currency: hotelRoomRates.currency,
          inclusions: hotelRoomRates.inclusions,
          starRating: hotels.starRating,
        })
        .from(hotelRoomRates)
        .leftJoin(hotels, eq(hotelRoomRates.hotelId, hotels.id))
        .leftJoin(destinations, eq(hotels.destinationId, destinations.id))
        .where(
          and(
            eq(hotelRoomRates.isActive, true),
            destination ? or(
              ilike(destinations.city, `%${destination}%`),
              ilike(destinations.country, `%${destination}%`),
              ilike(destinations.region, `%${destination}%`)
            ) : undefined,
            starRating ? eq(hotels.starRating, starRating) : undefined,
            hotelName ? ilike(hotels.name, `%${hotelName}%`) : undefined
          )
        )
        .limit(10);
      
      // Only return descriptive fields — no pricing sent to AI
      results.push(...hotelResults.map(r => ({
        id: r.id,
        serviceType: 'hotel',
        name: `${r.hotelName} - ${r.roomType} (${r.mealPlan})`,
        hotelName: r.hotelName,
        destination: r.destination,
        country: r.country,
        roomType: r.roomType,
        mealPlan: r.mealPlan,
        starRating: r.starRating,
        currency: r.currency,
        inclusions: r.inclusions,
      })));
    }

    // Search transportation
    if (!category || category.toLowerCase().includes('transport') || category.toLowerCase().includes('vehicle')) {
      const transportResults = await db
        .select()
        .from(transportation)
        .where(
          and(
            eq(transportation.isActive, true),
            destination ? or(
              ilike(transportation.routeFrom, `%${destination}%`),
              ilike(transportation.routeTo, `%${destination}%`),
              ilike(transportation.routeDescription, `%${destination}%`)
            ) : undefined
          )
        )
        .limit(20);

      results.push(...transportResults.map(r => ({
        id: r.id,
        serviceType: 'transportation',
        name: `${r.vehicleName || r.vehicleType}: ${r.routeFrom} → ${r.routeTo}`,
        vehicleType: r.vehicleType,
        vehicleName: r.vehicleName,
        capacity: r.capacity,
        routeFrom: r.routeFrom,
        routeTo: r.routeTo,
        routeDescription: r.routeDescription,
        distanceKm: r.distanceKm,
        durationHours: r.durationHours,
        destination: `${r.routeFrom} → ${r.routeTo}`,
        notes: r.notes,
        inclusions: r.inclusions,
        exclusions: r.exclusions,
      })));
    }

    // Search guides
    if (!category || category.toLowerCase().includes('guide')) {
      const guideResults = await db
        .select()
        .from(guides)
        .where(
          and(
            eq(guides.isActive, true),
            destination ? ilike(guides.destination, `%${destination}%`) : undefined
          )
        )
        .limit(10);

      results.push(...guideResults.map(r => ({
        id: r.id,
        serviceType: 'guide',
        name: `${r.guideType} Guide - ${r.destination || 'All Areas'}`,
        guideType: r.guideType,
        destination: r.destination,
        languages: r.languages,
        specializations: r.specializations,
        experienceYears: r.experienceYears,
        maxGroupSize: r.maxGroupSize,
        inclusions: r.inclusions,
        exclusions: r.exclusions,
      })));
    }

    // Search flights
    if (!category || category.toLowerCase().includes('flight')) {
      const flightResults = await db
        .select()
        .from(flightsDomestic)
        .where(
          and(
            eq(flightsDomestic.isActive, true),
            destination ? or(
              ilike(flightsDomestic.departureCity, `%${destination}%`),
              ilike(flightsDomestic.arrivalCity, `%${destination}%`),
              ilike(flightsDomestic.flightSector, `%${destination}%`)
            ) : undefined
          )
        )
        .limit(10);

      // Add forward sector results
      for (const r of flightResults) {
        results.push({
          id: r.id,
          serviceType: 'flight',
          name: `${r.airlineName}: ${r.flightSector}`,
          airlineName: r.airlineName,
          flightSector: r.flightSector,
          departureCity: r.departureCity,
          arrivalCity: r.arrivalCity,
          flightDuration: r.flightDuration,
          baggageAllowanceKg: r.baggageAllowanceKg,
          aircraftType: r.aircraftType,
          fareClass: r.fareClass,
          destination: r.flightSector,
          inclusions: r.inclusions,
          exclusions: r.exclusions,
          returnSectorNote: `Same rate applies for the return sector (${r.arrivalCity}→${r.departureCity}). Use the same serviceId (${r.id}) for the return flight.`,
        });
      }
    }

    // Search helicopter sharing
    if (!category || category.toLowerCase().includes('helicopter') || category.toLowerCase().includes('heli')) {
      const heliSharingResults = await db
        .select()
        .from(helicopterSharing)
        .where(
          and(
            eq(helicopterSharing.isActive, true),
            destination ? or(
              ilike(helicopterSharing.routeName, `%${destination}%`),
              ilike(helicopterSharing.routeFrom, `%${destination}%`),
              ilike(helicopterSharing.routeTo, `%${destination}%`)
            ) : undefined
          )
        )
        .limit(10);

      results.push(...heliSharingResults.map(r => ({
        id: r.id,
        serviceType: 'helicopter_sharing',
        name: `Heli Sharing: ${r.routeName}`,
        routeName: r.routeName,
        routeFrom: r.routeFrom,
        routeTo: r.routeTo,
        flightDuration: r.flightDuration,
        helicopterType: r.helicopterType,
        seatsAvailable: r.seatsAvailable,
        minPassengers: r.minPassengers,
        destination: r.routeName,
        inclusions: r.inclusions,
        exclusions: r.exclusions,
      })));
    }

    // Search helicopter charter
    if (!category || category.toLowerCase().includes('helicopter') || category.toLowerCase().includes('charter')) {
      const heliCharterResults = await db
        .select()
        .from(helicopterCharter)
        .where(
          and(
            eq(helicopterCharter.isActive, true),
            destination ? or(
              ilike(helicopterCharter.routeName, `%${destination}%`),
              ilike(helicopterCharter.routeFrom, `%${destination}%`),
              ilike(helicopterCharter.routeTo, `%${destination}%`)
            ) : undefined
          )
        )
        .limit(10);

      results.push(...heliCharterResults.map(r => ({
        id: r.id,
        serviceType: 'helicopter_charter',
        name: `Heli Charter: ${r.routeName}`,
        routeName: r.routeName,
        routeFrom: r.routeFrom,
        routeTo: r.routeTo,
        flightDuration: r.flightDuration,
        helicopterType: r.helicopterType,
        maxPassengers: r.maxPassengers,
        maxPayloadKg: r.maxPayloadKg,
        destination: r.routeName,
        inclusions: r.inclusions,
        exclusions: r.exclusions,
      })));
    }

    // Search permits
    if (!category || category.toLowerCase().includes('permit')) {
      const permitResults = await db
        .select()
        .from(permitsFees)
        .where(
          and(
            eq(permitsFees.isActive, true),
            destination ? or(
              ilike(permitsFees.country, `%${destination}%`),
              ilike(permitsFees.region, `%${destination}%`)
            ) : undefined
          )
        )
        .limit(10);

      results.push(...permitResults.map(r => ({
        id: r.id,
        serviceType: 'permit',
        name: r.name,
        type: r.type,
        country: r.country,
        region: r.region,
        applicableTo: r.applicableTo,
        processingTime: r.processingTime,
        requiredDocuments: r.requiredDocuments,
        description: r.description,
        destination: r.region || r.country,
      })));
    }

    // Search packages
    if (!category || category.toLowerCase().includes('package') || category.toLowerCase().includes('trek') || category.toLowerCase().includes('tour')) {
      const packageResults = await db
        .select()
        .from(packages)
        .where(
          and(
            eq(packages.isActive, true),
            destination ? or(
              ilike(packages.country, `%${destination}%`),
              ilike(packages.region, `%${destination}%`),
              ilike(packages.name, `%${destination}%`)
            ) : undefined,
            packageType ? eq(packages.packageType, packageType) : undefined,
            difficulty ? ilike(packages.difficulty, `%${difficulty}%`) : undefined,
            maxDays ? lte(packages.durationDays, maxDays) : undefined,
            region ? ilike(packages.region, `%${region}%`) : undefined
          )
        )
        .limit(10);

      results.push(...packageResults.map(r => ({
        id: r.id,
        serviceType: 'package',
        name: r.name,
        packageType: r.packageType,
        country: r.country,
        region: r.region,
        durationDays: r.durationDays,
        durationNights: r.durationNights,
        difficulty: r.difficulty,
        maxAltitude: r.maxAltitude,
        groupSizeMin: r.groupSizeMin,
        groupSizeMax: r.groupSizeMax,
        itinerarySummary: r.itinerarySummary,
        itineraryDetailed: r.itineraryDetailed,
        isFixedDeparture: r.isFixedDeparture,
        departureDates: r.departureDates,
        inclusions: r.inclusions,
        exclusions: r.exclusions,
        destination: r.region || r.country,
        pricingNote: `Use calculate_quote with serviceType 'package' and serviceId ${r.id} to get pricing`,
      })));
    }

    // Search miscellaneous services (dining, activities, etc.)
    if (!category || category.toLowerCase().includes('miscellaneous') || category.toLowerCase().includes('dining') || category.toLowerCase().includes('meal') || category.toLowerCase().includes('lunch') || category.toLowerCase().includes('dinner')) {
      const miscResults = await db
        .select()
        .from(miscellaneousServices)
        .where(
          and(
            eq(miscellaneousServices.isActive, true),
            destination ? or(
              ilike(miscellaneousServices.name, `%${destination}%`),
              ilike(miscellaneousServices.category, `%${destination}%`),
              ilike(miscellaneousServices.destination, `%${destination}%`)
            ) : undefined
          )
        )
        .limit(10);

      results.push(...miscResults.map(r => ({
        id: r.id,
        serviceType: 'miscellaneous',
        name: r.name,
        category: r.category,
        description: r.description,
        destination: r.destination,
        duration: r.duration,
        priceType: r.priceType,
        inclusions: r.inclusions,
        exclusions: r.exclusions,
      })));
    }

    return results.slice(0, 15); // Limit total results
  } catch (error) {
    console.error('Error searching rates:', error);
    return [];
  }
}

// Batch search: search multiple service types in one call to reduce tool iterations
export async function searchMultipleServices(params: {
  destination: string;
  serviceTypes: string[];
  starRating?: number;
  hotelName?: string;
}) {
  const results: Record<string, any[]> = {};

  for (const serviceType of params.serviceTypes) {
    const found = await searchRates({
      destination: params.destination,
      category: serviceType,
      starRating: params.starRating,
      hotelName: params.hotelName,
    });
    results[serviceType] = found;
  }

  return results;
}

// Tool 2: Get specific rate details by ID and type
export async function getRateDetails(params: { rateId: number; serviceType?: string }) {
  const { rateId, serviceType } = params;
  
  try {
    // If serviceType is provided, query that specific table
    if (serviceType) {
      switch (serviceType) {
        case 'hotel':
          const hotelRate = await db
            .select()
            .from(hotelRoomRates)
            .where(eq(hotelRoomRates.id, rateId))
            .limit(1);
          return hotelRate[0] || null;
        
        case 'transportation':
          const transport = await db
            .select()
            .from(transportation)
            .where(eq(transportation.id, rateId))
            .limit(1);
          return transport[0] || null;
        
        case 'guide':
          const guide = await db
            .select()
            .from(guides)
            .where(eq(guides.id, rateId))
            .limit(1);
          return guide[0] || null;
        
        case 'flight':
          const flight = await db
            .select()
            .from(flightsDomestic)
            .where(eq(flightsDomestic.id, rateId))
            .limit(1);
          return flight[0] || null;
        
        case 'porter':
          const porter = await db
            .select()
            .from(porters)
            .where(eq(porters.id, rateId))
            .limit(1);
          return porter[0] || null;

        case 'helicopter_sharing':
          const heliShare = await db
            .select()
            .from(helicopterSharing)
            .where(eq(helicopterSharing.id, rateId))
            .limit(1);
          return heliShare[0] || null;

        case 'helicopter_charter':
          const heliCharter = await db
            .select()
            .from(helicopterCharter)
            .where(eq(helicopterCharter.id, rateId))
            .limit(1);
          return heliCharter[0] || null;

        case 'permit':
          const permit = await db
            .select()
            .from(permitsFees)
            .where(eq(permitsFees.id, rateId))
            .limit(1);
          return permit[0] || null;

        case 'package':
          const pkg = await db
            .select()
            .from(packages)
            .where(eq(packages.id, rateId))
            .limit(1);
          return pkg[0] || null;

        case 'miscellaneous':
          const misc = await db
            .select()
            .from(miscellaneousServices)
            .where(eq(miscellaneousServices.id, rateId))
            .limit(1);
          return misc[0] || null;

        default:
          return null;
      }
    }
    
    // If no serviceType, try each table (less efficient)
    return null;
  } catch (error) {
    console.error('Error getting rate details:', error);
    return null;
  }
}

// Tool 3: Calculate quote for multiple services
export async function calculateQuote(params: {
  services: Array<{
    serviceType: string;
    serviceId: number;
    quantity?: number;
    nights?: number;
  }>;
  numberOfPax: number;
  numberOfRooms?: number;
  occupancyType?: string;
}) {
  const { services, numberOfPax, numberOfRooms, occupancyType = 'double' } = params;

  try {
    const lineItems: any[] = [];
    let grandTotal = 0;

    for (const svc of services) {
      const detail = await getRateDetails({ rateId: svc.serviceId, serviceType: svc.serviceType });
      if (!detail) {
        lineItems.push({
          serviceType: svc.serviceType,
          serviceId: svc.serviceId,
          error: 'Rate not found',
        });
        continue;
      }

      let unitPrice = 0;
      let priceLabel = '';
      const qty = svc.quantity || 1;
      const nights = svc.nights || 1;

      // Calculate subtotals internally but only expose service descriptions to the AI
      switch (svc.serviceType) {
        case 'hotel': {
          unitPrice = occupancyType === 'single'
            ? parseFloat((detail as any).sellSingle || '0')
            : parseFloat((detail as any).sellDouble || '0');
          const rooms = numberOfRooms || Math.ceil(numberOfPax / (occupancyType === 'single' ? 1 : 2));
          const subtotal = unitPrice * rooms * nights;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: (detail as any).roomType || 'Hotel Room',
            rooms,
            nights,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        case 'guide':
        case 'porter': {
          unitPrice = parseFloat((detail as any).sellPerDay || '0');
          const days = svc.nights || 1;
          const subtotal = unitPrice * qty * days;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: (detail as any).guideType || (detail as any).region || svc.serviceType,
            quantity: qty,
            days,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        case 'transportation': {
          unitPrice = parseFloat((detail as any).sellPrice || '0');
          const subtotal = unitPrice * qty;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: `${(detail as any).vehicleName || (detail as any).vehicleType}: ${(detail as any).routeFrom} → ${(detail as any).routeTo}`,
            quantity: qty,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        case 'flight': {
          unitPrice = parseFloat((detail as any).sellPrice || '0');
          const subtotal = unitPrice * numberOfPax;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: `${(detail as any).airlineName}: ${(detail as any).flightSector}`,
            pax: numberOfPax,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        case 'helicopter_sharing': {
          unitPrice = parseFloat((detail as any).sellPerSeat || '0');
          const subtotal = unitPrice * numberOfPax;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: (detail as any).routeName,
            pax: numberOfPax,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        case 'helicopter_charter': {
          unitPrice = parseFloat((detail as any).sellPerCharter || '0');
          const subtotal = unitPrice * qty;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: (detail as any).routeName,
            quantity: qty,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        case 'permit': {
          unitPrice = parseFloat((detail as any).sellPrice || '0');
          const subtotal = unitPrice * numberOfPax;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: (detail as any).name,
            pax: numberOfPax,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        case 'package': {
          unitPrice = parseFloat((detail as any).sellPrice || '0');
          const subtotal = unitPrice * numberOfPax;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: (detail as any).name,
            pax: numberOfPax,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
          break;
        }
        default: {
          unitPrice = parseFloat((detail as any).sellPrice || '0');
          const subtotal = unitPrice * qty;
          grandTotal += subtotal;
          lineItems.push({
            serviceType: svc.serviceType,
            serviceId: svc.serviceId,
            name: (detail as any).name || svc.serviceType,
            quantity: qty,
            unitSellPrice: unitPrice,
            itemTotal: subtotal,
          });
        }
      }
    }

    // Return services with per-item pricing (serviceId, unitSellPrice, itemTotal) for save_quote
    return {
      numberOfPax,
      occupancyType,
      servicesIncluded: lineItems,
      grandTotal,
      perPersonTotal: numberOfPax > 0 ? Math.round((grandTotal / numberOfPax) * 100) / 100 : 0,
      currency: 'USD',
      note: 'This is an estimated quote. Final pricing subject to availability confirmation.',
    };
  } catch (error) {
    console.error('Error calculating quote:', error);
    return {
      error: 'Quote calculation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Tool 4: Get available destinations
export async function getDestinations(params?: { country?: string }) {
  try {
    const results = await db
      .select({
        id: destinations.id,
        country: destinations.country,
        region: destinations.region,
        city: destinations.city,
        description: destinations.description,
      })
      .from(destinations)
      .where(
        params?.country 
          ? ilike(destinations.country, `%${params.country}%`)
          : eq(destinations.isActive, true)
      );

    return results;
  } catch (error) {
    console.error('Error getting destinations:', error);
    // Return default destinations if table is empty or error
    return [
      { country: 'Nepal', region: 'Kathmandu Valley', city: 'Kathmandu' },
      { country: 'Nepal', region: 'Annapurna', city: 'Pokhara' },
      { country: 'Nepal', region: 'Everest', city: 'Lukla' },
      { country: 'Bhutan', region: 'Western', city: 'Paro' },
      { country: 'Bhutan', region: 'Western', city: 'Thimphu' },
      { country: 'Tibet', region: 'Central', city: 'Lhasa' },
      { country: 'India', region: 'Sikkim', city: 'Gangtok' },
    ];
  }
}

// Tool 5: Get categories/service types available
export async function getCategories(destination?: string) {
  // Return all available service categories
  return [
    'hotel',
    'transportation', 
    'guide',
    'porter',
    'flight',
    'helicopter_sharing',
    'helicopter_charter',
    'permit',
    'package',
    'miscellaneous'
  ];
}

// Helper: Look up cost price from the rate table for a given service
async function getCostPrice(serviceType: string, serviceId: number, occupancyType?: string): Promise<number> {
  try {
    const detail = await getRateDetails({ rateId: serviceId, serviceType });
    if (!detail) return 0;

    switch (serviceType) {
      case 'hotel':
        return parseFloat(
          (occupancyType === 'single'
            ? (detail as any).costSingle
            : (detail as any).costDouble) || '0'
        );
      case 'transportation':
      case 'flight':
      case 'permit':
      case 'package':
        return parseFloat((detail as any).costPrice || '0');
      case 'guide':
      case 'porter':
        return parseFloat((detail as any).costPerDay || '0');
      case 'helicopter_sharing':
        return parseFloat((detail as any).costPerSeat || '0');
      case 'helicopter_charter':
        return parseFloat((detail as any).costPerCharter || '0');
      default:
        return parseFloat((detail as any).costPrice || '0');
    }
  } catch {
    return 0;
  }
}

// Helper: Look up sell price from the rate table for a given service
async function getSellPrice(serviceType: string, serviceId: number, occupancyType?: string): Promise<number> {
  try {
    const detail = await getRateDetails({ rateId: serviceId, serviceType });
    if (!detail) return 0;

    switch (serviceType) {
      case 'hotel':
        return parseFloat(
          (occupancyType === 'single'
            ? (detail as any).sellSingle
            : (detail as any).sellDouble) || '0'
        );
      case 'transportation':
      case 'flight':
      case 'permit':
      case 'package':
        return parseFloat((detail as any).sellPrice || '0');
      case 'guide':
      case 'porter':
        return parseFloat((detail as any).sellPerDay || '0');
      case 'helicopter_sharing':
        return parseFloat((detail as any).sellPerSeat || '0');
      case 'helicopter_charter':
        return parseFloat((detail as any).sellPerCharter || '0');
      default:
        return parseFloat((detail as any).sellPrice || '0');
    }
  } catch {
    return 0;
  }
}

// Tool 6: Save a quote to the database
export async function saveQuote(params: {
  clientEmail?: string;
  clientName?: string;
  quoteName?: string;
  destination?: string;
  numberOfPax?: number;
  occupancyType?: string;
  items: Array<{
    serviceType: string;
    serviceId?: number;
    serviceName: string;
    description?: string;
    quantity?: number;
    nights?: number; // Number of nights (hotels) or days (guides/porters)
    sellPrice?: number; // Deprecated — prices are always looked up from DB by serviceId
  }>;
}) {
  try {
    // Reject quotes where items are missing serviceId (AI must use DB records)
    const itemsWithoutServiceId = params.items.filter(i => !i.serviceId);
    if (itemsWithoutServiceId.length > 0) {
      console.warn('save_quote called with items missing serviceId:', itemsWithoutServiceId.map(i => i.serviceName));
      return {
        error: 'Cannot save quote: all items must have a serviceId from the database.',
        message: `The following items are missing serviceId: ${itemsWithoutServiceId.map(i => i.serviceName).join(', ')}. Please use search_packages or search_rates first to find the correct database records, then include their IDs when saving the quote.`,
        missingServiceIds: itemsWithoutServiceId.map(i => ({ serviceType: i.serviceType, serviceName: i.serviceName })),
      };
    }

    // Find or create client
    let clientId: number | null = null;
    if (params.clientEmail) {
      const existing = await db
        .select({ id: clients.id })
        .from(clients)
        .where(eq(clients.email, params.clientEmail))
        .limit(1);

      if (existing.length > 0) {
        clientId = existing[0].id;
      } else {
        const newClient = await db
          .insert(clients)
          .values({
            email: params.clientEmail,
            name: params.clientName || null,
            source: 'chat',
          })
          .returning();
        clientId = newClient[0].id;
      }
    }

    // Generate quote number
    const year = new Date().getFullYear();
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quotes);
    const nextNum = (Number(countResult[0]?.count) || 0) + 1;
    const quoteNumber = `QT-${year}-${String(nextNum).padStart(4, '0')}`;

    // Verify every serviceId actually exists in the database before saving
    const invalidItems: Array<{ serviceType: string; serviceName: string; serviceId: number }> = [];
    for (const item of params.items) {
      if (item.serviceId) {
        const detail = await getRateDetails({ rateId: item.serviceId, serviceType: item.serviceType });
        if (!detail) {
          invalidItems.push({ serviceType: item.serviceType, serviceName: item.serviceName, serviceId: item.serviceId });
        }
      }
    }
    if (invalidItems.length > 0) {
      console.warn('save_quote called with non-existent serviceIds:', invalidItems);
      return {
        error: 'Cannot save quote: some service IDs do not exist in the database.',
        message: `The following items have invalid serviceIds: ${invalidItems.map(i => `${i.serviceName} (${i.serviceType} #${i.serviceId})`).join(', ')}. Please use search_packages or search_rates to find valid database records first.`,
        invalidItems,
      };
    }

    // Look up cost and sell prices from DB for every item with a serviceId
    // ALWAYS use DB prices — ignore AI-provided sellPrice to ensure margin integrity
    // Quantity calculation mirrors calculateQuote logic per service type
    const resolvedItems: Array<{ unitCost: number; unitSell: number; unitMargin: number; effectiveQty: number; correctedQty: number; correctedNights: number }> = [];
    let totalSell = 0;
    let totalCost = 0;

    for (const item of params.items) {
      let qty = item.quantity || 1;
      let nights = item.nights || 1;

      // ── Auto-correct AI qty/nights confusion ─────────────────────────────
      // The AI frequently stuffs nights into qty (e.g., qty=3, nights=3 for a 3-night hotel)
      // or sets qty=nights and nights=1. Detect and fix these patterns.
      if (item.serviceType === 'hotel') {
        // Hotel qty should be rooms (usually 1 for a couple). If qty > 1 and qty == nights,
        // the AI likely put nights into both fields. Fix: rooms=1, keep nights.
        if (qty > 1 && qty === nights) {
          const rooms = params.numberOfPax ? Math.ceil(params.numberOfPax / (params.occupancyType === 'single' ? 1 : 2)) : 1;
          qty = rooms;
        }
        // If qty looks like nights (> 1) and nights is 1 (default), AI forgot nights.
        // Swap: nights = qty, qty = rooms.
        if (qty > 1 && nights === 1) {
          nights = qty;
          qty = params.numberOfPax ? Math.ceil(params.numberOfPax / (params.occupancyType === 'single' ? 1 : 2)) : 1;
        }
      }
      if (item.serviceType === 'guide' || item.serviceType === 'porter') {
        // Guide qty should be number of guides (usually 1). If qty > 1 and qty == nights,
        // the AI put days into both. Fix: guides=1, keep nights (days).
        if (qty > 1 && qty === nights) {
          qty = 1;
        }
        // If qty looks like days (> 1) and nights is 1, AI forgot nights. Swap.
        if (qty > 1 && nights === 1) {
          nights = qty;
          qty = 1;
        }
      }

      // ALWAYS use DB prices — ignore any AI-provided sellPrice
      const unitCost = item.serviceId ? await getCostPrice(item.serviceType, item.serviceId, params.occupancyType) : 0;
      const unitSell = item.serviceId ? await getSellPrice(item.serviceType, item.serviceId, params.occupancyType) : 0;
      const unitMargin = (unitCost > 0 && unitSell > 0) ? unitSell - unitCost : 0;

      // Calculate effective quantity based on service type (mirrors calculateQuote logic)
      let effectiveQty: number;
      switch (item.serviceType) {
        case 'hotel': {
          // Hotel: price is per room per night → qty (rooms) × nights
          const rooms = qty || (params.numberOfPax ? Math.ceil(params.numberOfPax / (params.occupancyType === 'single' ? 1 : 2)) : 1);
          effectiveQty = rooms * nights;
          break;
        }
        case 'guide':
        case 'porter':
          // Guide/porter: price is per day → qty (number of guides) × nights (days)
          effectiveQty = qty * nights;
          break;
        case 'flight':
        case 'helicopter_sharing':
        case 'permit':
        case 'package':
          // Per-person pricing → use qty (should be numberOfPax)
          effectiveQty = qty;
          break;
        case 'miscellaneous':
          // Miscellaneous (meals, activities): qty (pax) × nights (days) for per-person-per-day items
          effectiveQty = qty * nights;
          break;
        default:
          // Transportation, helicopter charter → flat per-unit
          effectiveQty = qty;
      }

      totalSell += unitSell * effectiveQty;
      totalCost += unitCost * effectiveQty;
      resolvedItems.push({ unitCost, unitSell, unitMargin, effectiveQty, correctedQty: qty, correctedNights: nights });
    }

    const totalMargin = totalSell - totalCost;
    const marginPercent = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0;
    const perPersonPrice = params.numberOfPax && params.numberOfPax > 0
      ? totalSell / params.numberOfPax
      : 0;

    const quoteResult = await db
      .insert(quotes)
      .values({
        quoteNumber,
        clientId,
        quoteName: params.quoteName || null,
        destination: params.destination || null,
        numberOfPax: params.numberOfPax || null,
        totalSellPrice: totalSell.toFixed(2),
        totalCostPrice: totalCost > 0 ? totalCost.toFixed(2) : null,
        totalMargin: totalCost > 0 ? totalMargin.toFixed(2) : null,
        marginPercent: totalCost > 0 ? marginPercent.toFixed(2) : null,
        perPersonPrice: perPersonPrice > 0 ? perPersonPrice.toFixed(2) : null,
        currency: 'USD',
        status: 'draft',
      })
      .returning();

    const quote = quoteResult[0];

    // Insert line items with cost data
    // quantity stores effectiveQty (rooms×nights for hotels, guides×days for guides, etc.)
    // costPrice/sellPrice are per-unit rates; quantity × sellPrice = line total
    if (params.items.length > 0) {
      await db.insert(quoteItems).values(
        params.items.map((item, idx) => ({
          quoteId: quote.id,
          serviceType: item.serviceType || 'miscellaneous',
          serviceId: item.serviceId || null,
          serviceName: item.serviceName || null,
          description: item.description || null,
          quantity: resolvedItems[idx].effectiveQty,
          nights: resolvedItems[idx].correctedNights || null,
          days: (item.serviceType === 'guide' || item.serviceType === 'porter') ? (resolvedItems[idx].correctedNights || null) : null,
          costPrice: resolvedItems[idx].unitCost > 0 ? resolvedItems[idx].unitCost.toFixed(2) : null,
          sellPrice: resolvedItems[idx].unitSell > 0 ? resolvedItems[idx].unitSell.toFixed(2) : null,
          margin: resolvedItems[idx].unitCost > 0 ? resolvedItems[idx].unitMargin.toFixed(2) : null,
          currency: 'USD',
        }))
      );
    }

    return {
      success: true,
      quoteNumber,
      quoteId: quote.id,
      totalSellPrice: totalSell,
      message: `Quote ${quoteNumber} saved successfully. The client can view this in the admin dashboard.`,
    };
  } catch (error) {
    console.error('Error saving quote:', error);
    return {
      error: 'Failed to save quote',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// BOOKING OPERATIONS TOOLS
// ============================================

// Tool 7: Get booking status (sanitized for client)
export async function getBookingStatus(params: { bookingReference: string }) {
  try {
    const { bookingReference } = params;

    const result = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        operationsStatus: bookings.operationsStatus,
        // Quote info
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        numberOfPax: quotes.numberOfPax,
        // Client info (limited)
        clientName: clients.name,
        // Payment summary (sell prices only, no costs)
        totalAmount: bookings.totalAmount,
        paidAmount: bookings.paidAmount,
        balanceAmount: bookings.balanceAmount,
        currency: bookings.currency,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .where(eq(bookings.bookingReference, bookingReference))
      .limit(1);

    if (result.length === 0) {
      return { error: 'Booking not found', bookingReference };
    }

    const booking = result[0];

    // Return sanitized data (no cost prices, no internal notes)
    return {
      bookingReference: booking.bookingReference,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      tripName: booking.quoteName,
      destination: booking.destination,
      startDate: booking.startDate,
      endDate: booking.endDate,
      numberOfTravelers: booking.numberOfPax,
      clientName: booking.clientName,
      // Payment summary (client-safe)
      totalAmount: booking.totalAmount,
      amountPaid: booking.paidAmount,
      balanceDue: booking.balanceAmount,
      currency: booking.currency,
      // Status descriptions
      operationsStatus: getOperationsStatusDescription(booking.operationsStatus),
      bookingDate: booking.createdAt,
    };
  } catch (error) {
    console.error('Error getting booking status:', error);
    return { error: 'Failed to get booking status' };
  }
}

function getOperationsStatusDescription(status: string | null): string {
  switch (status) {
    case 'pending': return 'We are processing your booking';
    case 'suppliers_contacted': return 'We have contacted all service providers';
    case 'all_confirmed': return 'All services are confirmed';
    case 'ready': return 'Your trip is fully prepared';
    default: return 'Processing';
  }
}

// Tool 8: Get payment schedule (milestones)
export async function getPaymentSchedule(params: { bookingReference: string }) {
  try {
    const { bookingReference } = params;

    // Find booking
    const bookingResult = await db
      .select({ id: bookings.id, totalAmount: bookings.totalAmount, currency: bookings.currency })
      .from(bookings)
      .where(eq(bookings.bookingReference, bookingReference))
      .limit(1);

    if (bookingResult.length === 0) {
      return { error: 'Booking not found', bookingReference };
    }

    const booking = bookingResult[0];

    // Get milestones
    const milestones = await db
      .select({
        id: paymentMilestones.id,
        milestoneType: paymentMilestones.milestoneType,
        description: paymentMilestones.description,
        amount: paymentMilestones.amount,
        percentage: paymentMilestones.percentage,
        dueDate: paymentMilestones.dueDate,
        paidDate: paymentMilestones.paidDate,
        paidAmount: paymentMilestones.paidAmount,
        status: paymentMilestones.status,
      })
      .from(paymentMilestones)
      .where(eq(paymentMilestones.bookingId, booking.id))
      .orderBy(paymentMilestones.dueDate);

    return {
      bookingReference,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      paymentSchedule: milestones.map(m => ({
        type: m.milestoneType,
        description: m.description,
        amount: m.amount,
        percentage: m.percentage,
        dueDate: m.dueDate,
        status: m.status,
        isPaid: m.status === 'paid',
        paidDate: m.paidDate,
        paidAmount: m.paidAmount,
      })),
    };
  } catch (error) {
    console.error('Error getting payment schedule:', error);
    return { error: 'Failed to get payment schedule' };
  }
}

// Tool 9: Convert quote to booking
export async function convertQuoteToBooking(params: { quoteNumber: string; clientEmail?: string }) {
  try {
    const { quoteNumber, clientEmail } = params;

    // Find quote
    const quoteResult = await db
      .select()
      .from(quotes)
      .where(eq(quotes.quoteNumber, quoteNumber))
      .limit(1);

    if (quoteResult.length === 0) {
      return { error: 'Quote not found', quoteNumber };
    }

    const quote = quoteResult[0];

    // Check if quote can be converted
    if (quote.status === 'expired') {
      return { error: 'This quote has expired. Please request a new quote.' };
    }

    // Check if already converted
    const existingBooking = await db
      .select({ bookingReference: bookings.bookingReference })
      .from(bookings)
      .where(eq(bookings.quoteId, quote.id))
      .limit(1);

    if (existingBooking.length > 0) {
      return {
        message: 'This quote has already been converted to a booking.',
        bookingReference: existingBooking[0].bookingReference,
      };
    }

    // Mark quote as accepted
    await db
      .update(quotes)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(quotes.id, quote.id));

    // The actual booking creation should be done via the admin API
    // Return instructions for the client
    return {
      success: true,
      quoteNumber,
      quoteName: quote.quoteName,
      totalAmount: quote.totalSellPrice,
      message: `Your quote ${quoteNumber} has been marked as accepted. Our team will process your booking and send you a confirmation email shortly with your booking reference and payment details.`,
      nextSteps: [
        'You will receive a booking confirmation email within 24 hours',
        'The email will include your booking reference number',
        'Payment instructions will be provided with deposit and balance deadlines',
      ],
    };
  } catch (error) {
    console.error('Error converting quote to booking:', error);
    return { error: 'Failed to process booking request' };
  }
}

// Tool 10: Check supplier confirmations (sanitized)
export async function checkSupplierConfirmations(params: { bookingReference: string }) {
  try {
    const { bookingReference } = params;

    // Find booking
    const bookingResult = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.bookingReference, bookingReference))
      .limit(1);

    if (bookingResult.length === 0) {
      return { error: 'Booking not found', bookingReference };
    }

    const booking = bookingResult[0];

    // Get confirmations (sanitized - no supplier contact info)
    const confirmations = await db
      .select({
        serviceName: supplierConfirmationRequests.serviceName,
        serviceType: supplierConfirmationRequests.serviceType,
        status: supplierConfirmationRequests.status,
        confirmedAt: supplierConfirmationRequests.confirmedAt,
      })
      .from(supplierConfirmationRequests)
      .where(eq(supplierConfirmationRequests.bookingId, booking.id));

    const confirmed = confirmations.filter(c => c.status === 'confirmed').length;
    const total = confirmations.length;
    const allConfirmed = confirmed === total && total > 0;

    return {
      bookingReference,
      summary: allConfirmed
        ? 'All services are confirmed! Your trip is fully secured.'
        : `${confirmed} of ${total} services confirmed. We are working on the remaining confirmations.`,
      allConfirmed,
      services: confirmations.map(c => ({
        serviceName: c.serviceName,
        serviceType: c.serviceType,
        isConfirmed: c.status === 'confirmed',
        status: getConfirmationStatusDescription(c.status),
        confirmedDate: c.confirmedAt,
      })),
    };
  } catch (error) {
    console.error('Error checking supplier confirmations:', error);
    return { error: 'Failed to check confirmations' };
  }
}

function getConfirmationStatusDescription(status: string | null): string {
  switch (status) {
    case 'pending': return 'Awaiting confirmation';
    case 'sent': return 'Confirmation requested';
    case 'confirmed': return 'Confirmed';
    case 'declined': return 'Alternative being arranged';
    case 'cancelled': return 'Cancelled';
    default: return 'Processing';
  }
}

// Tool 11: Get trip briefing content (client-safe)
export async function getTripBriefing(params: { bookingReference: string }) {
  try {
    const { bookingReference } = params;

    // Find booking with related data
    const bookingResult = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        specialRequests: bookings.specialRequests,
        quoteId: bookings.quoteId,
        clientId: bookings.clientId,
      })
      .from(bookings)
      .where(eq(bookings.bookingReference, bookingReference))
      .limit(1);

    if (bookingResult.length === 0) {
      return { error: 'Booking not found', bookingReference };
    }

    const booking = bookingResult[0];

    // Get quote info
    let tripName: string | undefined;
    let destination: string | undefined;
    let numberOfPax: number | undefined;
    if (booking.quoteId) {
      const quoteResult = await db
        .select({
          quoteName: quotes.quoteName,
          destination: quotes.destination,
          numberOfPax: quotes.numberOfPax,
        })
        .from(quotes)
        .where(eq(quotes.id, booking.quoteId))
        .limit(1);

      if (quoteResult.length > 0) {
        tripName = quoteResult[0].quoteName || undefined;
        destination = quoteResult[0].destination || undefined;
        numberOfPax = quoteResult[0].numberOfPax || undefined;
      }
    }

    // Get services from quote items
    let services: Array<{ serviceName: string; serviceType: string }> = [];
    if (booking.quoteId) {
      const itemsResult = await db
        .select({
          serviceName: quoteItems.serviceName,
          serviceType: quoteItems.serviceType,
        })
        .from(quoteItems)
        .where(eq(quoteItems.quoteId, booking.quoteId));

      services = itemsResult.map(item => ({
        serviceName: item.serviceName || item.serviceType,
        serviceType: item.serviceType,
      }));
    }

    // Get confirmation status
    const confirmations = await db
      .select({
        serviceName: supplierConfirmationRequests.serviceName,
        status: supplierConfirmationRequests.status,
      })
      .from(supplierConfirmationRequests)
      .where(eq(supplierConfirmationRequests.bookingId, booking.id));

    const allConfirmed = confirmations.every(c => c.status === 'confirmed');

    // Check for existing briefings
    const existingBriefings = await db
      .select({
        briefingType: tripBriefings.briefingType,
        sentAt: tripBriefings.sentAt,
      })
      .from(tripBriefings)
      .where(eq(tripBriefings.bookingId, booking.id))
      .orderBy(desc(tripBriefings.createdAt));

    return {
      bookingReference,
      tripName,
      destination,
      startDate: booking.startDate,
      endDate: booking.endDate,
      numberOfTravelers: numberOfPax,
      services: services.map(s => s.serviceName),
      allServicesConfirmed: allConfirmed,
      specialRequests: booking.specialRequests,
      briefingsSent: existingBriefings.map(b => ({
        type: b.briefingType === '7_day' ? '7-day briefing' : '24-hour briefing',
        sentAt: b.sentAt,
      })),
      preDepartureChecklist: [
        'Verify passport validity (6+ months from travel date)',
        'Check visa requirements for ' + (destination || 'your destination'),
        'Review travel insurance coverage',
        'Pack appropriate clothing for climate and activities',
        'Inform bank of travel plans',
        'Download offline maps and essential apps',
        'Prepare copies of important documents',
      ],
    };
  } catch (error) {
    console.error('Error getting trip briefing:', error);
    return { error: 'Failed to get trip briefing' };
  }
}

// ============================================
// MEDIA LIBRARY TOOL
// ============================================

// Tool 12: Search photos from the media library
export async function searchPhotos(params: {
  country?: string;
  destination?: string;
  category?: string;
  tags?: string[];
  season?: string;
  serviceType?: string;
  featured?: boolean;
  limit?: number;
}) {
  try {
    const { searchPhotosForAI } = await import('@/lib/media/media-service');
    const results = await searchPhotosForAI(params);

    if (results.length === 0) {
      return {
        photos: [],
        message: 'No photos found matching the criteria. Try broader filters or different tags.',
      };
    }

    return {
      photos: results,
      count: results.length,
    };
  } catch (error) {
    console.error('Error searching photos:', error);
    return { error: 'Photo search failed', photos: [] };
  }
}

// Tool: Suggest flight search links
export async function suggestFlightSearch(params: {
  origin_code?: string;
  destination_country: string;
  departure_date?: string;
  return_date?: string;
}) {
  const country = params.destination_country as GatewayCountry;
  const countryData = GATEWAY_AIRPORTS[country];
  if (!countryData) {
    return { error: `Unknown destination country: ${params.destination_country}` };
  }

  const airport = countryData.airports[0];
  const origin = params.origin_code?.toUpperCase() || "";
  const urls = buildFlightSearchUrls(origin, airport.code, params.departure_date, params.return_date);

  return {
    gatewayAirport: {
      code: airport.code,
      name: airport.name,
      city: airport.city,
    },
    googleFlightsUrl: urls.google,
    skyscannerUrl: urls.skyscanner,
    typicalAirlines: airport.typicalAirlines,
    notes: airport.notes,
    reminder: "International flights are not included in CuratedAscents packages. These links open third-party search engines for the traveler to compare and book independently.",
  };
}
