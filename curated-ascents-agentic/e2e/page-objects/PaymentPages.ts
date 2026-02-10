import { type Page, type Locator, expect } from '@playwright/test';

export class PaymentSuccessPage {
  readonly page: Page;
  readonly successMessage: Locator;
  readonly bookingRef: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successMessage = page.getByText(/success|confirmed|thank you/i).first();
    this.bookingRef = page.locator('[class*="font-mono"], [class*="font-bold"]').first();
  }

  async goto(sessionId = 'cs_test_mock') {
    await this.page.goto(`/payment/success?session_id=${sessionId}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/payment\/success/);
  }
}

export class PaymentCancelledPage {
  readonly page: Page;
  readonly cancelMessage: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cancelMessage = page.getByText(/cancel|not completed/i).first();
    this.retryButton = page.getByRole('link', { name: /try again|retry|back/i }).first();
  }

  async goto() {
    await this.page.goto('/payment/cancelled');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/payment\/cancelled/);
  }
}
