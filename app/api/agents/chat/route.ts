import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const AGENT_PROMPTS = {
  planner: `You are a travel planning expert. Use ONLY plain text. Never use markdown like #, *, backticks. Use • for bullet points.`,
  negotiator: `You are a travel negotiation expert. Use ONLY plain text. Never use markdown like #, *, backticks. Use • for bullet points.`,
  concierge: `You are a travel concierge expert. Use ONLY plain text. Never use markdown like #, *, backticks. Use • for bullet points.`,
};

// Simple text cleaner
function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[#*`_\-~>\[\]\(\)]/g, '')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { messages, agent } = await request.json();
    
    const validAgents = ['planner', 'negotiator', 'concierge'];
    if (!agent || !validAgents.includes(agent)) {
      return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
    }

    const apiMessages = [
      { role: 'system', content: AGENT_PROMPTS[agent as keyof typeof AGENT_PROMPTS] },
      ...messages.slice(-5)
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';
    const cleanedResponse = cleanText(aiResponse);

    return NextResponse.json({ response: cleanedResponse });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
