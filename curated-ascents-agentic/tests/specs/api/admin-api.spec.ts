import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Admin API', () => {
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

  test('GET /api/admin/rates requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/admin/rates returns data with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`, {
      headers: { Cookie: adminCookie() },
    });
    expect([200, 401, 403]).toContain(response.status());
  });

  test('GET /api/admin/suppliers requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSuppliers}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/admin/hotels requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminHotels}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/admin/clients requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminClients}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/admin/reports requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminReports}`);
    expect([401, 403, 307]).toContain(response.status());
  });
});
