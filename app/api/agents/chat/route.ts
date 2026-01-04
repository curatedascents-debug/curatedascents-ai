import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory';
import { cleanText, aggressiveClean } from '@/lib/utils/textCleaner';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// STRONGER SYSTEM PROMPT
const FORMATTING_RULES = `
CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE:
1. NEVER use markdown symbols: #, *, **, ``, ```, _, ~, >, [,], (, )
2. NEVER use headers like # Title or ## Subtitle
3. NEVER use bold or italic formatting
4. NEVER use code blocks or inline code
5. Use plain text only with normal punctuation
6. Use bullet points with • instead of * or -
  7. Use normal line breaks for paragraphs
8. If you need emphasis, use CAPITAL LETTERS or(important) notation
9. Format lists with numbers like 1) 2) 3) instead of 1. 2. 3.
`;

const AGENT_PROMPTS = {
  planner: `You are a travel planning expert.${ FORMATTING_RULES } `,
  negotiator: `You are a travel negotiation expert.${ FORMATTING_RULES } `,
  concierge: `You are a travel concierge expert.${ FORMATTING_RULES } `,
};

export async function POST(request: NextRequest) {
  try {
    const { messages, agent } = await request.json();
    
    if (!agent || !AGENT_PROMPTS[agent as keyof typeof AGENT_PROMPTS]) {
      return NextResponse.json(
        { error: 'Invalid agent specified' },
        { status: 400 }
      );
    }

    // Get memory context
    const memoryManager = new MemoryManager();
    const memoryContext = await memoryManager.getMemoryContext(messages);
    
    // Prepare messages for API
    const apiMessages = [
      {
        role: 'system',
        content: `${ AGENT_PROMPTS[agent as keyof typeof AGENT_PROMPTS] }

Remember: ABSOLUTELY NO MARKDOWN FORMATTING.
        If you use markdown, the response will be broken.
        Use plain text only with • for bullet points.

  ${ memoryContext? `Previous context:\n${memoryContext}` : ''}`
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ DEEPSEEK_API_KEY } `,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${ response.status } `);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Apply MULTI-LAYER cleaning
    let cleanedResponse = cleanText(aiResponse);
    
    // Double-check for any remaining markdown
    if (hasMarkdown(cleanedResponse)) {
      cleanedResponse = aggressiveClean(cleanedResponse);
    }
    
    // Final safety check - remove any remaining special characters
    cleanedResponse = cleanedResponse.replace(/[#*`_\-~>\[\]\(\)]/g, '');

// Save to memory
const lastUserMessage = messages[messages.length - 1]?.content || '';
await memoryManager.saveToMemory(lastUserMessage, cleanedResponse);

return NextResponse.json({
  response: cleanedResponse,
  rawResponse: aiResponse // Keep for debugging
});

  } catch (error) {
  console.error('Chat API error:', error);
  return NextResponse.json(
    { error: 'Failed to process chat request' },
    { status: 500 }
  );
}
}