import { type Page, expect } from '@playwright/test';

export class StaticPages {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoFaq() {
    await this.page.goto('/faq');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoContact() {
    await this.page.goto('/contact');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoPrivacyPolicy() {
    await this.page.goto('/privacy-policy');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoTerms() {
    await this.page.goto('/terms');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPageTitle(title: string) {
    const heading = this.page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toContainText(title);
  }

  async expectContentVisible() {
    const content = this.page.locator('main, [class*="prose"], article, [class*="container"]').first();
    await expect(content).toBeVisible();
  }

  async expectFooterVisible() {
    const footer = this.page.locator('footer');
    if (await footer.count() > 0) {
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
    }
  }
}
