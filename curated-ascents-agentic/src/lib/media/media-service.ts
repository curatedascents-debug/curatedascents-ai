/**
 * Media Library Service
 * CRUD, search, and utility functions for the media library.
 */

import { db } from "@/db";
import {
  mediaLibrary,
  mediaCollections,
  mediaCollectionItems,
} from "@/db/schema";
import { eq, and, or, ilike, desc, asc, sql, count } from "drizzle-orm";
import {
  uploadMedia as uploadPipeline,
  deleteMedia as deleteFromStorage,
  keyFromCdnUrl,
} from "./r2-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediaRecord {
  id: number;
  publicId: string;
  filename: string;
  cdnUrl: string;
  thumbnailUrl: string | null;
  blurHash: string | null;
  country: string;
  destination: string | null;
  destinationId: number | null;
  category: string;
  subcategory: string | null;
  tags: string[];
  title: string | null;
  description: string | null;
  altText: string | null;
  season: string | null;
  serviceType: string | null;
  hotelId: number | null;
  packageId: number | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string | null;
  photographer: string | null;
  source: string | null;
  license: string | null;
  featured: boolean | null;
  active: boolean | null;
  usageCount: number | null;
  lastUsedAt: Date | null;
  sortOrder: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MediaUploadParams {
  file: Buffer;
  filename: string;
  country: string;
  category: string;
  destination?: string;
  destinationId?: number;
  subcategory?: string;
  tags?: string[];
  title?: string;
  description?: string;
  altText?: string;
  season?: string;
  serviceType?: string;
  hotelId?: number;
  packageId?: number;
  photographer?: string;
  source?: string;
  license?: string;
  featured?: boolean;
}

export interface MediaSearchParams {
  country?: string;
  destination?: string;
  category?: string;
  tags?: string[];
  season?: string;
  serviceType?: string;
  featured?: boolean;
  active?: boolean;
  query?: string; // free text search across title, description, destination
  page?: number;
  limit?: number;
  sort?: "date" | "usage" | "country" | "destination" | "title";
  sortDir?: "asc" | "desc";
}

