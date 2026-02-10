/**
 * Admin Media — AI Auto-Tag
 * POST /api/admin/media/auto-tag
 * Body: { imageUrl: string }
 * Returns AI-generated: tags, description, altText, category, suggestedDestination
 */

import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an image analysis assistant for CuratedAscents, a luxury adventure travel company focused on Nepal, India, Tibet, and Bhutan.

Analyze the provided image URL and return a JSON object with these fields:
- "tags": array of 5-10 descriptive tags (lowercase, single words or short phrases)
- "description": 1-2 sentence descriptive caption for SEO (include location if identifiable)
- "altText": short alt text for accessibility (under 125 characters)
- "category": one of: landscape, hotel, trek, culture, food, wildlife, temple, adventure, wellness, people, aerial, luxury, heritage
- "suggestedDestination": best guess destination name (e.g., "Kathmandu", "Everest Region", "Paro Valley", "Rajasthan")
- "suggestedCountry": one of: nepal, india, tibet, bhutan (best guess)
- "suggestedSeason": one of: spring, summer, monsoon, autumn, winter, all

Return ONLY valid JSON, no markdown fencing or explanation.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this travel photo and return the JSON metadata: ${imageUrl}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek auto-tag error:", errorText);
      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response (handle potential markdown fencing)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          rawResponse: content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Auto-tag error:", error);
    return NextResponse.json(
      { error: "Auto-tag failed" },
      { status: 500 }
    );
  }
}
