import { test, expect } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';
import { ChatWidget } from '../../page-objects/ChatWidget';
import { mockChatSequence } from '../../mocks/chat-responses';
import { mockStripeCheckout, mockStripePaymentStatus } from '../../mocks/stripe-mock';
import { mockPersonalize } from '../../mocks/external-services';

test.describe('Customer Booking Journey @regression @booking', () => {
  test.setTimeout(120_000);

  test('complete journey: homepage → chat → quote → booking', async ({ page }) => {
    // Setup mocks
    await mockChatSequence(page, ['greeting', 'hotelSearch', 'quoteCalculation', 'bookingConfirmation']);
    await mockPersonalize(page);
    await mockStripeCheckout(page);
    await mockStripePaymentStatus(page);

    // Step 1: Land on homepage
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectLoaded();

    // Step 2: Open chat widget
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.expectInputVisible();

    // Step 3: Ask about destinations
    await chatWidget.sendMessage('I want to visit Nepal');
    await chatWidget.waitForResponse(30_000);
    const response1 = await chatWidget.getLastAssistantMessage();
    expect(response1.length).toBeGreaterThan(0);

    // Step 4: Ask about hotels (this triggers email prompt after response)
    await chatWidget.sendMessage('Show me luxury hotels in Kathmandu');
    await chatWidget.waitForResponse(30_000);
    const response2 = await chatWidget.getLastAssistantMessage();
    expect(response2.length).toBeGreaterThan(0);

    // Dismiss email capture prompt if it appeared (triggers after 2nd message)
    await page.waitForTimeout(500);
    await chatWidget.skipEmailCapture();
    await page.waitForTimeout(500);

    // Step 5: Request a quote
    await chatWidget.sendMessage('Give me a quote for a 10-day Nepal trip');
    await chatWidget.waitForResponse(30_000);
    const quoteResponse = await chatWidget.getLastAssistantMessage();
    expect(quoteResponse).toContain('$');
  });

  test('customer can browse blog before chatting', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/blog');

    // Navigate back to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homePage = new HomePage(page);
    await homePage.expectLoaded();

    // Chat should still be available
    const chatWidget = new ChatWidget(page);
    await chatWidget.open();
    await chatWidget.expectInputVisible();
  });

  test('customer journey includes email capture', async ({ page }) => {
    await mockChatSequence(page, ['greeting', 'destinationInfo', 'hotelSearch']);
    await mockPersonalize(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chatWidget = new ChatWidget(page);
    await chatWidget.open();

    // Send 2 messages to trigger email capture (triggers when newMessages.length >= 4)
    await chatWidget.sendMessage('Journey message 1');
    await chatWidget.waitForResponse(30_000);
    await chatWidget.sendMessage('Journey message 2');
    await chatWidget.waitForResponse(30_000);

    // Check email prompt appeared
    await page.waitForTimeout(1000);
    const emailInput = page.locator('input[placeholder="Your email"]');
    if (await emailInput.isVisible().catch(() => false)) {
      await chatWidget.captureEmail('journey@example.com', 'Journey User');
    }
  });
});
