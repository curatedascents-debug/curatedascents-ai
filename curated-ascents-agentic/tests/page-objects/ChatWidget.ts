import { type Page, type Locator, expect } from '@playwright/test';

export class ChatWidget {
  readonly page: Page;
  readonly container: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly userMessages: Locator;
  readonly assistantMessages: Locator;
  readonly loadingIndicator: Locator;
  readonly emailInput: Locator;
  readonly nameInput: Locator;
  readonly skipButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[class*="chat"], [class*="Chat"]').first();
    this.messageInput = page.locator('input[placeholder*="message"], input[placeholder*="adventure"], textarea').first();
    this.sendButton = page.locator('button[type="submit"]').first();
    this.messages = page.locator('[class*="message"], [class*="bg-emerald-600"], [class*="bg-slate-800"][class*="border-slate-700"]');
    this.userMessages = page.locator('div[class*="bg-emerald-600"][class*="rounded"]');
    this.assistantMessages = page.locator('div[class*="bg-slate-800"][class*="border"]:has(.markdown-content)');
    this.loadingIndicator = page.locator('[class*="animate-spin"]').first();
    this.emailInput = page.locator('input[placeholder="Your email"]');
    this.nameInput = page.locator('input[placeholder="Your name"]');
    this.skipButton = page.getByText(/skip/i);
    this.continueButton = page.getByRole('button', { name: /continue/i });
  }

  async open() {
    // Use aria-label which is the most reliable selector for the floating button
    const floatingBtn = this.page.locator('[aria-label="Open chat"]');
    try {
      await floatingBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await floatingBtn.click();
      // Wait for the chat panel to appear
      await this.messageInput.waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      // Fallback: try broader selectors
      const fallbackBtn = this.page.locator('button[class*="fixed"][class*="bottom"]').first();
      if (await fallbackBtn.isVisible()) {
        await fallbackBtn.click();
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async close() {
    const closeBtn = this.page.locator('[aria-label="Close chat"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  async sendMessage(text: string) {
    await this.messageInput.waitFor({ state: 'visible', timeout: 10_000 });
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async waitForResponse(timeout = 20_000) {
    // Brief pause for the fetch to start and isLoading to become true
    await this.page.waitForTimeout(300);
    try {
      // Wait for spinner to appear (it may appear only briefly with fast mocks)
      await this.page.locator('[class*="animate-spin"]')
        .waitFor({ state: 'visible', timeout: 2_000 })
        .catch(() => {});
      // Wait for spinner to disappear (response received and rendered)
      await this.page.waitForFunction(
        () => !document.querySelector('[class*="animate-spin"]'),
        { timeout }
      );
      // Small buffer for DOM update after state change
      await this.page.waitForTimeout(200);
    } catch {
      // timeout is acceptable — response may have already arrived
    }
  }

  async getLastAssistantMessage(): Promise<string> {
    const msgs = await this.assistantMessages.all();
    if (msgs.length === 0) return '';
    return msgs[msgs.length - 1].innerText();
  }

  async getMessageCount(): Promise<number> {
    return (await this.userMessages.count()) + (await this.assistantMessages.count());
  }

  async captureEmail(email: string, name?: string) {
    if (name && await this.nameInput.isVisible()) {
      await this.nameInput.fill(name);
    }
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

  async skipEmailCapture() {
    if (await this.skipButton.isVisible()) {
      await this.skipButton.click();
    }
  }

  async expectInputVisible() {
    await expect(this.messageInput).toBeVisible({ timeout: 15_000 });
  }

  async expectEmailPromptVisible() {
    await expect(this.emailInput).toBeVisible();
  }
}
