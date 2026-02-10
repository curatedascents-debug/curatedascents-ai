import { type Page, type Locator, expect } from '@playwright/test';

export class PortalQuotesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly quoteCards: Locator;
  readonly statusFilters: Locator;
  readonly emptyState: Locator;
  readonly quoteAmount: Locator;
  readonly acceptButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.quoteCards = page.locator('[class*="bg-slate-800"][class*="rounded"]');
    this.statusFilters = page.locator('button[class*="rounded"]');
    this.emptyState = page.getByText(/no quotes|nothing yet/i);
    this.quoteAmount = page.locator('[class*="font-bold"], [class*="text-emerald"]');
    this.acceptButton = page.getByRole('button', { name: /accept|approve/i });
  }

  async goto() {
    await this.page.goto('/portal/quotes');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/portal\/quotes/);
  }

  async getQuoteCount(): Promise<number> {
    return this.quoteCards.count();
  }

  async clickQuote(index = 0) {
    await this.quoteCards.nth(index).click();
  }

  async expectQuoteDetails() {
    await expect(this.page).toHaveURL(/\/portal\/quotes\/.+/);
  }

  async expectNoCostData() {
    const content = await this.page.content();
    expect(content).not.toContain('costPrice');
    expect(content).not.toContain('marginPercent');
  }
}
