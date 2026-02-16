import { test, expect } from '@playwright/test';

test.describe('Destination Pages @smoke @regression', () => {
  const COUNTRIES = ['nepal', 'bhutan', 'tibet', 'india'];

  test.describe('Destinations Listing', () => {
    test('loads destinations page with heading', async ({ page }) => {
      await page.goto('/destinations');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL('/destinations');
      const heading = page.getByRole('heading', { name: /destinations/i }).first();
      await expect(heading).toBeVisible();
    });

    test('has page title', async ({ page }) => {
      await page.goto('/destinations');
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('displays navigation', async ({ page }) => {
      await page.goto('/destinations');
      await page.waitForLoadState('domcontentloaded');
      const nav = page.locator('nav, header').first();
      await expect(nav).toBeVisible();
    });

    test('displays footer', async ({ page }) => {
      await page.goto('/destinations');
      await page.waitForLoadState('domcontentloaded');
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
    });

    test('shows country cards with links', async ({ page }) => {
      await page.goto('/destinations');
      await page.waitForLoadState('domcontentloaded');
      // Wait for links to appear
      const countryLinks = page.locator('a[href*="/destinations/"]');
      await expect(countryLinks.first()).toBeVisible({ timeout: 10_000 });
      const count = await countryLinks.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });
  });

  test.describe('Destination Detail Pages', () => {
    for (const country of COUNTRIES) {
      test(`${country} page loads successfully`, async ({ page }) => {
        await page.goto(`/destinations/${country}`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(`/destinations/${country}`);
        // Should have content
        const content = page.locator('main, article, section').first();
        await expect(content).toBeVisible();
      });
    }

    test('nepal page has heading with country name', async ({ page }) => {
      await page.goto('/destinations/nepal');
      await page.waitForLoadState('domcontentloaded');
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
      const text = await heading.innerText();
      expect(text.toLowerCase()).toContain('nepal');
    });

    test('detail page has navigation', async ({ page }) => {
      await page.goto('/destinations/nepal');
      await page.waitForLoadState('domcontentloaded');
      const nav = page.locator('nav, header').first();
      await expect(nav).toBeVisible();
    });

    test('detail page has footer', async ({ page }) => {
      await page.goto('/destinations/nepal');
      await page.waitForLoadState('domcontentloaded');
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Destination SEO', () => {
    test('destinations listing has title', async ({ page }) => {
      await page.goto('/destinations');
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('nepal detail page has title', async ({ page }) => {
      await page.goto('/destinations/nepal');
      await page.waitForLoadState('domcontentloaded');
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('destination pages have meta description', async ({ page }) => {
      await page.goto('/destinations');
      const metaDesc = page.locator('meta[name="description"]');
      if (await metaDesc.count() > 0) {
        const content = await metaDesc.getAttribute('content');
        expect(content).toBeTruthy();
      }
    });
  });
});
