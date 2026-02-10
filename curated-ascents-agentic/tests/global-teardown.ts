import { type FullConfig } from '@playwright/test';
import { cleanupTestData } from './helpers/db.helpers';

/**
 * Global teardown runs once after all tests.
 * Cleans up test-specific data if needed.
 */
async function globalTeardown(_config: FullConfig) {
  const testEnv = process.env.TEST_ENV || 'local';
  console.log(`[Global Teardown] Test suite completed (${testEnv})`);

  // Only clean up for local environment to avoid touching shared data
  if (testEnv === 'local' && process.env.CLEANUP_DB !== 'false') {
    try {
      await cleanupTestData();
    } catch (error) {
      console.warn('[Global Teardown] Cleanup failed:', error);
    }
  }
}

export default globalTeardown;
