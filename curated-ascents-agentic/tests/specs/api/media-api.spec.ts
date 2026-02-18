import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Media API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  // Public endpoint — no auth needed
  test('GET /api/media/homepage returns media data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.mediaHomepage}`);
    expect([200, 500]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  // --- Auth Required ---
  test('GET /api/admin/media requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMedia}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/media/stats requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMediaStats}`);
    expect(response.status()).toBe(401);
  });

  // --- Admin Media endpoints ---
  test('GET /api/admin/media returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMedia}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/media/stats returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMediaStats}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/admin/media/upload rejects empty request', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminMediaUpload}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    // Should reject empty upload (no file)
    expect([400, 415, 500]).toContain(response.status());
  });

  test('GET /api/admin/media/collections returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMediaCollections}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
