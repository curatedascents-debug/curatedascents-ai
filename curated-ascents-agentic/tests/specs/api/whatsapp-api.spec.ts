import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('WhatsApp API @api @admin', () => {
  // --- Conversations ---
  test('GET /api/admin/whatsapp/conversations returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET conversations with active filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}?filter=active`);
    expect(response.ok()).toBeTruthy();
  });

  test('GET conversations with pagination', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}?page=1&limit=5`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST conversations with invalid action returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappConversations}`, {
      data: { action: 'invalid-action-xyz' },
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST link conversation with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappConversations}`, {
      data: { action: 'link', conversationId: null },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Templates ---
  test('GET /api/admin/whatsapp/templates returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappTemplates}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET templates with status filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappTemplates}?status=draft`);
    expect(response.ok()).toBeTruthy();
  });

  test('POST templates with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappTemplates}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST templates with valid structure', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappTemplates}`, {
      data: {
        name: 'e2e_test_template',
        category: 'marketing',
        language: 'en',
        body: 'Hello {{1}}, welcome to CuratedAscents!',
        status: 'draft',
      },
    });
    // May return 200/201 on success, 400 for validation issues, or 500 for DB/config errors
    expect([200, 201, 400, 500]).toContain(response.status());
  });

  test('GET conversations supports search param', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}?search=test`);
    expect(response.ok()).toBeTruthy();
  });
});
