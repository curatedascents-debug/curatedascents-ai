import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, blogCategories, destinations } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - Get single published blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get the post
    const [post] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        content: blogPosts.content,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        featuredImageAlt: blogPosts.featuredImageAlt,
        gallery: blogPosts.gallery,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        keywords: blogPosts.keywords,
        tags: blogPosts.tags,
        contentType: blogPosts.contentType,
        authorName: blogPosts.authorName,
        publishedAt: blogPosts.publishedAt,
        readTimeMinutes: blogPosts.readTimeMinutes,
        viewCount: blogPosts.viewCount,
        categoryId: blogPosts.categoryId,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
        destinationId: blogPosts.destinationId,
        destinationCountry: destinations.country,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(destinations, eq(blogPosts.destinationId, destinations.id))
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    db.update(blogPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(blogPosts.id, post.id))
      .catch(() => {});

    // Get related posts (same category or destination)
    const relatedConditions = [eq(blogPosts.status, "published"), ne(blogPosts.id, post.id)];

    const relatedPosts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        publishedAt: blogPosts.publishedAt,
        readTimeMinutes: blogPosts.readTimeMinutes,
        categoryName: blogCategories.name,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(
        and(
          ...relatedConditions,
          post.categoryId
            ? eq(blogPosts.categoryId, post.categoryId)
            : undefined
        )
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(3);

    return NextResponse.json({
      success: true,
      post,
      relatedPosts,
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
