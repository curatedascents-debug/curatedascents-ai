import { test, expect } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';

test.describe('Homepage', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('loads successfully', async () => {
    await homePage.expectLoaded();
  });

  test('displays hero section', async () => {
    await homePage.expectHeroVisible();
  });

  test('displays navigation with key links', async ({ page }) => {
    await expect(page.locator('nav, header').first()).toBeVisible();
    await expect(page.getByText(/CuratedAscents/i).first()).toBeVisible();
  });

  test('displays footer', async () => {
    await homePage.expectFooterVisible();
  });

  test('has chat widget floating button', async ({ page }) => {
    const chatButton = page.locator('[class*="fixed"][class*="bottom"]').last();
    await expect(chatButton).toBeVisible();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/CuratedAscents|Luxury|Adventure/i);
  });

  test('testimonials section is scrollable', async ({ page }) => {
    const testimonials = page.locator('#testimonials');
    if (await testimonials.count() > 0) {
      await testimonials.scrollIntoViewIfNeeded();
      await expect(testimonials).toBeVisible();
    }
  });

  test('responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
