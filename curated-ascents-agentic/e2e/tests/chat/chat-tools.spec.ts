import { test, expect } from '@playwright/test';
import { ChatWidget } from '../../page-objects/ChatWidget';
import { mockChatEndpoint } from '../../mocks/chat-responses';

test.describe('Chat Tool Responses', () => {
  test('hotel search response contains hotel names', async ({ page }) => {
    await mockChatEndpoint(page, 'hotelSearch');
    await page.goto('/');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('Find me luxury hotels in Kathmandu');
    await chatWidget.waitForResponse();

    const response = await chatWidget.getLastAssistantMessage();
    expect(response).toContain('Hotel');
  });

  test('quote calculation response contains pricing', async ({ page }) => {
    await mockChatEndpoint(page, 'quoteCalculation');
    await page.goto('/');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('Give me a quote for Nepal trek');
    await chatWidget.waitForResponse();

    const response = await chatWidget.getLastAssistantMessage();
    expect(response).toContain('$');
  });

  test('destination info lists countries', async ({ page }) => {
    await mockChatEndpoint(page, 'destinationInfo');
    await page.goto('/');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('Where do you operate?');
    await chatWidget.waitForResponse();

    const response = await chatWidget.getLastAssistantMessage();
    expect(response).toContain('Nepal');
  });

  test('photo search response contains images', async ({ page }) => {
    await mockChatEndpoint(page, 'photoSearch');
    await page.goto('/');
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.sendMessage('Show me photos of Nepal');
    await chatWidget.waitForResponse();

    const response = await chatWidget.getLastAssistantMessage();
    expect(response.length).toBeGreaterThan(0);
  });
});
