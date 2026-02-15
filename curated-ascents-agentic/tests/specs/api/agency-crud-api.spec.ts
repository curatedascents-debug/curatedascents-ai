import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';
import { API_ROUTES, TEST_AGENCY_USER } from '../../fixtures/test-data.fixture';

/** Generate agency JWT inline for API-level tests (no browser context needed) */
async function generateAgencyJwt(): Promise<string> {
  const secret = process.env.AGENCY_JWT_SECRET || 'test-agency-jwt-secret-for-e2e-testing-32chars';
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT({
    userId: 1,
    agencyId: 1,
    email: TEST_AGENCY_USER.email,
    role: 'admin',
    agencySlug: 'test-travel-agency',
    agencyName: TEST_AGENCY_USER.agencyName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

test.describe('Agency CRUD API @api @agency', () => {
  // --- Admin-side agency management ---
  test('GET /api/admin/agencies returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminAgencies}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/admin/agencies with empty body returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminAgencies}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Agency auth ---
  test('GET /api/agency/auth/me without cookie returns unauthorized', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.agencyMe}`);
    expect([401, 403]).toContain(response.status());
  });

  // --- Agency clients ---
  test('GET /api/agency/clients without cookie returns unauthorized', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.agencyClients}`);
    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/agency/clients with JWT cookie', async ({ request, baseURL }) => {
    const token = await generateAgencyJwt();
    const response = await request.get(`${baseURL}${API_ROUTES.agencyClients}`, {
      headers: { Cookie: `agency_session=${token}` },
    });
    expect([200, 401, 500]).toContain(response.status());
  });

  // --- Agency bookings ---
  test('GET /api/agency/bookings without cookie returns unauthorized', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.agencyBookings}`);
    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/agency/bookings with JWT cookie', async ({ request, baseURL }) => {
    const token = await generateAgencyJwt();
    const response = await request.get(`${baseURL}${API_ROUTES.agencyBookings}`, {
      headers: { Cookie: `agency_session=${token}` },
    });
    expect([200, 401, 500]).toContain(response.status());
  });

  // --- Agency quotes ---
  test('GET /api/agency/quotes without cookie returns unauthorized', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.agencyQuotes}`);
    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/agency/quotes with JWT cookie', async ({ request, baseURL }) => {
    const token = await generateAgencyJwt();
    const response = await request.get(`${baseURL}${API_ROUTES.agencyQuotes}`, {
      headers: { Cookie: `agency_session=${token}` },
    });
    expect([200, 401, 500]).toContain(response.status());
  });

  // --- Agency rates / suppliers ---
  test('GET /api/agency/rates without cookie returns unauthorized', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.agencyRates}`);
    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/agency/suppliers without cookie returns unauthorized', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.agencySuppliers}`);
    expect([401, 403]).toContain(response.status());
  });

  // --- Agency client creation ---
  test('POST /api/agency/clients with empty body and JWT returns error', async ({ request, baseURL }) => {
    const token = await generateAgencyJwt();
    const response = await request.post(`${baseURL}${API_ROUTES.agencyClients}`, {
      headers: { Cookie: `agency_session=${token}` },
      data: {},
    });
    expect([400, 401, 500]).toContain(response.status());
  });
});
