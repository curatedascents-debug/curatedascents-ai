import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const results: string[] = [];

    // 1. Delete test/empty itineraries
    const deleteSlugs = [
      "bhutan-tour-14-days",
      "everest-base-camp-14-days",
      "bhutan-cultural-journey",
      "annapurna-circuit-trek",
      "everest-base-camp-trek-classic",
      "tibet-highlights-tour",
    ];

    const deleted = await db
      .delete(packages)
      .where(inArray(packages.slug, deleteSlugs));
    results.push(`Deleted ${deleteSlugs.length} test/empty itineraries`);

    // 2. Fix inclusions/exclusions for old itineraries (ensure newline-separated format)
    const fixSlugs = [
      "10-day-bhutan-cultural-immersion",
      "12-day-india-himalayan-explorer",
      "14-day-nepal-luxury-expedition",
      "8-day-tibet-sacred-lands",
    ];

    for (const slug of fixSlugs) {
      const [pkg] = await db
        .select({ id: packages.id, inclusions: packages.inclusions, exclusions: packages.exclusions })
        .from(packages)
        .where(eq(packages.slug, slug))
        .limit(1);

      if (!pkg) {
        results.push(`${slug}: not found, skipping`);
        continue;
      }

      let updated = false;
      const updates: { inclusions?: string; exclusions?: string; updatedAt: Date } = { updatedAt: new Date() };

      // Check if inclusions need fixing (might be comma-separated or JSON)
      if (pkg.inclusions) {
        const raw = pkg.inclusions;
        // If it looks like JSON array, parse and join with newlines
        if (raw.startsWith("[")) {
          try {
            const arr = JSON.parse(raw) as string[];
            updates.inclusions = arr.join("\n");
            updated = true;
          } catch { /* not JSON */ }
        }
        // If comma-separated (no newlines present), split on commas
        else if (!raw.includes("\n") && raw.includes(",")) {
          updates.inclusions = raw.split(",").map((s: string) => s.trim()).filter(Boolean).join("\n");
          updated = true;
        }
      }

      if (pkg.exclusions) {
        const raw = pkg.exclusions;
        if (raw.startsWith("[")) {
          try {
            const arr = JSON.parse(raw) as string[];
            updates.exclusions = arr.join("\n");
            updated = true;
          } catch { /* not JSON */ }
        } else if (!raw.includes("\n") && raw.includes(",")) {
          updates.exclusions = raw.split(",").map((s: string) => s.trim()).filter(Boolean).join("\n");
          updated = true;
        }
      }

      if (updated) {
        await db.update(packages).set(updates).where(eq(packages.id, pkg.id));
        results.push(`${slug}: fixed inclusions/exclusions format`);
      } else {
        results.push(`${slug}: already in correct format`);
      }
    }

    // 3. Remove "Helicopter evacuation insurance" from climb inclusions
    const climbSlugs = [
      "lobuche-east-luxury-climb",
      "mera-peak-luxury-climb",
      "island-peak-luxury-climb",
    ];

    for (const slug of climbSlugs) {
      const [pkg] = await db
        .select({ id: packages.id, inclusions: packages.inclusions })
        .from(packages)
        .where(eq(packages.slug, slug))
        .limit(1);

      if (!pkg || !pkg.inclusions) {
        results.push(`${slug}: not found or no inclusions`);
        continue;
      }

      const lines = pkg.inclusions.split("\n").filter(
        (line) => !line.toLowerCase().includes("helicopter evacuation insurance")
      );

      await db
        .update(packages)
        .set({ inclusions: lines.join("\n"), updatedAt: new Date() })
        .where(eq(packages.id, pkg.id));
      results.push(`${slug}: removed helicopter evacuation insurance`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Cleanup failed:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
