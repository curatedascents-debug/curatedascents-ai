import { test, expect } from '@playwright/test';
import { ChatWidget } from '../../page-objects/ChatWidget';
import { mockChatEndpoint } from '../../mocks/chat-responses';

test.describe('Chat Widget @smoke @ai-tools', () => {
  test.beforeEach(async ({ page }) => {
    await mockChatEndpoint(page, 'greeting');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('floating chat button is visible on homepage', async ({ page }) => {
    const floatingBtn = page.locator('[class*="fixed"][class*="bottom"]').last();
    await expect(floatingBtn).toBeVisible();
  });

  test('chat opens when floating button is clicked', async ({ page }) => {
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.expectInputVisible();
  });

  test('chat input accepts text', async ({ page }) => {
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.messageInput.fill('Hello');
    await expect(chatWidget.messageInput).toHaveValue('Hello');
  });

  test('send button is visible', async ({ page }) => {
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await expect(chatWidget.sendButton).toBeVisible();
  });

  test('chat input has placeholder text', async ({ page }) => {
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    const placeholder = await chatWidget.messageInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });
});
