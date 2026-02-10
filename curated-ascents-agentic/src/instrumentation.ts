/**
 * Next.js instrumentation hook.
 * When ENABLE_MSW=true, starts MSW to intercept external API calls
 * (DeepSeek, Cloudflare R2, Stripe, Resend) during E2E tests.
 */
export async function register() {
  if (process.env.ENABLE_MSW === 'true') {
    if (typeof window === 'undefined') {
      // Server-side only — dynamically import the MSW server
      const { startMswServer } = await import('../tests/msw/server');
      startMswServer();
    }
  }
}