export interface MediaSearchResult {
  items: MediaRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MediaUpdateParams {
  title?: string;
  description?: string;
  altText?: string;
  country?: string;
  destination?: string;
  destinationId?: number | null;
  category?: string;
  subcategory?: string | null;
  tags?: string[];
  season?: string | null;
  serviceType?: string | null;
  hotelId?: number | null;
  packageId?: number | null;
  photographer?: string | null;
  source?: string | null;
  license?: string | null;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
}

export interface MediaStats {
  total: number;
  byCountry: Record<string, number>;
  byCategory: Record<string, number>;
  bySeason: Record<string, number>;
  featured: number;
  mostUsed: Array<{ id: number; title: string | null; cdnUrl: string; usageCount: number | null }>;
  recentlyAdded: Array<{ id: number; title: string | null; thumbnailUrl: string | null; createdAt: Date | null }>;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

/**
 * Upload a file to R2 and create a media library record.
 */
export async function uploadMediaFile(
  params: MediaUploadParams
): Promise<MediaRecord> {
  // Upload to R2 or local filesystem fallback (process → WebP → thumbnail → upload)
  const r2Result = await uploadPipeline(
    params.file,
    params.country,
    params.category,
    params.filename
  );

  // Create DB record
  const [record] = await db
    .insert(mediaLibrary)
    .values({
      filename: params.filename,
      cdnUrl: r2Result.cdnUrl,
      thumbnailUrl: r2Result.thumbnailUrl,
      country: params.country,
      destination: params.destination || null,
      destinationId: params.destinationId || null,
      category: params.category,
      subcategory: params.subcategory || null,
      tags: params.tags || [],
      title: params.title || null,
      description: params.description || null,
      altText: params.altText || null,
      season: params.season || null,
      serviceType: params.serviceType || null,
      hotelId: params.hotelId || null,
      packageId: params.packageId || null,
      width: r2Result.width,
      height: r2Result.height,
      fileSize: r2Result.fileSize,
      mimeType: r2Result.mimeType,
      photographer: params.photographer || null,
      source: params.source || "original",
      license: params.license || null,
      featured: params.featured || false,
    })
    .returning();

  return record as MediaRecord;
}

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * Search media with filters, pagination, and sorting.
 */
export async function searchMedia(
  params: MediaSearchParams
): Promise<MediaSearchResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 24));
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions = [];

  // Default to active only
  const showActive = params.active !== undefined ? params.active : true;
  conditions.push(eq(mediaLibrary.active, showActive));

  if (params.country) {
    conditions.push(eq(mediaLibrary.country, params.country.toLowerCase()));
  }
  if (params.destination) {
    conditions.push(ilike(mediaLibrary.destination, `%${params.destination}%`));
  }
  if (params.category) {
    conditions.push(eq(mediaLibrary.category, params.category.toLowerCase()));
  }
  if (params.season) {
    conditions.push(eq(mediaLibrary.season, params.season.toLowerCase()));
  }
  if (params.serviceType) {
    conditions.push(eq(mediaLibrary.serviceType, params.serviceType));
  }
  if (params.featured !== undefined) {
    conditions.push(eq(mediaLibrary.featured, params.featured));
  }
  if (params.tags && params.tags.length > 0) {
    // JSONB array overlap: tags ?| array['tag1', 'tag2']
    conditions.push(
      sql`${mediaLibrary.tags}::jsonb ?| array[${sql.join(
        params.tags.map((t) => sql`${t}`),
        sql`, `
      )}]`
    );
  }
  if (params.query) {
    const q = `%${params.query}%`;
    conditions.push(
      sql`(${ilike(mediaLibrary.title, q)} OR ${ilike(mediaLibrary.description, q)} OR ${ilike(mediaLibrary.destination, q)})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Sort
  let orderBy;
  const direction = params.sortDir === "asc" ? asc : desc;
  switch (params.sort) {
    case "usage":
      orderBy = direction(mediaLibrary.usageCount);
      break;
    case "country":
      orderBy = direction(mediaLibrary.country);
      break;
    case "destination":
      orderBy = direction(mediaLibrary.destination);
      break;
    case "title":
      orderBy = direction(mediaLibrary.title);
      break;
    case "date":
    default:
      orderBy = direction(mediaLibrary.createdAt);
      break;
  }

  // Execute count and data queries in parallel
  const [countResult, items] = await Promise.all([
    db
      .select({ total: count() })
      .from(mediaLibrary)
      .where(whereClause),
    db
      .select()
      .from(mediaLibrary)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.total || 0;

  return {
    items: items as MediaRecord[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/**
 * Get a single media record by ID.
 */
export async function getMediaById(id: number): Promise<MediaRecord | null> {
  const [record] = await db
    .select()
    .from(mediaLibrary)
    .where(eq(mediaLibrary.id, id))
    .limit(1);

  return (record as MediaRecord) || null;
}

/**
 * Get a single media record by public ID.
 */
export async function getMediaByPublicId(
  publicId: string
): Promise<MediaRecord | null> {
  const [record] = await db
    .select()
    .from(mediaLibrary)
    .where(eq(mediaLibrary.publicId, publicId))
    .limit(1);

  return (record as MediaRecord) || null;
}

/**
 * Update media metadata.
 */
export async function updateMedia(
  id: number,
  updates: MediaUpdateParams
): Promise<MediaRecord | null> {
  const [record] = await db
    .update(mediaLibrary)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(mediaLibrary.id, id))
    .returning();

  return (record as MediaRecord) || null;
}

/**
 * Soft delete (set active=false).
 */
export async function softDeleteMedia(id: number): Promise<void> {
  await db
    .update(mediaLibrary)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(mediaLibrary.id, id));
}

/**
 * Hard delete: remove from R2 and database.
 */
export async function hardDeleteMedia(id: number): Promise<void> {
  const record = await getMediaById(id);
  if (!record) return;

  // Delete from storage (R2 or local)
  const key = keyFromCdnUrl(record.cdnUrl);
  if (key) {
    try {
      await deleteFromStorage(key);
    } catch (err) {
      console.error("Failed to delete from storage:", err);
    }
  }

  // Remove from collections
  await db
    .delete(mediaCollectionItems)
    .where(eq(mediaCollectionItems.mediaId, id));

  // Delete DB record
  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
}

// ─── Usage Tracking ──────────────────────────────────────────────────────────

/**
 * Increment usage count for a media item.
 */
export async function incrementUsage(id: number): Promise<void> {
  await db
    .update(mediaLibrary)
    .set({
      usageCount: sql`COALESCE(${mediaLibrary.usageCount}, 0) + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(mediaLibrary.id, id));
}

