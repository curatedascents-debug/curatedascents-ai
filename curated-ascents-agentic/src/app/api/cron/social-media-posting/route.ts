import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogSocialPosts, blogPosts } from "@/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn("CRON_SECRET not configured");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Placeholder for social media API integration
 * In production, this would call the actual social media APIs:
 * - Instagram Graph API
 * - Facebook Graph API
 * - LinkedIn API
 * - Twitter/X API
 */
async function postToSocialMedia(
  platform: string,
  text: string,
  imageUrl?: string | null,
  hashtags?: string[] | null
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement actual social media posting
  // For now, just log the attempt

  console.log(`[Social Media] Would post to ${platform}:`, {
    text: text.substring(0, 100) + "...",
    imageUrl,
    hashtagCount: hashtags?.length || 0,
  });

  // Simulate success (in production, this would be the actual API response)
  return { success: true };
}

// POST - Post scheduled social media content
export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find social posts that are scheduled and ready to post
    const scheduledPosts = await db
      .select({
        id: blogSocialPosts.id,
        blogPostId: blogSocialPosts.blogPostId,
        platform: blogSocialPosts.platform,
        postText: blogSocialPosts.postText,
        hashtags: blogSocialPosts.hashtags,
        imageUrl: blogSocialPosts.imageUrl,
      })
      .from(blogSocialPosts)
      .where(
        and(
          eq(blogSocialPosts.status, "scheduled"),
          lte(blogSocialPosts.scheduledAt, now)
        )
      );

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No social posts to publish",
        publishedCount: 0,
        failedCount: 0,
      });
    }

    let publishedCount = 0;
    let failedCount = 0;
    const results: { id: number; platform: string; success: boolean; error?: string }[] = [];

    for (const post of scheduledPosts) {
      try {
        const result = await postToSocialMedia(
          post.platform,
          post.postText,
          post.imageUrl,
          post.hashtags as string[] | null
        );

        if (result.success) {
          // Update to published
          await db
            .update(blogSocialPosts)
            .set({
              status: "published",
              publishedAt: now,
            })
            .where(eq(blogSocialPosts.id, post.id));

          publishedCount++;
          results.push({ id: post.id, platform: post.platform, success: true });
        } else {
          // Update to failed
          await db
            .update(blogSocialPosts)
            .set({
              status: "failed",
              errorMessage: result.error || "Unknown error",
            })
            .where(eq(blogSocialPosts.id, post.id));

          failedCount++;
          results.push({ id: post.id, platform: post.platform, success: false, error: result.error });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        await db
          .update(blogSocialPosts)
          .set({
            status: "failed",
            errorMessage,
          })
          .where(eq(blogSocialPosts.id, post.id));

        failedCount++;
        results.push({ id: post.id, platform: post.platform, success: false, error: errorMessage });
      }
    }

    console.log(`Social media posting: ${publishedCount} published, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Processed ${scheduledPosts.length} social posts`,
      publishedCount,
      failedCount,
      results,
    });
  } catch (error) {
    console.error("Error in social media posting cron:", error);
    return NextResponse.json(
      { error: "Failed to process social posts" },
      { status: 500 }
    );
  }
}

// GET - Health check
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Count scheduled social posts
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogSocialPosts)
      .where(eq(blogSocialPosts.status, "scheduled"));

    return NextResponse.json({
      success: true,
      scheduledPosts: result.count,
    });
  } catch (error) {
    console.error("Error in social media posting health check:", error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
