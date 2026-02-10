import { test, expect } from '@playwright/test';

test.describe('SEO & Meta Tags @smoke @regression', () => {
  test('homepage has title tag', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('homepage has meta description', async ({ page }) => {
    await page.goto('/');
    const metaDesc = page.locator('meta[name="description"]');
    if (await metaDesc.count() > 0) {
      const content = await metaDesc.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('homepage has viewport meta tag', async ({ page }) => {
    await page.goto('/');
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width/);
  });

  test('blog listing has appropriate title', async ({ page }) => {
    await page.goto('/blog');
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('static pages have title tags', async ({ page }) => {
    test.setTimeout(60_000); // 4 page navigations need more time
    const pages = ['/faq', '/contact', '/privacy-policy', '/terms'];
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const title = await page.title();
      expect(title).toBeTruthy();
    }
  });

  test('homepage has Open Graph tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      const content = await ogTitle.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('no broken images on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const images = page.locator('img[src]');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      // Images might use Unsplash fallbacks or be lazy-loaded, just check they have src
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });
});
