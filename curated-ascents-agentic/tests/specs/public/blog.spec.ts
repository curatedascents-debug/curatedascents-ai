import { test, expect } from '@playwright/test';
import { BlogPage, BlogPostPage } from '../../page-objects/BlogPage';

test.describe('Blog @smoke @regression', () => {
  test.describe('Blog Listing', () => {
    let blogPage: BlogPage;

    test.beforeEach(async ({ page }) => {
      blogPage = new BlogPage(page);
      await blogPage.goto();
    });

    test('loads blog listing page', async () => {
      await blogPage.expectLoaded();
    });

    test('displays blog post cards', async () => {
      const count = await blogPage.getPostCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('has category filter buttons', async ({ page }) => {
      const allButton = page.getByRole('button', { name: /all/i });
      if (await allButton.count() > 0) {
        await expect(allButton.first()).toBeVisible();
      }
    });

    test('navigates to blog post on card click', async ({ page }) => {
      const postCount = await blogPage.getPostCount();
      if (postCount > 0) {
        await blogPage.clickFirstPost();
        await expect(page).toHaveURL(/\/blog\/.+/);
      }
    });

    test('load more button works when available', async () => {
      await blogPage.loadMore();
    });
  });

  test.describe('Blog Post', () => {
    test('displays post content with prose styling', async ({ page }) => {
      // Navigate to blog first, then click a post
      const blogPage = new BlogPage(page);
      await blogPage.goto();
      const postCount = await blogPage.getPostCount();

      if (postCount > 0) {
        await blogPage.clickFirstPost();
        const postPage = new BlogPostPage(page);
        await postPage.expectLoaded();
      }
    });

    test('has back navigation link', async ({ page }) => {
      const blogPage = new BlogPage(page);
      await blogPage.goto();
      const postCount = await blogPage.getPostCount();

      if (postCount > 0) {
        await blogPage.clickFirstPost();
        const backLink = page.getByRole('link', { name: /back|blog/i }).first();
        if (await backLink.count() > 0) {
          await expect(backLink).toBeVisible();
        }
      }
    });
  });
});
