import { type Page, type Locator, expect } from '@playwright/test';

export class BlogPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly blogCards: Locator;
  readonly categoryButtons: Locator;
  readonly loadMoreButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.blogCards = page.locator('article, [class*="blog-card"], a[href*="/blog/"]');
    this.categoryButtons = page.locator('button[class*="rounded"]');
    this.loadMoreButton = page.getByRole('button', { name: /load more/i });
    this.searchInput = page.locator('input[placeholder*="Search"]');
  }

  async goto() {
    await this.page.goto('/blog');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL('/blog');
  }

  async getPostCount(): Promise<number> {
    return this.blogCards.count();
  }

  async clickFirstPost() {
    await this.blogCards.first().click();
  }

  async clickCategory(name: string) {
    await this.page.getByRole('button', { name }).click();
  }

  async loadMore() {
    if (await this.loadMoreButton.isVisible()) {
      await this.loadMoreButton.click();
    }
  }

  async expectPostPage() {
    await expect(this.page).toHaveURL(/\/blog\/.+/);
    await expect(this.page.locator('[class*="prose"], article')).toBeVisible();
  }
}

export class BlogPostPage {
  readonly page: Page;
  readonly title: Locator;
  readonly content: Locator;
  readonly backLink: Locator;
  readonly featuredImage: Locator;
  readonly metadata: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { level: 1 }).first();
    this.content = page.locator('[class*="prose"]').first();
    this.backLink = page.getByRole('link', { name: /back/i }).first();
    this.featuredImage = page.locator('img').first();
    this.metadata = page.locator('[class*="text-slate-400"]').first();
  }

  async goto(slug: string) {
    await this.page.goto(`/blog/${slug}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.title).toBeVisible();
  }

  async goBack() {
    await this.backLink.click();
    await expect(this.page).toHaveURL('/blog');
  }
}
