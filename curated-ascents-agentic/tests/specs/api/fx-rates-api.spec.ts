import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('FX Rates API @api @admin', () => {
  test('GET /api/admin/fx-rates returns default 30 days', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.days).toBe(30);
    expect(typeof data.count).toBe('number');
    expect(Array.isArray(data.rates)).toBeTruthy();
  });

  test('GET /api/admin/fx-rates with ?days=7', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}?days=7`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.days).toBe(7);
  });

  test('GET /api/admin/fx-rates caps days at 365', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}?days=999`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.days).toBe(365);
  });

  test('GET /api/admin/fx-rates with ?days=1 returns valid rate structure', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}?days=1`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    // If there are rates, verify structure
    if (data.rates.length > 0) {
      const rate = data.rates[0];
      expect(rate).toHaveProperty('rateDate');
      expect(rate).toHaveProperty('baseCurrency');
      expect(rate).toHaveProperty('rates');
      expect(rate).toHaveProperty('source');
    }
  });
});
