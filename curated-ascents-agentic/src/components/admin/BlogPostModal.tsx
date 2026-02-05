"use client";

import { useState, useEffect } from "react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  status: string;
  contentType?: string;
  authorName?: string;
  scheduledAt?: string;
  categoryId?: number;
  destinationId?: number;
  readTimeMinutes?: number;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface Destination {
  id: number;
  name: string;
}

interface BlogPostModalProps {
  post: BlogPost | null;
  categories: BlogCategory[];
  destinations: Destination[];
  onClose: () => void;
  onSave: () => void;
}

const CONTENT_TYPES = [
  { value: "destination_guide", label: "Destination Guide" },
  { value: "travel_tips", label: "Travel Tips" },
  { value: "packing_list", label: "Packing List" },
  { value: "cultural_insights", label: "Cultural Insights" },
  { value: "seasonal_content", label: "Seasonal Content" },
  { value: "trip_report", label: "Trip Report" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function BlogPostModal({
  post,
  categories,
  destinations,
  onClose,
  onSave,
}: BlogPostModalProps) {
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "media" | "ai">("content");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // AI Generation
  const [aiTopic, setAiTopic] = useState("");
  const [aiContentType, setAiContentType] = useState("destination_guide");
  const [aiDestination, setAiDestination] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTargetLength, setAiTargetLength] = useState<"short" | "medium" | "long">("medium");

  // Form state
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    featuredImage: post?.featuredImage || "",
    featuredImageAlt: post?.featuredImageAlt || "",
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    keywords: post?.keywords?.join(", ") || "",
    tags: post?.tags?.join(", ") || "",
    status: post?.status || "draft",
    contentType: post?.contentType || "destination_guide",
    authorName: post?.authorName || "CuratedAscents Team",
    scheduledAt: post?.scheduledAt ? post.scheduledAt.slice(0, 16) : "",
    categoryId: post?.categoryId || "",
    destinationId: post?.destinationId || "",
  });

  // Load full post content if editing
  useEffect(() => {
    if (post?.id) {
      fetch(`/api/admin/blog/posts/${post.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.post) {
            setForm({
              ...form,
              content: data.post.content || "",
              metaTitle: data.post.metaTitle || "",
              metaDescription: data.post.metaDescription || "",
              keywords: data.post.keywords?.join(", ") || "",
              tags: data.post.tags?.join(", ") || "",
            });
          }
        })
        .catch(console.error);
    }
  }, [post?.id]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setForm({
      ...form,
      title,
      slug: form.slug || generateSlug(title),
    });
  };

  const handleAIGenerate = async () => {
    if (!aiTopic) {
      alert("Please enter a topic for the AI to write about");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          contentType: aiContentType,
          destination: aiDestination,
          keywords: aiKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          targetLength: aiTargetLength,
          action: "generate",
        }),
      });

      const data = await res.json();

      if (data.success && data.draft) {
        setForm({
          ...form,
          title: data.draft.title,
          slug: data.draft.suggestedSlug,
          content: data.draft.content,
          excerpt: data.draft.excerpt,
          metaTitle: data.draft.metaTitle,
          metaDescription: data.draft.metaDescription,
          keywords: data.draft.keywords.join(", "),
          tags: data.draft.tags.join(", "),
          contentType: aiContentType,
        });
        setActiveTab("content");
      } else {
        alert("Failed to generate content: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestKeywords = async () => {
    if (!form.title && !aiTopic) {
      alert("Please enter a title or topic first");
      return;
    }

    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: form.title || aiTopic,
          destination: form.destinationId
            ? destinations.find((d) => d.id === Number(form.destinationId))?.name
            : aiDestination,
          contentType: form.contentType || aiContentType,
          action: "suggest_keywords",
        }),
      });

      const data = await res.json();

      if (data.success && data.keywords) {
        setForm({ ...form, keywords: data.keywords.join(", ") });
      }
    } catch (error) {
      console.error("Error suggesting keywords:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = post?.id
        ? `/api/admin/blog/posts/${post.id}`
        : "/api/admin/blog/posts";
      const method = post?.id ? "PUT" : "POST";

      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt,
        featuredImage: form.featuredImage || undefined,
        featuredImageAlt: form.featuredImageAlt || undefined,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        keywords: form.keywords
          ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : undefined,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
        status: form.status,
        contentType: form.contentType,
        authorName: form.authorName,
        scheduledAt: form.scheduledAt || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        destinationId: form.destinationId ? Number(form.destinationId) : undefined,
        isAutoGenerated: generating,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        onSave();
      } else {
        alert("Failed to save post: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {post?.id ? "Edit Post" : "Create New Post"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700 px-4">
          <div className="flex gap-4">
            {[
              { key: "content", label: "Content" },
              { key: "seo", label: "SEO & Metadata" },
              { key: "media", label: "Media" },
              { key: "ai", label: "AI Generate" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-3 px-1 text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  placeholder="Enter post title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                    placeholder="url-friendly-slug"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Content Type</label>
                  <select
                    value={form.contentType}
                    onChange={(e) => setForm({ ...form, contentType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Content (Markdown) *</label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm font-mono"
                  rows={15}
                  placeholder="Write your content in Markdown format..."
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  rows={2}
                  placeholder="Short summary for listings (auto-generated if empty)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Destination</label>
                  <select
                    value={form.destinationId}
                    onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="">Select destination (optional)</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Author</label>
                  <input
                    type="text"
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Schedule For</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    disabled={form.status !== "scheduled"}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  placeholder="SEO title (uses post title if empty)"
                  maxLength={60}
                />
                <div className="text-xs text-slate-500 mt-1">
                  {form.metaTitle.length}/60 characters
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Meta Description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  rows={3}
                  placeholder="SEO description (auto-generated from excerpt if empty)"
                  maxLength={155}
                />
                <div className="text-xs text-slate-500 mt-1">
                  {form.metaDescription.length}/155 characters
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Keywords</label>
                  <button
                    type="button"
                    onClick={handleSuggestKeywords}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Suggest Keywords
                  </button>
                </div>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  placeholder="Comma-separated keywords"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  placeholder="Comma-separated tags"
                />
              </div>

              {/* SEO Preview */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h4 className="text-xs text-slate-400 mb-3">Search Result Preview</h4>
                <div className="bg-white rounded p-3 text-left">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                    {form.metaTitle || form.title || "Page Title"}
                  </div>
                  <div className="text-green-700 text-sm">
                    curatedascents.com/blog/{form.slug || "page-slug"}
                  </div>
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {form.metaDescription || form.excerpt || "Page description will appear here..."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Featured Image URL</label>
                <input
                  type="url"
                  value={form.featuredImage}
                  onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {form.featuredImage && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h4 className="text-xs text-slate-400 mb-2">Preview</h4>
                  <img
                    src={form.featuredImage}
                    alt={form.featuredImageAlt || "Preview"}
                    className="max-h-48 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Image Alt Text</label>
                <input
                  type="text"
                  value={form.featuredImageAlt}
                  onChange={(e) => setForm({ ...form, featuredImageAlt: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">
                  Tip: For best results, use images at least 1200x630 pixels for social media sharing.
                </p>
              </div>
            </div>
          )}

          {/* AI Generate Tab */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">AI Content Generation</h4>
                <p className="text-slate-400 text-sm">
                  Let AI generate high-quality, SEO-optimized content for your blog post.
                  Provide a topic and the AI will create a complete article.
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Topic *</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  placeholder="e.g., Ultimate Guide to Everest Base Camp Trek"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Content Type</label>
                  <select
                    value={aiContentType}
                    onChange={(e) => setAiContentType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Target Length</label>
                  <select
                    value={aiTargetLength}
                    onChange={(e) => setAiTargetLength(e.target.value as typeof aiTargetLength)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="short">Short (800-1200 words)</option>
                    <option value="medium">Medium (1200-1800 words)</option>
                    <option value="long">Long (1800-2500 words)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination Focus</label>
                <select
                  value={aiDestination}
                  onChange={(e) => setAiDestination(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="">Select destination (optional)</option>
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.name}>
                      {dest.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Keywords</label>
                <input
                  type="text"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  placeholder="Comma-separated keywords to naturally include"
                />
              </div>

              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={generating || !aiTopic}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 px-4 py-3 rounded text-white font-semibold flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    Generating Content...
                  </>
                ) : (
                  <>
                    ⚡ Generate with AI
                  </>
                )}
              </button>

              {generating && (
                <div className="text-center text-slate-400 text-sm">
                  This may take 30-60 seconds. The AI is crafting your article...
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setForm({ ...form, status: "draft" });
                document.querySelector("form")?.requestSubmit();
              }}
              disabled={saving}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 rounded text-white text-sm"
            >
              {saving ? "Saving..." : post?.id ? "Update Post" : "Create Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
