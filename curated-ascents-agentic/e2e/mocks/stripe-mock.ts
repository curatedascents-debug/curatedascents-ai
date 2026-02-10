import { type Page, type Route } from '@playwright/test';

/** Mock Stripe checkout session creation */
export async function mockStripeCheckout(page: Page) {
  await page.route('**/api/payments/checkout', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId: 'cs_test_mock_session_id',
        url: 'https://checkout.stripe.com/test/mock-session',
      }),
    });
  });
}

/** Mock Stripe payment status check */
export async function mockStripePaymentStatus(page: Page, status: 'paid' | 'unpaid' | 'pending' = 'paid') {
  await page.route('**/api/payments/status**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status,
        amount: 1455,
        currency: 'usd',
        bookingRef: 'CA-2024-001',
      }),
    });
  });
}
