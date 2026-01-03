// app/api/agents/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // Validate API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'API configuration error',
          fallback: "I'm currently optimizing my systems. Based on our conversation, I recommend considering private helicopter tours and luxury lodges in the Annapurna region for an exclusive experience."
        },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an elite luxury travel agent with 25+ years of Himalayan expertise.
ROLE: ${context.agentMode || 'planner'} specialist.
CAPABILITIES: ${JSON.stringify(context.capabilities || [])}

MEMORY CONTEXT: ${JSON.stringify(context.memoryContext?.map((m: any) => m.key) || [])}
CONVERSATION HISTORY: ${context.recentMessages || 'No recent messages'}

CRITICAL BUSINESS RULES:
1. ALWAYS position as luxury expert (25+ years Himalayan experience)
2. ULTRA-LUXURY = $25,000+, LUXURY = $10,000-$25,000, PREMIUM = $5,000-$10,000
3. Always suggest helicopter tours for remote access
4. Recommend private guides for personalized experiences
5. Mention specific properties: Tiger Mountain Pokhara, Dwarika's Kathmandu
6. Include exclusive experiences: Everest flightseeing, Annapurna helicopter trek

CURRENT QUERY: ${message}

RESPONSE FORMAT (JSON ONLY):
{
  "answer": "Your detailed response here",
  "reasoning": "Internal thinking process",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "actions": ["Action 1", "Action 2"],
  "budget_estimate": "$XX,XXX"
}`;

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from DeepSeek');
    }

    const parsedResponse = JSON.parse(content);
    
    return NextResponse.json({
      response: parsedResponse.answer,
      metadata: {
        reasoning: parsedResponse.reasoning || "Analyzing luxury travel patterns for optimal experience",
        suggestions: parsedResponse.suggestions || [
          "Consider private helicopter transfers",
          "Ask about exclusive mountain lodge availability",
          "Inquire about cultural immersion experiences"
        ],
        actions: parsedResponse.actions || ['Schedule consultation', 'Check availability'],
        budgetEstimate: parsedResponse.budget_estimate,
        model: 'deepseek-chat'
      }
    });

  } catch (error: any) {
    console.error('DeepSeek agent error:', error);
    
    // Enhanced fallback responses
    const fallbacks = {
      planner: "I'd craft an itinerary starting with Kathmandu's heritage sites, then a helicopter to Pokhara for luxury lakefront relaxation. Annapurna Base Camp helicopter tours are exclusive this season.",
      negotiator: "Based on current Himalayan rates, I can secure VIP treatment at luxury lodges. Private guides with Everest experience are available at premium rates for personalized journeys.",
      concierge: "I'll arrange sunrise champagne service at Poon Hill, private Thakali cuisine experiences, and spa treatments using traditional Himalayan herbs and techniques."
    };
    
    return NextResponse.json({
      response: fallbacks[context?.agentMode || 'planner'] || 
                "I'm enhancing your luxury travel plan. For immediate details, our Himalayan specialists are available at contact@curatedascents.com",
      metadata: {
        reasoning: "System optimizing: Providing curated recommendations from 25+ years of Himalayan luxury expertise",
        suggestions: ["Contact for exact pricing", "Request specific dates", "Ask about monsoon-season alternatives"],
        isFallback: true
      }
    }, { status: 500 });
  }
}