/**
 * Increment usage for multiple items (fire-and-forget).
 */
export function incrementUsageBatch(ids: number[]): void {
  if (ids.length === 0) return;
  // Fire and forget — don't await
  Promise.all(ids.map((id) => incrementUsage(id))).catch((err) =>
    console.error("Failed to increment usage:", err)
  );
}

// ─── Convenience Queries ─────────────────────────────────────────────────────

/**
 * Get photos for a specific destination (used by AI tool).
 */
export async function getMediaForDestination(
  destination: string,
  options?: {
    country?: string;
    category?: string;
    season?: string;
    limit?: number;
  }
): Promise<MediaRecord[]> {
  const conditions = [
    eq(mediaLibrary.active, true),
    ilike(mediaLibrary.destination, `%${destination}%`),
  ];

  if (options?.country) {
    conditions.push(eq(mediaLibrary.country, options.country.toLowerCase()));
  }
  if (options?.category) {
    conditions.push(eq(mediaLibrary.category, options.category.toLowerCase()));
  }
  if (options?.season) {
    conditions.push(eq(mediaLibrary.season, options.season.toLowerCase()));
  }

  const results = await db
    .select()
    .from(mediaLibrary)
    .where(and(...conditions))
    .orderBy(desc(mediaLibrary.featured), asc(mediaLibrary.usageCount))
    .limit(options?.limit || 5);

  return results as MediaRecord[];
}

/**
 * Get random featured photos (for homepage hero rotation).
 */
export async function getRandomFeatured(
  country?: string,
  limit: number = 5
): Promise<MediaRecord[]> {
  const conditions = [
    eq(mediaLibrary.active, true),
    eq(mediaLibrary.featured, true),
  ];

  if (country) {
    conditions.push(eq(mediaLibrary.country, country.toLowerCase()));
  }

  const results = await db
    .select()
    .from(mediaLibrary)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return results as MediaRecord[];
}

// ─── AI Photo Search (for search_photos tool) ────────────────────────────────

export interface AIPhotoSearchParams {
  country?: string;
  destination?: string;
  category?: string;
  tags?: string[];
  season?: string;
  serviceType?: string;
  featured?: boolean;
  limit?: number;
}

export interface AIPhotoResult {
  id: number;
  publicId: string;
  cdnUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  altText: string | null;
  country: string;
  destination: string | null;
  category: string;
  tags: string[];
  season: string | null;
  width: number | null;
  height: number | null;
}

/**
 * Search photos for the AI tool. Returns only public-facing fields.
 * After returning results, increments usageCount (fire-and-forget).
 */
