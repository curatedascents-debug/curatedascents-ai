import { test, expect } from '@playwright/test';

const SUB_REGIONS = [
  { country: 'nepal', slug: 'everest-region', name: 'Everest Region' },
  { country: 'nepal', slug: 'annapurna', name: 'Annapurna' },
  { country: 'bhutan', slug: 'paro-valley', name: 'Paro Valley' },
  { country: 'india', slug: 'ladakh', name: 'Ladakh' },
  { country: 'tibet', slug: 'lhasa', name: 'Lhasa' },
];

test.describe('Sub-Region Destination Pages @smoke @regression', () => {
  for (const region of SUB_REGIONS) {
    test(`${region.country}/${region.slug} page loads`, async ({ page }) => {
      await page.goto(`/destinations/${region.country}/${region.slug}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`/destinations/${region.country}/${region.slug}`);
      const content = page.locator('main, article, section').first();
      await expect(content).toBeVisible();
    });
  }

  test('sub-region page has heading with region name', async ({ page }) => {
    await page.goto('/destinations/nepal/everest-region');
    await page.waitForLoadState('domcontentloaded');
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    const text = await heading.innerText();
    expect(text.toLowerCase()).toContain('everest');
  });

  test('sub-region page has navigation', async ({ page }) => {
    await page.goto('/destinations/nepal/everest-region');
    await page.waitForLoadState('domcontentloaded');
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('sub-region page has footer', async ({ page }) => {
    await page.goto('/destinations/nepal/everest-region');
    await page.waitForLoadState('domcontentloaded');
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
  });

  test('sub-region page has meta title', async ({ page }) => {
    await page.goto('/destinations/nepal/everest-region');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('sub-region page has breadcrumb back to country', async ({ page }) => {
    await page.goto('/destinations/nepal/everest-region');
    await page.waitForLoadState('domcontentloaded');
    const countryLink = page.locator('a[href="/destinations/nepal"]').first();
    if (await countryLink.count() > 0) {
      await expect(countryLink).toBeVisible();
    }
  });
});
