import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔧 Enhanced AI Itinerary API called:', new Date().toISOString());
  
  try {
    const body = await request.json();
    const { 
      destination, 
      duration, 
      travelers, 
      interests, 
      budget, 
      specialRequests,
      travelerType,
      pace,
      accommodationStyle 
    } = body;
    
    console.log('📋 Received enhanced preferences:', { 
      destination, 
      duration, 
      travelers, 
      interests: interests?.length || 0,
      budget,
      travelerType,
      pace,
      accommodationStyle
    });

    // Check environment variables
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('❌ DeepSeek API key is missing');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('🚀 Proceeding with enhanced API call to DeepSeek...');

    // Enhanced prompt with Kiran's expertise
    const prompt = `You are Kiran Pokhrel's AI assistant, with access to 28 years of Himalayan luxury travel expertise. 
    Create a detailed luxury itinerary using Kiran's knowledge and operational experience.

CLIENT PROFILE:
- Destination: ${destination}
- Duration: ${duration} days
- Travelers: ${travelers} ${travelers === '1' ? 'person' : 'people'}
- Traveler Type: ${travelerType || 'luxury traveler'}
- Pace Preference: ${pace || 'moderate'}
- Accommodation Style: ${accommodationStyle || 'luxury'}
- Interests: ${interests.join(', ')}
- Budget Level: ${budget}
- Special Requests: ${specialRequests || 'None'}

KIRAN'S EXPERTISE TO APPLY:
1. Altitude considerations: Include proper acclimatization for luxury comfort
2. Seasonality: Recommend best months based on 28 years of operations
3. Luxury properties: Suggest specific high-end hotels/lodges Kiran has relationships with
4. Exclusive access: Include experiences not available to standard tours
5. Safety protocols: Built-in safety from insurance industry experience
6. Cultural authenticity: Genuine local experiences with proper protocols

ITINERARY REQUIREMENTS:
1. Start with an engaging title that reflects luxury and destination
2. Include a "Why This Journey Is Unique" section highlighting Kiran's expertise
3. Day-by-day breakdown with:
   - Morning, afternoon, evening activities
   - Specific luxury accommodation recommendations
   - Dining suggestions (private dining where appropriate)
   - Transportation details (private vehicles, helicopters if budget allows)
4. Estimated cost range in USD (be realistic for luxury travel)
5. Best season to visit with specific month recommendations
6. Packing tips specific to this itinerary
7. 4-5 professional tips from Kiran's operational experience

FORMAT REQUIREMENTS:
- Use clear markdown formatting
- Include emojis for visual appeal
- Bold important luxury features
- Keep it professional but engaging
- End with how to proceed with Kiran's team

Remember: This is for high-net-worth clients who value exclusivity, comfort, and authentic experiences. 
Every recommendation should reflect 28 years of hands-on Himalayan luxury travel operations.`;

    console.log('📤 Making enhanced request to DeepSeek API...');
    
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
            content: `You are Kiran Pokhrel's AI travel concierge. You have access to 28 years of Himalayan luxury travel expertise including:
            
1. Operational knowledge of Nepal, Tibet, and Bhutan luxury travel
2. Network of 500+ vetted luxury suppliers
3. Altitude and safety protocols from decades of experience
4. Exclusive access to properties and experiences not available publicly
5. Cultural protocols and authentic local connections
6. Enterprise technology background from Travelport, American Airlines, Amex GBT

You create detailed, practical, and exclusive travel itineraries that reflect real operational knowledge. 
Be specific about locations, timing, unique experiences, and luxury considerations. 
Always include Kiran's professional tips based on actual experience.

Format responses in elegant markdown with clear sections and emoji enhancement for readability.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.8,
        stream: false,
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
    console.log('✅ Enhanced DeepSeek API call successful');
    console.log('📄 Response token usage:', data.usage?.total_tokens || 'unknown');

    const aiResponse = data.choices[0].message.content;

    // Add Kiran's signature note
    const enhancedResponse = `${aiResponse}

---
*This itinerary was generated by CuratedAscents AI, powered by Kiran Pokhrel's 28+ years of Himalayan luxury travel expertise and enterprise technology background.*

**Next Steps with Kiran's Team:**
1. Review this itinerary with our Nepal-based experts
2. Customize based on your specific preferences
3. Secure bookings through Kiran's luxury network
4. Receive white-glove service throughout your journey

*Contact Kiran's team at kiran@curatedascents.com to begin the refinement process.*`;

    return NextResponse.json({
      success: true,
      itinerary: enhancedResponse,
      expertiseApplied: true,
      generatedAt: new Date().toISOString(),
      expertiseYears: 28
    });

  } catch (error) {
    console.error('💥 Enhanced API route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}