import { type Page, type Locator, expect } from '@playwright/test';

export class AgencyDashboardPage {
  readonly page: Page;
  readonly dashboardTitle: Locator;
  readonly logoutButton: Locator;
  readonly clientsTab: Locator;
  readonly quotesTab: Locator;
  readonly bookingsTab: Locator;
  readonly reportsTab: Locator;
  readonly chatTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardTitle = page.getByText('Agency Dashboard');
    this.logoutButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    this.clientsTab = page.getByRole('button', { name: /clients/i });
    this.quotesTab = page.getByRole('button', { name: /quotes/i });
    this.bookingsTab = page.getByRole('button', { name: /bookings/i });
    this.reportsTab = page.getByRole('button', { name: /reports/i });
    this.chatTab = page.getByRole('button', { name: /ai chat/i });
  }

  async goto() {
    await this.page.goto('/agency/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/agency\/dashboard/);
    await expect(this.dashboardTitle).toBeVisible();
  }

  async switchTab(tabName: 'Clients' | 'Quotes' | 'Bookings' | 'Reports' | 'AI Chat') {
    await this.page.getByRole('button', { name: tabName }).click();
    await this.page.waitForTimeout(500);
  }

  async expectChatVisible() {
    const chatInput = this.page.locator('textarea, input[placeholder*="message"], input[placeholder*="adventure"]');
    await expect(chatInput).toBeVisible();
  }
}
