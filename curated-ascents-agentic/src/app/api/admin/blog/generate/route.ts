import { NextRequest, NextResponse } from "next/server";
import {
  generateBlogPost,
  generateTitleSuggestions,
  BlogContentType,
} from "@/lib/blog/blog-writer-agent";
import { suggestKeywords, analyzeSEO } from "@/lib/blog/seo-optimizer";
import { generateAllSocialPosts } from "@/lib/blog/social-media-formatter";

export const dynamic = "force-dynamic";

// POST - Generate blog content with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic,
      contentType = "destination_guide",
      destination,
      keywords,
      targetLength = "medium",
      additionalContext,
      action = "generate", // 'generate' | 'suggest_titles' | 'suggest_keywords' | 'analyze_seo' | 'generate_social'
    } = body;

    if (!topic && action !== "analyze_seo" && action !== "generate_social") {
      return NextResponse.json(
        { error: "Missing required field: topic" },
        { status: 400 }
      );
    }

    switch (action) {
      case "generate": {
        // Full blog post generation (includes media library image lookup)
        const draft = await generateBlogPost({
          topic,
          contentType: contentType as BlogContentType,
          destination,
          keywords,
          targetLength,
          additionalContext,
        });

        return NextResponse.json({
          success: true,
          draft,
          featuredImage: draft.featuredImage || null,
          featuredImageAlt: draft.featuredImageAlt || null,
        });
      }

      case "suggest_titles": {
        // Generate title suggestions only
        const count = body.count || 5;
        const titles = await generateTitleSuggestions(
          topic,
          contentType as BlogContentType,
          count
        );

        return NextResponse.json({
          success: true,
          titles,
        });
      }

      case "suggest_keywords": {
        // Generate keyword suggestions
        const suggestedKeywords = suggestKeywords(topic, destination, contentType);

        return NextResponse.json({
          success: true,
          keywords: suggestedKeywords,
        });
      }

      case "analyze_seo": {
        // Analyze existing content for SEO
        const { title, content } = body;

        if (!title || !content) {
          return NextResponse.json(
            { error: "Missing required fields: title, content" },
            { status: 400 }
          );
        }

        const analysis = analyzeSEO(title, content, keywords || []);

        return NextResponse.json({
          success: true,
          analysis,
        });
      }

      case "generate_social": {
        // Generate social media posts
        const { title, excerpt, slug, featuredImage } = body;

        if (!title || !excerpt || !slug) {
          return NextResponse.json(
            { error: "Missing required fields: title, excerpt, slug" },
            { status: 400 }
          );
        }

        const socialPosts = generateAllSocialPosts({
          title,
          excerpt,
          slug,
          destination,
          contentType,
          featuredImage,
        });

        return NextResponse.json({
          success: true,
          socialPosts,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in blog generation:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
