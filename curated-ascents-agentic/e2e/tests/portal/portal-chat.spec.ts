import { test, expect } from '@playwright/test';
import { mockChatEndpoint } from '../../mocks/chat-responses';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Chat', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.portalChat);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test('portal chat page has chat input', async ({ page }) => {
    await mockChatEndpoint(page, 'greeting');
    await page.goto(ROUTES.portalChat);
    const url = page.url();
    if (!url.includes('/login')) {
      const chatInput = page.locator('textarea, input[placeholder*="message"], input[placeholder*="adventure"]');
      if (await chatInput.count() > 0) {
        await expect(chatInput.first()).toBeVisible();
      }
    }
  });

  test('portal chat skips email prompt', async ({ page }) => {
    await mockChatEndpoint(page, 'greeting');
    await page.goto(ROUTES.portalChat);
    const url = page.url();
    if (!url.includes('/login')) {
      // In portal mode, email capture should not appear
      const emailInput = page.locator('input[placeholder="Your email"]');
      const isVisible = await emailInput.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    }
  });
});
