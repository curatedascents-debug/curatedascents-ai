import { type Page, type Locator, expect } from '@playwright/test';

export class PortalChatPage {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly userMessages: Locator;
  readonly assistantMessages: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.messageInput = page.locator('textarea, input[placeholder*="message"], input[placeholder*="adventure"]').first();
    this.sendButton = page.locator('button[type="submit"]').first();
    this.userMessages = page.locator('[class*="bg-emerald-600"]');
    this.assistantMessages = page.locator('[class*="bg-slate-800"][class*="border"]');
    this.loadingIndicator = page.locator('[class*="animate-"]').first();
  }

  async goto() {
    await this.page.goto('/portal/chat');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/portal\/chat/);
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async waitForResponse(timeout = 20_000) {
    await this.page.waitForTimeout(500);
    try {
      await this.page.waitForFunction(
        () => !document.querySelector('[class*="animate-pulse"], [class*="animate-bounce"]'),
        { timeout }
      );
    } catch {
      // Response may have already arrived
    }
  }

  async expectNoEmailPrompt() {
    const emailInput = this.page.locator('input[placeholder="Your email"]');
    await expect(emailInput).not.toBeVisible();
  }
}