export async function searchPhotosForAI(
  params: AIPhotoSearchParams
): Promise<AIPhotoResult[]> {
  const maxLimit = Math.min(params.limit || 5, 20);
  const conditions = [eq(mediaLibrary.active, true)];

  if (params.country) {
    conditions.push(eq(mediaLibrary.country, params.country.toLowerCase()));
  }
  if (params.destination) {
    conditions.push(
      ilike(mediaLibrary.destination, `%${params.destination}%`)
    );
  }
  if (params.category) {
    conditions.push(eq(mediaLibrary.category, params.category.toLowerCase()));
  }
  if (params.season) {
    conditions.push(eq(mediaLibrary.season, params.season.toLowerCase()));
  }
  if (params.serviceType) {
    conditions.push(eq(mediaLibrary.serviceType, params.serviceType));
  }
  if (params.featured !== undefined) {
    conditions.push(eq(mediaLibrary.featured, params.featured));
  }
  if (params.tags && params.tags.length > 0) {
    conditions.push(
      sql`${mediaLibrary.tags}::jsonb ?| array[${sql.join(
        params.tags.map((t) => sql`${t}`),
        sql`, `
      )}]`
    );
  }

  const results = await db
    .select({
      id: mediaLibrary.id,
      publicId: mediaLibrary.publicId,
      cdnUrl: mediaLibrary.cdnUrl,
      thumbnailUrl: mediaLibrary.thumbnailUrl,
      title: mediaLibrary.title,
      description: mediaLibrary.description,
      altText: mediaLibrary.altText,
      country: mediaLibrary.country,
      destination: mediaLibrary.destination,
      category: mediaLibrary.category,
      tags: mediaLibrary.tags,
      season: mediaLibrary.season,
      width: mediaLibrary.width,
      height: mediaLibrary.height,
    })
    .from(mediaLibrary)
    .where(and(...conditions))
    .orderBy(
      desc(mediaLibrary.featured),
      asc(mediaLibrary.usageCount),
      sql`RANDOM()`
    )
    .limit(maxLimit);

  // Increment usage (fire-and-forget)
  const ids = results.map((r) => r.id);
  incrementUsageBatch(ids);

  return results as AIPhotoResult[];
}

// ─── Blog Integration ────────────────────────────────────────────────────────

/**
 * Find the best featured image for a blog post from the media library.
 * Searches by destination first, then falls back to country, then any landscape.
 * Prefers featured images with lowest usage count for variety.
 */
