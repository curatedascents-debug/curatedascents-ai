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
    this.messageInput = page.locator('textarea, input[placeholder*="message"], input[placeholder*="adventure"]').first();
    this.sendButton = page.locator('button[type="submit"]').first();
    this.messages = page.locator('[class*="message"], [class*="bg-emerald-600"], [class*="bg-slate-800"][class*="border-slate-700"]');
    this.userMessages = page.locator('[class*="bg-emerald-600"]');
    this.assistantMessages = page.locator('[class*="bg-slate-800"][class*="border"]');
    this.loadingIndicator = page.locator('[class*="animate-"]').first();
    this.emailInput = page.locator('input[placeholder="Your email"]');
    this.nameInput = page.locator('input[placeholder="Your name"]');
    this.skipButton = page.getByText('Skip for now');
    this.continueButton = page.getByRole('button', { name: /continue/i });
  }

  async open() {
    // Click the floating chat button if it exists
    const floatingBtn = this.page.locator('[class*="fixed"][class*="bottom-"][class*="right-"] button, [class*="fixed"][class*="bottom"] [class*="cursor-pointer"]').first();
    if (await floatingBtn.isVisible()) {
      await floatingBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  async close() {
    const closeBtn = this.page.locator('[class*="chat"] button:has(svg)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async waitForResponse(timeout = 20_000) {
    // Wait for loading to appear then disappear, or new assistant message
    await this.page.waitForTimeout(500);
    try {
      await this.page.waitForFunction(
        () => !document.querySelector('[class*="animate-pulse"], [class*="animate-bounce"]'),
        { timeout }
      );
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
    await expect(this.messageInput).toBeVisible();
  }

  async expectEmailPromptVisible() {
    await expect(this.emailInput).toBeVisible();
  }
}
