"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Star,
  Trash2,
  Edit3,
  X,
  Check,
  Tag,
  FolderPlus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaItem {
  id: number;
  publicId: string;
  filename: string;
  cdnUrl: string;
  thumbnailUrl: string | null;
  country: string;
  destination: string | null;
  category: string;
  subcategory: string | null;
  tags: string[];
  title: string | null;
  description: string | null;
  altText: string | null;
  season: string | null;
  serviceType: string | null;
  featured: boolean | null;
  active: boolean | null;
  usageCount: number | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string | null;
  photographer: string | null;
  source: string | null;
  license: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface MediaSearchResult {
  items: MediaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MediaStats {
  total: number;
  byCountry: Record<string, number>;
  byCategory: Record<string, number>;
  bySeason: Record<string, number>;
  featured: number;
  mostUsed: Array<{ id: number; title: string | null; cdnUrl: string; usageCount: number | null }>;
  recentlyAdded: Array<{ id: number; title: string | null; thumbnailUrl: string | null; createdAt: string | null }>;
}

interface Collection {
  id: number;
  name: string;
  description: string | null;
  country: string | null;
  coverImageId: number | null;
  active: boolean | null;
  createdAt: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTRIES = ["nepal", "india", "tibet", "bhutan"];
const CATEGORIES = [
  "landscape", "hotel", "trek", "culture", "food", "wildlife",
  "temple", "adventure", "wellness", "people", "aerial", "luxury", "heritage",
];
const SEASONS = ["spring", "summer", "monsoon", "autumn", "winter", "all"];

type SubTab = "library" | "collections" | "stats";

// ─── Component ────────────────────────────────────────────────────────────────

export default function MediaTab() {
  const [subTab, setSubTab] = useState<SubTab>("library");

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { key: "library" as SubTab, label: "Library", icon: ImageIcon },
          { key: "collections" as SubTab, label: "Collections", icon: FolderPlus },
          { key: "stats" as SubTab, label: "Stats", icon: BarChart3 },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              subTab === t.key
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "library" && <LibraryView />}
      {subTab === "collections" && <CollectionsView />}
      {subTab === "stats" && <StatsView />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Library View
// ═══════════════════════════════════════════════════════════════════════════════

function LibraryView() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [featured, setFeatured] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Modals
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // Bulk action
  const [bulkAction, setBulkAction] = useState("");
  const [bulkValue, setBulkValue] = useState("");

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (country) params.set("country", country);
      if (category) params.set("category", category);
      if (season) params.set("season", season);
      if (featured) params.set("featured", featured);
      if (query) params.set("query", query);
      params.set("sort", sort);
      params.set("sortDir", sortDir);
      params.set("page", String(page));
      params.set("limit", "24");

      const res = await fetch(`/api/admin/media?${params}`);
      const data: MediaSearchResult = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  }, [country, category, season, featured, query, sort, sortDir, page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    const ids = Array.from(selected);

    let body: Record<string, unknown> = { action: bulkAction, ids };

    if (bulkAction === "tag") {
      const tags = bulkValue.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length === 0) return;
      body.value = tags;
    } else if (bulkAction === "categorize") {
      if (!bulkValue) return;
      body.value = bulkValue;
    }

    try {
      await fetch("/api/admin/media/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSelected(new Set());
      setBulkAction("");
      setBulkValue("");
      fetchMedia();
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    try {
      await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      fetchMedia();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const toggleFeatured = async (item: MediaItem) => {
    try {
      await fetch(`/api/admin/media/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !item.featured }),
      });
      fetchMedia();
    } catch (err) {
      console.error("Toggle featured failed:", err);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "–";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
        >
          <Upload className="w-4 h-4" /> Upload
        </button>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by title, description..."
            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
          />
        </div>

        {/* Filters */}
        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        <select
          value={season}
          onChange={(e) => { setSeason(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
        >
          <option value="">All Seasons</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          value={featured}
          onChange={(e) => { setFeatured(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
        >
          <option value="">All</option>
          <option value="true">Featured</option>
          <option value="false">Not Featured</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
        >
          <option value="date">Date</option>
          <option value="title">Title</option>
          <option value="usage">Usage</option>
          <option value="country">Country</option>
        </select>

        <button
          onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white hover:bg-slate-700"
        >
          {sortDir === "desc" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800 rounded border border-emerald-600/30">
          <span className="text-sm text-emerald-400">{selected.size} selected</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          >
            <option value="">Bulk action...</option>
            <option value="tag">Add Tags</option>
            <option value="categorize">Change Category</option>
            <option value="delete">Delete</option>
          </select>
          {bulkAction === "tag" && (
            <input
              type="text"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              placeholder="tag1, tag2, ..."
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
          )}
          {bulkAction === "categorize" && (
            <select
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleBulkAction}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm"
          >
            Apply
          </button>
          <button
            onClick={() => { setSelected(new Set()); setBulkAction(""); }}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          >
            Clear
          </button>
        </div>
      )}

      {/* Summary line */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">
          {total} image{total !== 1 ? "s" : ""} found
          {items.length > 0 && (
            <button onClick={selectAll} className="ml-3 text-emerald-400 hover:underline text-sm">
              {selected.size === items.length ? "Deselect all" : "Select all"}
            </button>
          )}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No media found. Upload your first image!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-lg overflow-hidden border transition-all cursor-pointer ${
                selected.has(item.id)
                  ? "border-emerald-500 ring-2 ring-emerald-500/30"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              {/* Thumbnail */}
              <div
                className="aspect-square bg-slate-800 relative"
                onClick={() => setPreviewItem(item)}
              >
                <img
                  src={item.thumbnailUrl || item.cdnUrl}
                  alt={item.altText || item.title || item.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Select checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                  className={`absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    selected.has(item.id)
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-slate-900/60 border-slate-400 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {selected.has(item.id) && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Featured star */}
                {item.featured && (
                  <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-400 fill-yellow-400" />
                )}

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                    className="p-1.5 bg-slate-700/80 rounded hover:bg-slate-600"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditItem(item); }}
                    className="p-1.5 bg-slate-700/80 rounded hover:bg-slate-600"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFeatured(item); }}
                    className="p-1.5 bg-slate-700/80 rounded hover:bg-slate-600"
                    title="Toggle featured"
                  >
                    <Star className={`w-4 h-4 ${item.featured ? "text-yellow-400 fill-yellow-400" : ""}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-1.5 bg-red-600/80 rounded hover:bg-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2 bg-slate-800/80">
                <p className="text-xs text-white truncate" title={item.title || item.filename}>
                  {item.title || item.filename}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400 capitalize">{item.country}</span>
                  <span className="text-[10px] text-slate-500">{formatFileSize(item.fileSize)}</span>
                </div>
                <span className="inline-block text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded mt-1 capitalize">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); fetchMedia(); }}
        />
      )}

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); fetchMedia(); }}
        />
      )}

      {/* Preview Modal */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={() => { setEditItem(previewItem); setPreviewItem(null); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Upload Modal
// ═══════════════════════════════════════════════════════════════════════════════

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [country, setCountry] = useState("nepal");
  const [category, setCategory] = useState("landscape");
  const [destination, setDestination] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [season, setSeason] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [featured, setFeatured] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (fileList: FileList) => {
    const valid = Array.from(fileList).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    setFiles(valid);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("country", country);
        formData.append("category", category);
        if (destination) formData.append("destination", destination);
        if (title) formData.append("title", title);
        if (tags) formData.append("tags", tags);
        if (season) formData.append("season", season);
        if (photographer) formData.append("photographer", photographer);
        if (featured) formData.append("featured", "true");

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Upload failed");
        }
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">Upload Images</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Drag & drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-600 hover:border-slate-500"
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-slate-400">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP — max 20MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="text-sm text-emerald-400">
              {files.length} file{files.length > 1 ? "s" : ""} selected:{" "}
              {files.map((f) => f.name).join(", ")}
            </div>
          )}

          {/* Metadata form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Country *</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kathmandu"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                <option value="">None</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Image title"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="mountain, sunrise, trek"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Photographer</label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600"
                />
                Featured image
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm disabled:opacity-50"
            >
              {uploading ? "Uploading..." : `Upload ${files.length || ""} Image${files.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Edit Modal
// ═══════════════════════════════════════════════════════════════════════════════

function EditModal({
  item,
  onClose,
  onSaved,
}: {
  item: MediaItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [autoTagging, setAutoTagging] = useState(false);
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [altText, setAltText] = useState(item.altText || "");
  const [country, setCountry] = useState(item.country || "nepal");
  const [destination, setDestination] = useState(item.destination || "");
  const [category, setCategory] = useState(item.category || "landscape");
  const [tags, setTags] = useState((item.tags || []).join(", "));
  const [season, setSeason] = useState(item.season || "");
  const [photographer, setPhotographer] = useState(item.photographer || "");
  const [featured, setFeatured] = useState(item.featured || false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const tagsList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await fetch(`/api/admin/media/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || null,
          description: description || null,
          altText: altText || null,
          country,
          destination: destination || null,
          category,
          tags: tagsList,
          season: season || null,
          photographer: photographer || null,
          featured,
        }),
      });
      onSaved();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoTag = async () => {
    setAutoTagging(true);
    try {
      const res = await fetch("/api/admin/media/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: item.cdnUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tags) setTags(data.tags.join(", "));
        if (data.description) setDescription(data.description);
        if (data.altText) setAltText(data.altText);
        if (data.category) setCategory(data.category);
        if (data.suggestedDestination) setDestination(data.suggestedDestination);
        if (data.suggestedCountry) setCountry(data.suggestedCountry);
        if (data.suggestedSeason) setSeason(data.suggestedSeason);
      }
    } catch (err) {
      console.error("Auto-tag failed:", err);
    } finally {
      setAutoTagging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">Edit Image</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex gap-4">
            <img
              src={item.thumbnailUrl || item.cdnUrl}
              alt={item.altText || item.filename}
              className="w-32 h-32 object-cover rounded"
            />
            <div className="flex-1 text-sm text-slate-400 space-y-1">
              <p><span className="text-slate-500">Filename:</span> {item.filename}</p>
              <p><span className="text-slate-500">Size:</span> {item.width}x{item.height}</p>
              <p><span className="text-slate-500">Uses:</span> {item.usageCount || 0}</p>
              <button
                onClick={handleAutoTag}
                disabled={autoTagging}
                className="flex items-center gap-1 mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-xs text-white disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                {autoTagging ? "Analyzing..." : "AI Auto-Tag"}
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Alt Text</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                <option value="">None</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Photographer</label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600"
                />
                Featured
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Preview Modal
// ═══════════════════════════════════════════════════════════════════════════════

function PreviewModal({
  item,
  onClose,
  onEdit,
}: {
  item: MediaItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold truncate">{item.title || item.filename}</h3>
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-1.5 hover:bg-slate-700 rounded" title="Edit">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <img
            src={item.cdnUrl}
            alt={item.altText || item.title || item.filename}
            className="w-full max-h-[60vh] object-contain rounded mb-4"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Country:</span>{" "}
              <span className="capitalize">{item.country}</span>
            </div>
            {item.destination && (
              <div>
                <span className="text-slate-500">Destination:</span> {item.destination}
              </div>
            )}
            <div>
              <span className="text-slate-500">Category:</span>{" "}
              <span className="capitalize">{item.category}</span>
            </div>
            {item.season && (
              <div>
                <span className="text-slate-500">Season:</span>{" "}
                <span className="capitalize">{item.season}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">Size:</span>{" "}
              {item.width}x{item.height}
            </div>
            <div>
              <span className="text-slate-500">Uses:</span> {item.usageCount || 0}
            </div>
            {item.photographer && (
              <div>
                <span className="text-slate-500">Photographer:</span> {item.photographer}
              </div>
            )}
            {item.featured && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400">Featured</span>
              </div>
            )}
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.description && (
            <p className="mt-3 text-sm text-slate-400">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Collections View
// ═══════════════════════════════════════════════════════════════════════════════

function CollectionsView() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collectionCountry, setCollectionCountry] = useState("");

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media/collections");
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await fetch("/api/admin/media/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description || undefined,
          country: collectionCountry || undefined,
        }),
      });
      setName("");
      setDescription("");
      setCollectionCountry("");
      setShowCreate(false);
      fetchCollections();
    } catch (err) {
      console.error("Create collection failed:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this collection?")) return;
    try {
      await fetch(`/api/admin/media/collections/${id}`, { method: "DELETE" });
      fetchCollections();
    } catch (err) {
      console.error("Delete collection failed:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading collections...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{collections.length} Collection{collections.length !== 1 ? "s" : ""}</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors text-sm"
        >
          <FolderPlus className="w-4 h-4" /> New Collection
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-4 p-4 bg-slate-800 rounded border border-slate-700 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
          />
          <select
            value={collectionCountry}
            onChange={(e) => setCollectionCountry(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
          >
            <option value="">No country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Collections list */}
      {collections.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FolderPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No collections yet. Create your first collection!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-white">{col.name}</h4>
                  {col.description && (
                    <p className="text-sm text-slate-400 mt-1">{col.description}</p>
                  )}
                  {col.country && (
                    <span className="inline-block text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded mt-2 capitalize">
                      {col.country}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(col.id)}
                  className="p-1.5 hover:bg-red-600/30 rounded text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Stats View
// ═══════════════════════════════════════════════════════════════════════════════

function StatsView() {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/media/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading stats...</div>;
  if (!stats) return <div className="text-center py-12 text-slate-400">Failed to load stats.</div>;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Images" value={stats.total} color="text-emerald-400" />
        <StatCard label="Featured" value={stats.featured} color="text-yellow-400" />
        <StatCard label="Countries" value={Object.keys(stats.byCountry).length} color="text-blue-400" />
        <StatCard label="Categories" value={Object.keys(stats.byCategory).length} color="text-purple-400" />
      </div>

      {/* By Country */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">By Country</h4>
        <div className="space-y-2">
          {Object.entries(stats.byCountry).sort(([,a], [,b]) => b - a).map(([name, count]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-sm capitalize">{name}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Category */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">By Category</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byCategory).sort(([,a], [,b]) => b - a).map(([name, count]) => (
            <span
              key={name}
              className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded capitalize"
            >
              {name}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Most Used */}
      {stats.mostUsed.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Most Used</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.mostUsed.map((m) => (
              <div key={m.id} className="text-center">
                <img
                  src={m.cdnUrl}
                  alt={m.title || ""}
                  className="w-full h-20 object-cover rounded mb-1"
                  loading="lazy"
                />
                <p className="text-xs text-slate-400 truncate">{m.title || `#${m.id}`}</p>
                <p className="text-xs text-emerald-400">{m.usageCount} uses</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
