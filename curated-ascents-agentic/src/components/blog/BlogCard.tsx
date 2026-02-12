"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogCardProps {
  post: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: string;
    featuredImageAlt?: string;
    categoryName?: string;
    categorySlug?: string;
    authorName?: string;
    publishedAt?: string;
    readTimeMinutes?: number;
    tags?: string[];
  };
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white/5 border border-luxury-gold/10 rounded-2xl overflow-hidden hover:border-luxury-gold/30 transition-all duration-300"
    >
      <Link href={`/blog/${post.slug}`}>
        {/* Image */}
        <div className="aspect-video relative overflow-hidden">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-luxury-navy to-luxury-charcoal flex items-center justify-center">
              <span className="text-white/20 text-sm">No Image</span>
            </div>
          )}

          {/* Category Badge */}
          {post.categoryName && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-luxury-gold/90 text-luxury-navy text-xs font-medium rounded-full">
              {post.categoryName}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-luxury-gold transition-colors line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-white/50 text-sm mb-4 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-white/30">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
            {post.readTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTimeMinutes} min read
              </span>
            )}
          </div>

          {/* Read More */}
          <div className="mt-4 flex items-center text-luxury-gold text-sm font-medium group-hover:text-luxury-gold/80">
            Read Article
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