export async function findBlogFeaturedImage(params: {
  destination?: string;
  country?: string;
  contentType?: string;
}): Promise<{ cdnUrl: string; altText: string; mediaId: number } | null> {
  // Map content type to preferred media category
  const categoryMap: Record<string, string> = {
    destination_guide: "landscape",
    travel_tips: "adventure",
    packing_list: "trek",
    cultural_insights: "culture",
    seasonal_content: "landscape",
    trip_report: "trek",
  };
  const preferredCategory = params.contentType
    ? categoryMap[params.contentType] || "landscape"
    : "landscape";

  // Strategy 1: Match destination tag
  if (params.destination) {
    const byDest = await db
      .select({
        id: mediaLibrary.id,
        cdnUrl: mediaLibrary.cdnUrl,
        altText: mediaLibrary.altText,
        title: mediaLibrary.title,
      })
      .from(mediaLibrary)
      .where(
        and(
          eq(mediaLibrary.active, true),
          ilike(mediaLibrary.destination, `%${params.destination}%`)
        )
      )
      .orderBy(desc(mediaLibrary.featured), asc(mediaLibrary.usageCount), sql`RANDOM()`)
      .limit(1);

    if (byDest.length > 0) {
      incrementUsageBatch([byDest[0].id]);
      return {
        cdnUrl: byDest[0].cdnUrl,
        altText: byDest[0].altText || byDest[0].title || params.destination,
        mediaId: byDest[0].id,
      };
    }

    // Strategy 1b: Match destination in filename or title (images often have place names in filenames)
    const byFilename = await db
      .select({
        id: mediaLibrary.id,
        cdnUrl: mediaLibrary.cdnUrl,
        altText: mediaLibrary.altText,
        title: mediaLibrary.title,
        filename: mediaLibrary.filename,
      })
      .from(mediaLibrary)
      .where(
        and(
          eq(mediaLibrary.active, true),
          sql`(${ilike(mediaLibrary.filename, `%${params.destination}%`)} OR ${ilike(mediaLibrary.title, `%${params.destination}%`)})`
        )
      )
      .orderBy(desc(mediaLibrary.featured), asc(mediaLibrary.usageCount), sql`RANDOM()`)
      .limit(1);

    if (byFilename.length > 0) {
      incrementUsageBatch([byFilename[0].id]);
      return {
        cdnUrl: byFilename[0].cdnUrl,
        altText: byFilename[0].altText || byFilename[0].title || byFilename[0].filename || params.destination,
        mediaId: byFilename[0].id,
      };
    }
  }

  // Strategy 2: Match country + preferred category
  if (params.country) {
    const byCountry = await db
      .select({
        id: mediaLibrary.id,
        cdnUrl: mediaLibrary.cdnUrl,
        altText: mediaLibrary.altText,
        title: mediaLibrary.title,
      })
      .from(mediaLibrary)
      .where(
        and(
          eq(mediaLibrary.active, true),
          eq(mediaLibrary.country, params.country.toLowerCase()),
          eq(mediaLibrary.category, preferredCategory)
        )
      )
      .orderBy(desc(mediaLibrary.featured), asc(mediaLibrary.usageCount), sql`RANDOM()`)
      .limit(1);

    if (byCountry.length > 0) {
      incrementUsageBatch([byCountry[0].id]);
      return {
        cdnUrl: byCountry[0].cdnUrl,
        altText: byCountry[0].altText || byCountry[0].title || params.country,
        mediaId: byCountry[0].id,
      };
    }

    // Strategy 3: Match country (any category)
    const byCountryAny = await db
      .select({
        id: mediaLibrary.id,
        cdnUrl: mediaLibrary.cdnUrl,
        altText: mediaLibrary.altText,
        title: mediaLibrary.title,
      })
      .from(mediaLibrary)
      .where(
        and(
          eq(mediaLibrary.active, true),
          eq(mediaLibrary.country, params.country.toLowerCase())
        )
      )
      .orderBy(desc(mediaLibrary.featured), asc(mediaLibrary.usageCount), sql`RANDOM()`)
      .limit(1);

    if (byCountryAny.length > 0) {
      incrementUsageBatch([byCountryAny[0].id]);
      return {
        cdnUrl: byCountryAny[0].cdnUrl,
        altText: byCountryAny[0].altText || byCountryAny[0].title || params.country,
        mediaId: byCountryAny[0].id,
      };
    }
  }

  // Strategy 4: Any featured landscape image
  const anyFeatured = await db
    .select({
      id: mediaLibrary.id,
      cdnUrl: mediaLibrary.cdnUrl,
      altText: mediaLibrary.altText,
      title: mediaLibrary.title,
    })
    .from(mediaLibrary)
    .where(
      and(
        eq(mediaLibrary.active, true),
        eq(mediaLibrary.featured, true)
      )
    )
    .orderBy(asc(mediaLibrary.usageCount), sql`RANDOM()`)
    .limit(1);

  if (anyFeatured.length > 0) {
    incrementUsageBatch([anyFeatured[0].id]);
    return {
      cdnUrl: anyFeatured[0].cdnUrl,
      altText: anyFeatured[0].altText || anyFeatured[0].title || "CuratedAscents",
      mediaId: anyFeatured[0].id,
    };
  }

  return null;
}

// ─── Itinerary Image Finder ──────────────────────────────────────────────────

const ITINERARY_STOP_WORDS = new Set([
  "luxury", "trek", "tour", "circuit", "the", "and", "of", "in", "to", "a",
  "with", "for", "expedition", "journey", "adventure", "package", "trip",
  "experience", "ultimate", "classic", "premium", "exclusive",
]);

