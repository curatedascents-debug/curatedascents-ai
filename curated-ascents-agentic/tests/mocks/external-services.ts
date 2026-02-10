import { type Page, type Route } from '@playwright/test';

/** Mock Resend email API (called server-side, but we can mock the portal's send-code response) */
export async function mockSendVerificationCode(page: Page) {
  await page.route('**/api/portal/auth/send-code', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sent: true }),
    });
  });
}

/** Mock currency rates API */
export async function mockCurrencyRates(page: Page) {
  await page.route('**/api/currency/rates', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        base: 'USD',
        rates: {
          EUR: 0.92,
          GBP: 0.79,
          NPR: 133.5,
          INR: 83.2,
          AUD: 1.53,
          CAD: 1.36,
          JPY: 149.8,
          CHF: 0.88,
        },
        updatedAt: new Date().toISOString(),
      }),
    });
  });
}

/** Mock currency conversion API */
export async function mockCurrencyConvert(page: Page) {
  await page.route('**/api/currency/convert', async (route: Route) => {
    const request = route.request();
    const body = request.postDataJSON();
    const mockRates: Record<string, number> = { EUR: 0.92, GBP: 0.79, NPR: 133.5, INR: 83.2 };
    const rate = mockRates[body?.to] || 1;
    const converted = (body?.amount || 0) * rate;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        from: body?.from || 'USD',
        to: body?.to || 'EUR',
        amount: body?.amount || 0,
        convertedAmount: converted,
        rate,
      }),
    });
  });
}

/** Mock homepage media API */
export async function mockHomepageMedia(page: Page) {
  await page.route('**/api/media/homepage', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        heroSlides: [],
        experiences: [],
        destinations: [],
        about: [],
      }),
    });
  });
}

/** Mock personalize API (email capture) */
export async function mockPersonalize(page: Page) {
  await page.route('**/api/personalize', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, clientId: 999 }),
    });
  });
}
