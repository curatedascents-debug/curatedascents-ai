import { type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Global setup runs once before all tests.
 * Seeds the database via direct Drizzle ORM calls (no HTTP endpoint needed).
 */
async function globalSetup(config: FullConfig) {
  const testEnv = process.env.TEST_ENV || 'local';
  const envFile = testEnv === 'staging' ? '.env.staging'
    : testEnv === 'production' ? '.env.production'
    : '.env.test';

  dotenv.config({ path: path.resolve(__dirname, envFile) });

  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  console.log(`[Global Setup] Environment: ${testEnv}, Base URL: ${baseURL}`);

  // Seed the database for local and staging environments
  if (testEnv !== 'production' && process.env.SEED_DB !== 'false') {
    try {
      console.log('[Global Setup] Seeding database via Drizzle ORM...');
      const { seedTestDatabase } = await import('./helpers/db.helpers');
      await seedTestDatabase();
      console.log('[Global Setup] Database seeded successfully');
    } catch (error) {
      console.warn('[Global Setup] Database seeding failed:', error);
      // Fall back to HTTP seed endpoint if direct seeding fails
      try {
        console.log('[Global Setup] Falling back to HTTP seed endpoint...');
        const response = await fetch(`${baseURL}/api/seed-all`);
        if (response.ok) {
          console.log('[Global Setup] HTTP seed successful');
        } else {
          console.warn(`[Global Setup] HTTP seed failed with status ${response.status}`);
        }
      } catch (httpError) {
        console.warn('[Global Setup] HTTP seed also failed:', httpError);
      }
    }
  }
}

export default globalSetup;
