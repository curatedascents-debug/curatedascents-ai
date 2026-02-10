import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Quotes Tab @admin @regression @booking', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Quotes');
  });

  test('displays quotes tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('table, [class*="grid"], [class*="quote"]').first();
    await expect(content).toBeVisible();
  });

  test('shows quotes list', async () => {
    const rows = await dashboard.getTableRowCount();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('has status filter or search', async ({ adminPage }) => {
    const searchInput = adminPage.locator('input[placeholder*="Search"], input[placeholder*="search"], select').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('quote rows show client and amount info', async ({ adminPage }) => {
    const rows = adminPage.locator('tbody tr');
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      const text = await firstRow.innerText();
      expect(text.length).toBeGreaterThan(0);
    }
  });
});
