import { http, HttpResponse } from 'msw';

/**
 * Mock Stripe API.
 * Intercepts checkout session creation and other Stripe calls.
 */
export const stripeHandlers = [
  // Create checkout session
  http.post('https://api.stripe.com/v1/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'cs_test_mock_' + Date.now(),
      object: 'checkout.session',
      url: 'https://checkout.stripe.com/test/mock-session',
      payment_status: 'unpaid',
      status: 'open',
      amount_total: 145500,
      currency: 'usd',
    });
  }),

  // Retrieve checkout session
  http.get(/https:\/\/api\.stripe\.com\/v1\/checkout\/sessions\/.*/, () => {
    return HttpResponse.json({
      id: 'cs_test_mock_session',
      object: 'checkout.session',
      payment_status: 'paid',
      status: 'complete',
      amount_total: 145500,
      currency: 'usd',
      customer_email: 'test@customer.com',
    });
  }),

  // Create payment intent
  http.post('https://api.stripe.com/v1/payment_intents', () => {
    return HttpResponse.json({
      id: 'pi_test_mock_' + Date.now(),
      object: 'payment_intent',
      status: 'succeeded',
      amount: 145500,
      currency: 'usd',
    });
  }),

  // Construct webhook event (catch-all for other Stripe endpoints)
  http.all(/https:\/\/api\.stripe\.com\/v1\/.*/, ({ request }) => {
    return HttpResponse.json({
      object: 'list',
      data: [],
      has_more: false,
    });
  }),
];
