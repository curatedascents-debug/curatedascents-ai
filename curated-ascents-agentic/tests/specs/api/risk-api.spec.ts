import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Risk & Compliance API @api @admin', () => {
  // --- Travel Advisories ---
  test('GET /api/admin/risk/advisories returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskAdvisories}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET advisories with country filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskAdvisories}?country=Nepal`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST advisories with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskAdvisories}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Weather Alerts ---
  test('GET /api/admin/risk/weather returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskWeather}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET weather with country filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskWeather}?country=Nepal`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST weather with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskWeather}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Compliance Requirements ---
  test('GET /api/admin/risk/compliance returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskCompliance}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST compliance with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskCompliance}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Emergency Contacts ---
  test('GET /api/admin/risk/emergency-contacts requires country param', async ({ request, baseURL }) => {
    // Without country or includeInactive, returns 400
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}`);
    expect(response.status()).toBe(400);
  });

  test('GET emergency contacts with includeInactive returns all', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}?includeInactive=true`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.contacts).toBeDefined();
  });

  test('GET emergency contacts with country filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}?country=Nepal`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST emergency contacts with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST compliance validates required fields', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskCompliance}`, {
      data: { description: 'Missing other required fields' },
    });
    expect([400, 500]).toContain(response.status());
  });
});
