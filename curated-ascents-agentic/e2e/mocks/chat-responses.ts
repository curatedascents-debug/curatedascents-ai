import { type Page, type Route } from '@playwright/test';

/** Canned AI chat responses for mocking /api/chat */
export const CHAT_RESPONSES = {
  greeting: {
    response: "Welcome to CuratedAscents! I'm your Expedition Architect, here to help you plan an extraordinary adventure in the Himalayas. Whether you're dreaming of trekking to Everest Base Camp, exploring ancient temples in Bhutan, or discovering the cultural wonders of Nepal — I can help craft a bespoke itinerary just for you. What kind of adventure are you looking for?",
  },

  hotelSearch: {
    response: "I found several luxury hotels in Kathmandu for you:\n\n1. **Dwarika's Hotel** - 5-star heritage property, from $350/night\n2. **Hyatt Regency Kathmandu** - 5-star with mountain views, from $280/night\n3. **Hotel Yak & Yeti** - 5-star in the heart of the city, from $220/night\n\nWould you like more details about any of these, or shall I search for hotels in another destination?",
  },

  quoteCalculation: {
    response: "Here's your custom quote for the Nepal Adventure:\n\n**10-Day Nepal Explorer Package**\n- Accommodation: Dwarika's Hotel (5 nights) + Everest View Hotel (4 nights)\n- Transportation: Private SUV + domestic flight\n- Guide: English-speaking mountain guide\n- Permits: TIMS card + National Park entry\n\n**Total: $4,850 per person** (based on 2 travelers)\n\nThis includes all taxes and service charges. Would you like to proceed with this quote, or shall I adjust anything?",
  },

  bookingConfirmation: {
    response: "Excellent! Your booking has been confirmed. Here are the details:\n\n**Booking Reference:** CA-2024-001\n**Status:** Confirmed\n**Payment:** 30% deposit ($1,455) due within 7 days\n\nI've sent the full itinerary to your email. Would you like to discuss payment options or add any special requests?",
  },

  destinationInfo: {
    response: "We operate in four incredible destinations:\n\n1. **Nepal** - Everest, Annapurna, Langtang treks + cultural tours\n2. **Bhutan** - Tiger's Nest, Punakha, Paro Valley\n3. **Tibet** - Lhasa, Mount Kailash, Namtso Lake\n4. **India** - Ladakh, Sikkim, Darjeeling\n\nEach destination offers unique experiences. Which one interests you most?",
  },

  toolError: {
    response: "I apologize, but I'm having trouble accessing our service catalog right now. Let me try a different approach — could you tell me more about what you're looking for? I can provide general information and estimated pricing while our systems catch up.",
  },

  photoSearch: {
    response: "Here are some stunning photos from Nepal:\n\n![Mount Everest at sunrise](https://test-media.example.com/everest-sunrise.webp)\n*Mount Everest at sunrise from Kala Patthar*\n\n![Boudhanath Stupa](https://test-media.example.com/boudhanath.webp)\n*The ancient Boudhanath Stupa in Kathmandu*\n\nWould you like to see more photos from a specific destination?",
  },
};

/** Mock the /api/chat endpoint to return a canned response */
export async function mockChatEndpoint(page: Page, responseKey: keyof typeof CHAT_RESPONSES = 'greeting') {
  await page.route('**/api/chat', async (route: Route) => {
    const data = CHAT_RESPONSES[responseKey];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

/** Mock the /api/chat endpoint to return sequential responses */
export async function mockChatSequence(page: Page, responseKeys: Array<keyof typeof CHAT_RESPONSES>) {
  let callIndex = 0;
  await page.route('**/api/chat', async (route: Route) => {
    const key = responseKeys[Math.min(callIndex, responseKeys.length - 1)];
    callIndex++;
    const data = CHAT_RESPONSES[key];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

/** Mock the /api/chat endpoint to simulate an error */
export async function mockChatError(page: Page, status = 500) {
  await page.route('**/api/chat', async (route: Route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' }),
    });
  });
}

/** Mock the /api/agency/chat endpoint */
export async function mockAgencyChatEndpoint(page: Page, responseKey: keyof typeof CHAT_RESPONSES = 'greeting') {
  await page.route('**/api/agency/chat', async (route: Route) => {
    const data = CHAT_RESPONSES[responseKey];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}
