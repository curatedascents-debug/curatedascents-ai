import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, count } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../src/db/schema';

let testDb: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Get a standalone Drizzle DB instance for test seeding/querying.
 * Uses the same Neon HTTP driver as the app.
 */
export function getTestDb(): NeonHttpDatabase<typeof schema> {
  if (testDb) return testDb;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for database helpers');
  }

  const sql = neon(databaseUrl);
  testDb = drizzle(sql, { schema });
  return testDb;
}

/**
 * Seed the test database with sample data using Drizzle ORM.
 * Uses onConflictDoNothing() for idempotent re-runs.
 * NEVER uses sql.raw() — always Drizzle operators (Neon caching pitfall).
 */
export async function seedTestDatabase() {
  const db = getTestDb();

  // Dynamic import to avoid bundling seed data in tests
  const seedData = await import('../../src/db/seed-data');

  console.log('[DB Seed] Seeding destinations...');
  if (seedData.sampleDestinations?.length) {
    await db.insert(schema.destinations)
      .values(seedData.sampleDestinations as (typeof schema.destinations.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding suppliers...');
  if (seedData.sampleSuppliers?.length) {
    await db.insert(schema.suppliers)
      .values(seedData.sampleSuppliers as (typeof schema.suppliers.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding hotels...');
  if (seedData.sampleHotels?.length) {
    await db.insert(schema.hotels)
      .values(seedData.sampleHotels as (typeof schema.hotels.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding transportation...');
  if (seedData.sampleTransportation?.length) {
    await db.insert(schema.transportation)
      .values(seedData.sampleTransportation as (typeof schema.transportation.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding guides...');
  if (seedData.sampleGuides?.length) {
    await db.insert(schema.guides)
      .values(seedData.sampleGuides as (typeof schema.guides.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding porters...');
  if (seedData.samplePorters?.length) {
    await db.insert(schema.porters)
      .values(seedData.samplePorters as (typeof schema.porters.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding flights...');
  if (seedData.sampleFlights?.length) {
    await db.insert(schema.flightsDomestic)
      .values(seedData.sampleFlights as (typeof schema.flightsDomestic.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding permits...');
  if (seedData.samplePermitsFees?.length) {
    await db.insert(schema.permitsFees)
      .values(seedData.samplePermitsFees as (typeof schema.permitsFees.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding packages...');
  if (seedData.samplePackages?.length) {
    await db.insert(schema.packages)
      .values(seedData.samplePackages as (typeof schema.packages.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding miscellaneous services...');
  if (seedData.sampleMiscellaneous?.length) {
    await db.insert(schema.miscellaneousServices)
      .values(seedData.sampleMiscellaneous as (typeof schema.miscellaneousServices.$inferInsert)[])
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Database seeded successfully');
}

/**
 * Clean up test-specific data. Removes records created during tests
 * that match test-specific patterns (e.g., e2e- prefixed emails).
 */
export async function cleanupTestData() {
  const db = getTestDb();

  console.log('[DB Cleanup] Cleaning up test data...');
  // Clean up test clients by email pattern
  // Only remove clearly test-generated records
  try {
    await db.delete(schema.clients)
      .where(eq(schema.clients.email, 'test@customer.com'));
  } catch {
    // Table may not have test data — that's fine
  }

  console.log('[DB Cleanup] Test data cleanup complete');
}

// Query helpers

export async function getClientByEmail(email: string) {
  const db = getTestDb();
  const results = await db.select()
    .from(schema.clients)
    .where(eq(schema.clients.email, email))
    .limit(1);
  return results[0] || null;
}

export async function getQuoteById(id: number) {
  const db = getTestDb();
  const results = await db.select()
    .from(schema.quotes)
    .where(eq(schema.quotes.id, id))
    .limit(1);
  return results[0] || null;
}

export async function getBookingByReference(reference: string) {
  const db = getTestDb();
  const results = await db.select()
    .from(schema.bookings)
    .where(eq(schema.bookings.bookingReference, reference))
    .limit(1);
  return results[0] || null;
}

export async function countTableRows(table: 'clients' | 'quotes' | 'bookings' | 'suppliers' | 'hotels') {
  const db = getTestDb();
  const tableMap = {
    clients: schema.clients,
    quotes: schema.quotes,
    bookings: schema.bookings,
    suppliers: schema.suppliers,
    hotels: schema.hotels,
  };
  const target = tableMap[table];
  const result = await db.select({ count: count() }).from(target);
  return result[0]?.count || 0;
}
