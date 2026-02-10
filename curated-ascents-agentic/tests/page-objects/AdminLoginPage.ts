import { type Page, type Locator, expect } from '@playwright/test';

export class AdminLoginPage {
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: /sign in|log in|login|enter/i });
    this.errorMessage = page.locator('[class*="text-red"]');
  }

  async goto() {
    await this.page.goto('/admin/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.passwordInput).toBeVisible();
  }

  async login(password: string) {
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/\/admin(?!\/login)/);
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }
}
