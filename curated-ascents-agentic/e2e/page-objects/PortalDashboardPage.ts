import { type Page, type Locator, expect } from '@playwright/test';

export class PortalDashboardPage {
  readonly page: Page;
  readonly upcomingTrip: Locator;
  readonly chatButton: Locator;
  readonly quotesButton: Locator;
  readonly currencyButton: Locator;
  readonly loyaltySummary: Locator;
  readonly recentQuotes: Locator;
  readonly recentPayments: Locator;

  constructor(page: Page) {
    this.page = page;
    this.upcomingTrip = page.locator('[class*="emerald-600"]').first();
    this.chatButton = page.getByText('Chat').first();
    this.quotesButton = page.getByText('Quotes').first();
    this.currencyButton = page.getByText('Currency').first();
    this.loyaltySummary = page.locator('[class*="amber"]').first();
    this.recentQuotes = page.getByText(/recent quotes/i);
    this.recentPayments = page.getByText(/recent payments/i);
  }

  async goto() {
    await this.page.goto('/portal');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL('/portal');
  }

  async navigateToChat() {
    await this.chatButton.click();
    await expect(this.page).toHaveURL(/\/portal\/chat/);
  }

  async navigateToQuotes() {
    await this.quotesButton.click();
    await expect(this.page).toHaveURL(/\/portal\/quotes/);
  }

  async navigateToCurrency() {
    await this.currencyButton.click();
    await expect(this.page).toHaveURL(/\/portal\/currency/);
  }
}
