/**
 * Script: Update 2025 departure / validity dates to 2026-2027
 *
 * What it does:
 * 1. Packages with null departure_dates and package_type in
 *    (fixed_departure_trek, expedition): populate with 2026/2027 seasonal dates
 *    and set valid_from/valid_to = 2026-01-01 / 2027-12-31.
 * 2. hotel_room_rates with valid_from starting in 2025: shift to 2026
 *    (same month/day). valid_to is already 2027-12-31, so no change needed there.
 *
 * Run: npx tsx scripts/update-departure-dates-2026.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Spring trekking/climbing season: March–May
// Autumn trekking/climbing season: September–November
const SPRING_DATES_2026 = ["2026-03-15", "2026-04-01", "2026-04-15", "2026-05-01"];
const AUTUMN_DATES_2026 = ["2026-09-15", "2026-10-01", "2026-10-15", "2026-11-01"];
const SPRING_DATES_2027 = ["2027-03-15", "2027-04-01", "2027-04-15", "2027-05-01"];
const AUTUMN_DATES_2027 = ["2027-09-15", "2027-10-01", "2027-10-15", "2027-11-01"];

// Year-round packages (cultural tours, safaris, wellness): monthly departures
function yearRoundDates(): string[] {
  const dates: string[] = [];
  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
  ];
  for (const yr of ["2026", "2027"]) {
    for (const mo of months) {
      dates.push(`${yr}-${mo}-01`);
    }
  }
  return dates;
}

// Seasonal departure dates per package ID based on type/name
function departureDatesFor(id: number, packageType: string, name: string): string[] {
  if (packageType === "expedition") {
    // Expeditions: spring + autumn only
    return [
      ...SPRING_DATES_2026,
      ...AUTUMN_DATES_2026,
      ...SPRING_DATES_2027,
      ...AUTUMN_DATES_2027,
    ];
  }

  // fixed_departure_trek: check name for cultural/year-round vs seasonal
  const lowerName = name.toLowerCase();
  const isYearRound =
    lowerName.includes("cultural") ||
    lowerName.includes("safari") ||
    lowerName.includes("wellness") ||
    lowerName.includes("retreat") ||
    lowerName.includes("helicopter") ||
    lowerName.includes("lumbini") ||
    lowerName.includes("pokhara");

  if (isYearRound) {
    return yearRoundDates();
  }

  // Standard trekking seasons
  return [
    ...SPRING_DATES_2026,
    ...AUTUMN_DATES_2026,
    ...SPRING_DATES_2027,
    ...AUTUMN_DATES_2027,
  ];
}

async function updatePackages() {
  const rows = await sql`
    SELECT id, name, package_type
    FROM packages
    WHERE package_type IN ('fixed_departure_trek', 'expedition')
    ORDER BY id
  `;

  console.log(`\nPackages to update: ${rows.length}`);
  let updated = 0;

  for (const row of rows) {
    const dates = departureDatesFor(row.id as number, row.package_type as string, row.name as string);

    await sql`
      UPDATE packages SET
        departure_dates    = ${JSON.stringify(dates)}::jsonb,
        is_fixed_departure = true,
        valid_from         = '2026-01-01',
        valid_to           = '2027-12-31',
        updated_at         = NOW()
      WHERE id = ${row.id}
    `;

    console.log(
      `  [${row.id}] ${row.name} → ${dates.length} departure dates set`
    );
    updated++;
  }

  console.log(`  → ${updated} package(s) updated`);
}

async function updateHotelRoomRates() {
  // Only shift dates that still start in 2025; valid_to is already 2027
  const rows = await sql`
    SELECT id, valid_from::text AS valid_from
    FROM hotel_room_rates
    WHERE valid_from::text LIKE '2025%'
  `;

  console.log(`\nhotel_room_rates with 2025 valid_from: ${rows.length}`);
  if (rows.length === 0) return;

  for (const row of rows) {
    // 2025-MM-DD → 2026-MM-DD
    const newValidFrom = (row.valid_from as string).replace(/^2025-/, "2026-");

    await sql`
      UPDATE hotel_room_rates
      SET valid_from = ${newValidFrom}, updated_at = NOW()
      WHERE id = ${row.id}
    `;
  }

  console.log(`  → ${rows.length} row(s) updated (2025-MM-DD → 2026-MM-DD)`);
}

async function main() {
  console.log("=== Updating departure / validity dates to 2026-2027 ===\n");

  await updatePackages();
  await updateHotelRoomRates();

  // ---- Verification ----
  console.log("\n=== Verification ===");

  const pkgVerify = await sql`
    SELECT id, name, departure_dates, valid_from::text, valid_to::text, is_fixed_departure
    FROM packages
    WHERE package_type IN ('fixed_departure_trek', 'expedition')
    ORDER BY id
  `;
  console.log("\nPackages (fixed_departure_trek + expedition):");
  for (const p of pkgVerify) {
    const dates = Array.isArray(p.departure_dates) ? (p.departure_dates as string[]) : [];
    console.log(
      `  [${p.id}] ${p.name}: ${dates.length} dates, first=${dates[0] ?? "—"}, last=${dates[dates.length - 1] ?? "—"}, valid ${p.valid_from}→${p.valid_to}`
    );
  }

  const hrrVerify = await sql`
    SELECT valid_from::text, valid_to::text, count(*) AS cnt
    FROM hotel_room_rates
    GROUP BY valid_from, valid_to
    ORDER BY valid_from
    LIMIT 10
  `;
  console.log("\nhotel_room_rates date distribution (top 10):");
  for (const r of hrrVerify) {
    console.log(`  valid_from=${r.valid_from}  valid_to=${r.valid_to}  count=${r.cnt}`);
  }

  const still2025 = await sql`
    SELECT count(*) AS cnt FROM hotel_room_rates WHERE valid_from::text LIKE '2025%' OR valid_to::text LIKE '2025%'
  `;
  console.log(`\nhotel_room_rates still with 2025 dates: ${still2025[0].cnt}`);

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
