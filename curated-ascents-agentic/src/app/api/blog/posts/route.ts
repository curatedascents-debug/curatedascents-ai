import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, blogCategories, destinations } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - List published blog posts (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // category slug
    const destination = searchParams.get("destination"); // destination id
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Resolve category slug to ID
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

    const destinationIdNum = destination ? parseInt(destination) : null;

    // Build raw SQL WHERE fragments to avoid Drizzle and() issues
    const whereParts: string[] = [`"blog_posts"."status" = 'published'`];
    if (categoryId) {
      whereParts.push(`"blog_posts"."category_id" = ${categoryId}`);
    }
    if (destinationIdNum) {
      whereParts.push(`"blog_posts"."destination_id" = ${destinationIdNum}`);
    }
    const whereSQL = sql.raw(whereParts.join(" AND "));

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
      .where(whereSQL)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    // Get total count using raw SQL to match exactly
    const countResult = await db.execute(
      sql.raw(`SELECT count(*)::int as count FROM blog_posts WHERE ${whereParts.join(" AND ")}`)
    );
    const total = countResult.rows?.[0]?.count ?? posts.length;

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
      total,
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
