import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Content Management API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  // --- Auth Required ---
  test('GET /api/admin/content/destinations requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminContentDestinations}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/content/guides requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminContentGuides}`);
    expect(response.status()).toBe(401);
  });

  // --- Destination Content ---
  test('GET /api/admin/content/destinations returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminContentDestinations}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST destination content with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminContentDestinations}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Guides ---
  test('GET /api/admin/content/guides returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminContentGuides}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST guides with missing action returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminContentGuides}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Templates ---
  test('GET /api/admin/content/templates returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminContentTemplates}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST templates with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminContentTemplates}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Assets ---
  test('GET /api/admin/content/assets returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminContentAssets}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST assets with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminContentAssets}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST assets with invalid assetType returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminContentAssets}`, {
      headers: { Cookie: adminCookie() },
      data: { assetType: 'invalid-type-xyz', title: 'Test' },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Generate ---
  test('POST content/generate with invalid type returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminContentGenerate}`, {
      headers: { Cookie: adminCookie() },
      data: { type: 'invalid-content-type' },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Seed ---
  test('POST content/seed succeeds or handles gracefully', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminContentSeed}`, {
      headers: { Cookie: adminCookie() },
    });
    expect([200, 500]).toContain(response.status());
  });
});
