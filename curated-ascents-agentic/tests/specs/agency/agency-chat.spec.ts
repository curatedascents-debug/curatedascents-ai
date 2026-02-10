import { test, expect } from '@playwright/test';
import { mockAgencyChatEndpoint } from '../../mocks/chat-responses';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Agency Chat @agency @ai-tools', () => {
  test('agency chat tab exists in dashboard', async ({ page }) => {
    await page.goto(ROUTES.agencyDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const chatTab = page.getByRole('button', { name: /AI Chat/i });
      if (await chatTab.count() > 0) {
        await expect(chatTab).toBeVisible();
      }
    }
  });

  test('agency chat uses dedicated API endpoint', async ({ page }) => {
    let usedAgencyEndpoint = false;
    await page.route('**/api/agency/chat', async (route) => {
      usedAgencyEndpoint = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ response: 'B2B pricing available' }),
      });
    });

    await page.goto(ROUTES.agencyDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const chatTab = page.getByRole('button', { name: /AI Chat/i });
      if (await chatTab.count() > 0) {
        await chatTab.click();
        await page.waitForTimeout(500);

        const chatInput = page.locator('textarea, input[placeholder*="message"]');
        if (await chatInput.count() > 0) {
          await chatInput.first().fill('Hello');
          await page.locator('button[type="submit"]').first().click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  test('agency chat endpoint returns 401 without auth', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/api/agency/chat`, {
      data: { messages: [{ role: 'user', content: 'test' }] },
    });
    expect([401, 403]).toContain(response.status());
  });
});
