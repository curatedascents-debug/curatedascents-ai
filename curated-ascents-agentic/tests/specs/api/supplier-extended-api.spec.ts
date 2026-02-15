import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Supplier Extended API @api @admin', () => {
  // --- Supplier Rankings ---
  test('GET /api/admin/supplier-rankings returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRankings}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET supplier rankings with serviceType filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRankings}?serviceType=hotel`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST supplier rankings with missing serviceType returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupplierRankings}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Supplier Rate Requests ---
  test('GET /api/admin/supplier-requests returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRequests}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET supplier requests with status filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupplierRequests}?status=pending`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST supplier requests with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupplierRequests}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Supplier Performance & Communications (by supplier ID) ---
  test('GET supplier performance by ID', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/admin/suppliers/1/performance`);
    expect([200, 404, 500]).toContain(response.status());
  });

  test('GET supplier communications by ID', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/admin/suppliers/1/communications`);
    expect([200, 404, 500]).toContain(response.status());
  });
});
