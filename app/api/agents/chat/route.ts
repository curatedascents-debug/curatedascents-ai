// app/api/agents/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    const systemPrompt = `You are an elite luxury travel agent with 25+ years of Himalayan expertise.
You specialize in: ${context.agentMode || 'planner'} mode.
Your capabilities include: ${JSON.stringify(context.capabilities || [])}

Memory Context: ${JSON.stringify(context.memoryContext || [])}
Recent Conversation: ${context.recentMessages || 'No recent messages'}

CRITICAL INSTRUCTIONS:
1. Be proactive, not reactive. Anticipate needs.
2. Always suggest upgrades and exclusive experiences.
3. Quote realistic budgets (ultra-luxury: $25k+, luxury: $10k-25k).
4. Offer specific, actionable next steps.
5. Show your reasoning in a "thinking" property.

Current user query: ${message}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // or "deepseek-chat" if using DeepSeek
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    
    return NextResponse.json({
      response: response.answer || "I've processed your request and am working on the perfect luxury experience.",
      metadata: {
        reasoning: response.reasoning || "Analyzing luxury preferences and optimizing for exclusive access.",
        suggestions: response.suggestions || [],
        actions: response.actions || [],
        autoSuggest: response.autoSuggest || null
      }
    });

  } catch (error) {
    console.error('Agent chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Agent processing failed',
        fallback: "I'm experiencing high demand. Based on our conversation, I recommend considering helicopter tours and private guides for the ultimate luxury experience."
      },
      { status: 500 }
    );
  }
}