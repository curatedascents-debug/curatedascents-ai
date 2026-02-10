import { type Page, type Locator, expect } from '@playwright/test';

export class SupplierDashboardPage {
  readonly page: Page;
  readonly supplierName: Locator;
  readonly logoutButton: Locator;
  readonly profileTab: Locator;
  readonly ratesTab: Locator;
  readonly bookingsTab: Locator;
  readonly earningsTab: Locator;
  readonly ratesTable: Locator;
  readonly ratesSearch: Locator;

  constructor(page: Page) {
    this.page = page;
    this.supplierName = page.locator('[class*="text-orange"]').first();
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.profileTab = page.getByRole('button', { name: /profile/i });
    this.ratesTab = page.getByRole('button', { name: /rates/i });
    this.bookingsTab = page.getByRole('button', { name: /bookings/i });
    this.earningsTab = page.getByRole('button', { name: /earnings/i });
    this.ratesTable = page.locator('table').first();
    this.ratesSearch = page.locator('input[placeholder*="Search"]');
  }

  async goto() {
    await this.page.goto('/supplier/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/supplier\/dashboard/);
  }

  async switchTab(tabName: 'Profile' | 'My Rates' | 'Bookings' | 'Earnings') {
    await this.page.getByRole('button', { name: tabName }).click();
    await this.page.waitForTimeout(500);
  }

  async searchRates(query: string) {
    await this.ratesSearch.fill(query);
    await this.page.waitForTimeout(500);
  }
}
