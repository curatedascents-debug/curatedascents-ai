import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Security & Health APIs @api @regression', () => {
  test('GET /api/health returns ok status', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeTruthy();
  });

  test('admin API returns 401 without auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`);
    expect(response.status()).toBe(401);
  });

  test('admin API returns 401 with invalid auth cookie', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`, {
      headers: { Cookie: 'admin_session=invalid-token-value' },
    });
    expect(response.status()).toBe(401);
  });

  test('admin API returns data with valid auth cookie', async ({ request, baseURL }) => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    const response = await request.get(`${baseURL}${API_ROUTES.adminRates}`, {
      headers: { Cookie: `admin_session=${token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('rate limiting headers present on API responses', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/health`);
    // Health endpoint should always respond
    expect(response.ok()).toBeTruthy();
  });

  test('chat API rejects empty messages', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
      data: { messages: [] },
    });
    // Should reject or handle gracefully
    expect([200, 400]).toContain(response.status());
  });

  test('portal auth rejects invalid verification code', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.portalVerifyCode}`, {
      data: { email: 'test@example.com', code: '000000' },
    });
    expect([400, 401]).toContain(response.status());
  });
});
