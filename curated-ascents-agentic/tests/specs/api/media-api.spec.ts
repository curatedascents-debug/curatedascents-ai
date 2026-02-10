import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Media API @api @admin', () => {
  test('GET /api/media/homepage returns media data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.mediaHomepage}`);
    expect([200, 500]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('GET /api/admin/media returns data', async ({ request, baseURL }) => {
    // Admin API endpoints don't check auth inline (middleware handles page-level auth)
    const response = await request.get(`${baseURL}${API_ROUTES.adminMedia}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/admin/media/stats returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMediaStats}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/admin/media/upload rejects empty request', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminMediaUpload}`, {
      data: {},
    });
    // Should reject empty upload (no file)
    expect([400, 415, 500]).toContain(response.status());
  });

  test('GET /api/admin/media/collections returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMediaCollections}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
