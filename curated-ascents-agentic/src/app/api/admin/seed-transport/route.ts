import { NextResponse } from 'next/server';
import { db } from '@/db';
import { transportation } from '@/db/schema';
import transportData from '@/db/nepal-transport-rates.json';

export const dynamic = 'force-dynamic';

interface StandardRoute {
  sn: number;
  description: string;
  km: number | null;
  car_usd: number;
  luxury_4x4_suv_usd: number;
}

interface ReferenceRoute {
  sn: number;
  route: string;
  km_one_way: number;
  km_round_trip: number;
  car_round_trip_usd: number;
  luxury_4x4_suv_round_trip_usd: number;
}

interface Category {
  category_id: number;
  category_name: string;
  trip_type: string;
  overtime_rule?: string;
  description?: string;
  routes: (StandardRoute | ReferenceRoute)[];
}

function parseRoute(description: string, categoryName: string): { routeFrom: string; routeTo: string } {
  // Try splitting on " to " first
  const toMatch = description.match(/^(.+?)\s+to\s+(.+?)$/i);
  if (toMatch) {
    return { routeFrom: toMatch[1].trim(), routeTo: toMatch[2].trim() };
  }

  // Try splitting on " - " for reference routes
  const dashParts = description.split(' - ');
  if (dashParts.length >= 2) {
    return { routeFrom: dashParts[0].trim(), routeTo: dashParts[dashParts.length - 1].trim() };
  }

  // For single-location entries (sightseeing, disposal, etc.), use category context
  if (categoryName.toLowerCase().includes('kathmandu')) {
    return { routeFrom: 'Kathmandu', routeTo: description.trim() };
  }
  if (categoryName.toLowerCase().includes('pokhara')) {
    return { routeFrom: 'Pokhara', routeTo: description.trim() };
  }

  return { routeFrom: 'Kathmandu', routeTo: description.trim() };
}

// All vehicle types with multiplier relative to car cost
const VEHICLE_TYPES = [
  { type: 'car', name: 'Standard Car', capacity: 3, multiplier: 1 },
  { type: 'hiace_van', name: 'HiAce Van', capacity: 8, multiplier: 2.5 },
  { type: 'luxury_4x4_suv', name: 'Luxury 4x4 SUV', capacity: 3, multiplier: 3 },
  { type: 'coaster', name: 'Coaster', capacity: 16, multiplier: 3 },
  { type: 'mini_bus', name: 'Mini Bus', capacity: 20, multiplier: 3.5 },
  { type: 'large_bus', name: 'Large Bus', capacity: 30, multiplier: 4 },
];

function buildNotes(category: Category): string {
  const parts = [category.category_name, `Trip type: ${category.trip_type}`];
  if (category.overtime_rule) parts.push(`Overtime: ${category.overtime_rule}`);
  if (category.description) parts.push(category.description);
  return parts.join(' | ');
}

type TransportRow = {
  vehicleType: string;
  vehicleName: string;
  capacity: number;
  routeFrom: string;
  routeTo: string;
  routeDescription: string;
  distanceKm: number | null;
  costPrice: string;
  sellPrice: string;
  marginPercent: string;
  priceType: string;
  currency: string;
  notes: string;
  isActive: boolean;
};

export async function GET() {
  try {
    const data = transportData as { categories: Category[]; metadata: Record<string, unknown> };
    const rows: TransportRow[] = [];

    for (const category of data.categories) {
      if (category.category_id === 15) {
        // Reference distance table
        for (const route of category.routes as ReferenceRoute[]) {
          const { routeFrom, routeTo } = parseRoute(route.route, category.category_name);
          const routeDesc = `${route.route} (Reference: ${route.km_one_way}km one-way, ${route.km_round_trip}km round trip)`;
          const notes = buildNotes(category);
          const carCost = route.car_round_trip_usd;

          for (const vehicle of VEHICLE_TYPES) {
            const costPrice = carCost * vehicle.multiplier;
            rows.push({
              vehicleType: vehicle.type,
              vehicleName: vehicle.name,
              capacity: vehicle.capacity,
              routeFrom,
              routeTo,
              routeDescription: routeDesc,
              distanceKm: route.km_round_trip,
              costPrice: costPrice.toFixed(2),
              sellPrice: (costPrice * 1.5).toFixed(2),
              marginPercent: '50.00',
              priceType: 'per_vehicle',
              currency: 'USD',
              notes,
              isActive: true,
            });
          }
        }
      } else {
        // Categories 1-14: standard routes
        for (const route of category.routes as StandardRoute[]) {
          const { routeFrom, routeTo } = parseRoute(route.description, category.category_name);
          const notes = buildNotes(category);
          const carCost = route.car_usd;

          for (const vehicle of VEHICLE_TYPES) {
            const costPrice = carCost * vehicle.multiplier;
            rows.push({
              vehicleType: vehicle.type,
              vehicleName: vehicle.name,
              capacity: vehicle.capacity,
              routeFrom,
              routeTo,
              routeDescription: route.description,
              distanceKm: route.km ?? null,
              costPrice: costPrice.toFixed(2),
              sellPrice: (costPrice * 1.5).toFixed(2),
              marginPercent: '50.00',
              priceType: 'per_vehicle',
              currency: 'USD',
              notes,
              isActive: true,
            });
          }
        }
      }
    }

    // Delete existing transport rows and insert new ones
    await db.delete(transportation);

    // Bulk insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      await db.insert(transportation).values(batch);
      inserted += batch.length;
    }

    const vehicleCount = VEHICLE_TYPES.length;
    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} transport rows (${data.categories.reduce((s, c) => s + c.routes.length, 0)} routes × ${vehicleCount} vehicle types)`,
      breakdown: {
        totalRoutes: data.categories.reduce((sum, c) => sum + c.routes.length, 0),
        vehicleTypes: VEHICLE_TYPES.map(v => `${v.name} (${v.capacity} pax, ${v.multiplier}x car rate)`),
        totalRows: inserted,
        categories: data.categories.map(c => ({
          id: c.category_id,
          name: c.category_name,
          routes: c.routes.length,
          rows: c.routes.length * vehicleCount,
        })),
      },
    });
  } catch (error) {
    console.error('Transport seed error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
