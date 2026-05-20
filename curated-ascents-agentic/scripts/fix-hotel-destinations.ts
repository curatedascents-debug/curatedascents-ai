import { config } from "dotenv";
import { resolve } from "path";

// Try cwd first, then parent directory (worktree layout)
config({ path: resolve(process.cwd(), ".env.local") });
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), "../.env.local") });
}
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), "../../.env.local") });
}

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Keywords that indicate a hotel belongs to a specific destination.
// Includes well-known Nepal hotels where the destination name doesn't appear in
// the hotel name but the geography is unambiguous (e.g. "Club Himalaya" is the
// famous Nagarkot resort; "Dwarika's Sanctuary" is the Dhulikhel wellness retreat).
const DESTINATION_KEYWORDS: Record<string, string[]> = {
  Nagarkot: [
    "nagarkot",
    "club himalaya",    // Club Himalaya Nagarkot Resort & Spa (ACE Hotels)
    "fort resort",      // FORT Resort Nagarkot
    "himalaya drishya", // Himalaya Drishya, Nagarkot
  ],
  Dhulikhel: [
    "dhulikhel",
    "dwarika's sanctuary", // Dwarika's Sanctuary Dhulikhel (famous wellness retreat)
    "dwarika sanctuary",
  ],
  Pokhara: [
    "pokhara",
    "lakeside",
    "lake paradise",  // Hotel Lake Paradise — Phewa Lake, Pokhara
    "annapurna view", // Annapurna-view lodges are in Pokhara or trekking routes, not KTM
    "annupurna view", // common misspelling variant
  ],
  Chitwan: ["chitwan", "jungle", "safari", "tiger", "tharu", "barahi jungle", "meghauli"],
  Bandipur: ["bandipur"],
  Bhaktapur: ["bhaktapur"],
  Lumbini: ["lumbini"],
};

async function main() {
  // 1. List all hotels with their current destination
  console.log("=== ALL HOTELS WITH CURRENT DESTINATIONS ===\n");
  const hotels = await sql`
    SELECT h.id, h.name, h.star_rating, d.city, d.country
    FROM hotels h
    LEFT JOIN destinations d ON h.destination_id = d.id
    ORDER BY d.city, h.name
  `;

  for (const h of hotels) {
    console.log(
      `  [${h.id}] ${h.name} (${h.star_rating}★) — ${h.city ?? "NO DEST"}, ${h.country ?? ""}`
    );
  }

  // 2. Fetch relevant destination IDs
  console.log("\n=== DESTINATION IDs ===\n");
  const destinations = await sql`
    SELECT id, city, country FROM destinations
    WHERE city IN ('Nagarkot','Dhulikhel','Pokhara','Chitwan','Bandipur','Bhaktapur','Lumbini')
    ORDER BY city
  `;
  const destMap: Record<string, string> = {};
  for (const d of destinations) {
    destMap[d.city] = d.id;
    console.log(`  ${d.city}: ${d.id}`);
  }

  // 3. Identify mis-assigned hotels (currently Kathmandu but name suggests elsewhere)
  const kathmandu = hotels.filter((h) => h.city === "Kathmandu");
  console.log(`\n=== KATHMANDU HOTELS (${kathmandu.length} total) ===\n`);

  type Reassignment = { id: string; name: string; from: string; to: string; destId: string };
  const reassignments: Reassignment[] = [];

  for (const hotel of kathmandu) {
    const nameLower = hotel.name.toLowerCase();
    for (const [destCity, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
      if (keywords.some((kw) => nameLower.includes(kw))) {
        const destId = destMap[destCity];
        if (!destId) {
          console.warn(`  WARNING: No destination found for "${destCity}" — skipping ${hotel.name}`);
          break;
        }
        reassignments.push({
          id: hotel.id,
          name: hotel.name,
          from: hotel.city,
          to: destCity,
          destId,
        });
        break;
      }
    }
  }

  if (reassignments.length === 0) {
    console.log("  No mis-assigned hotels found. Nothing to do.");
    return;
  }

  console.log(`\n=== PLANNED REASSIGNMENTS (${reassignments.length} hotels) ===\n`);
  for (const r of reassignments) {
    console.log(`  [${r.id}] "${r.name}"`);
    console.log(`        ${r.from} → ${r.to} (dest_id: ${r.destId})\n`);
  }

  // 4. Apply updates
  console.log("=== APPLYING UPDATES ===\n");
  for (const r of reassignments) {
    await sql`
      UPDATE hotels SET destination_id = ${r.destId} WHERE id = ${r.id}
    `;
    console.log(`  Updated: "${r.name}" → ${r.to}`);
  }

  // 5. Verify
  console.log("\n=== VERIFICATION — UPDATED HOTELS ===\n");
  const ids = reassignments.map((r) => r.id);
  const verified = await sql`
    SELECT h.id, h.name, h.star_rating, d.city, d.country
    FROM hotels h
    LEFT JOIN destinations d ON h.destination_id = d.id
    WHERE h.id = ANY(${ids})
    ORDER BY d.city, h.name
  `;
  for (const h of verified) {
    console.log(`  [${h.id}] ${h.name} (${h.star_rating}★) — ${h.city}, ${h.country}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
