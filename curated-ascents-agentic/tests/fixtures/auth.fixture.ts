import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { SignJWT } from 'jose';
import { TEST_ADMIN, TEST_AGENCY_USER, TEST_SUPPLIER_USER, TEST_CUSTOMER } from './test-data.fixture';

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

/**
 * Generate a JWT token using jose, matching the app's signing pattern.
 */
async function generateJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn = '7d'
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

type AuthFixtures = {
  guestContext: BrowserContext;
  guestPage: Page;
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
  // Guest — clean context with no auth cookies
  guestContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await context.clearCookies();
    await use(context);
    await context.close();
  },

  guestPage: async ({ guestContext }, use) => {
    const page = await guestContext.newPage();
    await use(page);
    await page.close();
  },

  // Admin — hash-based session token cookie
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

  // Agency — JWT generated programmatically via jose (no API call needed)
  agencyContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const secret = process.env.AGENCY_JWT_SECRET || 'test-agency-jwt-secret-for-e2e-testing-32chars';
    const token = await generateJwt(
      {
        userId: 1,
        agencyId: 1,
        email: TEST_AGENCY_USER.email,
        role: 'admin',
        agencySlug: 'test-travel-agency',
        agencyName: TEST_AGENCY_USER.agencyName,
      },
      secret
    );
    await context.addCookies([{
      name: 'agency_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }]);
    await use(context);
    await context.close();
  },

  agencyPage: async ({ agencyContext }, use) => {
    const page = await agencyContext.newPage();
    await use(page);
    await page.close();
  },

  // Supplier — JWT generated programmatically via jose (no API call needed)
  supplierContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const secret = process.env.SUPPLIER_JWT_SECRET || process.env.AGENCY_JWT_SECRET || 'test-supplier-jwt-secret-for-e2e-tests-32chars';
    const token = await generateJwt(
      {
        userId: 1,
        supplierId: 1,
        email: TEST_SUPPLIER_USER.email,
        role: 'supplier',
        supplierName: TEST_SUPPLIER_USER.supplierName,
      },
      secret
    );
    await context.addCookies([{
      name: 'supplier_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }]);
    await use(context);
    await context.close();
  },

  supplierPage: async ({ supplierContext }, use) => {
    const page = await supplierContext.newPage();
    await use(page);
    await page.close();
  },

  // Portal (Customer) — JWT generated programmatically via jose
  portalContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const secret = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_SESSION_SECRET || 'test-customer-jwt-secret-for-e2e-32chars';
    const token = await generateJwt(
      {
        clientId: TEST_CUSTOMER.clientId,
        email: TEST_CUSTOMER.email,
        name: TEST_CUSTOMER.name,
      },
      secret,
      '30d'
    );
    await context.addCookies([{
      name: 'customer_session',
      value: token,
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
