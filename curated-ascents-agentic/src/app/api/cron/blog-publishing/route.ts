import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, blogSocialPosts } from "@/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { generateAllSocialPosts } from "@/lib/blog/social-media-formatter";

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

// POST - Publish scheduled blog posts
export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find posts that are scheduled and ready to publish
    const scheduledPosts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        contentType: blogPosts.contentType,
        destinationId: blogPosts.destinationId,
      })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.status, "scheduled"),
          lte(blogPosts.scheduledAt, now)
        )
      );

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts to publish",
        publishedCount: 0,
      });
    }

    const publishedIds: number[] = [];

    for (const post of scheduledPosts) {
      // Update post to published
      await db
        .update(blogPosts)
        .set({
          status: "published",
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(blogPosts.id, post.id));

      publishedIds.push(post.id);

      // Generate social media posts
      try {
        const socialPosts = generateAllSocialPosts({
          title: post.title,
          excerpt: post.excerpt || "",
          slug: post.slug,
          destination: undefined, // Would need to join with destinations table for name
          contentType: post.contentType || undefined,
          featuredImage: post.featuredImage || undefined,
        });

        // Create social posts scheduled for staggered posting
        for (let i = 0; i < socialPosts.length; i++) {
          const socialPost = socialPosts[i];
          const scheduledAt = new Date(now.getTime() + (i + 1) * 30 * 60 * 1000); // Stagger by 30 mins

          await db.insert(blogSocialPosts).values({
            blogPostId: post.id,
            platform: socialPost.platform,
            postText: socialPost.text,
            hashtags: socialPost.hashtags,
            imageUrl: socialPost.imageUrl,
            status: "scheduled",
            scheduledAt,
          });
        }
      } catch (socialError) {
        console.error(`Error creating social posts for blog ${post.id}:`, socialError);
        // Continue with other posts even if social generation fails
      }
    }

    console.log(`Published ${publishedIds.length} blog posts: ${publishedIds.join(", ")}`);

    return NextResponse.json({
      success: true,
      message: `Published ${publishedIds.length} posts`,
      publishedCount: publishedIds.length,
      publishedIds,
    });
  } catch (error) {
    console.error("Error in blog publishing cron:", error);
    return NextResponse.json(
      { error: "Failed to publish posts" },
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
    // Count scheduled posts
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "scheduled"));

    return NextResponse.json({
      success: true,
      scheduledPosts: result.count,
    });
  } catch (error) {
    console.error("Error in blog publishing health check:", error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
