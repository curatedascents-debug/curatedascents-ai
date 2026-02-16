import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../page-objects/AdminDashboardPage';

test.describe('Admin FX Rates Tab @admin @regression', () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
  });

  test('FX Rates tab is visible and clickable', async ({ adminPage }) => {
    // The tab button should exist — might be labeled "FX Rates" or contain "FX"
    const fxTab = adminPage.getByRole('button', { name: /fx/i }).first();
    await expect(fxTab).toBeVisible({ timeout: 10_000 });
    await fxTab.click();
    await adminPage.waitForTimeout(1000);
  });

  test('displays content after switching to FX tab', async ({ adminPage }) => {
    const fxTab = adminPage.getByRole('button', { name: /fx/i }).first();
    await fxTab.click();
    await adminPage.waitForTimeout(1500);
    // Should show some content — rates table, loading indicator, or sub-tabs
    const content = adminPage.locator('table, [class*="grid"], button:has-text("Daily"), button:has-text("Historical"), button:has-text("Currencies")').first();
    await expect(content).toBeVisible({ timeout: 10_000 });
  });

  test('has sub-tab navigation', async ({ adminPage }) => {
    const fxTab = adminPage.getByRole('button', { name: /fx/i }).first();
    await fxTab.click();
    await adminPage.waitForTimeout(1500);
    // Check for any sub-tab buttons
    const subTabs = adminPage.getByRole('button', { name: /daily|historical|currencies/i });
    const count = await subTabs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
