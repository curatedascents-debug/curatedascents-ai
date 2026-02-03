"use client";

interface Rate {
  id: number;
  serviceType: string;
  [key: string]: any;
}

interface ServiceStatsProps {
  rates: Rate[];
  activeCategory: string;
}

interface StatCard {
  label: string;
  value: string | number;
  sublabel?: string;
}

function StatCard({ stat }: { stat: StatCard }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="text-2xl font-bold text-white">{stat.value}</div>
      <div className="text-sm text-slate-400">{stat.label}</div>
      {stat.sublabel && (
        <div className="text-xs text-slate-500 mt-1">{stat.sublabel}</div>
      )}
    </div>
  );
}

function getUniqueValues(rates: Rate[], field: string): string[] {
  const values = rates
    .map((r) => r[field])
    .filter((v) => v !== null && v !== undefined && v !== "");
  return [...new Set(values)] as string[];
}

function countByField(rates: Rate[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const rate of rates) {
    const value = rate[field] || "Unknown";
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function getActiveCount(rates: Rate[]): number {
  return rates.filter((r) => r.isActive !== false).length;
}

function getAveragePrice(rates: Rate[]): string {
  const prices = rates
    .map((r) => {
      return (
        parseFloat(r.sellPrice) ||
        parseFloat(r.sellDouble) ||
        parseFloat(r.sellPerDay) ||
        parseFloat(r.sellPerSeat) ||
        parseFloat(r.sellPerCharter) ||
        0
      );
    })
    .filter((p) => p > 0);

  if (prices.length === 0) return "N/A";
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return `$${avg.toFixed(0)}`;
}

export default function ServiceStats({ rates, activeCategory }: ServiceStatsProps) {
  // Filter rates by active category
  const filteredRates =
    activeCategory === "all"
      ? rates
      : rates.filter((r) => r.serviceType === activeCategory);

  if (filteredRates.length === 0) {
    return null;
  }

  let stats: StatCard[] = [];

  switch (activeCategory) {
    case "all": {
      // Overview stats
      const serviceBreakdown = countByField(rates, "serviceType");
      const topService = Object.entries(serviceBreakdown).sort(
        (a, b) => b[1] - a[1]
      )[0];
      stats = [
        { label: "Total Rates", value: rates.length },
        { label: "Active Rates", value: getActiveCount(rates) },
        { label: "Service Types", value: Object.keys(serviceBreakdown).length },
        {
          label: "Most Common",
          value: topService ? topService[1] : 0,
          sublabel: topService
            ? topService[0].replace("_", " ")
            : undefined,
        },
      ];
      break;
    }

    case "hotel": {
      const roomTypes = getUniqueValues(filteredRates, "roomType");
      const mealPlans = getUniqueValues(filteredRates, "mealPlan");
      stats = [
        { label: "Room Rates", value: filteredRates.length },
        { label: "Room Types", value: roomTypes.length },
        { label: "Meal Plans", value: mealPlans.length },
        { label: "Avg Price", value: getAveragePrice(filteredRates), sublabel: "per night" },
      ];
      break;
    }

    case "transportation": {
      const routes = getUniqueValues(filteredRates, "routeFrom");
      const vehicleTypes = countByField(filteredRates, "vehicleType");
      stats = [
        { label: "Transport Rates", value: filteredRates.length },
        { label: "Routes From", value: routes.length },
        { label: "Vehicle Types", value: Object.keys(vehicleTypes).length },
        { label: "Avg Price", value: getAveragePrice(filteredRates), sublabel: "per trip" },
      ];
      break;
    }

    case "guide": {
      const guideTypes = countByField(filteredRates, "guideType");
      const destinations = getUniqueValues(filteredRates, "destination");
      stats = [
        { label: "Guide Rates", value: filteredRates.length },
        { label: "Guide Types", value: Object.keys(guideTypes).length },
        { label: "Destinations", value: destinations.length },
        { label: "Avg Rate", value: getAveragePrice(filteredRates), sublabel: "per day" },
      ];
      break;
    }

    case "porter": {
      const regions = getUniqueValues(filteredRates, "region");
      stats = [
        { label: "Porter Rates", value: filteredRates.length },
        { label: "Regions", value: regions.length },
        { label: "Active", value: getActiveCount(filteredRates) },
        { label: "Avg Rate", value: getAveragePrice(filteredRates), sublabel: "per day" },
      ];
      break;
    }

    case "flight": {
      const airlines = getUniqueValues(filteredRates, "airlineName");
      const sectors = getUniqueValues(filteredRates, "flightSector");
      stats = [
        { label: "Flight Rates", value: filteredRates.length },
        { label: "Airlines", value: airlines.length },
        { label: "Sectors", value: sectors.length },
        { label: "Avg Price", value: getAveragePrice(filteredRates), sublabel: "per ticket" },
      ];
      break;
    }

    case "helicopter_sharing":
    case "helicopter_charter": {
      const heliRoutes = getUniqueValues(filteredRates, "routeName");
      const heliTypes = getUniqueValues(filteredRates, "helicopterType");
      const label = activeCategory === "helicopter_sharing" ? "Sharing" : "Charter";
      stats = [
        { label: `${label} Rates`, value: filteredRates.length },
        { label: "Routes", value: heliRoutes.length },
        { label: "Heli Types", value: heliTypes.length },
        { label: "Avg Price", value: getAveragePrice(filteredRates), sublabel: activeCategory === "helicopter_sharing" ? "per seat" : "per charter" },
      ];
      break;
    }

    case "permit": {
      const countries = getUniqueValues(filteredRates, "country");
      const permitTypes = getUniqueValues(filteredRates, "type");
      stats = [
        { label: "Permit Rates", value: filteredRates.length },
        { label: "Countries", value: countries.length },
        { label: "Permit Types", value: permitTypes.length },
        { label: "Avg Price", value: getAveragePrice(filteredRates), sublabel: "per person" },
      ];
      break;
    }

    case "package": {
      const packageTypes = countByField(filteredRates, "packageType");
      const difficulties = getUniqueValues(filteredRates, "difficulty");
      const avgDuration = filteredRates.reduce((sum, r) => sum + (r.durationDays || 0), 0) / filteredRates.length;
      stats = [
        { label: "Packages", value: filteredRates.length },
        { label: "Package Types", value: Object.keys(packageTypes).length },
        { label: "Difficulties", value: difficulties.length },
        { label: "Avg Duration", value: `${avgDuration.toFixed(0)}D`, sublabel: "days" },
      ];
      break;
    }

    case "miscellaneous": {
      const categories = getUniqueValues(filteredRates, "category");
      const destinations = getUniqueValues(filteredRates, "destination");
      stats = [
        { label: "Misc Services", value: filteredRates.length },
        { label: "Categories", value: categories.length },
        { label: "Destinations", value: destinations.length },
        { label: "Avg Price", value: getAveragePrice(filteredRates) },
      ];
      break;
    }

    default:
      stats = [
        { label: "Total Rates", value: filteredRates.length },
        { label: "Active", value: getActiveCount(filteredRates) },
        { label: "Avg Price", value: getAveragePrice(filteredRates) },
      ];
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} />
      ))}
    </div>
  );
}
