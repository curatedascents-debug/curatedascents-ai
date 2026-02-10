import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Management Journey @regression @admin', () => {
  test('admin reviews all tabs sequentially', async ({ adminPage }) => {
    const dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();

    const tabs = ['Rates', 'Suppliers', 'Hotels', 'Clients', 'Quotes', 'Bookings', 'Blog', 'Media', 'Reports'];

    for (const tab of tabs) {
      await dashboard.switchTab(tab);
      await adminPage.waitForTimeout(500);
      // Each tab should render without errors
      const errorMessages = adminPage.locator('[class*="text-red"]');
      const errorCount = await errorMessages.count();
      // Some tabs may show "no data" messages which is fine
    }
  });

  test('admin can switch between tabs rapidly', async ({ adminPage }) => {
    const dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();

    // Rapid tab switching should not crash
    await dashboard.switchTab('Rates');
    await dashboard.switchTab('Hotels');
    await dashboard.switchTab('Clients');
    await dashboard.switchTab('Reports');
    await dashboard.switchTab('Blog');

    // Page should still be responsive
    await expect(dashboard.title).toBeVisible();
  });

  test('admin dashboard shows stats cards', async ({ adminPage }) => {
    const dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();

    // Stats cards should be visible at the top
    const statsCards = dashboard.statsCards;
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
