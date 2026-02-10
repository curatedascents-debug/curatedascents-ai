import { type APIRequestContext } from '@playwright/test';
import { API_ROUTES } from '../fixtures/test-data.fixture';

/** Helper to make authenticated admin API calls */
export async function adminApiGet(request: APIRequestContext, endpoint: string, adminCookie: string) {
  return request.get(endpoint, {
    headers: { Cookie: `admin_session=${adminCookie}` },
  });
}

export async function adminApiPost(request: APIRequestContext, endpoint: string, data: unknown, adminCookie: string) {
  return request.post(endpoint, {
    data,
    headers: { Cookie: `admin_session=${adminCookie}` },
  });
}

/** Seed the database via the seed-all endpoint */
export async function seedDatabase(request: APIRequestContext, baseURL: string) {
  const response = await request.get(`${baseURL}${API_ROUTES.seedAll}`);
  return response;
}

/** Get blog posts via API */
export async function getBlogPosts(request: APIRequestContext, baseURL: string, params?: { limit?: number; offset?: number; category?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.category) searchParams.set('category', params.category);
  const url = `${baseURL}${API_ROUTES.blogPosts}?${searchParams.toString()}`;
  return request.get(url);
}

/** Send a chat message via API */
export async function sendChatMessage(request: APIRequestContext, baseURL: string, messages: Array<{ role: string; content: string }>) {
  return request.post(`${baseURL}${API_ROUTES.chat}`, {
    data: { messages },
  });
}

/** Get currency rates via API */
export async function getCurrencyRates(request: APIRequestContext, baseURL: string) {
  return request.get(`${baseURL}${API_ROUTES.currencyRates}`);
}

/** Convert currency via API */
export async function convertCurrency(request: APIRequestContext, baseURL: string, from: string, to: string, amount: number) {
  return request.post(`${baseURL}${API_ROUTES.currencyConvert}`, {
    data: { from, to, amount },
  });
}

/** Get homepage media via API */
export async function getHomepageMedia(request: APIRequestContext, baseURL: string) {
  return request.get(`${baseURL}${API_ROUTES.mediaHomepage}`);
}

/** Portal auth: send verification code */
export async function portalSendCode(request: APIRequestContext, baseURL: string, email: string) {
  return request.post(`${baseURL}${API_ROUTES.portalSendCode}`, {
    data: { email },
  });
}

/** Portal auth: verify code */
export async function portalVerifyCode(request: APIRequestContext, baseURL: string, email: string, code: string) {
  return request.post(`${baseURL}${API_ROUTES.portalVerifyCode}`, {
    data: { email, code },
  });
}