// Curated Unsplash photos for itinerary fallback (permanent photo IDs)
const UNSPLASH_ITINERARY_PHOTOS: Record<string, string> = {
  // Nepal regions
  everest: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
  annapurna: "https://images.unsplash.com/photo-1585938389612-a552a28d6914?w=800&h=600&fit=crop",
  langtang: "https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&h=600&fit=crop",
  manaslu: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  mustang: "https://images.unsplash.com/photo-1570804485046-1d876c777648?w=800&h=600&fit=crop",
  kanchenjunga: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop",
  makalu: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
  dolpo: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop",
  solukhumbu: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
  khumbu: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
  "ganesh himal": "https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&h=600&fit=crop",
  helambu: "https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&h=600&fit=crop",
  chitwan: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
  pokhara: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=600&fit=crop",
  kathmandu: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800&h=600&fit=crop",
  lumbini: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800&h=600&fit=crop",
  // Bhutan regions
  paro: "https://images.unsplash.com/photo-1553856622-d1b352e9a211?w=800&h=600&fit=crop",
  thimphu: "https://images.unsplash.com/photo-1553856622-d1b352e9a211?w=800&h=600&fit=crop",
  bumthang: "https://images.unsplash.com/photo-1553856622-d1b352e9a211?w=800&h=600&fit=crop",
  punakha: "https://images.unsplash.com/photo-1553856622-d1b352e9a211?w=800&h=600&fit=crop",
  lunana: "https://images.unsplash.com/photo-1553856622-d1b352e9a211?w=800&h=600&fit=crop",
  // Tibet regions
  lhasa: "https://images.unsplash.com/photo-1503641926155-5b64e0441c88?w=800&h=600&fit=crop",
  "western tibet": "https://images.unsplash.com/photo-1503641926155-5b64e0441c88?w=800&h=600&fit=crop",
  tingri: "https://images.unsplash.com/photo-1503641926155-5b64e0441c88?w=800&h=600&fit=crop",
  // India regions
  ladakh: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&h=600&fit=crop",
  rajasthan: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop",
  agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop",
  jaipur: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop",
  uttarakhand: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&h=600&fit=crop",
  sikkim: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&h=600&fit=crop",
  darjeeling: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&h=600&fit=crop",
  // Country-level fallbacks
  nepal: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
  bhutan: "https://images.unsplash.com/photo-1553856622-d1b352e9a211?w=800&h=600&fit=crop",
  tibet: "https://images.unsplash.com/photo-1503641926155-5b64e0441c88?w=800&h=600&fit=crop",
  india: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop",
};

/**
 * Find a relevant image for an itinerary using a cascading search strategy.
 * Does NOT increment usage counts (listing page loads all ~46 at once).
 */
export async function findItineraryImage(params: {
  name: string;
  country?: string;
  region?: string;
}): Promise<{ cdnUrl: string; altText: string } | null> {
  const selectCols = {
    id: mediaLibrary.id,
    cdnUrl: mediaLibrary.cdnUrl,
    altText: mediaLibrary.altText,
    title: mediaLibrary.title,
    filename: mediaLibrary.filename,
  };
  const orderClause = [desc(mediaLibrary.featured), asc(mediaLibrary.usageCount), sql`RANDOM()`];

  // Country filter condition (reused in strategies 1 & 2)
  const countryFilter = params.country
    ? eq(mediaLibrary.country, params.country.toLowerCase())
    : undefined;

  // Strategy 1: Match region in destination, filename, or title (with country filter)
  if (params.region) {
    const regionTerm = `%${params.region}%`;
    const regionConditions = [
      eq(mediaLibrary.active, true),
      or(
        ilike(mediaLibrary.destination, regionTerm),
        ilike(mediaLibrary.filename, regionTerm),
        ilike(mediaLibrary.title, regionTerm)
      ),
    ];
    if (countryFilter) regionConditions.push(countryFilter);

    const byRegion = await db
      .select(selectCols)
      .from(mediaLibrary)
      .where(and(...regionConditions))
      .orderBy(...orderClause)
      .limit(1);

    if (byRegion.length > 0) {
      return {
        cdnUrl: byRegion[0].cdnUrl,
        altText: byRegion[0].altText || byRegion[0].title || params.region,
      };
    }
  }

  // Strategy 2: Extract keywords from name and search each (with country filter)
  const keywords = params.name
    .split(/[\s\-–—]+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase())
    .filter((w) => w.length > 2 && !ITINERARY_STOP_WORDS.has(w));

  for (const keyword of keywords) {
    const term = `%${keyword}%`;
    const keywordConditions = [
      eq(mediaLibrary.active, true),
      or(
        ilike(mediaLibrary.destination, term),
        ilike(mediaLibrary.filename, term),
        ilike(mediaLibrary.title, term)
      ),
    ];
    if (countryFilter) keywordConditions.push(countryFilter);

    const byKeyword = await db
      .select(selectCols)
      .from(mediaLibrary)
      .where(and(...keywordConditions))
      .orderBy(...orderClause)
      .limit(1);

    if (byKeyword.length > 0) {
      return {
        cdnUrl: byKeyword[0].cdnUrl,
        altText: byKeyword[0].altText || byKeyword[0].title || keyword,
      };
    }
  }

  // Strategy 3: Country match — least-used image for that country
  if (params.country) {
    const byCountry = await db
      .select(selectCols)
      .from(mediaLibrary)
      .where(
        and(
          eq(mediaLibrary.active, true),
          eq(mediaLibrary.country, params.country.toLowerCase())
        )
      )
      .orderBy(...orderClause)
      .limit(1);

    if (byCountry.length > 0) {
      return {
        cdnUrl: byCountry[0].cdnUrl,
        altText: byCountry[0].altText || byCountry[0].title || params.country,
      };
    }
  }

  // Strategy 4: Unsplash fallback — curated photos by region/keyword/country
  const regionKey = params.region?.toLowerCase();
  if (regionKey && UNSPLASH_ITINERARY_PHOTOS[regionKey]) {
    return {
      cdnUrl: UNSPLASH_ITINERARY_PHOTOS[regionKey],
      altText: params.region || params.name,
    };
  }
  // Try matching keywords against Unsplash map keys
  for (const keyword of keywords) {
    const matchKey = Object.keys(UNSPLASH_ITINERARY_PHOTOS).find(
      (k) => k.includes(keyword) || keyword.includes(k)
    );
    if (matchKey) {
      return {
        cdnUrl: UNSPLASH_ITINERARY_PHOTOS[matchKey],
        altText: params.name,
      };
    }
  }
  // Country-level Unsplash fallback
  const countryKey = params.country?.toLowerCase();
  if (countryKey && UNSPLASH_ITINERARY_PHOTOS[countryKey]) {
    return {
      cdnUrl: UNSPLASH_ITINERARY_PHOTOS[countryKey],
      altText: params.country || params.name,
    };
  }

  return null;
}

