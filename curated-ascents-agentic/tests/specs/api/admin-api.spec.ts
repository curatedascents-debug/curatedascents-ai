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

  test('GET /api/admin/rates requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/rates returns data with auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/suppliers requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSuppliers}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/suppliers returns data with auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSuppliers}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/hotels requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminHotels}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/hotels returns data with auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminHotels}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/clients requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminClients}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/clients returns data with auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminClients}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/reports requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminReports}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/reports returns data with auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminReports}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
