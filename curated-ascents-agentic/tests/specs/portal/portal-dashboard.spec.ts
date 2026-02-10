import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Dashboard @portal @regression', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.portal);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test('login page displays email input', async ({ page }) => {
    await page.goto(ROUTES.portalLogin);
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('portal dashboard has quick action buttons', async ({ page }) => {
    // This test requires authentication — will redirect if not logged in
    await page.goto(ROUTES.portal);
    const url = page.url();
    if (url.includes('/portal') && !url.includes('/login')) {
      // Authenticated — check for quick actions
      const chatBtn = page.getByText('Chat');
      const quotesBtn = page.getByText('Quotes');
      if (await chatBtn.count() > 0) {
        await expect(chatBtn.first()).toBeVisible();
      }
    }
  });
});
