import { test, expect } from '@playwright/test';
import { ChatWidget } from '../../page-objects/ChatWidget';
import { mockChatEndpoint, mockChatSequence, mockChatError } from '../../mocks/chat-responses';

test.describe('Chat Conversation @regression @ai-tools', () => {
  test.setTimeout(60_000);

  test('sends message and receives response', async ({ page }) => {
    await mockChatEndpoint(page, 'greeting');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('Hello!');
    await chatWidget.waitForResponse();

    const messageCount = await chatWidget.getMessageCount();
    expect(messageCount).toBeGreaterThanOrEqual(1);
  });

  test('displays user message in chat', async ({ page }) => {
    await mockChatEndpoint(page, 'greeting');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('Tell me about Nepal');
    await chatWidget.waitForResponse();

    const userMsgs = await chatWidget.userMessages.count();
    expect(userMsgs).toBeGreaterThanOrEqual(1);
  });

  test('displays assistant response', async ({ page }) => {
    await mockChatEndpoint(page, 'destinationInfo');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('What destinations do you cover?');
    await chatWidget.waitForResponse();

    const lastMessage = await chatWidget.getLastAssistantMessage();
    expect(lastMessage.length).toBeGreaterThan(0);
  });

  test('handles sequential messages', async ({ page }) => {
    await mockChatSequence(page, ['greeting', 'hotelSearch']);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();

    await chatWidget.sendMessage('Hello');
    await chatWidget.waitForResponse();

    await chatWidget.sendMessage('Find hotels in Kathmandu');
    await chatWidget.waitForResponse();

    const messageCount = await chatWidget.getMessageCount();
    expect(messageCount).toBeGreaterThanOrEqual(2);
  });

  test('handles API error gracefully', async ({ page }) => {
    await mockChatError(page, 500);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('Hello');

    await page.waitForTimeout(3000);
    // Should not crash — page remains interactive
    await expect(chatWidget.messageInput).toBeVisible();
  });
});
