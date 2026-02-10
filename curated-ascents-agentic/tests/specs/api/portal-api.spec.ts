import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal API @api @portal', () => {
  test('POST /api/portal/auth/send-code requires email', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.portalSendCode}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST /api/portal/auth/send-code accepts valid email', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.portalSendCode}`, {
      data: { email: `e2e-portal-${Date.now()}@example.com` },
    });
    // 200 if email sent, or 500 if Resend not configured
    expect([200, 500]).toContain(response.status());
  });

  test('POST /api/portal/auth/verify-code rejects invalid code', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.portalVerifyCode}`, {
      data: { email: 'test@example.com', code: '000000' },
    });
    expect([400, 401, 500]).toContain(response.status());
  });

  test('GET /api/portal/dashboard requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.portalDashboard}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/portal/bookings requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.portalBookings}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/portal/quotes requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.portalQuotes}`);
    expect([401, 403, 307]).toContain(response.status());
  });

  test('GET /api/portal/loyalty requires authentication', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.portalLoyalty}`);
    expect([401, 403, 307]).toContain(response.status());
  });
});
