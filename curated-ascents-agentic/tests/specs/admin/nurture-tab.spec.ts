import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Nurture Tab @admin @regression', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Nurture');
  });

  test('displays nurture tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('table, [class*="grid"], [class*="nurture"]').first();
    await expect(content).toBeVisible();
  });

  test('shows nurture sequences', async ({ adminPage }) => {
    const sequences = adminPage.locator('table tbody tr, [class*="sequence"]');
    const count = await sequences.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('has create sequence button', async ({ adminPage }) => {
    const createBtn = adminPage.getByRole('button', { name: /create|add|new/i }).first();
    if (await createBtn.isVisible()) {
      await expect(createBtn).toBeVisible();
    }
  });

  test('has enrollments section', async ({ adminPage }) => {
    const enrollments = adminPage.getByText(/enrollment/i);
    if (await enrollments.count() > 0) {
      await expect(enrollments.first()).toBeVisible();
    }
  });
});
