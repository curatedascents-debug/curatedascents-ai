/**
 * Stripe Client Configuration
 * Server-side Stripe SDK initialization
 */

import Stripe from "stripe";

// Create a lazy-initialized stripe client to avoid build errors when env vars are missing
let _stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripeClient;
}

// Getter for backwards compatibility - will throw if key not set
export const stripe = {
  get checkout() {
    return getStripeClient().checkout;
  },
  get products() {
    return getStripeClient().products;
  },
  get prices() {
    return getStripeClient().prices;
  },
  get paymentLinks() {
    return getStripeClient().paymentLinks;
  },
  get webhooks() {
    return getStripeClient().webhooks;
  },
};

// Public key for client-side (safe to expose)
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
