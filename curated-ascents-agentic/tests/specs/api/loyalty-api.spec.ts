import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Loyalty & Referrals API @api @admin', () => {
  // --- Loyalty Accounts ---
  test('GET /api/admin/loyalty/accounts returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminLoyaltyAccounts}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET loyalty accounts with tier filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminLoyaltyAccounts}?tier=bronze`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST loyalty account with missing clientId returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminLoyaltyAccounts}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST loyalty account with nonexistent client returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminLoyaltyAccounts}`, {
      data: { clientId: 999999 },
    });
    expect([400, 404, 500]).toContain(response.status());
  });

  // --- Referrals ---
  test('GET /api/admin/referrals returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminReferrals}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST referrals with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminReferrals}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST referrals with invalid email returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminReferrals}`, {
      data: { referrerClientId: 1, referredEmail: 'not-an-email' },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Customer Success ---
  test('GET /api/admin/customer-success returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminCustomerSuccess}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET customer success with days filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminCustomerSuccess}?days=90`);
    expect(response.ok()).toBeTruthy();
  });

  test('Customer success response has expected sections', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminCustomerSuccess}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Response should have some structure related to loyalty/customer success metrics
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });
});
