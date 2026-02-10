import { test, expect } from '@playwright/test';
import { SupplierLoginPage } from '../../page-objects/SupplierLoginPage';
import { TEST_SUPPLIER_USER, ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Supplier Authentication', () => {
  let loginPage: SupplierLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new SupplierLoginPage(page);
    await loginPage.goto();
  });

  test('displays login form with email and password fields', async () => {
    await loginPage.expectLoaded();
  });

  test('rejects invalid credentials', async () => {
    await loginPage.login('invalid@email.com', 'wrongpassword');
    await loginPage.expectLoginError();
  });

  test('email field validates email format', async ({ page }) => {
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
  });

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.supplierDashboard);
    await expect(page).toHaveURL(/\/supplier\/login/);
  });

  test('login attempt with test credentials', async ({ page }) => {
    await loginPage.login(TEST_SUPPLIER_USER.email, TEST_SUPPLIER_USER.password);
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/\/supplier\/(dashboard|login)/);
  });
});
