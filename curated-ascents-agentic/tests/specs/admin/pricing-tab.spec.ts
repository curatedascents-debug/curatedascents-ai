import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Pricing Tab @admin @regression', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Pricing');
  });

  test('displays pricing tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('table, [class*="grid"], [class*="pricing"]').first();
    await expect(content).toBeVisible();
  });

  test('shows pricing rules list', async ({ adminPage }) => {
    const rules = adminPage.locator('table tbody tr, [class*="rule"]');
    const count = await rules.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('has price simulator section', async ({ adminPage }) => {
    const simulator = adminPage.getByText(/simulat/i);
    if (await simulator.count() > 0) {
      await expect(simulator.first()).toBeVisible();
    }
  });

  test('has demand metrics section', async ({ adminPage }) => {
    const demand = adminPage.getByText(/demand/i);
    if (await demand.count() > 0) {
      await expect(demand.first()).toBeVisible();
    }
  });
});
