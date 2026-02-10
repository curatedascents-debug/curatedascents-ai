import { type Page, type Locator, expect } from '@playwright/test';

export class PortalTripsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tripCards: Locator;
  readonly upcomingTrips: Locator;
  readonly pastTrips: Locator;
  readonly emptyState: Locator;
  readonly tripDetails: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.tripCards = page.locator('[class*="bg-slate-800"][class*="rounded"]');
    this.upcomingTrips = page.getByText(/upcoming/i);
    this.pastTrips = page.getByText(/past|completed/i);
    this.emptyState = page.getByText(/no trips|no bookings|nothing yet/i);
    this.tripDetails = page.locator('[class*="trip-detail"], [class*="booking-detail"]');
  }

  async goto() {
    await this.page.goto('/portal/trips');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/portal\/trips/);
  }

  async getTripCount(): Promise<number> {
    return this.tripCards.count();
  }

  async clickTrip(index = 0) {
    await this.tripCards.nth(index).click();
  }

  async expectTripDetails() {
    await expect(this.page).toHaveURL(/\/portal\/trips\/.+/);
  }
}
