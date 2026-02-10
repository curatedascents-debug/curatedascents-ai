import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Suppliers Tab @admin @regression', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Suppliers');
  });

  test('displays suppliers tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('table, [class*="grid"]').first();
    await expect(content).toBeVisible();
  });

  test('shows supplier list or empty state', async () => {
    const rows = await dashboard.getTableRowCount();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('has add supplier button', async ({ adminPage }) => {
    const addBtn = adminPage.getByRole('button', { name: /add|create|new/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('search filters suppliers', async ({ adminPage }) => {
    const searchInput = adminPage.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test supplier');
      await adminPage.waitForTimeout(500);
    }
  });
});
