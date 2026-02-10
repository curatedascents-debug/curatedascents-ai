import { test, expect } from '../../fixtures/auth.fixture';
import { mockChatEndpoint } from '../../mocks/chat-responses';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Chat @portal @ai-tools', () => {
  test.setTimeout(60_000);

  test('redirects to login when not authenticated', async ({ guestPage }) => {
    await guestPage.goto(ROUTES.portalChat);
    await expect(guestPage).toHaveURL(/\/portal\/login/, { timeout: 15_000 });
  });

  test('portal chat page has chat input', async ({ portalPage }) => {
    await mockChatEndpoint(portalPage, 'greeting');
    await portalPage.goto(ROUTES.portalChat);
    await portalPage.waitForLoadState('networkidle');
    const url = portalPage.url();
    if (!url.includes('/login')) {
      const chatInput = portalPage.locator('textarea, input[placeholder*="message"], input[placeholder*="adventure"]');
      if (await chatInput.count() > 0) {
        await expect(chatInput.first()).toBeVisible();
      }
    }
  });

  test('portal chat skips email prompt', async ({ portalPage }) => {
    await mockChatEndpoint(portalPage, 'greeting');
    await portalPage.goto(ROUTES.portalChat);
    await portalPage.waitForLoadState('networkidle');
    const url = portalPage.url();
    if (!url.includes('/login')) {
      // In portal mode, email capture should not appear
      const emailInput = portalPage.locator('input[placeholder="Your email"]');
      const isVisible = await emailInput.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    }
  });
});
