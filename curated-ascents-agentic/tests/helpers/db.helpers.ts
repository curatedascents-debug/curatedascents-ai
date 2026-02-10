/**
 * Database helpers for test seeding and querying.
 * Uses dynamic imports to avoid ESM/CJS conflicts with @neondatabase/serverless.
 * NEVER uses sql.raw() — always Drizzle operators (Neon caching pitfall).
 */

let testDb: any = null;
let schemaModule: any = null;

/**
 * Get a standalone Drizzle DB instance for test seeding/querying.
 * Uses the same Neon HTTP driver as the app.
 */
async function getTestDb() {
  if (testDb) return testDb;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for database helpers');
  }

  // Dynamic imports to avoid ESM/CJS issues in Playwright's transpiler
  const { neon } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-http');
  schemaModule = await import('../../src/db/schema');

  const sql = neon(databaseUrl);
  testDb = drizzle(sql, { schema: schemaModule });
  return testDb;
}

async function getSchema() {
  if (schemaModule) return schemaModule;
  schemaModule = await import('../../src/db/schema');
  return schemaModule;
}

/**
 * Seed the test database with sample data using Drizzle ORM.
 * Uses onConflictDoNothing() for idempotent re-runs.
 */
export async function seedTestDatabase() {
  const db = await getTestDb();
  const schema = await getSchema();

  // Dynamic import to avoid bundling seed data in tests
  const seedData = await import('../../src/db/seed-data');

  console.log('[DB Seed] Seeding destinations...');
  if (seedData.sampleDestinations?.length) {
    await db.insert(schema.destinations)
      .values(seedData.sampleDestinations)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding suppliers...');
  if (seedData.sampleSuppliers?.length) {
    await db.insert(schema.suppliers)
      .values(seedData.sampleSuppliers)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding hotels...');
  if (seedData.sampleHotels?.length) {
    await db.insert(schema.hotels)
      .values(seedData.sampleHotels)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding transportation...');
  if (seedData.sampleTransportation?.length) {
    await db.insert(schema.transportation)
      .values(seedData.sampleTransportation)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding guides...');
  if (seedData.sampleGuides?.length) {
    await db.insert(schema.guides)
      .values(seedData.sampleGuides)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding porters...');
  if (seedData.samplePorters?.length) {
    await db.insert(schema.porters)
      .values(seedData.samplePorters)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding flights...');
  if (seedData.sampleFlights?.length) {
    await db.insert(schema.flightsDomestic)
      .values(seedData.sampleFlights)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding permits...');
  if (seedData.samplePermitsFees?.length) {
    await db.insert(schema.permitsFees)
      .values(seedData.samplePermitsFees)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding packages...');
  if (seedData.samplePackages?.length) {
    await db.insert(schema.packages)
      .values(seedData.samplePackages)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Seeding miscellaneous services...');
  if (seedData.sampleMiscellaneous?.length) {
    await db.insert(schema.miscellaneousServices)
      .values(seedData.sampleMiscellaneous)
      .onConflictDoNothing();
  }

  console.log('[DB Seed] Database seeded successfully');
}

/**
 * Clean up test-specific data. Removes records created during tests
 * that match test-specific patterns (e.g., e2e- prefixed emails).
 */
export async function cleanupTestData() {
  const db = await getTestDb();
  const schema = await getSchema();
  const { eq } = await import('drizzle-orm');

  console.log('[DB Cleanup] Cleaning up test data...');
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
  const db = await getTestDb();
  const schema = await getSchema();
  const { eq } = await import('drizzle-orm');

  const results = await db.select()
    .from(schema.clients)
    .where(eq(schema.clients.email, email))
    .limit(1);
  return results[0] || null;
}

export async function getQuoteById(id: number) {
  const db = await getTestDb();
  const schema = await getSchema();
  const { eq } = await import('drizzle-orm');

  const results = await db.select()
    .from(schema.quotes)
    .where(eq(schema.quotes.id, id))
    .limit(1);
  return results[0] || null;
}

export async function getBookingByReference(reference: string) {
  const db = await getTestDb();
  const schema = await getSchema();
  const { eq } = await import('drizzle-orm');

  const results = await db.select()
    .from(schema.bookings)
    .where(eq(schema.bookings.bookingReference, reference))
    .limit(1);
  return results[0] || null;
}

export async function countTableRows(table: 'clients' | 'quotes' | 'bookings' | 'suppliers' | 'hotels') {
  const db = await getTestDb();
  const schema = await getSchema();
  const { count } = await import('drizzle-orm');

  const tableMap: Record<string, any> = {
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
