import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory';
import { cleanText, hasMarkdown } from '@/lib/utils/textCleaner';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// STRONGER SYSTEM PROMPT - using escaped backticks
const FORMATTING_RULES = `
CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE:
1. NEVER use markdown symbols: #, *, **, backticks, triple backticks, _, ~, >, [, ], (, )
2. NEVER use headers like hash Title or double hash Subtitle
3. NEVER use bold or italic formatting
4. NEVER use code blocks or inline code
5. Use plain text only with normal punctuation
6. Use bullet points with bullet symbol • instead of asterisk or dash
7. Use normal line breaks for paragraphs
8. If you need emphasis, use CAPITAL LETTERS or (important) notation
9. Format lists with numbers like 1) 2) 3) instead of 1. 2. 3.
10. IMPORTANT: Replace any markdown symbol with plain text equivalents
`;

const AGENT_PROMPTS = {
  planner: `You are a travel planning expert. ${FORMATTING_RULES}`,
  negotiator: `You are a travel negotiation expert. ${FORMATTING_RULES}`,
  concierge: `You are a travel concierge expert. ${FORMATTING_RULES}`,
};

// Nuclear cleaning function as last resort
function nuclearClean(text: string): string {
  // Remove ALL non-alphanumeric characters except basic punctuation and spaces
  return text
    .replace(/[^\w\s.,!?;:'"()•\n]/g, '') // Only allow these characters
    .replace(/\s+/g, ' ')
    .trim();
}

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

    // Prepare messages for API with STRONG formatting instructions
    const apiMessages = [
      {
        role: 'system',
        content: `${AGENT_PROMPTS[agent as keyof typeof AGENT_PROMPTS]}
        
        ABSOLUTELY NO MARKDOWN FORMATTING ALLOWED!
        DO NOT USE: # * ** backticks ``` _ ~ > []()
        USE ONLY: Plain text, bullet •, numbers with )

    IMPORTANT: If you use any markdown, the response will be broken and unusable.

      ${ memoryContext ? `Previous context:\n${memoryContext}` : '' } `
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
    
    // Check for any remaining markdown
    if (hasMarkdown(cleanedResponse)) {
      // Try more aggressive cleaning
      cleanedResponse = cleanedResponse
        .replace(/[#*`_\-~>\[\]\(\)]/g, '')
        .replace(/^\s*[•\-]\s+/gm, '• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

    // Final nuclear option if still has problematic characters
    const problematicChars = /[#*`_]/;
  if (problematicChars.test(cleanedResponse)) {
    cleanedResponse = nuclearClean(cleanedResponse);
  }

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