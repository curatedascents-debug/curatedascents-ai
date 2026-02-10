import { test, expect } from '@playwright/test';
import { StaticPages } from '../../page-objects/StaticPages';

test.describe('Static Pages', () => {
  let staticPages: StaticPages;

  test.beforeEach(async ({ page }) => {
    staticPages = new StaticPages(page);
  });

  test.describe('FAQ Page', () => {
    test('loads and displays content', async ({ page }) => {
      await staticPages.gotoFaq();
      await expect(page).toHaveURL('/faq');
      await staticPages.expectContentVisible();
    });

    test('has FAQ heading', async () => {
      await staticPages.gotoFaq();
      await staticPages.expectPageTitle(/FAQ|Frequently Asked/i);
    });
  });

  test.describe('Contact Page', () => {
    test('loads and displays content', async ({ page }) => {
      await staticPages.gotoContact();
      await expect(page).toHaveURL('/contact');
      await staticPages.expectContentVisible();
    });

    test('has contact heading', async () => {
      await staticPages.gotoContact();
      await staticPages.expectPageTitle(/Contact/i);
    });
  });

  test.describe('Privacy Policy Page', () => {
    test('loads and displays content', async ({ page }) => {
      await staticPages.gotoPrivacyPolicy();
      await expect(page).toHaveURL('/privacy-policy');
      await staticPages.expectContentVisible();
    });

    test('has privacy policy heading', async () => {
      await staticPages.gotoPrivacyPolicy();
      await staticPages.expectPageTitle(/Privacy/i);
    });
  });

  test.describe('Terms Page', () => {
    test('loads and displays content', async ({ page }) => {
      await staticPages.gotoTerms();
      await expect(page).toHaveURL('/terms');
      await staticPages.expectContentVisible();
    });

    test('has terms heading', async () => {
      await staticPages.gotoTerms();
      await staticPages.expectPageTitle(/Terms/i);
    });
  });
});
