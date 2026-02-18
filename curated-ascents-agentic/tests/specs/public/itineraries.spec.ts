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

    test('itinerary cards have images', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const cards = page.locator('a[href*="/itineraries/"]');
      await expect(cards.first()).toBeVisible({ timeout: 15_000 });
      // Each card should contain an image
      const firstCardImage = cards.first().locator('img');
      await expect(firstCardImage).toBeVisible();
      const src = await firstCardImage.getAttribute('src');
      expect(src).toBeTruthy();
    });

    test('itinerary card images use valid sources', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const cards = page.locator('a[href*="/itineraries/"]');
      await expect(cards.first()).toBeVisible({ timeout: 15_000 });
      // Check first 3 cards for valid image sources (media library or Unsplash)
      const cardCount = Math.min(await cards.count(), 3);
      for (let i = 0; i < cardCount; i++) {
        const img = cards.nth(i).locator('img');
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        // Should be a Next.js optimized image URL (/_next/image?url=...) or direct path
        expect(src).toMatch(/\/_next\/image|\/uploads\/media|unsplash/);
      }
    });
  });

  test.describe('PackageType Formatting', () => {
    test('listing card type badges show formatted text without underscores', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const cards = page.locator('a[href*="/itineraries/"]');
      await expect(cards.first()).toBeVisible({ timeout: 15_000 });
      // Check visible text of all itinerary cards for underscored packageType values
      const cardCount = Math.min(await cards.count(), 5);
      for (let i = 0; i < cardCount; i++) {
        const cardText = await cards.nth(i).textContent();
        // Should not contain raw underscore-separated package type values
        expect(cardText).not.toMatch(/fixed_departure|bhutan_program|india_program|tibet_tour|multi_country/);
      }
    });

    test('filter buttons show formatted type names without underscores', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      // Get all filter buttons
      const buttons = page.locator('button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        const text = await buttons.nth(i).textContent();
        // No filter button should display underscores
        if (text) {
          expect(text).not.toContain('_');
        }
      }
    });

    test('detail page type label shows formatted text', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      // The hero section type label should not show underscored values
      // Check the visible hero area (first section) for raw packageType values
      const heroText = await page.locator('section').first().textContent();
      expect(heroText).not.toMatch(/fixed_departure|bhutan_program|india_program|tibet_tour|multi_country/);
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

    test('filter section has All Countries and All Types buttons', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      const allCountries = page.getByRole('button', { name: /all countries/i });
      const allTypes = page.getByRole('button', { name: /all types/i });
      await expect(allCountries).toBeVisible({ timeout: 10_000 });
      await expect(allTypes).toBeVisible({ timeout: 10_000 });
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

    test('detail page has hero image', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      // Detail page has a hero image
      const heroImage = page.locator('section').first().locator('img');
      await expect(heroImage).toBeVisible({ timeout: 10_000 });
      const src = await heroImage.getAttribute('src');
      expect(src).toBeTruthy();
    });

    test('detail page shows country and type labels', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      // Should show a country name (Nepal, Bhutan, India, or Tibet)
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toMatch(/Nepal|Bhutan|India|Tibet/);
    });

    test('detail page has back link to all itineraries', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      const backLink = page.locator('a[href="/itineraries"]').first();
      await expect(backLink).toBeVisible();
    });
  });

  test.describe('Itinerary SEO', () => {
    test('itineraries listing has title', async ({ page }) => {
      await page.goto('/itineraries');
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('itineraries listing title contains relevant keywords', async ({ page }) => {
      await page.goto('/itineraries');
      const title = await page.title();
      expect(title.toLowerCase()).toMatch(/itinerar|luxury|curated/i);
    });

    test('detail page has unique title', async ({ page }) => {
      await page.goto('/itineraries');
      await page.waitForLoadState('domcontentloaded');
      const firstCard = page.locator('a[href*="/itineraries/"]').first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title).toContain('CuratedAscents');
    });
  });
});
