import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, blogCategories, destinations } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - List published blog posts (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // category slug
    const destination = searchParams.get("destination"); // destination id
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause - only published posts
    const baseCondition = eq(blogPosts.status, "published");

    // Join with category to filter by slug
    let categoryId: number | null = null;
    if (category) {
      const [cat] = await db
        .select({ id: blogCategories.id })
        .from(blogCategories)
        .where(eq(blogCategories.slug, category))
        .limit(1);
      if (cat) {
        categoryId = cat.id;
      }
    }

    const destinationId = destination ? parseInt(destination) : null;

    // Build where clause explicitly to avoid and() with single arg
    const whereClause = categoryId && destinationId
      ? and(baseCondition, eq(blogPosts.categoryId, categoryId), eq(blogPosts.destinationId, destinationId))
      : categoryId
      ? and(baseCondition, eq(blogPosts.categoryId, categoryId))
      : destinationId
      ? and(baseCondition, eq(blogPosts.destinationId, destinationId))
      : baseCondition;

    // Get posts
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        featuredImageAlt: blogPosts.featuredImageAlt,
        contentType: blogPosts.contentType,
        authorName: blogPosts.authorName,
        publishedAt: blogPosts.publishedAt,
        readTimeMinutes: blogPosts.readTimeMinutes,
        tags: blogPosts.tags,
        categoryId: blogPosts.categoryId,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        destinationId: blogPosts.destinationId,
        destinationCountry: destinations.country,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(destinations, eq(blogPosts.destinationId, destinations.id))
      .where(whereClause)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(whereClause);

    // Get all categories for filter
    const categories = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        color: blogCategories.color,
      })
      .from(blogCategories)
      .where(eq(blogCategories.isActive, true))
      .orderBy(blogCategories.displayOrder);

    return NextResponse.json({
      success: true,
      posts,
      total: count,
      categories,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
