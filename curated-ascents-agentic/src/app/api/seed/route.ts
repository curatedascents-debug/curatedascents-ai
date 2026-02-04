import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
  suppliers, 
  destinations, 
  hotels, 
  hotelRoomRates,
  transportation,
  guides,
  flightsDomestic,
  packages 
} from "@/db/schema";

export async function GET() {
  try {
    // Check if we already have data
    const existingSuppliers = await db.select().from(suppliers).limit(1);
    
    if (existingSuppliers.length > 0) {
      return NextResponse.json({
        message: "Database already has data. Skipping seed.",
        status: "skipped"
      });
    }

    // Seed Destinations first
    const destResults = await db.insert(destinations).values([
      { country: 'Nepal', region: 'Kathmandu Valley', city: 'Kathmandu', description: 'Capital city and cultural hub' },
      { country: 'Nepal', region: 'Gandaki', city: 'Pokhara', description: 'Lake city, gateway to Annapurna' },
      { country: 'Nepal', region: 'Solukhumbu', city: 'Lukla', description: 'Gateway to Everest' },
      { country: 'Nepal', region: 'Solukhumbu', city: 'Namche Bazaar', description: 'Sherpa capital' },
      { country: 'Bhutan', region: 'Paro', city: 'Paro', description: 'Home of Tiger\'s Nest' },
      { country: 'Bhutan', region: 'Thimphu', city: 'Thimphu', description: 'Capital of Bhutan' },
      { country: 'Tibet', region: 'Central Tibet', city: 'Lhasa', description: 'Holy city, Potala Palace' },
    ]).returning();

    // Seed Suppliers
    const supplierResults = await db.insert(suppliers).values([
      { 
        name: "Dwarika's Group", 
        type: 'hotel', 
        country: 'Nepal', 
        city: 'Kathmandu',
        isPreferred: true,
        isActive: true
      },
      { 
        name: "Yeti Airlines", 
        type: 'airline', 
        country: 'Nepal', 
        city: 'Kathmandu',
        isActive: true
      },
      { 
        name: "Nepal Adventure Treks", 
        type: 'adventure_company', 
        country: 'Nepal', 
        city: 'Kathmandu',
        isPreferred: true,
        isActive: true
      },
      { 
        name: "Bhutan Tourism Corp", 
        type: 'dmc', 
        country: 'Bhutan', 
        city: 'Thimphu',
        isActive: true
      },
    ]).returning();

    // Seed Hotels
    const hotelResults = await db.insert(hotels).values([
      {
        supplierId: supplierResults[0].id,
        name: "Dwarika's Hotel",
        destinationId: destResults[0].id, // Kathmandu
        starRating: 5,
        category: 'Heritage Luxury',
        isActive: true
      },
      {
        supplierId: supplierResults[0].id,
        name: "Dwarika's Resort",
        destinationId: destResults[1].id, // Pokhara
        starRating: 5,
        category: 'Luxury Resort',
        isActive: true
      },
    ]).returning();

    // Seed Hotel Room Rates
    await db.insert(hotelRoomRates).values([
      {
        hotelId: hotelResults[0].id,
        roomType: 'Deluxe',
        mealPlan: 'CP',
        costDouble: '180.00',
        sellDouble: '350.00',
        marginPercent: '50.00',
        currency: 'USD',
        inclusions: 'Breakfast, WiFi, Airport Transfer',
        isActive: true
      },
      {
        hotelId: hotelResults[0].id,
        roomType: 'Heritage Suite',
        mealPlan: 'MAP',
        costDouble: '350.00',
        sellDouble: '650.00',
        marginPercent: '50.00',
        currency: 'USD',
        inclusions: 'Breakfast, Dinner, WiFi, Airport Transfer, Spa Access',
        isActive: true
      },
      {
        hotelId: hotelResults[1].id,
        roomType: 'Deluxe Lake View',
        mealPlan: 'CP',
        costDouble: '200.00',
        sellDouble: '380.00',
        marginPercent: '50.00',
        currency: 'USD',
        inclusions: 'Breakfast, WiFi, Lake View',
        isActive: true
      },
    ]);

    // Seed Transportation
    await db.insert(transportation).values([
      {
        supplierId: supplierResults[2].id,
        vehicleType: 'hiace',
        vehicleName: 'Toyota Hiace',
        capacity: 8,
        routeFrom: 'Kathmandu',
        routeTo: 'Pokhara',
        distanceKm: 200,
        costPrice: '80.00',
        sellPrice: '150.00',
        marginPercent: '50.00',
        currency: 'USD',
        inclusions: 'Driver, Fuel, Tolls',
        isActive: true
      },
      {
        supplierId: supplierResults[2].id,
        vehicleType: 'land_cruiser',
        vehicleName: 'Toyota Land Cruiser',
        capacity: 6,
        routeFrom: 'Kathmandu',
        routeTo: 'Chitwan',
        distanceKm: 150,
        costPrice: '100.00',
        sellPrice: '180.00',
        marginPercent: '50.00',
        currency: 'USD',
        inclusions: 'Driver, Fuel, Tolls',
        isActive: true
      },
    ]);

    // Seed Guides
    await db.insert(guides).values([
      {
        supplierId: supplierResults[2].id,
        guideType: 'trekking',
        destination: 'Everest Region',
        costPerDay: '35.00',
        sellPerDay: '65.00',
        marginPercent: '50.00',
        currency: 'USD',
        inclusions: 'Guide services, local knowledge',
        maxGroupSize: 8,
        isActive: true
      },
      {
        supplierId: supplierResults[2].id,
        guideType: 'city',
        destination: 'Kathmandu Valley',
        costPerDay: '25.00',
        sellPerDay: '50.00',
        marginPercent: '50.00',
        currency: 'USD',
        inclusions: 'City tour guide, historical knowledge',
        maxGroupSize: 12,
        isActive: true
      },
    ]);

    // Seed Flights
    await db.insert(flightsDomestic).values([
      {
        supplierId: supplierResults[1].id,
        airlineName: 'Yeti Airlines',
        flightSector: 'KTM-LUA',
        departureCity: 'Kathmandu',
        arrivalCity: 'Lukla',
        flightDuration: '35 min',
        baggageAllowanceKg: 10,
        costPrice: '150.00',
        sellPrice: '200.00',
        marginPercent: '25.00',
        currency: 'USD',
        isActive: true
      },
      {
        supplierId: supplierResults[1].id,
        airlineName: 'Yeti Airlines',
        flightSector: 'KTM-PKR',
        departureCity: 'Kathmandu',
        arrivalCity: 'Pokhara',
        flightDuration: '25 min',
        baggageAllowanceKg: 20,
        costPrice: '80.00',
        sellPrice: '120.00',
        marginPercent: '35.00',
        currency: 'USD',
        isActive: true
      },
    ]);

    // Seed Packages
    await db.insert(packages).values([
      {
        supplierId: supplierResults[2].id,
        name: 'Everest Base Camp Trek',
        packageType: 'fixed_departure_trek',
        country: 'Nepal',
        region: 'Everest',
        durationDays: 14,
        durationNights: 13,
        difficulty: 'Moderate-Difficult',
        maxAltitude: 5364,
        groupSizeMin: 2,
        groupSizeMax: 12,
        itinerarySummary: 'Classic EBC trek through Sherpa villages',
        costPrice: '800.00',
        sellPrice: '1500.00',
        marginPercent: '50.00',
        priceType: 'per_person',
        currency: 'USD',
        inclusions: 'Accommodation, Meals, Guide, Porter, Permits',
        exclusions: 'Flights, Travel Insurance, Personal Expenses',
        isActive: true
      },
      {
        supplierId: supplierResults[3].id,
        name: 'Bhutan Cultural Discovery',
        packageType: 'bhutan_program',
        country: 'Bhutan',
        region: 'Western Bhutan',
        durationDays: 7,
        durationNights: 6,
        difficulty: 'Easy',
        groupSizeMin: 1,
        groupSizeMax: 15,
        itinerarySummary: 'Explore Paro, Thimphu, and Punakha',
        costPrice: '1200.00',
        sellPrice: '2200.00',
        marginPercent: '45.00',
        priceType: 'per_person',
        currency: 'USD',
        inclusions: 'All meals, Accommodation, Guide, SDF, Permits, Transport',
        exclusions: 'International flights, Travel Insurance, Tips',
        isActive: true
      },
    ]);

    return NextResponse.json({
      message: "Database seeded successfully!",
      status: "success",
      data: {
        destinations: destResults.length,
        suppliers: supplierResults.length,
        hotels: hotelResults.length,
      }
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { 
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
