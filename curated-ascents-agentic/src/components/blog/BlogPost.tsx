"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  contentType?: string;
  authorName?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  viewCount?: number;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  destinationName?: string;
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  categoryName?: string;
}

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog/posts/${slug}`);
      const data = await res.json();

      if (data.success) {
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
      } else {
        setError(data.error || "Post not found");
      }
    } catch (err) {
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post?.title || "")}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post?.title || "")}`,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-navy pt-24">
        <div className="container-luxury px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-8 bg-white/5 rounded w-1/4 mb-4" />
          <div className="h-12 bg-white/5 rounded w-3/4 mb-8" />
          <div className="aspect-video bg-white/5 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-white/5 rounded" />
            <div className="h-4 bg-white/5 rounded" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-luxury-navy pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-white/50 mb-8">{error || "The requested blog post could not be found."}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-luxury-gold hover:text-luxury-gold/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-luxury-navy">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-luxury-navy/95 backdrop-blur-md border-b border-luxury-gold/10 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <CuratedAscentsLogo className="text-luxury-gold group-hover:text-luxury-gold/80 transition-colors" size={32} />
              <span className="text-xl font-serif font-bold text-white">
                CuratedAscents
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#signature-journeys" className="text-white/70 hover:text-white transition-colors link-underline">
                Journeys
              </Link>
              <Link href="/blog" className="text-white/70 hover:text-white transition-colors link-underline">
                Blog
              </Link>
              <Link href="/#about" className="text-white/70 hover:text-white transition-colors link-underline">
                About
              </Link>
            </nav>

            <Link
              href="/"
              className="hidden md:inline-block px-6 py-2.5 bg-luxury-gold text-luxury-navy text-sm font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
            >
              Plan Your Journey
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px]">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="container-luxury px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-luxury-gold hover:text-luxury-gold/80 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              {/* Category */}
              {post.categoryName && (
                <span className="inline-block px-3 py-1 bg-luxury-gold/90 text-luxury-navy text-sm font-medium rounded-full mb-4 ml-4">
                  {post.categoryName}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-white/60">
                {post.authorName && <span>By {post.authorName}</span>}
                {formattedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </span>
                )}
                {post.readTimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTimeMinutes} min read
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-luxury px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <article className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-white prose-p:text-white/70 prose-a:text-luxury-gold prose-strong:text-white prose-blockquote:border-luxury-gold prose-blockquote:text-white/60 prose-img:rounded-xl prose-hr:border-luxury-gold/20 prose-li:text-white/70 prose-code:text-luxury-gold">
              <ReactMarkdown>
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-luxury-gold/10">
                <h4 className="text-sm font-medium text-white/40 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/5 text-white/60 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-luxury-gold/10">
              <h4 className="text-sm font-medium text-white/40 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share this article
              </h4>
              <div className="flex gap-3">
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 hover:bg-blue-600 rounded-full transition-colors"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 hover:bg-sky-500 rounded-full transition-colors"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 hover:bg-blue-700 rounded-full transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 border border-luxury-gold/20 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-serif font-bold text-white mb-3">
                Ready to Plan Your {post.destinationName || "Himalayan"} Adventure?
              </h3>
              <p className="text-white/50 mb-6">
                Our expedition architects are here to craft your perfect journey.
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-luxury-gold/25"
              >
                Start Planning
              </Link>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="sticky top-24">
                <h3 className="text-lg font-serif font-bold text-white mb-4">
                  Related Articles
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      className="block group"
                    >
                      <div className="bg-white/5 border border-luxury-gold/10 rounded-xl overflow-hidden hover:border-luxury-gold/30 transition-colors">
                        {related.featuredImage && (
                          <img
                            src={related.featuredImage}
                            alt={related.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-medium text-white group-hover:text-luxury-gold transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
                            {related.readTimeMinutes && (
                              <span>{related.readTimeMinutes} min read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-luxury-gold/10 py-12">
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <CuratedAscentsLogo className="text-luxury-gold" size={24} />
              <span className="text-lg font-serif font-bold text-white">
                CuratedAscents
              </span>
            </Link>
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} CuratedAscents. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
