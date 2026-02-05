/**
 * Content Engine
 * Core content management and retrieval for the Content & Personalization Agent
 */

import { db } from "@/db";
import {
  destinationContent,
  contentTemplates,
  contentAssets,
  generatedContent,
  clientContentPreferences,
  destinations,
  clients,
} from "@/db/schema";
import { eq, and, desc, sql, ilike, inArray } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentSearchParams {
  destinationId?: number;
  contentType?: string;
  language?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface TemplateRenderData {
  [key: string]: string | number | boolean | undefined | null;
}

export interface AssetSearchParams {
  destinationId?: number;
  hotelId?: number;
  assetType?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  limit?: number;
}

// ─── Destination Content Management ───────────────────────────────────────────

/**
 * Create destination content
 */
export async function createDestinationContent(params: {
  destinationId?: number;
  contentType: string;
  language?: string;
  title: string;
  content: string;
  summary?: string;
  highlights?: string[];
  keywords?: string[];
  tags?: string[];
  seasonalVariations?: Record<string, string>;
  featuredImage?: string;
  gallery?: Array<{ url: string; caption?: string; alt?: string }>;
}) {
  const [created] = await db
    .insert(destinationContent)
    .values({
      destinationId: params.destinationId,
      contentType: params.contentType,
      language: params.language || "en",
      title: params.title,
      content: params.content,
      summary: params.summary,
      highlights: params.highlights,
      keywords: params.keywords,
      tags: params.tags,
      seasonalVariations: params.seasonalVariations,
      featuredImage: params.featuredImage,
      gallery: params.gallery,
      isApproved: false,
    })
    .returning();

  return created;
}

/**
 * Get destination content by type
 */
export async function getDestinationContent(
  destinationId: number,
  contentType: string,
  language: string = "en"
) {
  const [content] = await db
    .select()
    .from(destinationContent)
    .where(
      and(
        eq(destinationContent.destinationId, destinationId),
        eq(destinationContent.contentType, contentType),
        eq(destinationContent.language, language),
        eq(destinationContent.isApproved, true)
      )
    )
    .orderBy(desc(destinationContent.version))
    .limit(1);

  if (content) {
    // Update usage count
    await db
      .update(destinationContent)
      .set({
        usageCount: sql`${destinationContent.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(destinationContent.id, content.id));
  }

  return content;
}

/**
 * Search destination content
 */
export async function searchDestinationContent(params: ContentSearchParams) {
  const conditions = [];

  if (params.destinationId) {
    conditions.push(eq(destinationContent.destinationId, params.destinationId));
  }
  if (params.contentType) {
    conditions.push(eq(destinationContent.contentType, params.contentType));
  }
  if (params.language) {
    conditions.push(eq(destinationContent.language, params.language));
  }

  const results = await db
    .select({
      content: destinationContent,
      destination: {
        id: destinations.id,
        city: destinations.city,
        region: destinations.region,
        country: destinations.country,
      },
    })
    .from(destinationContent)
    .leftJoin(destinations, eq(destinationContent.destinationId, destinations.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(destinationContent.usageCount))
    .limit(params.limit || 50)
    .offset(params.offset || 0);

  return results;
}

/**
 * Approve destination content
 */
export async function approveDestinationContent(
  contentId: number,
  approvedBy: string
) {
  const [updated] = await db
    .update(destinationContent)
    .set({
      isApproved: true,
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(destinationContent.id, contentId))
    .returning();

  return updated;
}

// ─── Content Templates ────────────────────────────────────────────────────────

/**
 * Create content template
 */
export async function createContentTemplate(params: {
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  subject?: string;
  content: string;
  htmlContent?: string;
  plainTextContent?: string;
  availableTokens?: Array<{ token: string; description: string }>;
  requiredTokens?: string[];
  language?: string;
  variants?: Record<string, string>;
}) {
  const [created] = await db
    .insert(contentTemplates)
    .values({
      name: params.name,
      slug: params.slug,
      category: params.category,
      subcategory: params.subcategory,
      subject: params.subject,
      content: params.content,
      htmlContent: params.htmlContent,
      plainTextContent: params.plainTextContent,
      availableTokens: params.availableTokens,
      requiredTokens: params.requiredTokens,
      language: params.language || "en",
      variants: params.variants,
      isActive: true,
    })
    .returning();

  return created;
}

/**
 * Get template by slug
 */
export async function getTemplateBySlug(slug: string, language: string = "en") {
  const [template] = await db
    .select()
    .from(contentTemplates)
    .where(
      and(
        eq(contentTemplates.slug, slug),
        eq(contentTemplates.language, language),
        eq(contentTemplates.isActive, true)
      )
    )
    .limit(1);

  return template;
}

/**
 * Render template with data
 */
export function renderTemplate(
  template: string,
  data: TemplateRenderData
): string {
  let rendered = template;

  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(placeholder, String(value ?? ""));
  }

  // Clean up any remaining placeholders
  rendered = rendered.replace(/\{\{[^}]+\}\}/g, "");

  return rendered;
}

/**
 * Get and render template
 */
export async function getRenderedTemplate(
  slug: string,
  data: TemplateRenderData,
  language: string = "en"
): Promise<{ subject?: string; content: string; html?: string } | null> {
  const template = await getTemplateBySlug(slug, language);
  if (!template) return null;

  // Update usage count
  await db
    .update(contentTemplates)
    .set({
      usageCount: sql`${contentTemplates.usageCount} + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(contentTemplates.id, template.id));

  return {
    subject: template.subject ? renderTemplate(template.subject, data) : undefined,
    content: renderTemplate(template.content, data),
    html: template.htmlContent ? renderTemplate(template.htmlContent, data) : undefined,
  };
}

/**
 * List templates by category
 */
export async function listTemplates(category?: string, subcategory?: string) {
  const conditions = [eq(contentTemplates.isActive, true)];

  if (category) {
    conditions.push(eq(contentTemplates.category, category));
  }
  if (subcategory) {
    conditions.push(eq(contentTemplates.subcategory, subcategory));
  }

  return db
    .select()
    .from(contentTemplates)
    .where(and(...conditions))
    .orderBy(contentTemplates.name);
}

// ─── Content Assets ───────────────────────────────────────────────────────────

/**
 * Create content asset
 */
export async function createContentAsset(params: {
  name: string;
  filename: string;
  assetType: string;
  url: string;
  thumbnailUrl?: string;
  storageProvider?: string;
  storagePath?: string;
  mimeType?: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  destinationId?: number;
  hotelId?: number;
  supplierId?: number;
  category?: string;
  tags?: string[];
  caption?: string;
  altText?: string;
  credits?: string;
  licenseType?: string;
  licenseExpiry?: Date;
  usageRights?: { web?: boolean; print?: boolean; social?: boolean };
  qualityScore?: number;
}) {
  const [created] = await db
    .insert(contentAssets)
    .values({
      name: params.name,
      filename: params.filename,
      assetType: params.assetType,
      url: params.url,
      thumbnailUrl: params.thumbnailUrl,
      storageProvider: params.storageProvider || "local",
      storagePath: params.storagePath,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      dimensions: params.dimensions,
      duration: params.duration,
      destinationId: params.destinationId,
      hotelId: params.hotelId,
      supplierId: params.supplierId,
      category: params.category,
      tags: params.tags,
      caption: params.caption,
      altText: params.altText,
      credits: params.credits,
      licenseType: params.licenseType,
      licenseExpiry: params.licenseExpiry,
      usageRights: params.usageRights,
      qualityScore: params.qualityScore,
    })
    .returning();

  return created;
}

/**
 * Search content assets
 */
export async function searchAssets(params: AssetSearchParams) {
  const conditions = [];

  if (params.destinationId) {
    conditions.push(eq(contentAssets.destinationId, params.destinationId));
  }
  if (params.hotelId) {
    conditions.push(eq(contentAssets.hotelId, params.hotelId));
  }
  if (params.assetType) {
    conditions.push(eq(contentAssets.assetType, params.assetType));
  }
  if (params.category) {
    conditions.push(eq(contentAssets.category, params.category));
  }
  if (params.isFeatured) {
    conditions.push(eq(contentAssets.isFeatured, true));
  }

  return db
    .select()
    .from(contentAssets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contentAssets.qualityScore), desc(contentAssets.usageCount))
    .limit(params.limit || 20);
}

/**
 * Get featured assets for a destination
 */
export async function getDestinationAssets(
  destinationId: number,
  options?: { category?: string; limit?: number; featuredOnly?: boolean }
) {
  const conditions = [eq(contentAssets.destinationId, destinationId)];

  if (options?.category) {
    conditions.push(eq(contentAssets.category, options.category));
  }
  if (options?.featuredOnly) {
    conditions.push(eq(contentAssets.isFeatured, true));
  }

  return db
    .select()
    .from(contentAssets)
    .where(and(...conditions))
    .orderBy(desc(contentAssets.qualityScore))
    .limit(options?.limit || 10);
}

// ─── Client Content Preferences ───────────────────────────────────────────────

/**
 * Get or create client content preferences
 */
export async function getClientPreferences(clientId: number) {
  const [existing] = await db
    .select()
    .from(clientContentPreferences)
    .where(eq(clientContentPreferences.clientId, clientId))
    .limit(1);

  if (existing) return existing;

  // Create default preferences
  const [created] = await db
    .insert(clientContentPreferences)
    .values({
      clientId,
      preferredLanguage: "en",
      formalityLevel: "professional",
      communicationStyle: "detailed",
    })
    .returning();

  return created;
}

/**
 * Update client content preferences
 */
export async function updateClientPreferences(
  clientId: number,
  updates: {
    preferredLanguage?: string;
    formalityLevel?: string;
    communicationStyle?: string;
    interests?: string[];
    preferredActivities?: string[];
    travelStyle?: string;
    specialOccasions?: Record<string, string>;
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
    emailOptOut?: boolean;
    smsOptOut?: boolean;
    marketingOptOut?: boolean;
  }
) {
  // Get or create first
  await getClientPreferences(clientId);

  const [updated] = await db
    .update(clientContentPreferences)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(clientContentPreferences.clientId, clientId))
    .returning();

  return updated;
}

/**
 * Record content engagement
 */
export async function recordContentEngagement(
  clientId: number,
  contentId: string,
  action: "opened" | "clicked" | "ignored"
) {
  const prefs = await getClientPreferences(clientId);
  const engagement = (prefs.contentEngagement as Record<string, string[]>) || {
    opened: [],
    clicked: [],
    ignored: [],
  };

  // Add to appropriate array (limit to last 100)
  engagement[action] = [contentId, ...(engagement[action] || [])].slice(0, 100);

  await db
    .update(clientContentPreferences)
    .set({
      contentEngagement: engagement,
      updatedAt: new Date(),
    })
    .where(eq(clientContentPreferences.clientId, clientId));
}

// ─── Generated Content Cache ──────────────────────────────────────────────────

/**
 * Cache generated content
 */
export async function cacheGeneratedContent(params: {
  contentType: string;
  language?: string;
  contextType?: string;
  contextId?: number;
  inputData?: Record<string, unknown>;
  content: string;
  metadata?: Record<string, unknown>;
  modelUsed?: string;
  promptTemplate?: string;
  generationParams?: Record<string, unknown>;
  tokensUsed?: number;
  expiresAt?: Date;
}) {
  const [cached] = await db
    .insert(generatedContent)
    .values({
      contentType: params.contentType,
      language: params.language || "en",
      contextType: params.contextType,
      contextId: params.contextId,
      inputData: params.inputData,
      content: params.content,
      metadata: params.metadata,
      modelUsed: params.modelUsed,
      promptTemplate: params.promptTemplate,
      generationParams: params.generationParams,
      tokensUsed: params.tokensUsed,
      expiresAt: params.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    })
    .returning();

  return cached;
}

/**
 * Get cached content if available
 */
export async function getCachedContent(
  contentType: string,
  contextType: string,
  contextId: number,
  language: string = "en"
) {
  const [cached] = await db
    .select()
    .from(generatedContent)
    .where(
      and(
        eq(generatedContent.contentType, contentType),
        eq(generatedContent.contextType, contextType),
        eq(generatedContent.contextId, contextId),
        eq(generatedContent.language, language),
        sql`${generatedContent.expiresAt} > NOW()`
      )
    )
    .orderBy(desc(generatedContent.createdAt))
    .limit(1);

  if (cached) {
    // Update usage
    await db
      .update(generatedContent)
      .set({
        usageCount: sql`${generatedContent.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(generatedContent.id, cached.id));
  }

  return cached;
}

/**
 * Approve generated content
 */
export async function approveGeneratedContent(
  contentId: number,
  approvedBy: string,
  editedContent?: string
) {
  const [updated] = await db
    .update(generatedContent)
    .set({
      isApproved: true,
      approvedBy,
      wasEdited: !!editedContent,
      editedContent,
      updatedAt: new Date(),
    })
    .where(eq(generatedContent.id, contentId))
    .returning();

  return updated;
}

// ─── Content Statistics ───────────────────────────────────────────────────────

/**
 * Get content statistics
 */
export async function getContentStats() {
  const [destContentStats] = await db
    .select({
      total: sql<number>`count(*)`,
      approved: sql<number>`count(*) filter (where ${destinationContent.isApproved})`,
      totalUsage: sql<number>`sum(${destinationContent.usageCount})`,
    })
    .from(destinationContent);

  const [templateStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${contentTemplates.isActive})`,
      totalUsage: sql<number>`sum(${contentTemplates.usageCount})`,
    })
    .from(contentTemplates);

  const [assetStats] = await db
    .select({
      total: sql<number>`count(*)`,
      images: sql<number>`count(*) filter (where ${contentAssets.assetType} = 'image')`,
      videos: sql<number>`count(*) filter (where ${contentAssets.assetType} = 'video')`,
      featured: sql<number>`count(*) filter (where ${contentAssets.isFeatured})`,
    })
    .from(contentAssets);

  const [generatedStats] = await db
    .select({
      total: sql<number>`count(*)`,
      approved: sql<number>`count(*) filter (where ${generatedContent.isApproved})`,
      totalTokens: sql<number>`sum(${generatedContent.tokensUsed})`,
    })
    .from(generatedContent);

  return {
    destinationContent: destContentStats,
    templates: templateStats,
    assets: assetStats,
    generated: generatedStats,
  };
}