// ─── Bulk Operations ─────────────────────────────────────────────────────────

/**
 * Bulk update tags on multiple records.
 */
export async function bulkAddTags(
  ids: number[],
  tags: string[]
): Promise<void> {
  for (const id of ids) {
    const record = await getMediaById(id);
    if (!record) continue;
    const existingTags = (record.tags || []) as string[];
    const merged = [...new Set([...existingTags, ...tags])];
    await db
      .update(mediaLibrary)
      .set({ tags: merged, updatedAt: new Date() })
      .where(eq(mediaLibrary.id, id));
  }
}

/**
 * Bulk update category on multiple records.
 */
export async function bulkUpdateCategory(
  ids: number[],
  category: string
): Promise<void> {
  for (const id of ids) {
    await db
      .update(mediaLibrary)
      .set({ category, updatedAt: new Date() })
      .where(eq(mediaLibrary.id, id));
  }
}

/**
 * Bulk soft delete.
 */
export async function bulkDelete(ids: number[]): Promise<void> {
  for (const id of ids) {
    await softDeleteMedia(id);
  }
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function createCollection(params: {
  name: string;
  description?: string;
  country?: string;
  coverImageId?: number;
}) {
  const [record] = await db
    .insert(mediaCollections)
    .values({
      name: params.name,
      description: params.description || null,
      country: params.country || null,
      coverImageId: params.coverImageId || null,
    })
    .returning();

  return record;
}

export async function listCollections(activeOnly = true) {
  const conditions = activeOnly
    ? [eq(mediaCollections.active, true)]
    : [];

  return db
    .select()
    .from(mediaCollections)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(mediaCollections.createdAt));
}

