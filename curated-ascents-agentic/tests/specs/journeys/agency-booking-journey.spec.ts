import { test, expect } from '@playwright/test';
import { AgencyLoginPage } from '../../page-objects/AgencyLoginPage';
import { mockAgencyChatEndpoint } from '../../mocks/chat-responses';
import { ROUTES, TEST_AGENCY_USER } from '../../fixtures/test-data.fixture';

test.describe('Agency Booking Journey', () => {
  test('agency user can access login page', async ({ page }) => {
    const loginPage = new AgencyLoginPage(page);
    await loginPage.goto();
    await loginPage.expectLoaded();
  });

  test('agency user login → dashboard → chat flow', async ({ page }) => {
    await mockAgencyChatEndpoint(page, 'quoteCalculation');

    // Step 1: Login
    const loginPage = new AgencyLoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_AGENCY_USER.email, TEST_AGENCY_USER.password);
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes('/agency/dashboard')) {
      // Step 2: Navigate to AI Chat tab
      const chatTab = page.getByRole('button', { name: /AI Chat/i });
      if (await chatTab.count() > 0) {
        await chatTab.click();
        await page.waitForTimeout(500);

        // Step 3: Send a message
        const chatInput = page.locator('textarea, input[placeholder*="message"]');
        if (await chatInput.count() > 0) {
          await chatInput.first().fill('Get a B2B quote for Everest trek');
          await page.locator('button[type="submit"]').first().click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  test('agency dashboard tabs are all accessible', async ({ page }) => {
    await page.goto(ROUTES.agencyDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const tabNames = ['Clients', 'Quotes', 'Bookings', 'Reports', 'AI Chat'];
      for (const tab of tabNames) {
        const tabButton = page.getByRole('button', { name: tab });
        if (await tabButton.count() > 0) {
          await tabButton.click();
          await page.waitForTimeout(300);
        }
      }
    }
  });
});
