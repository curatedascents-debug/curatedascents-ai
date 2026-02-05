"use client";

import BlogPost from "@/components/blog/BlogPost";

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  return <BlogPost slug={slug} />;
}
