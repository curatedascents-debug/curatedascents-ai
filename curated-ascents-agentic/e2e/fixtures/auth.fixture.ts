import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { TEST_ADMIN, TEST_AGENCY_USER, TEST_SUPPLIER_USER, TEST_CUSTOMER, API_ROUTES } from './test-data.fixture';

/**
 * Generate admin session token matching the app's hash algorithm.
 * See: src/app/api/admin/auth/login/route.ts
 */
function generateAdminToken(password: string, secret: string): string {
  const combined = password + secret;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `session_${Math.abs(hash).toString(36)}`;
}

type AuthFixtures = {
  adminContext: BrowserContext;
  adminPage: Page;
  agencyContext: BrowserContext;
  agencyPage: Page;
  supplierContext: BrowserContext;
  supplierPage: Page;
  portalContext: BrowserContext;
  portalPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const token = generateAdminToken(
      TEST_ADMIN.password,
      process.env.ADMIN_SESSION_SECRET || 'curated-ascents-default-secret'
    );
    await context.addCookies([{
      name: 'admin_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }]);
    await use(context);
    await context.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },

  agencyContext: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      const response = await page.request.post(`${baseURL}${API_ROUTES.agencyLogin}`, {
        data: {
          email: TEST_AGENCY_USER.email,
          password: TEST_AGENCY_USER.password,
        },
      });
      if (!response.ok()) {
        console.warn('Agency login failed — tests using agencyPage may fail. Ensure test agency user exists.');
      }
    } catch {
      console.warn('Agency login request failed — agency fixture unavailable.');
    }
    await page.close();
    await use(context);
    await context.close();
  },

  agencyPage: async ({ agencyContext }, use) => {
    const page = await agencyContext.newPage();
    await use(page);
    await page.close();
  },

  supplierContext: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      const response = await page.request.post(`${baseURL}${API_ROUTES.supplierLogin}`, {
        data: {
          email: TEST_SUPPLIER_USER.email,
          password: TEST_SUPPLIER_USER.password,
        },
      });
      if (!response.ok()) {
        console.warn('Supplier login failed — tests using supplierPage may fail. Ensure test supplier user exists.');
      }
    } catch {
      console.warn('Supplier login request failed — supplier fixture unavailable.');
    }
    await page.close();
    await use(context);
    await context.close();
  },

  supplierPage: async ({ supplierContext }, use) => {
    const page = await supplierContext.newPage();
    await use(page);
    await page.close();
  },

  portalContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    // For the customer portal, we directly set a JWT cookie
    // matching the app's jose HS256 signing (see customer-auth.ts).
    // In tests that need this, we use the API route with a mock
    // or set a pre-generated cookie. For simplicity, we set a
    // dummy customer_session cookie that will be verified by middleware.
    // In practice, tests should call the send-code/verify-code flow
    // or mock the verification.
    await context.addCookies([{
      name: 'customer_session',
      value: 'e2e-test-token-placeholder',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }]);
    await use(context);
    await context.close();
  },

  portalPage: async ({ portalContext }, use) => {
    const page = await portalContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
export { generateAdminToken };
