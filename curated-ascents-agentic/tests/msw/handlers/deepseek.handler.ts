import { http, HttpResponse } from 'msw';

/**
 * Mock DeepSeek chat completions API.
 * Intercepts calls from the Next.js server to api.deepseek.com.
 */
export const deepseekHandlers = [
  http.post('https://api.deepseek.com/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as { messages?: Array<{ role: string; content: string }>; tools?: unknown[] };
    const lastMessage = body.messages?.[body.messages.length - 1]?.content || '';

    // If the request includes tools and the message looks like it needs tool calling,
    // return a simple text response instead of actual tool calls
    const response = generateMockResponse(lastMessage);

    return HttpResponse.json({
      id: 'chatcmpl-mock-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'deepseek-chat',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    });
  }),
];

function generateMockResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('hotel') || lower.includes('accommodation')) {
    return "I found several luxury hotels for you:\n\n1. **Dwarika's Hotel** - 5-star heritage property, from $350/night\n2. **Hyatt Regency Kathmandu** - 5-star, from $280/night\n\nWould you like more details?";
  }

  if (lower.includes('quote') || lower.includes('price') || lower.includes('cost')) {
    return "Here's your custom quote:\n\n**10-Day Nepal Explorer**\n- Accommodation + Transport + Guide\n- **Total: $4,850 per person**\n\nWould you like to proceed?";
  }

  if (lower.includes('book') || lower.includes('confirm')) {
    return "Your booking has been confirmed!\n\n**Booking Reference:** CA-2024-001\n**Status:** Confirmed\n\nI've sent the details to your email.";
  }

  if (lower.includes('destination') || lower.includes('where')) {
    return "We operate in Nepal, Bhutan, Tibet, and India. Each offers unique adventure experiences. Which interests you most?";
  }

  return "Welcome to CuratedAscents! I'm your Expedition Architect. Whether you're dreaming of Everest, exploring Bhutan, or discovering Nepal — I can help craft a bespoke itinerary. What adventure are you looking for?";
}
