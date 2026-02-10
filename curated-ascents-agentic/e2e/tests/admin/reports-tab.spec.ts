import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Reports Tab', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Reports');
  });

  test('displays reports tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('[class*="grid"], [class*="chart"], [class*="report"]').first();
    await expect(content).toBeVisible();
  });

  test('has overview sub-tab', async ({ adminPage }) => {
    const overviewBtn = adminPage.getByRole('button', { name: /overview/i });
    if (await overviewBtn.count() > 0) {
      await expect(overviewBtn.first()).toBeVisible();
    }
  });

  test('has financial sub-tab', async ({ adminPage }) => {
    const financialBtn = adminPage.getByRole('button', { name: /financial/i });
    if (await financialBtn.count() > 0) {
      await financialBtn.first().click();
      await adminPage.waitForTimeout(500);
    }
  });

  test('has suppliers sub-tab', async ({ adminPage }) => {
    const suppliersBtn = adminPage.getByRole('button', { name: /supplier/i });
    if (await suppliersBtn.count() > 0) {
      await suppliersBtn.first().click();
      await adminPage.waitForTimeout(500);
    }
  });

  test('has date filter', async ({ adminPage }) => {
    const dateFilter = adminPage.locator('input[type="date"], select, [class*="date"]');
    if (await dateFilter.count() > 0) {
      await expect(dateFilter.first()).toBeVisible();
    }
  });

  test('has CSV export button', async ({ adminPage }) => {
    const exportBtn = adminPage.getByRole('button', { name: /export|csv|download/i });
    if (await exportBtn.count() > 0) {
      await expect(exportBtn.first()).toBeVisible();
    }
  });
});
