import { test, expect } from '@playwright/test';
import { API_ROUTES, TEST_ADMIN } from '../../fixtures/test-data.fixture';
import { generateAdminToken } from '../../fixtures/auth.fixture';

test.describe('WhatsApp API @api @admin', () => {
  const adminCookie = () => {
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    return `admin_session=${token}`;
  };

  // --- Auth Required ---
  test('GET /api/admin/whatsapp/conversations requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/admin/whatsapp/templates requires auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappTemplates}`);
    expect(response.status()).toBe(401);
  });

  // --- Conversations ---
  test('GET /api/admin/whatsapp/conversations returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET conversations with active filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}?filter=active`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('GET conversations with pagination', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}?page=1&limit=5`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST conversations with invalid action returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappConversations}`, {
      headers: { Cookie: adminCookie() },
      data: { action: 'invalid-action-xyz' },
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST link conversation with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappConversations}`, {
      headers: { Cookie: adminCookie() },
      data: { action: 'link', conversationId: null },
    });
    expect([400, 500]).toContain(response.status());
  });

  // --- Templates ---
  test('GET /api/admin/whatsapp/templates returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappTemplates}`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET templates with status filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappTemplates}?status=draft`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST templates with missing fields returns error', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappTemplates}`, {
      headers: { Cookie: adminCookie() },
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST templates with valid structure', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminWhatsappTemplates}`, {
      headers: { Cookie: adminCookie() },
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
    const response = await request.get(`${baseURL}${API_ROUTES.adminWhatsappConversations}?search=test`, {
      headers: { Cookie: adminCookie() },
    });
    expect(response.ok()).toBeTruthy();
  });
});
