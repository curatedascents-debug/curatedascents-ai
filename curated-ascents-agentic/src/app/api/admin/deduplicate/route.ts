import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql, inArray } from "drizzle-orm";
import {
  hotelRoomRates,
  blogSocialPosts,
  transportation,
  guides,
  porters,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  permitsFees,
  miscellaneousServices,
  packages,
  seasons,
  hotels,
  blogCategories,
  destinations,
  suppliers,
  blogPosts,
  // Additional FK children of destinations
  agencyMarginOverrides,
  pricingRules,
  demandMetrics,
  competitorRates,
  blackoutDates,
  permitInventory,
  supplierRankings,
  travelAdvisories,
  weatherAlerts,
  complianceRequirements,
  emergencyContacts,
  destinationContent,
  contentAssets,
  destinationGuides,
  mediaLibrary,
  // Additional FK children of suppliers
  agencySuppliers,
  supplierUsers,
  availabilityCalendar,
  capacityConfig,
  availabilitySyncLog,
  supplierPerformance,
  supplierCommunications,
  supplierRateRequests,
  supplierIssues,
  supplierConfirmationRequests,
} from "@/db/schema";

export const dynamic = "force-dynamic";

// Types
interface DuplicateGroup {
  keeperId: number;
  duplicateIds: number[];
}

interface TableResult {
  table: string;
  duplicateGroups: number;
  duplicateRows: number;
  sample?: { keeperId: number; duplicateIds: number[] };
  deleted?: number;
  repointed?: Record<string, number>;
  error?: string;
}

// Detect duplicates — uses a parameterized cache-buster to avoid Neon's HTTP query cache
async function detectDuplicates(
  tableName: string,
  naturalKeyCols: string[]
): Promise<DuplicateGroup[]> {
  const groupBy = naturalKeyCols.join(", ");
  // Add a random parameter so Neon sees a unique parameterized query each time
  const cacheBuster = Math.random();
  const result = await db.execute(sql`
    SELECT MIN(id) as keeper_id, array_agg(id ORDER BY id) as all_ids
    FROM ${sql.raw(tableName)}
    WHERE ${cacheBuster} = ${cacheBuster}
    GROUP BY ${sql.raw(groupBy)}
    HAVING COUNT(*) > 1
  `);

  return (result.rows as { keeper_id: number; all_ids: number[] }[]).map(
    (row) => ({
      keeperId: row.keeper_id,
      duplicateIds: (row.all_ids as number[]).filter(
        (id) => id !== row.keeper_id
      ),
    })
  );
}

// Re-point child FK references from duplicate IDs to the keeper ID
// jsKey is the Drizzle property name (e.g. "destinationId"), fkColumn is for the WHERE clause
async function repointFK(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childTable: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fkColumn: any,
  jsKey: string,
  keeperId: number,
  duplicateIds: number[]
): Promise<number> {
  if (duplicateIds.length === 0) return 0;
  const result = await db
    .update(childTable)
    .set({ [jsKey]: keeperId })
    .where(inArray(fkColumn, duplicateIds));
  return (result as { rowCount?: number }).rowCount ?? 0;
}

// Delete duplicate rows by ID using Drizzle inArray (parameterized)
async function deleteDuplicates(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  idColumn: any,
  duplicateIds: number[]
): Promise<number> {
  if (duplicateIds.length === 0) return 0;
  const result = await db.delete(table).where(inArray(idColumn, duplicateIds));
  return (result as { rowCount?: number }).rowCount ?? 0;
}

// Process a simple table (no FK children to re-point)
async function processSimpleTable(
  tableName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drizzleTable: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  idColumn: any,
  naturalKeyCols: string[],
  execute: boolean
): Promise<TableResult> {
  try {
    const groups = await detectDuplicates(tableName, naturalKeyCols);
    const allDuplicateIds = groups.flatMap((g) => g.duplicateIds);

    const result: TableResult = {
      table: tableName,
      duplicateGroups: groups.length,
      duplicateRows: allDuplicateIds.length,
    };

    if (groups.length > 0) {
      result.sample = {
        keeperId: groups[0].keeperId,
        duplicateIds: groups[0].duplicateIds,
      };
    }

    if (execute && allDuplicateIds.length > 0) {
      result.deleted = await deleteDuplicates(
        drizzleTable,
        idColumn,
        allDuplicateIds
      );
    }

    return result;
  } catch (e) {
    return {
      table: tableName,
      duplicateGroups: 0,
      duplicateRows: 0,
      error: (e as Error).message,
    };
  }
}

// GET — Preview duplicates (read-only)
// POST — Execute deduplication (loops until convergence, max 5 passes)
export async function GET() {
  const results = await runDeduplicatePass(false);
  return formatResponse(results, false, 1);
}

