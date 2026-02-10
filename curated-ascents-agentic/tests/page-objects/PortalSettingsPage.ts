import { type Page, type Locator, expect } from '@playwright/test';

export class PortalSettingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly countryInput: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    this.emailInput = page.locator('input[type="email"]').first();
    this.phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]').first();
    this.countryInput = page.locator('input[name="country"], select[name="country"]').first();
    this.saveButton = page.getByRole('button', { name: /save|update/i });
    this.successMessage = page.locator('[class*="text-emerald"], [class*="text-green"]');
  }

  async goto() {
    await this.page.goto('/portal/settings');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/portal\/settings/);
  }

  async updateProfile(data: { name?: string; phone?: string }) {
    if (data.name && await this.nameInput.isVisible()) {
      await this.nameInput.fill(data.name);
    }
    if (data.phone && await this.phoneInput.isVisible()) {
      await this.phoneInput.fill(data.phone);
    }
    if (await this.saveButton.isVisible()) {
      await this.saveButton.click();
    }
  }
}
