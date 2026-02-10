import { type FullConfig } from '@playwright/test';

/**
 * Global teardown runs once after all tests.
 * Clean up test data if needed.
 */
async function globalTeardown(_config: FullConfig) {
  console.log('[Global Teardown] Test suite completed');
  // Add any cleanup logic here if needed
  // e.g., removing test-specific records from the database
}

export default globalTeardown;
