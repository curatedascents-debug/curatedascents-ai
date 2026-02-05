"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogCard from "./BlogCard";

interface Post {
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
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async (loadMore = false) => {
    setLoading(true);
    try {
      const currentOffset = loadMore ? offset : 0;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(currentOffset),
      });

      if (activeCategory) {
        params.set("category", activeCategory);
      }

      const res = await fetch(`/api/blog/posts?${params}`);
      const data = await res.json();

      if (data.success) {
        if (loadMore) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts || []);
        }
        setCategories(data.categories || []);
        setTotal(data.total || 0);
        setOffset(currentOffset + limit);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug: string | null) => {
    setActiveCategory(slug);
    setOffset(0);
  };

  const hasMore = posts.length < total;

  return (
    <div>
      {/* Category Filter */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All Posts
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.slug
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* Posts Grid */}
      {loading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-slate-800" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No blog posts yet.</p>
          <p className="text-slate-500 text-sm mt-2">Check back soon for travel stories and insights.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchPosts(true)}
                disabled={loading}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
