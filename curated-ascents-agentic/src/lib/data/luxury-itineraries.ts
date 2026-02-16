/**
 * Luxury Itineraries - Combined export
 * Aggregates all itinerary data from sub-files
 */

import { type LuxuryItinerary, nepalTreks } from "./luxury-itineraries-nepal-treks";
import {
  nepalClimbs,
  nepalTours,
  bhutanItineraries,
  tibetItineraries,
  indiaItineraries,
} from "./luxury-itineraries-other";

export type { LuxuryItinerary };

export const allLuxuryItineraries: LuxuryItinerary[] = [
  ...nepalTreks,
  ...nepalClimbs,
  ...nepalTours,
  ...bhutanItineraries,
  ...tibetItineraries,
  ...indiaItineraries,
];

export {
  nepalTreks,
  nepalClimbs,
  nepalTours,
  bhutanItineraries,
  tibetItineraries,
  indiaItineraries,
};
