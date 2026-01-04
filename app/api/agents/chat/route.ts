import { NextRequest, NextResponse } from 'next/server';
import { getMemory, updateMemory } from '@/lib/agents/memory';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, agentType } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Get conversation history from memory
    const memory = await getMemory(sessionId);
    const previousMessages = memory.messages.slice(-10); // Last 10 messages for context

    // Enhanced system prompt with strict formatting rules
    const systemPrompt = `You are CuratedAscents AI, a premier luxury travel concierge with 25+ years of Himalayan expertise.

CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE:
1. NEVER use markdown symbols: #, *, **, \`\`\`, \`
2. NEVER create headers with # symbols
3. Use ONLY plain text formatting
4. For emphasis: Use CAPITALIZATION or descriptive language instead of asterisks
5. For lists: Use bullet points with • symbol or numbered lists (1., 2., 3.)
6. Section separation: Use double line breaks between sections

AGENT SPECIALIZATIONS:
${agentType === 'planner' ? '• You are the PLANNER: Design exquisite itineraries, optimize for weather/season, secure VIP access' : ''}
${agentType === 'negotiator' ? '• You are the NEGOTIATOR: Compare multi-vendor rates, secure premium upgrades, exclusive perks' : ''}
${agentType === 'concierge' ? '• You are the CONCIERGE: Arrange personalized surprises, real-time coordination, special requests' : ''}

RESPONSE GUIDELINES:
• Use elegant, conversational language fitting for luxury travel
• Provide specific, actionable recommendations
• Ask clarifying questions when needed
• Maintain 25+ years expert tone
• Format all responses in clean, readable plain text
• Use • for bullet points, not * or -

EXAMPLE OF GOOD FORMATTING:
For your luxury Himalayan experience, I recommend:

• Private helicopter tour to Everest Base Camp
• Stay at the exclusive Yeti Mountain Home
• Personal sherpa guide with 20+ years experience

The best time to visit is April-May for optimal weather conditions.`;

    // Prepare messages for DeepSeek
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...previousMessages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Clean the response (extra safety measure)
    const cleanedResponse = cleanAIText(aiResponse);

    // Update memory with new conversation
    const updatedMemory = await updateMemory(sessionId, [
      ...memory.messages,
      { content: message, isUser: true, timestamp: new Date().toISOString() },
      { content: cleanedResponse, isUser: false, timestamp: new Date().toISOString() },
    ]);

    return NextResponse.json({
      response: cleanedResponse,
      sessionId,
      memory: updatedMemory,
    });

  } catch (error) {
    console.error('Error in agent chat:', error);

    // Fallback responses if API fails
    const fallbackResponses = {
      planner: "I apologize for the technical issue. As your luxury travel planner, I'd recommend considering a private Everest Base Camp helicopter tour with a stay at Yeti Mountain Home for an exclusive Himalayan experience.",
      negotiator: "I'm experiencing a temporary connection issue. For premium upgrades and exclusive rates, I typically secure 20-30% off luxury lodges and private transport in Nepal.",
      concierge: "Please pardon the interruption. For personalized surprises, I often arrange private dining at mountain viewpoints or spa treatments with Himalayan herbal therapies."
    };

    return NextResponse.json({
      response: fallbackResponses[agentType as keyof typeof fallbackResponses] || "Thank you for your message. Our luxury travel concierge will assist you shortly with personalized recommendations for the Himalayas.",
      sessionId: (await request.json()).sessionId,
      memory: null,
    }, { status: 200 });
  }
}

// Utility function to clean AI text
function cleanAIText(text: string): string {
  if (!text) return text;

  return text
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold markers
    .replace(/\*\*/g, '')
    // Remove italic markers but preserve text
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove inline code markers
    .replace(/`([^`]+)`/g, '$1')
    // Convert markdown bullets to •
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}