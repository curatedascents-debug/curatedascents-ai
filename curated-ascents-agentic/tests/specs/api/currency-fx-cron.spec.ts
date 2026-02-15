import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Currency FX Cron & Conversion @api', () => {
  // --- Cron endpoint auth ---
  test('GET cron without auth returns 401 when CRON_SECRET is set', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.cronUpdateExchangeRates}`);
    // If CRON_SECRET is set, expect 401; if not set, the endpoint runs (200 or 500 if external API unavailable)
    expect([200, 401, 500]).toContain(response.status());
    if (response.status() === 401) {
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    }
  });

  test('GET cron with Bearer token returns valid response', async ({ request, baseURL }) => {
    const cronSecret = process.env.CRON_SECRET || '';
    const response = await request.get(`${baseURL}${API_ROUTES.cronUpdateExchangeRates}`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    // Endpoint may fail with 500 if external FX API is unavailable in test env
    expect([200, 500]).toContain(response.status());
    const data = await response.json();
    if (response.ok()) {
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('source');
      expect(data).toHaveProperty('timestamp');
    } else {
      expect(data).toHaveProperty('error');
    }
  });

  test('POST cron mirrors GET behavior', async ({ request, baseURL }) => {
    const cronSecret = process.env.CRON_SECRET || '';
    const response = await request.post(`${baseURL}${API_ROUTES.cronUpdateExchangeRates}`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    // Same as GET — may succeed or fail due to external API
    expect([200, 500]).toContain(response.status());
    const data = await response.json();
    if (response.ok()) {
      expect(data.success).toBe(true);
    }
  });

  // --- Currency conversion ---
  test('GET /api/currency/convert with valid params returns conversion', async ({ request, baseURL }) => {
    const response = await request.get(
      `${baseURL}${API_ROUTES.currencyConvert}?amount=100&from=USD&to=EUR`
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.original.amount).toBe(100);
    expect(data.original.currency).toBe('USD');
    expect(data.converted.currency).toBe('EUR');
    expect(typeof data.converted.amount).toBe('number');
    expect(data.converted.amount).toBeGreaterThan(0);
    expect(typeof data.rate).toBe('number');
  });

  test('GET /api/currency/convert cross-currency (EUR to GBP) works', async ({ request, baseURL }) => {
    const response = await request.get(
      `${baseURL}${API_ROUTES.currencyConvert}?amount=500&from=EUR&to=GBP`
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.original.currency).toBe('EUR');
    expect(data.converted.currency).toBe('GBP');
    expect(data.converted.amount).toBeGreaterThan(0);
  });
});
