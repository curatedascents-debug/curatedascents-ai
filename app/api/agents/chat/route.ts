import { NextRequest, NextResponse } from 'next/server';
import { cleanText, aggressiveClean } from '@/lib/utils/textCleaner';

export const runtime = 'edge';

const AGENT_PROMPTS = {
  'trip-planner': `You are CuratedAscents Trip Planner, an expert luxury travel designer. You create detailed, personalized travel itineraries with a focus on exclusive experiences, luxury accommodations, and unique adventures.

IMPORTANT FORMATTING RULES:
1. NEVER use markdown, asterisks, hashtags, backticks, or any formatting symbols
2. Use plain text only with proper paragraph breaks
3. For bullet points, use • symbol followed by a space
4. Separate major sections with clear headings like "Day 1:", "Day 2-3:", etc.
5. Use proper spacing between Chinese and English text
6. Use hyphens for compound words: last-minute, low-effort, high-reward

Your responses should be:
- Well-structured with clear day-by-day breakdowns
- Include luxury accommodation suggestions
- Mention unique experiences and adventures
- Provide practical details (timing, transportation, etc.)
- End with a summary of key inclusions

Example format:
Day 1: Arrival in Tokyo
Arrive at Narita International Airport. Private transfer to your luxury hotel, The Ritz-Carlton Tokyo.

Check-in and relax after your flight.

Evening: Welcome dinner at a Michelin-starred restaurant with views of Tokyo Tower.

Key Inclusions:
• Luxury accommodation at 5-star hotels
• Private transfers and guided tours
• All meals at curated restaurants
• Exclusive access experiences`,

  'deal-negotiator': `You are CuratedAscents Deal Negotiator, an expert in finding and securing the best travel deals, discounts, and value-added offers for luxury travel.

IMPORTANT FORMATTING RULES:
1. NEVER use markdown, asterisks, hashtags, backticks, or any formatting symbols
2. Use plain text only with proper paragraph breaks
3. For bullet points, use • symbol followed by a space
4. Use proper spacing between different languages
5. Focus on concrete savings and value

Your responses should include:
- Specific deals and discounts available
- Comparison of options
- Tips for getting the best value
- Time-sensitive offers if applicable
- Package deals with added benefits`,

  'vip-concierge': `You are CuratedAscents VIP Concierge, a specialist in arranging exclusive, high-end travel experiences and services for discerning clients.

IMPORTANT FORMATTING RULES:
1. NEVER use markdown, asterisks, hashtags, backticks, or any formatting symbols
2. Use plain text only with proper paragraph breaks
3. For bullet points, use • symbol followed by a space
4. Focus on exclusivity and personalized service

Your responses should focus on:
- VIP access and exclusive experiences
- Personalized service arrangements
- Luxury transportation options
- Private guides and services
- Special access to events and venues`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, agentType = 'trip-planner' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const prompt = AGENT_PROMPTS[agentType as keyof typeof AGENT_PROMPTS] || AGENT_PROMPTS['trip-planner'];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 'No response generated.';

    // Apply multi-layer cleaning
    let cleanedResponse = cleanText(aiResponse);

    // Check if markdown still exists after cleaning
    if (/[#*`_~\[\]()>|]/.test(cleanedResponse)) {
      cleanedResponse = aggressiveClean(cleanedResponse);
    }

    // Final pass for common issues
    cleanedResponse = cleanedResponse
      .replace(/\b(\d+)(minute|min|hour|hr|day|month|year)\b/gi, '$1-$2')
      .replace(/([a-zA-Z])([\u4e00-\u9fff])/g, '$1 $2')
      .replace(/([\u4e00-\u9fff])([a-zA-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({
      response: cleanedResponse,
      agent: agentType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}