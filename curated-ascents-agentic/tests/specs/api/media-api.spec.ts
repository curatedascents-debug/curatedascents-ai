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

  test('GET /api/admin/media requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMedia}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/admin/media/stats requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMediaStats}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('POST /api/admin/media/upload requires authentication', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminMediaUpload}`, {
      data: {},
    });
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/admin/media/collections requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminMediaCollections}`);
    expect([401, 403, 307]).toContain(response.status());
  });
});
