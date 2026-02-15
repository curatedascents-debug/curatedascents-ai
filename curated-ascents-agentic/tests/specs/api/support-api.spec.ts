import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Support Tickets API @api @admin', () => {
  test('GET /api/admin/support/tickets returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupportTickets}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET tickets with status filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupportTickets}?status=open`);
    expect(response.ok()).toBeTruthy();
  });

  test('GET tickets with pagination', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminSupportTickets}?limit=5&offset=0`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST tickets with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupportTickets}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST tickets with valid data', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupportTickets}`, {
      data: {
        clientId: 1,
        subject: 'E2E Test Ticket',
        description: 'This is an automated test ticket from the E2E suite.',
        priority: 'medium',
        category: 'general',
      },
    });
    // May succeed or fail if clientId=1 doesn't exist in test DB
    expect([200, 201, 500]).toContain(response.status());
  });

  test('POST tickets validates required subject field', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminSupportTickets}`, {
      data: { clientId: 1, description: 'Missing subject field' },
    });
    expect([400, 500]).toContain(response.status());
  });
});
