import { type Page, type Locator, expect } from '@playwright/test';

export class CurrencyConverterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly amountInput: Locator;
  readonly fromSelect: Locator;
  readonly toSelect: Locator;
  readonly convertButton: Locator;
  readonly result: Locator;
  readonly rateDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.amountInput = page.locator('input[type="number"], input[placeholder*="amount" i]').first();
    this.fromSelect = page.locator('select').first();
    this.toSelect = page.locator('select').last();
    this.convertButton = page.getByRole('button', { name: /convert/i });
    this.result = page.locator('[class*="text-2xl"], [class*="text-3xl"], [class*="font-bold"]').first();
    this.rateDisplay = page.locator('[class*="text-slate-400"]');
  }

  async goto() {
    await this.page.goto('/portal/currency');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/portal\/currency/);
  }

  async convert(amount: string, from?: string, to?: string) {
    await this.amountInput.fill(amount);
    if (from) await this.fromSelect.selectOption(from);
    if (to) await this.toSelect.selectOption(to);
    if (await this.convertButton.isVisible()) {
      await this.convertButton.click();
    }
  }
}
