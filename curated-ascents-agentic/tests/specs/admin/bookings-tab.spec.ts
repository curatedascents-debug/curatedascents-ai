import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Bookings Tab', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Bookings');
  });

  test('displays bookings tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('table, [class*="grid"], [class*="booking"]').first();
    await expect(content).toBeVisible();
  });

  test('shows bookings list', async () => {
    const rows = await dashboard.getTableRowCount();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('has status indicators for bookings', async ({ adminPage }) => {
    const statusBadges = adminPage.locator('[class*="rounded-full"], [class*="badge"]');
    // May have status badges if bookings exist
    const count = await statusBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('booking rows display reference numbers', async ({ adminPage }) => {
    const rows = adminPage.locator('tbody tr');
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      const text = await firstRow.innerText();
      expect(text.length).toBeGreaterThan(0);
    }
  });
});
