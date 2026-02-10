import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Chat API', () => {
  test('POST /api/chat accepts messages', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
      data: {
        messages: [{ role: 'user', content: 'Hello' }],
      },
    });
    // Should return 200 (with AI response) or timeout/error from DeepSeek
    expect([200, 500, 504]).toContain(response.status());
  });

  test('POST /api/chat requires messages field', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
      data: {},
    });
    expect([400, 500]).toContain(response.status());
  });

  test('POST /api/personalize saves client info', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.personalize}`, {
      data: {
        email: `e2e-test-${Date.now()}@example.com`,
        name: 'E2E Test User',
      },
    });
    expect([200, 201]).toContain(response.status());
  });

  test('POST /api/personalize requires email', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.personalize}`, {
      data: { name: 'No Email' },
    });
    expect([400, 500]).toContain(response.status());
  });
});