export async function getCollection(id: number) {
  const [collection] = await db
    .select()
    .from(mediaCollections)
    .where(eq(mediaCollections.id, id))
    .limit(1);

  if (!collection) return null;

  const items = await db
    .select({
      id: mediaCollectionItems.id,
      mediaId: mediaCollectionItems.mediaId,
      sortOrder: mediaCollectionItems.sortOrder,
      media: mediaLibrary,
    })
    .from(mediaCollectionItems)
    .leftJoin(mediaLibrary, eq(mediaCollectionItems.mediaId, mediaLibrary.id))
    .where(eq(mediaCollectionItems.collectionId, id))
    .orderBy(asc(mediaCollectionItems.sortOrder));

  return { ...collection, items };
}

export async function updateCollection(
  id: number,
  updates: { name?: string; description?: string; country?: string; coverImageId?: number | null; active?: boolean }
) {
  const [record] = await db
    .update(mediaCollections)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(mediaCollections.id, id))
    .returning();

  return record || null;
}

export async function deleteCollection(id: number) {
  await db
    .delete(mediaCollectionItems)
    .where(eq(mediaCollectionItems.collectionId, id));
  await db.delete(mediaCollections).where(eq(mediaCollections.id, id));
}

export async function addToCollection(
  collectionId: number,
  mediaId: number,
  sortOrder = 0
) {
  const [record] = await db
    .insert(mediaCollectionItems)
    .values({ collectionId, mediaId, sortOrder })
    .returning();

  return record;
}

export async function removeFromCollection(
  collectionId: number,
  mediaId: number
) {
  await db
    .delete(mediaCollectionItems)
    .where(
      and(
        eq(mediaCollectionItems.collectionId, collectionId),
        eq(mediaCollectionItems.mediaId, mediaId)
      )
    );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getMediaStats(): Promise<MediaStats> {
  // Total count
  const [totalResult] = await db
    .select({ total: count() })
    .from(mediaLibrary)
    .where(eq(mediaLibrary.active, true));

  // By country
  const countryResult = await db
    .select({
      country: mediaLibrary.country,
      count: count(),
    })
    .from(mediaLibrary)
    .where(eq(mediaLibrary.active, true))
    .groupBy(mediaLibrary.country);

  // By category
  const categoryResult = await db
    .select({
      category: mediaLibrary.category,
      count: count(),
    })
    .from(mediaLibrary)
    .where(eq(mediaLibrary.active, true))
    .groupBy(mediaLibrary.category);

  // By season
  const seasonResult = await db
    .select({
      season: mediaLibrary.season,
      count: count(),
    })
    .from(mediaLibrary)
    .where(and(eq(mediaLibrary.active, true), sql`${mediaLibrary.season} IS NOT NULL`))
    .groupBy(mediaLibrary.season);

  // Featured count
  const [featuredResult] = await db
    .select({ count: count() })
    .from(mediaLibrary)
    .where(and(eq(mediaLibrary.active, true), eq(mediaLibrary.featured, true)));

  // Most used
  const mostUsed = await db
    .select({
      id: mediaLibrary.id,
      title: mediaLibrary.title,
      cdnUrl: mediaLibrary.cdnUrl,
      usageCount: mediaLibrary.usageCount,
    })
    .from(mediaLibrary)
    .where(eq(mediaLibrary.active, true))
    .orderBy(desc(mediaLibrary.usageCount))
    .limit(5);

  // Recently added
  const recentlyAdded = await db
    .select({
      id: mediaLibrary.id,
      title: mediaLibrary.title,
      thumbnailUrl: mediaLibrary.thumbnailUrl,
      createdAt: mediaLibrary.createdAt,
    })
    .from(mediaLibrary)
    .where(eq(mediaLibrary.active, true))
    .orderBy(desc(mediaLibrary.createdAt))
    .limit(5);

  const byCountry: Record<string, number> = {};
  for (const r of countryResult) {
    byCountry[r.country] = r.count;
  }

  const byCategory: Record<string, number> = {};
  for (const r of categoryResult) {
    byCategory[r.category] = r.count;
  }

  const bySeason: Record<string, number> = {};
  for (const r of seasonResult) {
    if (r.season) bySeason[r.season] = r.count;
  }

  return {
    total: totalResult?.total || 0,
    byCountry,
    byCategory,
    bySeason,
    featured: featuredResult?.count || 0,
    mostUsed,
    recentlyAdded,
  };
}
