import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Financial API @api @admin', () => {
  // --- Invoices ---
  test('GET /api/admin/invoices returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminInvoices}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET invoices with status filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminInvoices}?status=draft`);
    expect(response.ok()).toBeTruthy();
  });

  test('GET invoices with pagination', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminInvoices}?limit=5&offset=0`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST invoices with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminInvoices}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST invoices with invalid bookingId returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminInvoices}`, {
      data: { bookingId: 999999, clientId: 999999 },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Payments ---
  test('GET /api/admin/payments returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminPayments}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET payments with method filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminPayments}?paymentMethod=stripe`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST payments with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminPayments}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST payments with zero amount returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminPayments}`, {
      data: { amount: 0, invoiceId: 1, paymentMethod: 'stripe' },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Financial Reports ---
  test('GET /api/admin/financial/reports returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialReports}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET financial reports with period filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialReports}?period=year`);
    expect(response.ok()).toBeTruthy();
  });

  // --- Aging ---
  test('GET /api/admin/financial/aging returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminFinancialAging}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
