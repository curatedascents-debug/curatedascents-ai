import { NextRequest, NextResponse } from 'next/server';
import { getAgentMemory, updateAgentMemory } from '@/lib/agents/memory';

export async function POST(request: NextRequest) {
  try {
    const { messages, agentMode, sessionId, travelPreferences } = await request.json();
    
    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get context from memory
    let memoryContext = {};
    try {
      memoryContext = await getAgentMemory(sessionId);
    } catch (memoryError) {
      console.log('Memory system not available, starting fresh');
    }

    // System prompt based on agent mode
    const modePrompts = {
      planner: 'Focus on itinerary design, weather optimization, VIP access scoring, and luxury accommodations.',
      negotiator: 'Focus on multi-vendor rate comparison, premium upgrades, exclusive access negotiation, and value optimization.',
      concierge: 'Focus on personalized surprises, real-time local coordination, unique experiences, and guest delight.'
    };

    const systemPrompt = `You are CuratedAscents AI, a luxury Himalayan travel specialist with 25+ years of experience.

Mode: ${agentMode || 'planner'}
${modePrompts[agentMode as keyof typeof modePrompts] || modePrompts.planner}

Memory Context: ${JSON.stringify(memoryContext)}

Travel Preferences: ${JSON.stringify(travelPreferences || {})}

Always structure responses with:
1. Brief acknowledgment
2. Specific, actionable suggestions
3. Luxury differentiators
4. Budget tier alignment (Ultra-Luxury: $25k+, Luxury: $10k-25k, Premium: $5k-10k)
5. Next step recommendation

Incorporate Himalayan luxury keywords: private helicopter, butler service, mountain villa, monastery access, spa retreat, exclusive access, personal guide.`;

    // Get DeepSeek API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not configured');
      
      // Return a fallback response
      const fallbackResponses = {
        planner: "I'm currently designing your bespoke Himalayan itinerary. For immediate details, our luxury travel specialists are available at contact@curatedascents.com",
        negotiator: "I'm securing premium upgrades and exclusive rates for your journey. For real-time negotiation, contact our team at contact@curatedascents.com",
        concierge: "I'm arranging personalized surprises for your Himalayan adventure. For immediate concierge service, reach us at contact@curatedascents.com"
      };
      
      const fallbackMode = agentMode || 'planner';
      const fallbackResponse = fallbackResponses[fallbackMode as keyof typeof fallbackResponses] || 
        fallbackResponses.planner;
      
      return NextResponse.json({ 
        message: fallbackResponse,
        sessionId: sessionId || `session_${Date.now()}`,
        mode: agentMode || 'planner',
        budgetTier: travelPreferences?.budget || 'luxury',
        suggestions: [
          "Private helicopter tour of Everest",
          "Luxury villa with butler service",
          "Exclusive monastery access",
          "Personalized spa retreat"
        ],
        followUpQuestion: "What specific Himalayan destination are you most drawn to?"
      });
    }

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10) // Last 10 messages for context
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: false
      })
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', deepseekResponse.status, errorText);
      
      // Return a fallback response
      return NextResponse.json({
        message: `I'm enhancing your luxury travel plan. For immediate details, our Himalayan specialists are available at contact@curatedascents.com`,
        sessionId: sessionId || `session_${Date.now()}`,
        mode: agentMode || 'planner',
        budgetTier: travelPreferences?.budget || 'luxury',
        suggestions: [
          "Private helicopter tour of Everest",
          "Luxury villa with butler service",
          "Exclusive monastery access",
          "Personalized spa retreat"
        ],
        followUpQuestion: "What specific Himalayan destination are you most drawn to?"
      });
    }

    const data = await deepseekResponse.json();
    const aiMessage = data.choices[0]?.message?.content || 
      "I appreciate your interest in luxury Himalayan travel. Based on 25+ years of expertise, I recommend our signature 'Himalayan Royal Retreat' with private helicopter transfers and exclusive monastery access.";

    // Update memory with this interaction
    if (sessionId) {
      try {
        await updateAgentMemory(sessionId, {
          lastInteraction: new Date().toISOString(),
          agentMode: agentMode || 'planner',
          conversationSummary: `User interested in: ${messages[messages.length - 1]?.content?.substring(0, 100)}...`,
          preferences: travelPreferences || {}
        });
      } catch (memoryError) {
        console.log('Memory update failed:', memoryError);
      }
    }

    return NextResponse.json({ 
      message: aiMessage,
      sessionId: sessionId || `session_${Date.now()}`,
      mode: agentMode || 'planner',
      budgetTier: travelPreferences?.budget || 'luxury',
      suggestions: [
        "Private helicopter tour of Everest",
        "Luxury villa with butler service",
        "Exclusive monastery access",
        "Personalized spa retreat"
      ],
      followUpQuestion: "What specific Himalayan destination are you most drawn to?"
    });

  } catch (error) {
    console.error('Agent API error:', error);
    
    return NextResponse.json({ 
      message: "I apologize for the interruption. As your luxury travel AI, I'm here to design exceptional Himalayan experiences. Please try again or contact our team at contact@curatedascents.com for immediate assistance.",
      sessionId: `error_session_${Date.now()}`,
      mode: 'planner',
      budgetTier: 'luxury',
      suggestions: [
        "Retry the conversation",
        "Contact our luxury specialists",
        "Browse our signature experiences"
      ]
    });
  }
}
