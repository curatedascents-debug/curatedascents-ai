/**
 * Next.js instrumentation hook.
 * - Environment variable audit: warns if secrets leak via NEXT_PUBLIC_ prefix
 * - When ENABLE_MSW=true, starts MSW to intercept external API calls
 *   (DeepSeek, Cloudflare R2, Stripe, Resend) during E2E tests.
 */
export async function register() {
  // Environment variable security audit
  const sensitivePatterns = [
    'DATABASE_URL',
    'DEEPSEEK_API_KEY',
    'RESEND_API_KEY',
    'ADMIN_PASSWORD',
    'ADMIN_SESSION_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CRON_SECRET',
    'CUSTOMER_JWT_SECRET',
    'AGENCY_JWT_SECRET',
    'SUPPLIER_JWT_SECRET',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
  ];

  for (const key of sensitivePatterns) {
    const publicKey = `NEXT_PUBLIC_${key}`;
    if (process.env[publicKey]) {
      console.error(
        `[SECURITY] Secret "${key}" is exposed as "${publicKey}". ` +
        `Remove the NEXT_PUBLIC_ prefix — this value must not be sent to the browser.`
      );
    }
  }

  if (process.env.ENABLE_MSW === 'true') {
    if (typeof window === 'undefined') {
      // Server-side only — dynamically import the MSW server
      const { startMswServer } = await import('../tests/msw/server');
      startMswServer();
    }
  }
}
