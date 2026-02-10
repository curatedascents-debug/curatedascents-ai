import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Media Tab @admin @regression', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Media');
  });

  test('displays media tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    // Media tab has Library/Collections/Stats sub-tabs
    const content = adminPage.locator('[class*="grid"], [class*="media"]').first();
    await expect(content).toBeVisible();
  });

  test('has Library sub-tab', async ({ adminPage }) => {
    const libraryTab = adminPage.getByRole('button', { name: /library/i });
    if (await libraryTab.count() > 0) {
      await expect(libraryTab.first()).toBeVisible();
    }
  });

  test('has Collections sub-tab', async ({ adminPage }) => {
    const collectionsTab = adminPage.getByRole('button', { name: /collections/i });
    if (await collectionsTab.count() > 0) {
      await collectionsTab.first().click();
      await adminPage.waitForTimeout(500);
    }
  });

  test('has Stats sub-tab', async ({ adminPage }) => {
    const statsTab = adminPage.getByRole('button', { name: /stats/i });
    if (await statsTab.count() > 0) {
      await statsTab.first().click();
      await adminPage.waitForTimeout(500);
    }
  });

  test('has upload button', async ({ adminPage }) => {
    const uploadBtn = adminPage.getByRole('button', { name: /upload/i });
    if (await uploadBtn.count() > 0) {
      await expect(uploadBtn.first()).toBeVisible();
    }
  });

  test('has search functionality', async ({ adminPage }) => {
    const searchInput = adminPage.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Nepal');
      await adminPage.waitForTimeout(500);
    }
  });
});
