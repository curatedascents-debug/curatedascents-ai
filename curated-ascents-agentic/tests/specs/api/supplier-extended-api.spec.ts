import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Supplier Extended API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  // --- Supplier Rankings ---
  test('GET /api/admin/supplier-rankings requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRankings}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/supplier-rankings returns data with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRankings}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET supplier rankings with serviceType filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRankings}?serviceType=hotel`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST supplier rankings without auth returns 401', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupplierRankings}`, {
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('POST supplier rankings with missing serviceType returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupplierRankings}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Supplier Rate Requests ---
  test('GET /api/admin/supplier-requests requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRequests}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/supplier-requests returns data with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRequests}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET supplier requests with status filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRequests}?status=pending`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST supplier requests without auth returns 401', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupplierRequests}`, {
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('POST supplier requests with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupplierRequests}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Supplier Performance & Communications (by supplier ID) ---
  test('GET supplier performance by ID requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/admin/suppliers/1/performance`);
    expect(response.status()).toBe(401);
  });

  test('GET supplier performance by ID with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/admin/suppliers/1/performance`, {
      headers: { Cookie: adminCookie() },
    });
    expect([200, 404, 500]).toContain(response.status());
  });

  test('GET supplier communications by ID requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/admin/suppliers/1/communications`);
    expect(response.status()).toBe(401);
  });

  test('GET supplier communications by ID with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/admin/suppliers/1/communications`, {
      headers: { Cookie: adminCookie() },
    });
    expect([200, 404, 500]).toContain(response.status());
  });
});
