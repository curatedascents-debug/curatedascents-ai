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

function buildNotes(category: Category): string {
  const parts = [category.category_name, `Trip type: ${category.trip_type}`];
  if (category.overtime_rule) parts.push(`Overtime: ${category.overtime_rule}`);
  if (category.description) parts.push(category.description);
  return parts.join(' | ');
}

export async function GET() {
  try {
    const data = transportData as { categories: Category[]; metadata: Record<string, unknown> };
    const rows: Array<{
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
    }> = [];

    for (const category of data.categories) {
      if (category.category_id === 15) {
        // Reference distance table
        for (const route of category.routes as ReferenceRoute[]) {
          const { routeFrom, routeTo } = parseRoute(route.route, category.category_name);

          // Car entry
          rows.push({
            vehicleType: 'car',
            vehicleName: 'Standard Car',
            capacity: 3,
            routeFrom,
            routeTo,
            routeDescription: `${route.route} (Reference: ${route.km_one_way}km one-way, ${route.km_round_trip}km round trip)`,
            distanceKm: route.km_round_trip,
            costPrice: route.car_round_trip_usd.toFixed(2),
            sellPrice: (route.car_round_trip_usd * 1.5).toFixed(2),
            marginPercent: '50.00',
            priceType: 'per_vehicle',
            currency: 'USD',
            notes: buildNotes(category),
            isActive: true,
          });

          // SUV entry
          rows.push({
            vehicleType: 'luxury_4x4_suv',
            vehicleName: 'Luxury 4x4 SUV',
            capacity: 5,
            routeFrom,
            routeTo,
            routeDescription: `${route.route} (Reference: ${route.km_one_way}km one-way, ${route.km_round_trip}km round trip)`,
            distanceKm: route.km_round_trip,
            costPrice: route.luxury_4x4_suv_round_trip_usd.toFixed(2),
            sellPrice: (route.luxury_4x4_suv_round_trip_usd * 1.5).toFixed(2),
            marginPercent: '50.00',
            priceType: 'per_vehicle',
            currency: 'USD',
            notes: buildNotes(category),
            isActive: true,
          });
        }
      } else {
        // Categories 1-14: standard routes
        for (const route of category.routes as StandardRoute[]) {
          const { routeFrom, routeTo } = parseRoute(route.description, category.category_name);

          // Car entry
          rows.push({
            vehicleType: 'car',
            vehicleName: 'Standard Car',
            capacity: 3,
            routeFrom,
            routeTo,
            routeDescription: route.description,
            distanceKm: route.km ?? null,
            costPrice: route.car_usd.toFixed(2),
            sellPrice: (route.car_usd * 1.5).toFixed(2),
            marginPercent: '50.00',
            priceType: 'per_vehicle',
            currency: 'USD',
            notes: buildNotes(category),
            isActive: true,
          });

          // SUV entry
          rows.push({
            vehicleType: 'luxury_4x4_suv',
            vehicleName: 'Luxury 4x4 SUV',
            capacity: 5,
            routeFrom,
            routeTo,
            routeDescription: route.description,
            distanceKm: route.km ?? null,
            costPrice: route.luxury_4x4_suv_usd.toFixed(2),
            sellPrice: (route.luxury_4x4_suv_usd * 1.5).toFixed(2),
            marginPercent: '50.00',
            priceType: 'per_vehicle',
            currency: 'USD',
            notes: buildNotes(category),
            isActive: true,
          });
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

    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} transport rows`,
      breakdown: {
        totalRoutes: data.categories.reduce((sum, c) => sum + c.routes.length, 0),
        totalRows: inserted,
        categories: data.categories.map(c => ({
          id: c.category_id,
          name: c.category_name,
          routes: c.routes.length,
          rows: c.routes.length * 2,
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
