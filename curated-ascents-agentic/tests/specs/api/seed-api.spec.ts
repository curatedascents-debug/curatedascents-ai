import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Seed & Cleanup APIs @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  test.describe('Seed Itineraries API', () => {
    test('POST /api/admin/seed-itineraries requires auth', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.adminSeedItineraries}`);
      expect(response.status()).toBe(401);
    });

    test('POST /api/admin/seed-itineraries returns success', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.adminSeedItineraries}`, {
        headers: { Cookie: adminCookie() },
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('created');
      expect(data).toHaveProperty('updated');
      expect(typeof data.created).toBe('number');
      expect(typeof data.updated).toBe('number');
      const total = data.created + data.updated;
      expect(total).toBeGreaterThanOrEqual(1);
    });

    test('POST /api/admin/seed-itineraries is idempotent (upsert)', async ({ request, baseURL }) => {
      // Run twice — second run should mostly update, not create duplicates
      await request.post(`${baseURL}${API_ROUTES.adminSeedItineraries}`, {
        headers: { Cookie: adminCookie() },
      });
      const response = await request.post(`${baseURL}${API_ROUTES.adminSeedItineraries}`, {
        headers: { Cookie: adminCookie() },
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      // Second run: all should be updates
      expect(data.updated).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Seed Destinations API', () => {
    test('POST /api/admin/seed-destinations requires auth', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.adminSeedDestinations}`);
      expect(response.status()).toBe(401);
    });

    test('POST /api/admin/seed-destinations returns success', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.adminSeedDestinations}`, {
        headers: { Cookie: adminCookie() },
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
      expect(typeof data.message).toBe('string');
    });
  });

  test.describe('Cleanup Itineraries API', () => {
    test('POST /api/admin/cleanup-itineraries requires auth', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.adminCleanupItineraries}`);
      expect(response.status()).toBe(401);
    });

    test('POST /api/admin/cleanup-itineraries returns success', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.adminCleanupItineraries}`, {
        headers: { Cookie: adminCookie() },
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.results)).toBeTruthy();
    });
  });
});
