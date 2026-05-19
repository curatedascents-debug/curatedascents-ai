/**
 * Script: Link hotel properties to supplier records
 *
 * Finds all hotels with supplier_id IS NULL that have real, named properties
 * (not generic test entries), creates supplier records, and links them.
 *
 * Run: DATABASE_URL=... node --loader ts-node/esm scripts/link-hotel-suppliers.ts
 *   or: npx ts-node --esm scripts/link-hotel-suppliers.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  console.log("Querying hotels with no supplier_id...\n");

  // Fetch hotels with null supplier_id + destination info
  const hotelsWithoutSupplier = await sql`
    SELECT
      h.id,
      h.name,
      h.star_rating,
      h.category,
      h.is_active,
      d.country AS dest_country,
      d.city    AS dest_city
    FROM hotels h
    LEFT JOIN destinations d ON h.destination_id = d.id
    WHERE h.supplier_id IS NULL
    ORDER BY h.name
  `;

  if (hotelsWithoutSupplier.length === 0) {
    console.log("No hotels without supplier_id found. Nothing to do.");
    return;
  }

  console.log(`Found ${hotelsWithoutSupplier.length} hotels without a supplier_id:`);
  for (const h of hotelsWithoutSupplier) {
    console.log(
      `  [${h.id}] ${h.name} — ${h.dest_city ?? "?"}, ${h.dest_country ?? "?"} (${h.star_rating ?? "?"}★)`
    );
  }

  // Filter to real named hotels (skip generic test names)
  const SKIP_PATTERNS = [
    /^test\b/i,
    /^sample\b/i,
    /^demo\b/i,
    /^temp\b/i,
    /^hotel \d+$/i,
    /^property \d+$/i,
  ];

  const realHotels = hotelsWithoutSupplier.filter((h) => {
    const name = String(h.name ?? "").trim();
    if (!name) return false;
    for (const pat of SKIP_PATTERNS) {
      if (pat.test(name)) {
        console.log(`  Skipping generic entry: "${name}"`);
        return false;
      }
    }
    return true;
  });

  console.log(`\nProcessing ${realHotels.length} real named hotels...\n`);

  let created = 0;
  let linked = 0;

  for (const hotel of realHotels) {
    const country = hotel.dest_country ?? "Nepal";
    const city = hotel.dest_city ?? null;
    const hotelName = String(hotel.name).trim();

    // Create supplier record
    const [supplier] = await sql`
      INSERT INTO suppliers (name, type, country, city, is_active, created_at, updated_at)
      VALUES (
        ${hotelName},
        'hotel',
        ${country},
        ${city},
        true,
        NOW(),
        NOW()
      )
      RETURNING id, name
    `;

    created++;
    console.log(`  Created supplier #${supplier.id}: "${supplier.name}" (${city}, ${country})`);

    // Link hotel to supplier
    await sql`
      UPDATE hotels
      SET supplier_id = ${supplier.id}, updated_at = NOW()
      WHERE id = ${hotel.id}
    `;

    linked++;
    console.log(`  Linked hotel #${hotel.id} → supplier #${supplier.id}`);
  }

  console.log(`\nDone! Created ${created} supplier records, linked ${linked} hotels.`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