export async function POST() {
  const allPassResults: TableResult[][] = [];
  const MAX_PASSES = 5;

  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    const results = await runDeduplicatePass(true);
    allPassResults.push(results);
    const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);
    if (totalDeleted === 0) break;
  }

  // Merge results across passes
  const merged = mergePassResults(allPassResults);
  return formatResponse(merged, true, allPassResults.length);
}

function mergePassResults(passes: TableResult[][]): TableResult[] {
  if (passes.length === 0) return [];
  const merged: Record<string, TableResult> = {};
  for (const pass of passes) {
    for (const r of pass) {
      if (!merged[r.table]) {
        merged[r.table] = { ...r };
      } else {
        merged[r.table].duplicateGroups += r.duplicateGroups;
        merged[r.table].duplicateRows += r.duplicateRows;
        merged[r.table].deleted = (merged[r.table].deleted || 0) + (r.deleted || 0);
        if (r.repointed) {
          merged[r.table].repointed = merged[r.table].repointed || {};
          for (const [k, v] of Object.entries(r.repointed)) {
            merged[r.table].repointed![k] = (merged[r.table].repointed![k] || 0) + v;
          }
        }
        if (r.error && !merged[r.table].error) {
          merged[r.table].error = r.error;
        }
      }
    }
  }
  return Object.values(merged);
}

function formatResponse(results: TableResult[], execute: boolean, passes: number) {
  const totalDuplicateGroups = results.reduce((sum, r) => sum + r.duplicateGroups, 0);
  const totalDuplicateRows = results.reduce((sum, r) => sum + r.duplicateRows, 0);
  const totalDeleted = execute
    ? results.reduce((sum, r) => sum + (r.deleted || 0), 0)
    : undefined;
  const errors = results.filter((r) => r.error);

  return NextResponse.json({
    mode: execute ? "execute" : "preview",
    passes,
    summary: {
      tablesScanned: results.length,
      tablesWithDuplicates: results.filter((r) => r.duplicateGroups > 0).length,
      totalDuplicateGroups,
      totalDuplicateRows,
      ...(execute ? { totalDeleted } : {}),
      errors: errors.length,
    },
    tables: results,
  });
}

