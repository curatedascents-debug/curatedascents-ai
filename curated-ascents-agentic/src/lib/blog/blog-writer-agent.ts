/**
 * AI Blog Writer Agent
 * Generates SEO-optimized travel content using DeepSeek
 */

import { generateSEOMetadata, analyzeSEO, suggestKeywords } from "./seo-optimizer";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export type BlogContentType =
  | "destination_guide"
  | "travel_tips"
  | "packing_list"
  | "cultural_insights"
  | "seasonal_content"
  | "trip_report";

export interface BlogGenerationRequest {
  topic: string;
  contentType: BlogContentType;
  destination?: string;
  keywords?: string[];
  targetLength?: "short" | "medium" | "long"; // 800-1200 | 1200-1800 | 1800-2500 words
  additionalContext?: string;
}

export interface BlogPostDraft {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tags: string[];
  readTimeMinutes: number;
  seoScore: number;
  suggestedSlug: string;
  featuredImage?: string;
  featuredImageAlt?: string;
}

const CONTENT_TYPE_CONFIG: Record<
  BlogContentType,
  {
    wordRange: { min: number; max: number };
    focus: string;
    ctaType: string;
    sections: string[];
  }
> = {
  destination_guide: {
    wordRange: { min: 2000, max: 2500 },
    focus: "Comprehensive destination overview with practical information",
    ctaType: "Plan Your Journey",
    sections: [
      "Overview",
      "Best Time to Visit",
      "Getting There",
      "Top Experiences",
      "Where to Stay",
      "Practical Tips",
      "Planning Your Trip",
    ],
  },
  travel_tips: {
    wordRange: { min: 800, max: 1200 },
    focus: "Actionable advice for travelers",
    ctaType: "Ask Our Experts",
    sections: ["Introduction", "Key Tips", "Common Mistakes", "Expert Advice", "Conclusion"],
  },
  packing_list: {
    wordRange: { min: 1000, max: 1500 },
    focus: "Detailed gear and packing recommendations",
    ctaType: "Get Personalized List",
    sections: [
      "Essential Gear",
      "Clothing",
      "Documents & Money",
      "Health & Safety",
      "Tech & Gadgets",
      "Pro Tips",
    ],
  },
  cultural_insights: {
    wordRange: { min: 1200, max: 1800 },
    focus: "Local customs, traditions, and etiquette",
    ctaType: "Explore Experiences",
    sections: [
      "Cultural Overview",
      "Local Customs",
      "Etiquette & Respect",
      "Festivals & Celebrations",
      "Language Basics",
      "Meaningful Interactions",
    ],
  },
  seasonal_content: {
    wordRange: { min: 1000, max: 1500 },
    focus: "Best times to visit and seasonal highlights",
    ctaType: "Book Now",
    sections: [
      "Season Overview",
      "Weather Patterns",
      "Peak vs Off-Peak",
      "Seasonal Activities",
      "Booking Tips",
      "Our Recommendation",
    ],
  },
  trip_report: {
    wordRange: { min: 1500, max: 2000 },
    focus: "Compelling narrative of a real travel experience",
    ctaType: "Create Your Story",
    sections: [
      "The Journey Begins",
      "Day-by-Day Highlights",
      "Memorable Moments",
      "Challenges & Surprises",
      "Final Reflections",
      "Advice for Future Travelers",
    ],
  },
};

/**
 * Build the system prompt for blog generation
 */
function buildSystemPrompt(contentType: BlogContentType): string {
  const config = CONTENT_TYPE_CONFIG[contentType];

  return `You are a luxury travel content writer for CuratedAscents, a high-end adventure travel company specializing in Nepal, Tibet, Bhutan, and India.

## Your Writing Style
- **Tone**: Sophisticated, informative, inspiring
- **Audience**: High-net-worth travelers seeking authentic, transformative experiences
- **Voice**: Expert yet approachable, passionate about the destinations
- **Quality**: Premium, well-researched, engaging

## Content Guidelines
1. Write in markdown format with clear H2 (##) and H3 (###) headings
2. Use bullet points and numbered lists for easy scanning
3. Include vivid descriptions that evoke the destination's atmosphere
4. Balance practical information with inspiring storytelling
5. Naturally integrate target keywords without keyword stuffing
6. Include a compelling introduction that hooks the reader
7. End with a clear call-to-action

## Content Type: ${contentType.replace(/_/g, " ").toUpperCase()}
- Focus: ${config.focus}
- Target length: ${config.wordRange.min}-${config.wordRange.max} words
- Suggested sections: ${config.sections.join(", ")}
- CTA: "${config.ctaType}"

## Formatting Rules
- Use ## for main sections
- Use ### for subsections
- Use **bold** for emphasis on key points
- Use > for inspirational quotes or highlight boxes
- Include a brief author bio note at the end

## Important
- Never mention specific prices (they change seasonally)
- Focus on experiences, not transactions
- Highlight luxury touches and exclusive access
- Mention safety and sustainability considerations
- Be culturally respectful and accurate`;
}

/**
 * Build the user prompt for specific content generation
 */
