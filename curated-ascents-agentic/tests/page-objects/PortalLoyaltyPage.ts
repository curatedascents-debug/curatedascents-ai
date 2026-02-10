import { type Page, type Locator, expect } from '@playwright/test';

export class PortalLoyaltyPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tierBadge: Locator;
  readonly pointsBalance: Locator;
  readonly transactionHistory: Locator;
  readonly tierProgress: Locator;
  readonly tierCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.tierBadge = page.locator('[class*="rounded-full"], [class*="badge"]').first();
    this.pointsBalance = page.locator('[class*="text-2xl"], [class*="text-3xl"]').first();
    this.transactionHistory = page.locator('table, [class*="transaction"]');
    this.tierProgress = page.locator('[class*="progress"], [class*="w-full"][class*="bg-"]');
    this.tierCards = page.locator('[class*="bg-slate-800"]');
  }

  async goto() {
    await this.page.goto('/portal/loyalty');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/portal\/loyalty/);
  }

  async expectTierInfo() {
    const content = await this.page.content();
    const hasTier = /bronze|silver|gold|platinum/i.test(content);
    expect(hasTier).toBeTruthy();
  }
}
