import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔧 API route called at:', new Date().toISOString());
  
  try {
    const body = await request.json();
    const { destination, duration, travelers, interests, budget, specialRequests } = body;
    
    console.log('📋 Received preferences:', { 
      destination, 
      duration, 
      travelers, 
      interests: interests?.length || 0,
      budget 
    });

    // Debug: Check environment variables
    console.log('🔑 Checking for DEEPSEEK_API_KEY in environment...');
    const apiKey = process.env.DEEPSEEK_API_KEY;
    console.log('✅ API key exists:', !!apiKey);
    console.log('📏 API key length:', apiKey ? `${apiKey.length} characters` : '0');
    console.log('🔍 API key starts with:', apiKey ? apiKey.substring(0, 5) + '...' : 'none');
    
    if (!apiKey) {
      console.error('❌ DeepSeek API key is missing from environment variables');
      console.log('📋 Available env vars:', Object.keys(process.env).filter(k => k.includes('DEEPSEEK') || k.includes('API')));
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('🚀 Proceeding with API call to DeepSeek...');

    // Construct the prompt using your 25 years of expertise
    const prompt = `As a Himalayan travel expert with 25 years of experience operating luxury tours in Nepal, Tibet, and Bhutan, create a detailed itinerary with these parameters:

Destination: ${destination}
Duration: ${duration} days
Travelers: ${travelers} ${travelers === '1' ? 'person' : 'people'}
Interests: ${interests.join(', ')}
Budget Level: ${budget}
Special Requests: ${specialRequests || 'None'}

Please provide:
1. A day-by-day itinerary with unique, insider experiences only a local expert would know
2. Estimated cost range in USD (be realistic for luxury travel)
3. Best season to visit with specific month recommendations
4. 3-4 professional tips based on actual operational experience

Format the response clearly for a luxury travel client. Focus on exclusive access, safety considerations, and authentic cultural immersion.`;

    console.log('📤 Making request to DeepSeek API...');
    
    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a Himalayan travel expert with 25 years of experience operating luxury tours. Provide detailed, practical, and exclusive travel advice. Be specific about locations, timing, and unique experiences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    console.log('📥 DeepSeek response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ DeepSeek API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again or contact us directly.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ DeepSeek API call successful');
    console.log('📄 Response token usage:', data.usage?.total_tokens || 'unknown');

    const aiResponse = data.choices[0].message.content;

    // Parse the AI response into structured format
    return NextResponse.json({
      success: true,
      itinerary: aiResponse,
    });

  } catch (error) {
    console.error('💥 API route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}