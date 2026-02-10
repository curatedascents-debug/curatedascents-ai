import { type Page, type Locator, expect } from '@playwright/test';

export class PortalLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly sendCodeButton: Locator;
  readonly codeInputs: Locator;
  readonly errorMessage: Locator;
  readonly resendButton: Locator;
  readonly changeEmailLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.sendCodeButton = page.getByRole('button', { name: /send.*code|verify.*email|continue/i });
    this.codeInputs = page.locator('input[inputmode="numeric"], input[maxlength="1"]');
    this.errorMessage = page.locator('[class*="text-red"]');
    this.resendButton = page.getByRole('button', { name: /resend/i });
    this.changeEmailLink = page.getByText(/change.*email|back/i);
  }

  async goto() {
    await this.page.goto('/portal/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.emailInput).toBeVisible();
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
    await this.sendCodeButton.click();
  }

  async enterCode(code: string) {
    const digits = code.split('');
    const inputs = await this.codeInputs.all();
    for (let i = 0; i < Math.min(digits.length, inputs.length); i++) {
      await inputs[i].fill(digits[i]);
    }
  }

  async expectCodeStep() {
    await expect(this.codeInputs.first()).toBeVisible();
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/\/portal(?!\/login)/);
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }
}