function buildUserPrompt(request: BlogGenerationRequest): string {
  const config = CONTENT_TYPE_CONFIG[request.contentType];
  const lengthWord = request.targetLength === "short" ? "concise" : request.targetLength === "long" ? "comprehensive" : "detailed";

  let prompt = `Write a ${lengthWord} ${request.contentType.replace(/_/g, " ")} blog post about: ${request.topic}`;

  if (request.destination) {
    prompt += `\n\nDestination focus: ${request.destination}`;
  }

  if (request.keywords && request.keywords.length > 0) {
    prompt += `\n\nTarget keywords to naturally incorporate: ${request.keywords.join(", ")}`;
  }

  if (request.additionalContext) {
    prompt += `\n\nAdditional context: ${request.additionalContext}`;
  }

  prompt += `\n\n## Requirements:
1. Create an engaging title that includes the primary keyword
2. Write ${config.wordRange.min}-${config.wordRange.max} words
3. Include these sections: ${config.sections.join(", ")}
4. End with a CTA: "${config.ctaType}"
5. Format output as:

---
TITLE: [Your catchy title here]
---

[Full markdown content starting with an engaging introduction]

---
EXCERPT: [A compelling 150-200 character excerpt for blog listings]
---
TAGS: [comma-separated relevant tags, 5-8 tags]
---`;

  return prompt;
}

/**
 * Parse the AI response into structured blog post draft
 */
function parseAIResponse(response: string, request: BlogGenerationRequest): BlogPostDraft {
  // Extract title
  const titleMatch = response.match(/---\s*TITLE:\s*(.+?)\s*---/i);
  const title = titleMatch ? titleMatch[1].trim() : request.topic;

  // Extract excerpt
  const excerptMatch = response.match(/---\s*EXCERPT:\s*([\s\S]+?)\s*---/i);
  const excerpt = excerptMatch ? excerptMatch[1].trim() : "";

  // Extract tags
  const tagsMatch = response.match(/---\s*TAGS:\s*([\s\S]+?)\s*---/i);
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // Extract main content (between title and excerpt sections)
  let content = response;
  if (titleMatch) {
    content = content.replace(/---\s*TITLE:\s*.+?\s*---/i, "");
  }
  if (excerptMatch) {
    content = content.replace(/---\s*EXCERPT:\s*[\s\S]+?\s*---/i, "");
  }
  if (tagsMatch) {
    content = content.replace(/---\s*TAGS:\s*[\s\S]+?\s*---/i, "");
  }
  content = content.trim();

  // Generate SEO metadata
  const seoMetadata = generateSEOMetadata(
    title,
    content,
    request.destination,
    request.contentType
  );

  // Analyze SEO
  const keywords = request.keywords || suggestKeywords(title, request.destination, request.contentType);
  const seoAnalysis = analyzeSEO(title, content, keywords);

  return {
    title,
    content,
    excerpt: excerpt || seoMetadata.metaDescription,
    metaTitle: seoMetadata.metaTitle,
    metaDescription: seoMetadata.metaDescription,
    keywords,
    tags,
    readTimeMinutes: seoMetadata.readTimeMinutes,
    seoScore: seoAnalysis.score,
    suggestedSlug: seoMetadata.slug,
  };
}

/**
 * Generate a blog post using AI
 */
export async function generateBlogPost(
  request: BlogGenerationRequest
): Promise<BlogPostDraft> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API key not configured");
  }

  const systemPrompt = buildSystemPrompt(request.contentType);
  const userPrompt = buildUserPrompt(request);

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
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8, // Slightly higher for creative writing
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DeepSeek API error:", errorText);
    throw new Error("Failed to generate blog content");
  }

  const data = await response.json();
  const aiContent = data.choices[0]?.message?.content;

  if (!aiContent) {
    throw new Error("No content generated");
  }

  const draft = parseAIResponse(aiContent, request);

  // Try to find a featured image from the media library
  try {
    const { findBlogFeaturedImage } = await import("@/lib/media/media-service");
    const image = await findBlogFeaturedImage({
      destination: request.destination,
      country: request.destination, // destination name may match country
      contentType: request.contentType,
    });
    if (image) {
      draft.featuredImage = image.cdnUrl;
      draft.featuredImageAlt = image.altText;
    }
  } catch (err) {
    // Media library lookup is non-critical — continue without image
    console.warn("Media library image lookup failed:", err);
  }

  return draft;
}

/**
 * Regenerate specific sections of a blog post
 */
export async function regenerateSection(
  originalContent: string,
  sectionToRegenerate: string,
  instructions: string
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API key not configured");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a travel content editor. Rewrite the specified section while maintaining the overall flow and style.",
        },
        {
          role: "user",
          content: `Original content:\n\n${originalContent}\n\nSection to rewrite: "${sectionToRegenerate}"\n\nInstructions: ${instructions}\n\nReturn the FULL updated content with the section rewritten.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to regenerate section");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || originalContent;
}

/**
 * Generate title suggestions for a topic
 */
export async function generateTitleSuggestions(
  topic: string,
  contentType: BlogContentType,
  count: number = 5
): Promise<string[]> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API key not configured");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are an SEO expert and travel content strategist. Generate compelling blog post titles that are SEO-optimized and appealing to luxury travelers.",
        },
        {
          role: "user",
          content: `Generate ${count} compelling title options for a ${contentType.replace(/_/g, " ")} blog post about: ${topic}\n\nFormat: One title per line, no numbering.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate titles");
  }

  const data = await response.json();
  const titles = data.choices[0]?.message?.content
    .split("\n")
    .map((t: string) => t.trim())
    .filter((t: string) => t.length > 0);

  return titles || [];
}
