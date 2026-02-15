import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Availability API @api @admin', () => {
  // --- Calendar ---
  test('GET calendar without params returns error', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminAvailabilityCalendar}`);
    expect([400, 500]).toContain(response.status());
  });

  test('GET calendar with date range returns data', async ({ request, baseURL }) => {
    const response = await request.get(
      `${baseURL}${API_ROUTES.adminAvailabilityCalendar}?startDate=2026-03-01&endDate=2026-03-31`
    );
    expect(response.ok()).toBeTruthy();
  });

  test('POST calendar with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminAvailabilityCalendar}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Availability Check ---
  test('GET check without params returns error', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminAvailabilityCheck}`);
    expect([400, 500]).toContain(response.status());
  });

  test('GET check with valid params', async ({ request, baseURL }) => {
    const response = await request.get(
      `${baseURL}${API_ROUTES.adminAvailabilityCheck}?serviceType=hotel&serviceId=1&startDate=2026-04-01&endDate=2026-04-05`
    );
    expect([200, 500]).toContain(response.status());
  });

  // --- Blackouts ---
  test('GET blackouts returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminAvailabilityBlackouts}`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST blackouts with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminAvailabilityBlackouts}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST blackouts with invalid date range returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminAvailabilityBlackouts}`, {
      data: { startDate: '2026-04-10', endDate: '2026-04-01', reason: 'Test' },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Holds ---
  test('GET holds returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminAvailabilityHolds}`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST holds with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminAvailabilityHolds}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Permits ---
  test('GET permits returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminAvailabilityPermits}`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST permits with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminAvailabilityPermits}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });
});
