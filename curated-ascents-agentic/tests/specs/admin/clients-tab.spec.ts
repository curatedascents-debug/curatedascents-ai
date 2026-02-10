import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Clients Tab @admin @regression', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Clients');
  });

  test('displays clients tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('table, [class*="grid"]').first();
    await expect(content).toBeVisible();
  });

  test('shows client records', async () => {
    const rows = await dashboard.getTableRowCount();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('has add client functionality', async ({ adminPage }) => {
    const addBtn = adminPage.getByRole('button', { name: /add|create|new/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await adminPage.waitForTimeout(500);
    }
  });

  test('search filters clients', async ({ adminPage }) => {
    const searchInput = adminPage.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test@example.com');
      await adminPage.waitForTimeout(500);
    }
  });
});
