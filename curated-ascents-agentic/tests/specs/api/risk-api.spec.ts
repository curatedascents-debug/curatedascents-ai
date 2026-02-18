import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Risk & Compliance API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  // --- Auth Required ---
  test('GET /api/admin/risk/advisories requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskAdvisories}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/risk/weather requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskWeather}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/risk/compliance requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskCompliance}`);
    expect(response.status()).toBe(401);
  });

  // --- Travel Advisories ---
  test('GET /api/admin/risk/advisories returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskAdvisories}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET advisories with country filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskAdvisories}?country=Nepal`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST advisories with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskAdvisories}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Weather Alerts ---
  test('GET /api/admin/risk/weather returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskWeather}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET weather with country filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskWeather}?country=Nepal`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST weather with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskWeather}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Compliance Requirements ---
  test('GET /api/admin/risk/compliance returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskCompliance}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST compliance with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskCompliance}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Emergency Contacts ---
  test('GET /api/admin/risk/emergency-contacts requires country param', async ({ request, baseURL }) => {
    // Without country or includeInactive, returns 400
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.status()).toBe(400);
  });

  test('GET emergency contacts with includeInactive returns all', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}?includeInactive=true`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.contacts).toBeDefined();
  });

  test('GET emergency contacts with country filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}?country=Nepal`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST emergency contacts with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskEmergencyContacts}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST compliance validates required fields', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminRiskCompliance}`, {
      headers: { Cookie: adminCookie() },
      data: { description: 'Missing other required fields' },
    });
    expect([400, 500]).toContain(response.status());
  });
});
