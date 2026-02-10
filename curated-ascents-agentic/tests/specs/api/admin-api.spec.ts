import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Admin API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  test('POST /api/admin/auth/login rejects wrong password', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminLogin}`, {
      data: { password: 'wrong-password-123' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/admin/auth/login accepts correct password', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminLogin}`, {
      data: { password: TEST_ADMIN.password },
    });
    expect([200, 302, 307]).toContain(response.status());
  });

  test('GET /api/admin/rates returns data', async ({ request, baseURL }) => {
    // Admin API endpoints don't check auth inline (middleware handles page-level auth)
    // API routes return data directly
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/rates returns data with auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/admin/suppliers returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSuppliers}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/hotels returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminHotels}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/clients returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminClients}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/reports returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminReports}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
