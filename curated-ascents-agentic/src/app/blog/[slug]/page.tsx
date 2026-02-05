import { Metadata } from "next";
import { db } from "@/db";
import { blogPosts, blogCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import BlogPostClient from "./BlogPostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const [post] = await db
      .select({
        title: blogPosts.title,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        excerpt: blogPosts.excerpt,
        keywords: blogPosts.keywords,
        featuredImage: blogPosts.featuredImage,
        authorName: blogPosts.authorName,
        publishedAt: blogPosts.publishedAt,
        categoryName: blogCategories.name,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
      .limit(1);

    if (!post) {
      return {
        title: "Post Not Found | CuratedAscents",
      };
    }

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt || `Read ${post.title} on CuratedAscents`;

    return {
      title: `${title} | CuratedAscents Blog`,
      description,
      keywords: post.keywords as string[] | undefined,
      authors: [{ name: post.authorName || "CuratedAscents Team" }],
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.authorName || "CuratedAscents Team"],
        images: post.featuredImage
          ? [{ url: post.featuredImage, alt: title }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: post.featuredImage ? [post.featuredImage] : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog | CuratedAscents",
    };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
