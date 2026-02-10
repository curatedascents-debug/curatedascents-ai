import { test, expect } from '@playwright/test';
import { AdminLoginPage } from '../../page-objects/AdminLoginPage';
import { TEST_ADMIN, ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Admin Authentication @smoke @auth', () => {
  let loginPage: AdminLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    await loginPage.goto();
  });

  test('displays login form', async () => {
    await loginPage.expectLoaded();
  });

  test('rejects invalid password', async () => {
    await loginPage.login('wrong-password');
    await loginPage.expectLoginError();
  });

  test('accepts valid password and redirects to dashboard', async ({ page }) => {
    await loginPage.login(TEST_ADMIN.password);
    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  test('unauthenticated access redirects to login', async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();
    await page.goto(ROUTES.admin);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('password field has password type', async () => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
