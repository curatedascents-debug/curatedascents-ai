import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroSection: Locator;
  readonly navigation: Locator;
  readonly chatWidget: Locator;
  readonly experiencesSection: Locator;
  readonly testimonialsSection: Locator;
  readonly destinationsSection: Locator;
  readonly footer: Locator;
  readonly planJourneyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroSection = page.locator('section').first();
    this.navigation = page.locator('nav, header').first();
    this.chatWidget = page.locator('[class*="fixed"][class*="bottom"]').last();
    this.experiencesSection = page.locator('#experiences, section:has-text("Experience")').first();
    this.testimonialsSection = page.locator('#testimonials');
    this.destinationsSection = page.locator('#destinations, section:has-text("Destination")').first();
    this.footer = page.locator('footer');
    this.planJourneyButton = page.getByRole('button', { name: /plan your journey/i }).first();
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL('/');
    await expect(this.navigation).toBeVisible();
  }

  async expectHeroVisible() {
    await expect(this.heroSection).toBeVisible();
  }

  async expectFooterVisible() {
    await this.footer.scrollIntoViewIfNeeded();
    await expect(this.footer).toBeVisible();
  }

  async clickPlanJourney() {
    await this.planJourneyButton.click();
  }

  async navigateToBlog() {
    await this.page.getByRole('link', { name: /blog/i }).first().click();
  }

  async scrollToTestimonials() {
    await this.testimonialsSection.scrollIntoViewIfNeeded();
  }

  async scrollToDestinations() {
    if (await this.destinationsSection.count() > 0) {
      await this.destinationsSection.scrollIntoViewIfNeeded();
    }
  }
}
