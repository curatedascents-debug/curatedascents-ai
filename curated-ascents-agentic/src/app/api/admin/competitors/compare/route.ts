import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { competitorRates, packages, transportation } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface OurRate {
  serviceType: string;
  serviceName: string;
  destination: string;
  sellPrice: number;
}

interface ComparisonResult {
  serviceType: string;
  serviceName: string;
  destination: string;
  ourPrice: number;
  competitors: {
    name: string;
    price: number;
    priceDate: string;
    difference: number;
    differencePercent: number;
  }[];
  avgCompetitorPrice: number;
  ourPosition: "cheaper" | "similar" | "expensive";
  positionPercent: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");

    // Get all competitor rates grouped by service
    const compRates = await db
      .select({
        competitorName: competitorRates.competitorName,
        serviceType: competitorRates.serviceType,
        serviceName: competitorRates.serviceName,
        destinationId: competitorRates.destinationId,
        price: competitorRates.price,
        priceDate: competitorRates.priceDate,
      })
      .from(competitorRates)
      .where(serviceType ? eq(competitorRates.serviceType, serviceType) : undefined)
      .orderBy(competitorRates.serviceType, competitorRates.serviceName);

    // Get our rates for comparison
    const ourRates: Map<string, OurRate[]> = new Map();

    // Packages - has country/region directly
    if (!serviceType || serviceType === "package") {
      const packageData = await db
        .select({
          serviceName: packages.name,
          country: packages.country,
          region: packages.region,
          sellPrice: packages.sellPrice,
        })
        .from(packages);

      packageData.forEach(p => {
        if (!p.serviceName || !p.sellPrice) return;
        const key = `package|${p.serviceName}`;
        if (!ourRates.has(key)) ourRates.set(key, []);
        ourRates.get(key)!.push({
          serviceType: "package",
          serviceName: p.serviceName,
          destination: p.region || p.country || "Unknown",
          sellPrice: parseFloat(p.sellPrice),
        });
      });
    }

    // Transportation - uses routeFrom/routeTo
    if (!serviceType || serviceType === "transportation") {
      const transData = await db
        .select({
          serviceName: transportation.vehicleType,
          routeFrom: transportation.routeFrom,
          routeTo: transportation.routeTo,
          sellPrice: transportation.sellPrice,
        })
        .from(transportation);

      transData.forEach(t => {
        if (!t.serviceName || !t.sellPrice) return;
        const key = `transportation|${t.serviceName}`;
        if (!ourRates.has(key)) ourRates.set(key, []);
        ourRates.get(key)!.push({
          serviceType: "transportation",
          serviceName: t.serviceName,
          destination: t.routeFrom && t.routeTo ? `${t.routeFrom} - ${t.routeTo}` : "Various",
          sellPrice: parseFloat(t.sellPrice),
        });
      });
    }

    // Build comparison results
    const comparisons: ComparisonResult[] = [];
    const serviceGroups = new Map<string, typeof compRates>();

    // Group competitor rates by service
    compRates.forEach(rate => {
      const key = `${rate.serviceType}|${rate.serviceName}`;
      if (!serviceGroups.has(key)) serviceGroups.set(key, []);
      serviceGroups.get(key)!.push(rate);
    });

    // Compare with our rates
    serviceGroups.forEach((competitors, key) => {
      const [type, name] = key.split("|");
      const ourKey = `${type}|${name}`;
      const ourServiceRates = ourRates.get(ourKey);

      // Calculate our average price for this service
      const ourAvgPrice = ourServiceRates && ourServiceRates.length > 0
        ? ourServiceRates.reduce((sum, r) => sum + r.sellPrice, 0) / ourServiceRates.length
        : 0;

      // Calculate competitor comparison
      const competitorComparison = competitors.map(c => {
        const compPrice = parseFloat(c.price || "0");
        const difference = ourAvgPrice - compPrice;
        const differencePercent = compPrice > 0 ? (difference / compPrice) * 100 : 0;
        return {
          name: c.competitorName,
          price: compPrice,
          priceDate: c.priceDate || "",
          difference,
          differencePercent,
        };
      });

      const avgCompetitorPrice = competitors.reduce((sum, c) => sum + parseFloat(c.price || "0"), 0) / competitors.length;
      const positionPercent = avgCompetitorPrice > 0 ? ((ourAvgPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100 : 0;

      let ourPosition: "cheaper" | "similar" | "expensive" = "similar";
      if (positionPercent < -5) ourPosition = "cheaper";
      else if (positionPercent > 5) ourPosition = "expensive";

      comparisons.push({
        serviceType: type,
        serviceName: name,
        destination: ourServiceRates?.[0]?.destination || "Unknown",
        ourPrice: ourAvgPrice,
        competitors: competitorComparison,
        avgCompetitorPrice,
        ourPosition,
        positionPercent,
      });
    });

    // Sort by position (expensive first - these need attention)
    comparisons.sort((a, b) => b.positionPercent - a.positionPercent);

    // Calculate summary statistics
    const summary = {
      totalComparisons: comparisons.length,
      cheaper: comparisons.filter(c => c.ourPosition === "cheaper").length,
      similar: comparisons.filter(c => c.ourPosition === "similar").length,
      expensive: comparisons.filter(c => c.ourPosition === "expensive").length,
      avgPositionPercent: comparisons.length > 0
        ? comparisons.reduce((sum, c) => sum + c.positionPercent, 0) / comparisons.length
        : 0,
    };

    return NextResponse.json({
      success: true,
      comparisons,
      summary,
    });
  } catch (error) {
    console.error("Error comparing rates:", error);
    return NextResponse.json(
      { error: "Failed to compare rates", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
