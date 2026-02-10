import { type Page, type Locator, expect } from '@playwright/test';

export class OfflinePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly message: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading').first();
    this.message = page.getByText(/offline|no connection|internet/i);
    this.retryButton = page.getByRole('button', { name: /retry|try again/i });
  }

  async goto() {
    await this.page.goto('/offline');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/offline/);
  }
}
