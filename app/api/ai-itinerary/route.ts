import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { destination, duration, travelers, interests, budget, specialRequests } = await request.json();

    // Your DeepSeek API key - we'll set this as environment variable
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DeepSeek API key is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again or contact us directly.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the AI response into structured format
    return NextResponse.json({
      success: true,
      itinerary: aiResponse,
      // You can add more structured parsing here as needed
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}// AI API configured on Sun Dec 28 05:36:55 UTC 2025
