"use client";

import { useState } from "react";

interface RateDetailModalProps {
  rate: any;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function RateDetailModal({ rate, onClose, onEdit, onDelete }: RateDetailModalProps) {
  if (!rate) return null;

  // Calculate margin if we have cost and sell
  const calculateMargin = (cost: string | undefined, sell: string | undefined) => {
    if (!cost || !sell) return null;
    const costNum = parseFloat(cost);
    const sellNum = parseFloat(sell);
    if (costNum === 0) return null;
    const margin = ((sellNum - costNum) / costNum) * 100;
    return margin.toFixed(1);
  };

  // Render different details based on service type
  const renderDetails = () => {
    switch (rate.serviceType) {
      case "hotel":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Hotel Room Rate Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Hotel Name" value={rate.hotelName} />
              <InfoCard label="Star Rating" value={rate.starRating ? `${rate.starRating} ⭐` : "-"} />
              <InfoCard label="Room Type" value={rate.roomType} />
              <InfoCard label="Meal Plan" value={formatMealPlan(rate.mealPlan)} />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-6">💰 Pricing (Internal)</h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="text-left py-2">Occupancy</th>
                    <th className="text-right py-2">Cost</th>
                    <th className="text-right py-2">Sell</th>
                    <th className="text-right py-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  <PriceRow label="Single" cost={rate.costSingle} sell={rate.sellSingle} />
                  <PriceRow label="Double" cost={rate.costDouble} sell={rate.sellDouble} />
                  <PriceRow label="Triple" cost={rate.costTriple} sell={rate.sellTriple} />
                  <PriceRow label="Extra Bed" cost={rate.costExtraBed} sell={rate.sellExtraBed} />
                  <PriceRow
                    label="Child w/ Bed"
                    cost={rate.costChildWithBed}
                    sell={rate.sellChildWithBed}
                  />
                  <PriceRow
                    label="Child no Bed"
                    cost={rate.costChildNoBed}
                    sell={rate.sellChildNoBed}
                  />
                </tbody>
              </table>
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-4">🧾 Taxes (Nepal)</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="VAT" value={rate.vatPercent ? `${rate.vatPercent}%` : "13%"} />
              <InfoCard
                label="Service Charge"
                value={rate.serviceChargePercent ? `${rate.serviceChargePercent}%` : "10%"}
              />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-4">📋 Inclusions & Exclusions</h4>
            <div className="space-y-2">
              <div className="bg-green-900/30 p-3 rounded">
                <span className="text-green-400 font-medium">Includes: </span>
                <span className="text-slate-300">{rate.inclusions || "Not specified"}</span>
              </div>
              <div className="bg-red-900/30 p-3 rounded">
                <span className="text-red-400 font-medium">Excludes: </span>
                <span className="text-slate-300">{rate.exclusions || "Not specified"}</span>
              </div>
            </div>
          </div>
        );

      case "transportation":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Transportation Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Vehicle Type" value={rate.vehicleType} />
              <InfoCard label="Vehicle Name" value={rate.vehicleName} />
              <InfoCard label="From" value={rate.routeFrom} />
              <InfoCard label="To" value={rate.routeTo} />
              <InfoCard label="Distance" value={rate.distanceKm ? `${rate.distanceKm} km` : "-"} />
              <InfoCard
                label="Duration"
                value={rate.durationHours ? `${rate.durationHours} hrs` : "-"}
              />
              <InfoCard label="Capacity" value={rate.capacity ? `${rate.capacity} pax` : "-"} />
              <InfoCard label="Price Type" value={rate.priceType || "per_vehicle"} />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-6">💰 Pricing (Internal)</h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost Price</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell Price</div>
                  <div className="text-xl font-bold text-emerald-400">${rate.sellPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPrice, rate.sellPrice)}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      case "guide":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Guide Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Guide Type" value={rate.guideType} />
              <InfoCard label="Destination" value={rate.destination} />
              <InfoCard
                label="Experience"
                value={rate.experienceYears ? `${rate.experienceYears} years` : "-"}
              />
              <InfoCard
                label="Max Group Size"
                value={rate.maxGroupSize ? `${rate.maxGroupSize} pax` : "-"}
              />
            </div>

            {rate.languages && (
              <div>
                <span className="text-slate-400">Languages: </span>
                <span className="text-white">
                  {Array.isArray(rate.languages) ? rate.languages.join(", ") : rate.languages}
                </span>
              </div>
            )}

            {rate.specializations && (
              <div>
                <span className="text-slate-400">Specializations: </span>
                <span className="text-white">
                  {Array.isArray(rate.specializations)
                    ? rate.specializations.join(", ")
                    : rate.specializations}
                </span>
              </div>
            )}

            <h4 className="text-md font-semibold text-slate-300 mt-6">
              💰 Pricing (Per Day - Internal)
            </h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost/Day</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPerDay || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell/Day</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${rate.sellPerDay || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPerDay, rate.sellPerDay)}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      case "porter":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Porter Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Region" value={rate.region} />
              <InfoCard
                label="Max Weight"
                value={rate.maxWeightKg ? `${rate.maxWeightKg} kg` : "-"}
              />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-6">
              💰 Pricing (Per Day - Internal)
            </h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost/Day</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPerDay || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell/Day</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${rate.sellPerDay || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPerDay, rate.sellPerDay)}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      case "flight":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Domestic Flight Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Airline" value={rate.airlineName} />
              <InfoCard label="Sector" value={rate.flightSector} />
              <InfoCard label="From" value={rate.departureCity} />
              <InfoCard label="To" value={rate.arrivalCity} />
              <InfoCard label="Duration" value={rate.flightDuration} />
              <InfoCard
                label="Baggage"
                value={rate.baggageAllowanceKg ? `${rate.baggageAllowanceKg} kg` : "-"}
              />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-6">💰 Pricing (Internal)</h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost Price</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell Price</div>
                  <div className="text-xl font-bold text-emerald-400">${rate.sellPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPrice, rate.sellPrice)}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      case "helicopter_sharing":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Helicopter Sharing Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Route Name" value={rate.routeName} />
              <InfoCard label="Helicopter Type" value={rate.helicopterType} />
              <InfoCard label="From" value={rate.routeFrom} />
              <InfoCard label="To" value={rate.routeTo} />
              <InfoCard label="Duration" value={rate.flightDuration} />
              <InfoCard
                label="Seats Available"
                value={rate.seatsAvailable ? `${rate.seatsAvailable} seats` : "-"}
              />
              <InfoCard
                label="Min Passengers"
                value={rate.minPassengers ? `${rate.minPassengers} pax` : "-"}
              />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-6">
              💰 Pricing (Per Seat - Internal)
            </h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost/Seat</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPerSeat || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell/Seat</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${rate.sellPerSeat || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPerSeat, rate.sellPerSeat)}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      case "helicopter_charter":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Helicopter Charter Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Route Name" value={rate.routeName} />
              <InfoCard label="Helicopter Type" value={rate.helicopterType} />
              <InfoCard label="From" value={rate.routeFrom} />
              <InfoCard label="To" value={rate.routeTo} />
              <InfoCard label="Duration" value={rate.flightDuration} />
              <InfoCard
                label="Max Passengers"
                value={rate.maxPassengers ? `${rate.maxPassengers} pax` : "-"}
              />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-6">
              💰 Pricing (Per Charter - Internal)
            </h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost/Charter</div>
                  <div className="text-xl font-bold text-red-400">
                    ${rate.costPerCharter || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell/Charter</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${rate.sellPerCharter || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPerCharter, rate.sellPerCharter)}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      case "permit":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Permit / Fee Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Name" value={rate.name} />
              <InfoCard label="Type" value={rate.type} />
              <InfoCard label="Country" value={rate.country} />
              <InfoCard label="Region" value={rate.region} />
              <InfoCard label="Applicable To" value={rate.applicableTo} />
              <InfoCard label="Processing Time" value={rate.processingTime} />
            </div>

            <h4 className="text-md font-semibold text-slate-300 mt-6">💰 Pricing (Internal)</h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost Price</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell Price</div>
                  <div className="text-xl font-bold text-emerald-400">${rate.sellPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPrice, rate.sellPrice)}%
                  </div>
                </div>
              </div>
            </div>

            {rate.description && (
              <div className="bg-slate-700 p-3 rounded">
                <span className="text-slate-400 font-medium">Description: </span>
                <span className="text-white">{rate.description}</span>
              </div>
            )}
          </div>
        );

      case "package":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Package Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Package Name" value={rate.name} />
              <InfoCard label="Type" value={rate.packageType?.replace("_", " ")} />
              <InfoCard label="Country" value={rate.country} />
              <InfoCard label="Region" value={rate.region} />
              <InfoCard label="Duration" value={`${rate.durationDays}D / ${rate.durationNights}N`} />
              <InfoCard label="Difficulty" value={rate.difficulty} />
              <InfoCard label="Max Altitude" value={rate.maxAltitude ? `${rate.maxAltitude}m` : "-"} />
              <InfoCard
                label="Group Size"
                value={`${rate.groupSizeMin || 1} - ${rate.groupSizeMax || 12} pax`}
              />
            </div>

            {rate.itinerarySummary && (
              <div className="bg-slate-700 p-3 rounded">
                <span className="text-slate-400 font-medium">Itinerary: </span>
                <span className="text-white">{rate.itinerarySummary}</span>
              </div>
            )}

            <h4 className="text-md font-semibold text-slate-300 mt-6">
              💰 Pricing (Per Person - Internal)
            </h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost Price</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell Price</div>
                  <div className="text-xl font-bold text-emerald-400">${rate.sellPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPrice, rate.sellPrice)}%
                  </div>
                </div>
              </div>
              {rate.singleSupplement && (
                <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                  <span className="text-slate-400">Single Supplement: </span>
                  <span className="text-emerald-400 font-bold">${rate.singleSupplement}</span>
                </div>
              )}
            </div>

            {rate.departureDates && rate.departureDates.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-slate-300">📅 Departure Dates</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {rate.departureDates.map((date: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-900 text-blue-300 rounded text-sm">
                      {date}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      case "miscellaneous":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Service Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Service Name" value={rate.name} />
              <InfoCard label="Category" value={rate.category} />
              <InfoCard label="Destination" value={rate.destination} />
              <InfoCard label="Duration" value={rate.duration} />
              <InfoCard label="Min Participants" value={rate.minParticipants} />
              <InfoCard label="Price Type" value={rate.priceType} />
            </div>

            {rate.description && (
              <div className="bg-slate-700 p-3 rounded">
                <span className="text-slate-400 font-medium">Description: </span>
                <span className="text-white">{rate.description}</span>
              </div>
            )}

            <h4 className="text-md font-semibold text-slate-300 mt-6">💰 Pricing (Internal)</h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost Price</div>
                  <div className="text-xl font-bold text-red-400">${rate.costPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell Price</div>
                  <div className="text-xl font-bold text-emerald-400">${rate.sellPrice || "0"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {calculateMargin(rate.costPrice, rate.sellPrice)}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">
              {rate.serviceType?.replace("_", " ").toUpperCase()} Details
            </h3>

            <h4 className="text-md font-semibold text-slate-300 mt-6">💰 Pricing (Internal)</h4>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Cost</div>
                  <div className="text-xl font-bold text-red-400">
                    $
                    {rate.costPrice ||
                      rate.costPerDay ||
                      rate.costPerSeat ||
                      rate.costPerCharter ||
                      "0"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Sell</div>
                  <div className="text-xl font-bold text-emerald-400">
                    $
                    {rate.sellPrice ||
                      rate.sellPerDay ||
                      rate.sellPerSeat ||
                      rate.sellPerCharter ||
                      "0"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Margin</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {rate.marginPercent || "50"}%
                  </div>
                </div>
              </div>
            </div>

            <InclusionsSection inclusions={rate.inclusions} exclusions={rate.exclusions} />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
          <div>
            <span className="px-2 py-1 bg-slate-700 rounded text-xs uppercase">
              {rate.serviceType?.replace("_", " ")}
            </span>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${
                rate.isActive !== false
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {rate.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{renderDetails()}</div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-between sticky bottom-0 bg-slate-800">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
            >
              Edit Rate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-700 p-3 rounded">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-white font-medium">{value || "-"}</div>
    </div>
  );
}

function PriceRow({ label, cost, sell }: { label: string; cost?: string; sell?: string }) {
  if (!cost && !sell) return null;

  const costNum = parseFloat(cost || "0");
  const sellNum = parseFloat(sell || "0");
  const margin = costNum > 0 ? (((sellNum - costNum) / costNum) * 100).toFixed(1) : "0";

  return (
    <tr className="border-t border-slate-800">
      <td className="py-2 text-slate-300">{label}</td>
      <td className="py-2 text-right text-red-400">${cost || "-"}</td>
      <td className="py-2 text-right text-emerald-400">${sell || "-"}</td>
      <td className="py-2 text-right text-yellow-400">{margin}%</td>
    </tr>
  );
}

function InclusionsSection({
  inclusions,
  exclusions,
}: {
  inclusions?: string;
  exclusions?: string;
}) {
  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-md font-semibold text-slate-300">📋 Inclusions & Exclusions</h4>
      <div className="bg-green-900/30 p-3 rounded">
        <span className="text-green-400 font-medium">✓ Includes: </span>
        <span className="text-slate-300">{inclusions || "Not specified"}</span>
      </div>
      <div className="bg-red-900/30 p-3 rounded">
        <span className="text-red-400 font-medium">✗ Excludes: </span>
        <span className="text-slate-300">{exclusions || "Not specified"}</span>
      </div>
    </div>
  );
}

function formatMealPlan(plan?: string): string {
  const plans: Record<string, string> = {
    EP: "Room Only (EP)",
    CP: "Bed & Breakfast (CP)",
    MAP: "Half Board (MAP)",
    AP: "Full Board (AP)",
    AI: "All Inclusive (AI)",
  };
  return plans[plan || ""] || plan || "-";
}
