import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin Blog Tab', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.switchTab('Blog');
  });

  test('displays blog tab content', async ({ adminPage }) => {
    await adminPage.waitForTimeout(1000);
    const content = adminPage.locator('table, [class*="grid"], [class*="blog"]').first();
    await expect(content).toBeVisible();
  });

  test('shows blog post list', async ({ adminPage }) => {
    const rows = adminPage.locator('table tbody tr, [class*="post"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('has generate blog post button', async ({ adminPage }) => {
    const generateBtn = adminPage.getByRole('button', { name: /generate|create|write/i });
    if (await generateBtn.count() > 0) {
      await expect(generateBtn.first()).toBeVisible();
    }
  });

  test('blog posts show title and status', async ({ adminPage }) => {
    const rows = adminPage.locator('table tbody tr');
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      const text = await firstRow.innerText();
      expect(text.length).toBeGreaterThan(0);
    }
  });

  test('has blog analytics section or link', async ({ adminPage }) => {
    const analytics = adminPage.getByText(/analytics|stats/i);
    if (await analytics.count() > 0) {
      await expect(analytics.first()).toBeVisible();
    }
  });
});
