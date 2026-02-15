/**
 * Admin Media — Bulk AI Auto-Tag
 * POST /api/admin/media/auto-tag-all
 * Uses DeepSeek to generate metadata (title, description, altText, tags,
 * destination, category, season) for all media items based on filenames.
 * Processes in batches of 15 to minimize API calls.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaLibrary } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for processing all images

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const BATCH_SIZE = 15;

interface AITagResult {
  id: number;
  title: string;
  description: string;
  altText: string;
  tags: string[];
  destination: string | null;
  category: string;
  season: string;
}

async function tagBatch(
  items: { id: number; filename: string; country: string; category: string }[]
): Promise<AITagResult[]> {
  const itemList = items
    .map((item) => `- ID ${item.id}: filename="${item.filename}", country="${item.country}", currentCategory="${item.category}"`)
    .join("\n");

  const systemPrompt = `You are a metadata specialist for CuratedAscents, a luxury adventure travel company focused on Nepal, India, Tibet, and Bhutan.

Given a list of image filenames with their country, generate rich metadata for each. Use the filename to infer the location, subject, and context.

For each image, return a JSON object with:
- "id": the provided ID (number)
- "title": descriptive title (e.g., "Sunrise Over Everest Base Camp") — capitalize properly
- "description": 1-2 sentence SEO description mentioning the location and what's shown
- "altText": short accessibility text under 125 chars
- "tags": array of 5-8 lowercase tags (e.g., ["everest", "mountain", "sunrise", "trek", "himalaya"])
- "destination": specific destination name (e.g., "Everest Region", "Pokhara", "Kathmandu Valley", "Upper Mustang", "Annapurna Region", "Chitwan", "Lumbini", "Nagarkot", "Bhaktapur", "Patan", "Rara Lake", "Bandipur", "Manang", "Dhulikhel", "Janakpur") — use null only if truly unidentifiable
- "category": best fit from: landscape, hotel, trek, culture, food, wildlife, temple, adventure, wellness, people, aerial, luxury, heritage
- "season": one of: spring, summer, monsoon, autumn, winter, all

Return a JSON array of objects. Return ONLY valid JSON, no markdown fencing or explanation.`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate metadata for these ${items.length} images:\n${itemList}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DeepSeek batch auto-tag error:", errorText);
    throw new Error("AI analysis failed");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST() {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured" },
        { status: 500 }
      );
    }

    // Get all active media items
    const allMedia = await db
      .select({
        id: mediaLibrary.id,
        filename: mediaLibrary.filename,
        country: mediaLibrary.country,
        category: mediaLibrary.category,
      })
      .from(mediaLibrary)
      .where(eq(mediaLibrary.active, true));

    if (allMedia.length === 0) {
      return NextResponse.json({ message: "No media items found", updated: 0 });
    }

    console.log(`[Auto-tag] Processing ${allMedia.length} images in batches of ${BATCH_SIZE}...`);

    let totalUpdated = 0;
    const errors: string[] = [];

    // Process in batches
    for (let i = 0; i < allMedia.length; i += BATCH_SIZE) {
      const batch = allMedia.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allMedia.length / BATCH_SIZE);

      console.log(`[Auto-tag] Batch ${batchNum}/${totalBatches} (${batch.length} items)...`);

      try {
        const results = await tagBatch(batch);

        // Update each record
        for (const result of results) {
          try {
            await db
              .update(mediaLibrary)
              .set({
                title: result.title,
                description: result.description,
                altText: result.altText,
                tags: result.tags,
                destination: result.destination,
                category: result.category,
                season: result.season,
                updatedAt: new Date(),
              })
              .where(eq(mediaLibrary.id, result.id));

            totalUpdated++;
          } catch (updateErr) {
            const msg = `Failed to update media ${result.id}: ${updateErr}`;
            console.error(msg);
            errors.push(msg);
          }
        }
      } catch (batchErr) {
        const msg = `Batch ${batchNum} failed: ${batchErr}`;
        console.error(msg);
        errors.push(msg);
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < allMedia.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`[Auto-tag] Done. Updated ${totalUpdated}/${allMedia.length} items.`);

    return NextResponse.json({
      success: true,
      total: allMedia.length,
      updated: totalUpdated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk auto-tag error:", error);
    return NextResponse.json(
      {
        error: "Bulk auto-tag failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
