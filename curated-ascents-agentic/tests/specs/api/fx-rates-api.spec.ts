import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('FX Rates API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  test('GET /api/admin/fx-rates requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/fx-rates returns default 30 days', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.days).toBe(30);
    expect(typeof data.count).toBe('number');
    expect(Array.isArray(data.rates)).toBeTruthy();
  });

  test('GET /api/admin/fx-rates with ?days=7', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}?days=7`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.days).toBe(7);
  });

  test('GET /api/admin/fx-rates caps days at 365', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}?days=999`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.days).toBe(365);
  });

  test('GET /api/admin/fx-rates with ?days=1 returns valid rate structure', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFxRates}?days=1`, {
      headers: { Cookie: adminCookie() },
    });
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
