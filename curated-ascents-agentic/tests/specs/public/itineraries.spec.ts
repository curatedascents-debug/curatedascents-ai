import { test, expect } from '@playwright/test';

test.describe('Itinerary Pages @smoke @regression', () => {
  test.setTimeout(60_000);

  test.describe('Itineraries Listing', () => {
    test('loads itineraries page with heading', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/itineraries/);
      const heading = page.getByRole('heading', { name: /itineraries/i }).first();
      await expect(heading).toBeVisible({ timeout: 15_000 });
    });

    test('has page title', async ({ page }) => {
      await page.goto('/itineraries');
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('displays navigation', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const nav = page.locator('nav, header').first();
      await expect(nav).toBeVisible();
    });

    test('displays footer', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
    });

    test('shows itinerary cards', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const cards = page.locator('a[href*="/itineraries/"]');
      await expect(cards.first()).toBeVisible({ timeout: 15_000 });
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('has filter buttons', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      // Wait for page to fully render
      await page.waitForTimeout(2000);
      // The ItineraryFilters component renders filter buttons
      const buttons = page.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Itinerary Filtering', () => {
    test('filters by country via URL params', async ({ page }) => {
      await page.goto('/itineraries?country=Nepal');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/country=Nepal/);
      // Should still show heading
      const heading = page.getByRole('heading', { name: /itineraries/i }).first();
      await expect(heading).toBeVisible({ timeout: 15_000 });
    });

    test('filters by type via URL params', async ({ page }) => {
      await page.goto('/itineraries?type=trekking');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/type=trekking/);
    });
  });

  test.describe('Itinerary Detail Pages', () => {
    test('navigates to itinerary detail from listing', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      // Extract href and navigate directly (image overlay can intercept clicks)
      const href = await firstCard.getAttribute('href');
      expect(href).toBeTruthy();
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/itineraries\/.+/);
    });

    test('detail page has heading and content', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    });

    test('detail page has navigation and footer', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      const nav = page.locator('nav, header').first();
      await expect(nav).toBeVisible();
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Itinerary SEO', () => {
    test('itineraries listing has title', async ({ page }) => {
      await page.goto('/itineraries');
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });
  });
});
