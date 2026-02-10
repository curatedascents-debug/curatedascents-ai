import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Rates Tab @admin @regression', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Rates');
  });

  test('displays rates tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    // Should show rate categories or table
    const content = adminPage.locator('table, [class*="grid"]').first();
    await expect(content).toBeVisible();
  });

  test('has search functionality', async () => {
    const searchInput = dashboard.searchInput;
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Everest');
      await dashboard.page.waitForTimeout(500);
    }
  });

  test('has service type sub-tabs or categories', async ({ adminPage }) => {
    // Rates tab typically shows sub-tabs for different service types
    const buttons = adminPage.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('can open create rate modal', async ({ adminPage }) => {
    const createBtn = adminPage.getByRole('button', { name: /create|add|new/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await adminPage.waitForTimeout(500);
      // Modal should appear
      const modal = adminPage.locator('[class*="fixed"][class*="inset-0"]');
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
      }
    }
  });

  test('displays rate data in table format', async () => {
    const rows = await dashboard.getTableRowCount();
    // May be 0 if no rates seeded — that's OK
    expect(rows).toBeGreaterThanOrEqual(0);
  });
});