async function runDeduplicatePass(execute: boolean): Promise<TableResult[]> {
  const results: TableResult[] = [];

  // 1. hotelRoomRates — child of hotels
  results.push(
    await processSimpleTable(
      "hotel_room_rates",
      hotelRoomRates,
      hotelRoomRates.id,
      ["hotel_id", "room_type", "meal_plan"],
      execute
    )
  );

  // 2. blogSocialPosts — child of blogPosts
  results.push(
    await processSimpleTable(
      "blog_social_posts",
      blogSocialPosts,
      blogSocialPosts.id,
      ["blog_post_id", "platform"],
      execute
    )
  );

  // 3-8. Service tables (no FK children)
  results.push(
    await processSimpleTable(
      "transportation",
      transportation,
      transportation.id,
      ["route_from", "route_to", "vehicle_type"],
      execute
    )
  );

  results.push(
    await processSimpleTable("guides", guides, guides.id, [
      "guide_type",
      "destination",
      "experience_years",
    ], execute)
  );

  results.push(
    await processSimpleTable("porters", porters, porters.id, [
      "region",
      "max_weight_kg",
    ], execute)
  );

  results.push(
    await processSimpleTable(
      "flights_domestic",
      flightsDomestic,
      flightsDomestic.id,
      ["airline_name", "flight_sector", "departure_city", "arrival_city"],
      execute
    )
  );

  results.push(
    await processSimpleTable(
      "helicopter_sharing",
      helicopterSharing,
      helicopterSharing.id,
      ["route_name", "route_from", "route_to"],
      execute
    )
  );

  results.push(
    await processSimpleTable(
      "helicopter_charter",
      helicopterCharter,
      helicopterCharter.id,
      ["route_name", "route_from", "route_to"],
      execute
    )
  );

  // 9. permitsFees (no supplierId, no FK children)
  results.push(
    await processSimpleTable(
      "permits_fees",
      permitsFees,
      permitsFees.id,
      ["name", "country", "region"],
      execute
    )
  );

  // 10. miscellaneousServices
  results.push(
    await processSimpleTable(
      "miscellaneous_services",
      miscellaneousServices,
      miscellaneousServices.id,
      ["name", "destination", "category"],
      execute
    )
  );

  // 11. packages
  results.push(
    await processSimpleTable(
      "packages",
      packages,
      packages.id,
      ["name", "country", "region"],
      execute
    )
  );

  // 12. seasons
  results.push(
    await processSimpleTable(
      "seasons",
      seasons,
      seasons.id,
      ["country", "name", "start_month", "end_month"],
      execute
    )
  );

  // 13. hotels — has child hotelRoomRates.hotelId
  try {
    const hotelGroups = await detectDuplicates("hotels", [
      "name",
      "destination_id",
    ]);
    const hotelDupIds = hotelGroups.flatMap((g) => g.duplicateIds);

    const hotelResult: TableResult = {
      table: "hotels",
      duplicateGroups: hotelGroups.length,
      duplicateRows: hotelDupIds.length,
    };

    if (hotelGroups.length > 0) {
      hotelResult.sample = {
        keeperId: hotelGroups[0].keeperId,
        duplicateIds: hotelGroups[0].duplicateIds,
      };
    }

    if (execute && hotelDupIds.length > 0) {
      let repointedRoomRates = 0;
      for (const group of hotelGroups) {
        repointedRoomRates += await repointFK(
          hotelRoomRates,
          hotelRoomRates.hotelId,
          "hotelId",
          group.keeperId,
          group.duplicateIds
        );
      }
      hotelResult.repointed = { hotelRoomRates: repointedRoomRates };
      hotelResult.deleted = await deleteDuplicates(
        hotels,
        hotels.id,
        hotelDupIds
      );
    }

    results.push(hotelResult);
  } catch (e) {
    results.push({
      table: "hotels",
      duplicateGroups: 0,
      duplicateRows: 0,
      error: (e as Error).message,
    });
  }

  // 14. blogCategories — has child blogPosts.categoryId
  try {
    const catGroups = await detectDuplicates("blog_categories", ["slug"]);
    const catDupIds = catGroups.flatMap((g) => g.duplicateIds);

    const catResult: TableResult = {
      table: "blog_categories",
      duplicateGroups: catGroups.length,
      duplicateRows: catDupIds.length,
    };

    if (catGroups.length > 0) {
      catResult.sample = {
        keeperId: catGroups[0].keeperId,
        duplicateIds: catGroups[0].duplicateIds,
      };
    }

    if (execute && catDupIds.length > 0) {
      let repointedPosts = 0;
      for (const group of catGroups) {
        repointedPosts += await repointFK(
          blogPosts,
          blogPosts.categoryId,
          "categoryId",
          group.keeperId,
          group.duplicateIds
        );
      }
      catResult.repointed = { blogPosts: repointedPosts };
      catResult.deleted = await deleteDuplicates(
        blogCategories,
        blogCategories.id,
        catDupIds
      );
    }

    results.push(catResult);
  } catch (e) {
    results.push({
      table: "blog_categories",
      duplicateGroups: 0,
      duplicateRows: 0,
      error: (e as Error).message,
    });
  }

  // 15. destinations — re-point ALL 16 child FK tables before deleting
  try {
    const destGroups = await detectDuplicates("destinations", [
      "country",
      "region",
      "city",
    ]);
    const destDupIds = destGroups.flatMap((g) => g.duplicateIds);

    const destResult: TableResult = {
      table: "destinations",
      duplicateGroups: destGroups.length,
      duplicateRows: destDupIds.length,
    };

    if (destGroups.length > 0) {
      destResult.sample = {
        keeperId: destGroups[0].keeperId,
        duplicateIds: destGroups[0].duplicateIds,
      };
    }

    if (execute && destDupIds.length > 0) {
      const destChildren = [
        { table: hotels, col: hotels.destinationId, name: "hotels" },
        { table: blogPosts, col: blogPosts.destinationId, name: "blogPosts" },
        { table: agencyMarginOverrides, col: agencyMarginOverrides.destinationId, name: "agencyMarginOverrides" },
        { table: pricingRules, col: pricingRules.destinationId, name: "pricingRules" },
        { table: demandMetrics, col: demandMetrics.destinationId, name: "demandMetrics" },
        { table: competitorRates, col: competitorRates.destinationId, name: "competitorRates" },
        { table: blackoutDates, col: blackoutDates.destinationId, name: "blackoutDates" },
        { table: permitInventory, col: permitInventory.destinationId, name: "permitInventory" },
        { table: supplierRankings, col: supplierRankings.destinationId, name: "supplierRankings" },
        { table: travelAdvisories, col: travelAdvisories.destinationId, name: "travelAdvisories" },
        { table: weatherAlerts, col: weatherAlerts.destinationId, name: "weatherAlerts" },
        { table: complianceRequirements, col: complianceRequirements.destinationId, name: "complianceRequirements" },
        { table: emergencyContacts, col: emergencyContacts.destinationId, name: "emergencyContacts" },
        { table: destinationContent, col: destinationContent.destinationId, name: "destinationContent" },
        { table: contentAssets, col: contentAssets.destinationId, name: "contentAssets" },
        { table: destinationGuides, col: destinationGuides.destinationId, name: "destinationGuides" },
        { table: mediaLibrary, col: mediaLibrary.destinationId, name: "mediaLibrary" },
      ];

      const repointed: Record<string, number> = {};
      for (const group of destGroups) {
        for (const child of destChildren) {
          const count = await repointFK(
            child.table,
            child.col,
            "destinationId",
            group.keeperId,
            group.duplicateIds
          );
          repointed[child.name] = (repointed[child.name] || 0) + count;
        }
      }
      destResult.repointed = repointed;
      destResult.deleted = await deleteDuplicates(
        destinations,
        destinations.id,
        destDupIds
      );
    }

    results.push(destResult);
  } catch (e) {
    results.push({
      table: "destinations",
      duplicateGroups: 0,
      duplicateRows: 0,
      error: (e as Error).message,
    });
  }

  // 16. suppliers — has children: hotels, transportation, guides, porters,
  //     flightsDomestic, helicopterSharing, helicopterCharter, miscellaneousServices, packages
  try {
    const supplierGroups = await detectDuplicates("suppliers", [
      "name",
      "country",
    ]);
    const supplierDupIds = supplierGroups.flatMap((g) => g.duplicateIds);

    const supplierResult: TableResult = {
      table: "suppliers",
      duplicateGroups: supplierGroups.length,
      duplicateRows: supplierDupIds.length,
    };

    if (supplierGroups.length > 0) {
      supplierResult.sample = {
        keeperId: supplierGroups[0].keeperId,
        duplicateIds: supplierGroups[0].duplicateIds,
      };
    }

    if (execute && supplierDupIds.length > 0) {
      const childTables = [
        { table: hotels, col: hotels.supplierId, name: "hotels" },
        { table: transportation, col: transportation.supplierId, name: "transportation" },
        { table: guides, col: guides.supplierId, name: "guides" },
        { table: porters, col: porters.supplierId, name: "porters" },
        { table: flightsDomestic, col: flightsDomestic.supplierId, name: "flights_domestic" },
        { table: helicopterSharing, col: helicopterSharing.supplierId, name: "helicopter_sharing" },
        { table: helicopterCharter, col: helicopterCharter.supplierId, name: "helicopter_charter" },
        { table: miscellaneousServices, col: miscellaneousServices.supplierId, name: "miscellaneous_services" },
        { table: packages, col: packages.supplierId, name: "packages" },
        { table: agencySuppliers, col: agencySuppliers.supplierId, name: "agencySuppliers" },
        { table: agencyMarginOverrides, col: agencyMarginOverrides.supplierId, name: "agencyMarginOverrides" },
        { table: supplierUsers, col: supplierUsers.supplierId, name: "supplierUsers" },
        { table: pricingRules, col: pricingRules.supplierId, name: "pricingRules" },
        { table: availabilityCalendar, col: availabilityCalendar.supplierId, name: "availabilityCalendar" },
        { table: blackoutDates, col: blackoutDates.supplierId, name: "blackoutDates" },
        { table: capacityConfig, col: capacityConfig.supplierId, name: "capacityConfig" },
        { table: availabilitySyncLog, col: availabilitySyncLog.supplierId, name: "availabilitySyncLog" },
        { table: supplierPerformance, col: supplierPerformance.supplierId, name: "supplierPerformance" },
        { table: supplierCommunications, col: supplierCommunications.supplierId, name: "supplierCommunications" },
        { table: supplierRateRequests, col: supplierRateRequests.supplierId, name: "supplierRateRequests" },
        { table: supplierIssues, col: supplierIssues.supplierId, name: "supplierIssues" },
        { table: contentAssets, col: contentAssets.supplierId, name: "contentAssets" },
        { table: supplierConfirmationRequests, col: supplierConfirmationRequests.supplierId, name: "supplierConfirmationRequests" },
      ];

      const repointed: Record<string, number> = {};
      for (const group of supplierGroups) {
        for (const child of childTables) {
          const count = await repointFK(
            child.table,
            child.col,
            "supplierId",
            group.keeperId,
            group.duplicateIds
          );
          repointed[child.name] = (repointed[child.name] || 0) + count;
        }
      }

      supplierResult.repointed = repointed;
      supplierResult.deleted = await deleteDuplicates(
        suppliers,
        suppliers.id,
        supplierDupIds
      );
    }

    results.push(supplierResult);
  } catch (e) {
    results.push({
      table: "suppliers",
      duplicateGroups: 0,
      duplicateRows: 0,
      error: (e as Error).message,
    });
  }

  return results;
}
