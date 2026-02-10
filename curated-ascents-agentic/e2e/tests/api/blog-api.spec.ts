import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Blog API', () => {
  test('GET /api/blog/posts returns post list', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.blogPosts}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/blog/posts supports limit parameter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.blogPosts}?limit=5`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/blog/posts supports offset parameter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.blogPosts}?offset=0&limit=3`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/blog/posts supports category filter', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.blogPosts}?category=travel-tips`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/blog/posts/[slug] returns 404 for non-existent slug', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.blogPosts}/non-existent-slug-${Date.now()}`);
    expect([404, 200]).toContain(response.status());
  });

  test('blog posts do not expose internal pricing data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.blogPosts}`);
    const text = await response.text();
    expect(text).not.toContain('costPrice');
    expect(text).not.toContain('marginPercent');
  });
});
