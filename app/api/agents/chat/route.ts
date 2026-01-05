import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// SIMPLE SYSTEM PROMPTS - NO BACKTICKS, NO SPECIAL CHARACTERS
const AGENT_PROMPTS = {
  planner: `You are a travel planning expert. 
IMPORTANT FORMATTING RULES:
- NEVER use markdown symbols like hashtag, asterisk, or backtick
- NEVER use headers with hashtags
- NEVER use bold or italic formatting
- Use plain text only with normal punctuation
- Use bullet points with the bullet symbol • instead of asterisk or dash
- Use normal line breaks for paragraphs
- If you need emphasis, use CAPITAL LETTERS or write (important)
- Format lists with numbers like 1) 2) 3) instead of 1. 2. 3.
- Replace any markdown symbol with plain text equivalents`,

  negotiator: `You are a travel negotiation expert.
IMPORTANT FORMATTING RULES:
- NEVER use markdown symbols like hashtag, asterisk, or backtick
- NEVER use headers with hashtags
- NEVER use bold or italic formatting
- Use plain text only with normal punctuation
- Use bullet points with the bullet symbol • instead of asterisk or dash
- Use normal line breaks for paragraphs
- If you need emphasis, use CAPITAL LETTERS or write (important)
- Format lists with numbers like 1) 2) 3) instead of 1. 2. 3.
- Replace any markdown symbol with plain text equivalents`,

  concierge: `You are a travel concierge expert.
IMPORTANT FORMATTING RULES:
- NEVER use markdown symbols like hashtag, asterisk, or backtick
- NEVER use headers with hashtags
- NEVER use bold or italic formatting
- Use plain text only with normal punctuation
- Use bullet points with the bullet symbol • instead of asterisk or dash
- Use normal line breaks for paragraphs
- If you need emphasis, use CAPITAL LETTERS or write (important)
- Format lists with numbers like 1) 2) 3) instead of 1. 2. 3.
- Replace any markdown symbol with plain text equivalents`,
};

// Simple text cleaner function
function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`/g, '')
    // Convert markdown lists to bullet points
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove other markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/_{1,}/g, '')
    .replace(/~{1,}/g, '')
    .replace(/>\s*/g, '')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { messages, agent } = await request.json();

    const validAgents = ['planner', 'negotiator', 'concierge'];
    if (!agent || !validAgents.includes(agent)) {
      return NextResponse.json(
        { error: 'Invalid agent specified' },
        { status: 400 }
      );
    }

    // Get memory context
    const memoryManager = new MemoryManager();
    const memoryContext = await memoryManager.getMemoryContext(messages);

    // Prepare system message
    let systemMessage = `${AGENT_PROMPTS[agent as keyof typeof AGENT_PROMPTS]}\n\n`;
    if (memoryContext) {
      systemMessage += `Previous conversation context:\n${memoryContext}\n\n`;
    }
    systemMessage += `Current user query: ${messages[messages.length - 1]?.content || ''}\n\n`;
    systemMessage += `Remember: Use ONLY plain text format with bullet points (•) for lists.`;

    // Prepare messages for API
    const apiMessages = [
      {
        role: 'system',
        content: systemMessage
      },
      ...messages.slice(-3).map((msg: any) => ({ // Only last 3 messages for context
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call DeepSeek API
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

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Clean the response
    let cleanedResponse = cleanText(aiResponse);

    // Extra safety cleaning
    cleanedResponse = cleanedResponse
      .replace(/[#*`_\-~>\[\]\(\)]/g, '')
      .replace(/^\s*[•\-]\s+/gm, '• ')
      .trim();

    // Save to memory
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    await memoryManager.saveToMemory(lastUserMessage, cleanedResponse);

    return NextResponse.json({
      response: cleanedResponse
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}