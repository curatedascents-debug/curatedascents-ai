import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  suppliers,
  destinations,
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
} from '@/db/schema';
import {
  sampleSuppliers,
  sampleDestinations,
  sampleHotels,
  sampleHotelRates,
  sampleTransportation,
  sampleGuides,
  samplePorters,
  sampleFlights,
  sampleHelicopterSharing,
  sampleHelicopterCharter,
  samplePermitsFees,
  sampleMiscellaneous,
  samplePackages,
} from '@/db/seed-data';

export async function GET() {
  try {
    console.log('Starting comprehensive database seed...');

    // 1. Seed Suppliers
    const insertedSuppliers = await db.insert(suppliers).values(
      sampleSuppliers.map(s => ({
        name: s.name,
        type: s.type,
        country: s.country,
        city: s.city,
      }))
    ).returning();
    console.log(`Inserted ${insertedSuppliers.length} suppliers`);

    // 2. Seed Destinations
    const insertedDestinations = await db.insert(destinations).values(
      sampleDestinations.map(d => ({
        country: d.country,
        region: d.region,
        city: d.city,
        altitude: d.altitude,
      }))
    ).returning();
    console.log(`Inserted ${insertedDestinations.length} destinations`);

    // Create lookup maps
    const destinationMap = new Map(
      insertedDestinations.map(d => [d.city, d.id])
    );
    const supplierMap = new Map(
      insertedSuppliers.map(s => [s.name, s.id])
    );

    // 3. Seed Hotels
    const insertedHotels = await db.insert(hotels).values(
      sampleHotels.map(h => ({
        name: h.name,
        supplierId: supplierMap.get("Dwarika's Group") || null,
        destinationId: destinationMap.get(h.destinationCity) || null,
        starRating: h.starRating,
        category: h.category,
        description: h.description,
        amenities: h.amenities,
      }))
    ).returning();
    console.log(`Inserted ${insertedHotels.length} hotels`);

    // Create hotel lookup
    const hotelMap = new Map(
      insertedHotels.map(h => [h.name, h.id])
    );

    // 4. Seed Hotel Room Rates
    const hotelRateValues = sampleHotelRates.map(r => ({
      hotelId: hotelMap.get(r.hotelName)!,
      roomType: r.roomType,
      mealPlan: r.mealPlan,
      costSingle: r.costSingle?.toString(),
      sellSingle: r.sellSingle?.toString(),
      costDouble: r.costDouble?.toString(),
      sellDouble: r.sellDouble?.toString(),
      costExtraBed: r.costExtraBed?.toString(),
      sellExtraBed: r.sellExtraBed?.toString(),
      inclusions: r.inclusions,
      currency: 'USD',
    }));
    
    const insertedRates = await db.insert(hotelRoomRates).values(hotelRateValues).returning();
    console.log(`Inserted ${insertedRates.length} hotel room rates`);

    // 5. Seed Transportation
    const insertedTransport = await db.insert(transportation).values(
      sampleTransportation.map(t => ({
        vehicleType: t.vehicleType,
        vehicleName: t.vehicleName,
        capacity: t.capacity,
        routeFrom: t.routeFrom,
        routeTo: t.routeTo,
        distanceKm: t.distanceKm,
        durationHours: t.durationHours?.toString(),
        costPrice: t.costPrice?.toString(),
        sellPrice: t.sellPrice?.toString(),
        inclusions: t.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedTransport.length} transportation options`);

    // 6. Seed Guides
    const insertedGuides = await db.insert(guides).values(
      sampleGuides.map(g => ({
        guideType: g.guideType,
        destination: g.destination,
        languages: g.languages,
        specializations: g.specializations,
        experienceYears: g.experienceYears,
        costPerDay: g.costPerDay?.toString(),
        sellPerDay: g.sellPerDay?.toString(),
        inclusions: g.inclusions,
        exclusions: g.exclusions,
        maxGroupSize: g.maxGroupSize,
      }))
    ).returning();
    console.log(`Inserted ${insertedGuides.length} guides`);

    // 7. Seed Porters
    const insertedPorters = await db.insert(porters).values(
      samplePorters.map(p => ({
        region: p.region,
        maxWeightKg: p.maxWeightKg,
        costPerDay: p.costPerDay?.toString(),
        sellPerDay: p.sellPerDay?.toString(),
        inclusions: p.inclusions,
        exclusions: p.exclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedPorters.length} porters`);

    // 8. Seed Domestic Flights
    const insertedFlights = await db.insert(flightsDomestic).values(
      sampleFlights.map(f => ({
        airlineName: f.airlineName,
        flightSector: f.flightSector,
        departureCity: f.departureCity,
        arrivalCity: f.arrivalCity,
        flightDuration: f.flightDuration,
        baggageAllowanceKg: f.baggageAllowanceKg,
        costPrice: f.costPrice?.toString(),
        sellPrice: f.sellPrice?.toString(),
        inclusions: f.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedFlights.length} domestic flights`);

    // 9. Seed Helicopter Sharing
    const insertedHeliSharing = await db.insert(helicopterSharing).values(
      sampleHelicopterSharing.map(h => ({
        routeName: h.routeName,
        routeFrom: h.routeFrom,
        routeTo: h.routeTo,
        flightDuration: h.flightDuration,
        helicopterType: h.helicopterType,
        seatsAvailable: h.seatsAvailable,
        minPassengers: h.minPassengers,
        costPerSeat: h.costPerSeat?.toString(),
        sellPerSeat: h.sellPerSeat?.toString(),
        inclusions: h.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedHeliSharing.length} helicopter sharing options`);

    // 10. Seed Helicopter Charter
    const insertedHeliCharter = await db.insert(helicopterCharter).values(
      sampleHelicopterCharter.map(h => ({
        routeName: h.routeName,
        routeFrom: h.routeFrom,
        routeTo: h.routeTo,
        flightDuration: h.flightDuration,
        helicopterType: h.helicopterType,
        maxPassengers: h.maxPassengers,
        costPerCharter: h.costPerCharter?.toString(),
        sellPerCharter: h.sellPerCharter?.toString(),
        inclusions: h.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedHeliCharter.length} helicopter charter options`);

    // 11. Seed Permits & Fees
    const insertedPermits = await db.insert(permitsFees).values(
      samplePermitsFees.map(p => ({
        name: p.name,
        type: p.type,
        country: p.country,
        region: p.region,
        applicableTo: p.applicableTo,
        costPrice: p.costPrice?.toString(),
        sellPrice: p.sellPrice?.toString(),
        description: p.description,
        processingTime: p.processingTime,
      }))
    ).returning();
    console.log(`Inserted ${insertedPermits.length} permits/fees`);

    // 12. Seed Miscellaneous Services
    const insertedMisc = await db.insert(miscellaneousServices).values(
      sampleMiscellaneous.map(m => ({
        name: m.name,
        category: m.category,
        destination: m.destination,
        description: m.description,
        duration: m.duration,
        minParticipants: m.minParticipants,
        costPrice: m.costPrice?.toString(),
        sellPrice: m.sellPrice?.toString(),
        priceType: m.priceType,
        inclusions: m.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedMisc.length} miscellaneous services`);

    // 13. Seed Packages
    const insertedPackages = await db.insert(packages).values(
      samplePackages.map(p => ({
        name: p.name,
        packageType: p.packageType,
        country: p.country,
        region: p.region,
        durationDays: p.durationDays,
        durationNights: p.durationNights,
        difficulty: p.difficulty,
        maxAltitude: p.maxAltitude,
        groupSizeMin: p.groupSizeMin,
        groupSizeMax: p.groupSizeMax,
        itinerarySummary: p.itinerarySummary,
        costPrice: p.costPrice?.toString(),
        sellPrice: p.sellPrice?.toString(),
        singleSupplement: p.singleSupplement?.toString(),
        inclusions: p.inclusions,
        exclusions: p.exclusions,
        isFixedDeparture: p.isFixedDeparture,
        departureDates: p.departureDates,
      }))
    ).returning();
    console.log(`Inserted ${insertedPackages.length} packages`);

    // Summary
    const summary = {
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        suppliers: insertedSuppliers.length,
        destinations: insertedDestinations.length,
        hotels: insertedHotels.length,
        hotelRoomRates: insertedRates.length,
        transportation: insertedTransport.length,
        guides: insertedGuides.length,
        porters: insertedPorters.length,
        domesticFlights: insertedFlights.length,
        helicopterSharing: insertedHeliSharing.length,
        helicopterCharter: insertedHeliCharter.length,
        permitsFees: insertedPermits.length,
        miscellaneousServices: insertedMisc.length,
        packages: insertedPackages.length,
      },
      total: insertedSuppliers.length + insertedDestinations.length + insertedHotels.length + 
             insertedRates.length + insertedTransport.length + insertedGuides.length + 
             insertedPorters.length + insertedFlights.length + insertedHeliSharing.length + 
             insertedHeliCharter.length + insertedPermits.length + insertedMisc.length + 
             insertedPackages.length,
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}