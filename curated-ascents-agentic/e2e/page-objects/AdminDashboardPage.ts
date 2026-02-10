import { type Page, type Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;
  readonly title: Locator;
  readonly logoutButton: Locator;
  readonly statsCards: Locator;
  readonly tabButtons: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly searchInput: Locator;
  readonly createButton: Locator;
  readonly modal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('CuratedAscents Admin');
    this.logoutButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    this.statsCards = page.locator('[class*="bg-slate-800"][class*="rounded"][class*="p-"]');
    this.tabButtons = page.getByRole('button');
    this.table = page.locator('table').first();
    this.tableRows = page.locator('tbody tr');
    this.searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    this.createButton = page.getByRole('button', { name: /create|add|new/i }).first();
    this.modal = page.locator('[class*="fixed"][class*="inset-0"][class*="z-50"]');
  }

  async goto() {
    await this.page.goto('/admin');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL('/admin');
    await expect(this.title).toBeVisible();
  }

  async switchTab(tabName: string) {
    await this.page.getByRole('button', { name: new RegExp(tabName, 'i') }).click();
    await this.page.waitForTimeout(500);
  }

  async getTableRowCount(): Promise<number> {
    await this.table.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return this.tableRows.count();
  }

  async searchTable(query: string) {
    if (await this.searchInput.count() > 0) {
      await this.searchInput.first().fill(query);
      await this.page.waitForTimeout(500);
    }
  }

  async clickCreate() {
    await this.createButton.click();
    await expect(this.modal).toBeVisible();
  }

  async closeModal() {
    const closeButton = this.page.locator('[class*="fixed"] button:has(svg)').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  async expectTabActive(tabName: string) {
    const tab = this.page.getByRole('button', { name: new RegExp(tabName, 'i') });
    await expect(tab).toBeVisible();
  }
}
