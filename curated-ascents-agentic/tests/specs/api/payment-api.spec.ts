import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Payment API @api @booking', () => {
  test('POST /api/payments/checkout requires booking data', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.paymentsCheckout}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('GET /api/payments/status requires session_id', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.paymentsStatus}`);
    expect([400, 500]).toContain(response.status());
  });

  test('GET /api/payments/status with invalid session returns error', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.paymentsStatus}?session_id=invalid_session`);
    expect([400, 404, 500]).toContain(response.status());
  });
});
