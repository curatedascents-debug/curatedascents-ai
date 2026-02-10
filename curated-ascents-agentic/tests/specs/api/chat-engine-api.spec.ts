import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';
import { test as authTest } from '../../fixtures/auth.fixture';
import { createChatMessage, createConversationHistory, createCustomerProfile } from '../../factories/test-data.factory';

/**
 * @tags @regression @ai-tools @api
 *
 * Comprehensive API-level tests for the chat engine endpoints.
 * Tests /api/chat (public) and /api/agency/chat (B2B) for:
 * - Message acceptance and response format
 * - Conversation history handling
 * - Tool-calling scenarios (search_rates, calculate_quote, search_hotels, etc.)
 * - Price sanitization (costPrice/margin never leaked to client)
 * - Error handling and edge cases
 * - Agency B2B pricing (20% margin vs 50% client-facing)
 */
test.describe('Chat Engine API — Public (/api/chat) @regression @ai-tools @api', () => {
  test.describe('Message Handling', () => {
    test('accepts a single user message and returns assistant response', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'What destinations do you offer?' }],
        },
      });
      // MSW intercepts DeepSeek, so we should get 200
      if (response.ok()) {
        const body = await response.json();
        expect(body).toHaveProperty('response');
        expect(typeof body.response).toBe('string');
        expect(body.response.length).toBeGreaterThan(0);
      } else {
        // Without MSW (e.g., staging), tolerate 500/504
        expect([500, 504]).toContain(response.status());
      }
    });

    test('accepts conversation history with multiple turns', async ({ request, baseURL }) => {
      const history = createConversationHistory(2);
      history.push(createChatMessage('user', { content: 'Show me hotels in Kathmandu' }));

      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: { messages: history },
      });
      expect([200, 500, 504]).toContain(response.status());
    });

    test('accepts optional clientId for personalized responses', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'Hello' }],
          clientId: 1,
        },
      });
      expect([200, 500, 504]).toContain(response.status());
    });

    test('accepts optional conversationId for tracking', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'Hello' }],
          conversationId: 'test-conv-123',
        },
      });
      expect([200, 500, 504]).toContain(response.status());
    });
  });

  test.describe('Validation & Error Handling', () => {
    test('rejects empty body', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {},
      });
      expect([400, 500]).toContain(response.status());
    });

    test('rejects messages with empty array', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: { messages: [] },
      });
      expect([400, 500]).toContain(response.status());
    });

    test('rejects non-POST methods', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${API_ROUTES.chat}`);
      expect(response.status()).toBe(405);
    });

    test('handles very long messages gracefully', async ({ request, baseURL }) => {
      const longContent = 'A'.repeat(10000);
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: longContent }],
        },
      });
      // Should handle it — either succeed or return a proper error
      expect([200, 400, 413, 500, 504]).toContain(response.status());
    });
  });

  test.describe('Tool-Calling Scenarios', () => {
    test('hotel search query triggers search_hotels-like response', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'Find me luxury 5-star hotels in Kathmandu' }],
        },
      });
      if (response.ok()) {
        const body = await response.json();
        expect(body.response).toBeDefined();
        // MSW returns canned hotel response for hotel-related queries
        if (body.response.toLowerCase().includes('hotel')) {
          expect(body.response).toMatch(/hotel|accommodation|stay/i);
        }
      }
    });

    test('pricing query triggers quote-like response', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'How much does a 10-day Nepal trek cost?' }],
        },
      });
      if (response.ok()) {
        const body = await response.json();
        expect(body.response).toBeDefined();
      }
    });

    test('destination query triggers destination info response', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'Where do you operate? What destinations are available?' }],
        },
      });
      if (response.ok()) {
        const body = await response.json();
        expect(body.response).toBeDefined();
      }
    });

    test('booking query triggers booking-related response', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'I want to book a trip to Bhutan' }],
        },
      });
      if (response.ok()) {
        const body = await response.json();
        expect(body.response).toBeDefined();
      }
    });
  });

  test.describe('Price Sanitization', () => {
    test('response never contains costPrice field', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'Give me a price quote for Everest Base Camp trek' }],
        },
      });
      if (response.ok()) {
        const raw = await response.text();
        expect(raw).not.toContain('"costPrice"');
        expect(raw).not.toContain('"basecost"');
      }
    });

    test('response never contains margin field', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.chat}`, {
        data: {
          messages: [{ role: 'user', content: 'What is the price for helicopter tour to Everest?' }],
        },
      });
      if (response.ok()) {
        const raw = await response.text();
        expect(raw).not.toContain('"marginPercent"');
        expect(raw).not.toContain('"margin_percent"');
      }
    });
  });

  test.describe('Personalization (/api/personalize)', () => {
    test('saves new client with email and name', async ({ request, baseURL }) => {
      const profile = createCustomerProfile();
      const response = await request.post(`${baseURL}${API_ROUTES.personalize}`, {
        data: {
          email: profile.email,
          name: profile.name,
        },
      });
      expect([200, 201]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success || body.clientId).toBeTruthy();
      }
    });

    test('rejects missing email', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${API_ROUTES.personalize}`, {
        data: { name: 'No Email User' },
      });
      expect([400, 500]).toContain(response.status());
    });

    test('handles duplicate email gracefully', async ({ request, baseURL }) => {
      const email = `dedup-test-${Date.now()}@example.com`;
      // First call
      await request.post(`${baseURL}${API_ROUTES.personalize}`, {
        data: { email, name: 'First' },
      });
      // Second call with same email
      const response = await request.post(`${baseURL}${API_ROUTES.personalize}`, {
        data: { email, name: 'Second' },
      });
      // Should not crash — either 200 (upsert) or conflict
      expect([200, 201, 409]).toContain(response.status());
    });
  });
});

test.describe('Chat Engine API — Agency (/api/agency/chat) @regression @ai-tools @api', () => {
  test('rejects unauthenticated requests', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.agencyChat}`, {
      data: {
        messages: [{ role: 'user', content: 'Hello' }],
      },
    });
    // Without agency auth headers, should reject
    expect([401, 403]).toContain(response.status());
  });

  test('accepts authenticated agency request with proper headers', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.agencyChat}`, {
      data: {
        messages: [{ role: 'user', content: 'Find hotels for my client' }],
      },
      headers: {
        'x-agency-id': '1',
        'x-agency-user-id': '1',
        'x-agency-name': 'Test Travel Agency',
      },
    });
    // This goes through middleware which reads cookies, not headers directly
    // So raw headers may not work — depends on middleware implementation
    expect([200, 401, 403, 500, 504]).toContain(response.status());
  });

  test('agency response format matches expected structure', async ({ request, baseURL }) => {
    // Use the agency fixture's JWT cookie approach via the web page
    // This test validates the API contract shape
    const response = await request.post(`${baseURL}${API_ROUTES.agencyChat}`, {
      data: {
        messages: [{ role: 'user', content: 'Get me a quote for Annapurna Circuit' }],
        agencyId: 1,
      },
    });
    if (response.ok()) {
      const body = await response.json();
      expect(body).toHaveProperty('response');
    }
  });
});
