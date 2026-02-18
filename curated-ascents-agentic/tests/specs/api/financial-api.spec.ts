import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('Financial API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  // --- Invoices ---
  test('GET /api/admin/invoices requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminInvoices}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/invoices returns data with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminInvoices}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET invoices with status filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminInvoices}?status=draft`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('GET invoices with pagination', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminInvoices}?limit=5&offset=0`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST invoices without auth returns 401', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminInvoices}`, {
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('POST invoices with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminInvoices}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST invoices with invalid bookingId returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminInvoices}`, {
      headers: { Cookie: adminCookie() },
      data: { bookingId: 999999, clientId: 999999 },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Payments ---
  test('GET /api/admin/payments requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminPayments}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/payments returns data with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminPayments}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET payments with method filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminPayments}?paymentMethod=stripe`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST payments without auth returns 401', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminPayments}`, {
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('POST payments with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminPayments}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST payments with zero amount returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminPayments}`, {
      headers: { Cookie: adminCookie() },
      data: { amount: 0, invoiceId: 1, paymentMethod: 'stripe' },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Financial Reports ---
  test('GET /api/admin/financial/reports requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialReports}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/financial/reports returns data with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialReports}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET financial reports with period filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialReports}?period=year`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  // --- Aging ---
  test('GET /api/admin/financial/aging requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialAging}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/financial/aging returns data with auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialAging}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
