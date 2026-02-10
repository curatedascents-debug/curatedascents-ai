import { type FullConfig } from '@playwright/test';

/**
 * Global setup runs once before all tests.
 * Seeds the database if needed.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';

  console.log(`[Global Setup] Using base URL: ${baseURL}`);

  // Optionally seed the database
  if (process.env.SEED_DB === 'true') {
    try {
      console.log('[Global Setup] Seeding database...');
      const response = await fetch(`${baseURL}/api/seed-all`);
      if (response.ok) {
        console.log('[Global Setup] Database seeded successfully');
      } else {
        console.warn(`[Global Setup] Seed failed with status ${response.status}`);
      }
    } catch (error) {
      console.warn('[Global Setup] Could not seed database:', error);
    }
  }
}

export default globalSetup;
