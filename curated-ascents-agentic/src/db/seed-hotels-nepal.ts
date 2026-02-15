import { db } from "@/db";
import { hotels, hotelRoomRates, destinations } from "@/db/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HotelSeedData {
  name: string;
  city: string;
  starRating: number;
  category: string;
  address: string;
  description: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  roomRates: RoomRateSeed[];
}

interface RoomRateSeed {
  roomType: string;
  mealPlan: string;
  costSingle: string;
  costDouble: string;
  costTriple: string;
  costExtraBed: string;
  costChildWithBed: string;
  costChildNoBed: string;
  sellSingle: string;
  sellDouble: string;
  sellTriple: string;
  sellExtraBed: string;
  sellChildWithBed: string;
  sellChildNoBed: string;
  inclusions: string;
  exclusions: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Helper – build room rate objects
// ---------------------------------------------------------------------------

function makeRate(
  roomType: string,
  mealPlan: string,
  costSingle: number,
  costDouble: number,
  notes: string = ""
): RoomRateSeed {
  const costTriple = Math.round(costDouble * 1.35);
  const costExtraBed = Math.round(costDouble * 0.3);
  const costChildWithBed = Math.round(costDouble * 0.6);
  const costChildNoBed = Math.round(costDouble * 0.35);
  const margin = 1.5; // 50%
  return {
    roomType,
    mealPlan,
    costSingle: costSingle.toFixed(2),
    costDouble: costDouble.toFixed(2),
    costTriple: costTriple.toFixed(2),
    costExtraBed: costExtraBed.toFixed(2),
    costChildWithBed: costChildWithBed.toFixed(2),
    costChildNoBed: costChildNoBed.toFixed(2),
    sellSingle: (costSingle * margin).toFixed(2),
    sellDouble: (costDouble * margin).toFixed(2),
    sellTriple: (costTriple * margin).toFixed(2),
    sellExtraBed: (costExtraBed * margin).toFixed(2),
    sellChildWithBed: (costChildWithBed * margin).toFixed(2),
    sellChildNoBed: (costChildNoBed * margin).toFixed(2),
    inclusions:
      mealPlan === "CP"
        ? "Breakfast buffet, WiFi, Welcome drink"
        : mealPlan === "MAP"
          ? "Breakfast buffet, Dinner, WiFi, Welcome drink"
          : "Room only, WiFi",
    exclusions: "Laundry, Mini-bar, Telephone charges",
    notes,
  };
}

// ---------------------------------------------------------------------------
// Amenity presets
// ---------------------------------------------------------------------------

const LUXURY_AMENITIES = [
  "WiFi",
  "Restaurant",
  "Bar",
  "Spa",
  "Swimming Pool",
  "Room Service",
  "Airport Transfer",
  "Fitness Center",
  "Business Center",
  "Concierge",
  "Valet Parking",
  "Laundry Service",
];

const FOUR_STAR_AMENITIES = [
  "WiFi",
  "Restaurant",
  "Bar",
  "Room Service",
  "Fitness Center",
  "Laundry Service",
  "Airport Transfer",
  "Business Center",
];

const BOUTIQUE_AMENITIES = [
  "WiFi",
  "Restaurant",
  "Garden",
  "Library",
  "Room Service",
  "Cultural Programs",
  "Laundry Service",
  "Airport Transfer",
];

const LODGE_AMENITIES = [
  "WiFi",
  "Restaurant",
  "Hot Shower",
  "Charging Station",
  "Common Room",
  "Guided Treks",
];

const SAFARI_AMENITIES = [
  "WiFi",
  "Restaurant",
  "Bar",
  "Swimming Pool",
  "Jungle Safari",
  "Canoe Rides",
  "Bird Watching",
  "Cultural Tours",
  "Bonfire",
  "Room Service",
];

const HERITAGE_AMENITIES = [
  "WiFi",
  "Restaurant",
  "Garden",
  "Library",
  "Cultural Programs",
  "Room Service",
  "Laundry Service",
];

const BUDGET_AMENITIES = [
  "WiFi",
  "Restaurant",
  "Laundry Service",
  "Travel Desk",
  "Room Service",
];

// ---------------------------------------------------------------------------
// Hotel data – ~100 hotels
// ---------------------------------------------------------------------------

const NEPAL_HOTELS: HotelSeedData[] = [
  // =========================================================================
  // 5-STAR LUXURY – KATHMANDU (~12)
  // =========================================================================
  {
    name: "Dwarika's Hotel",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Battisputali, Kathmandu",
    description:
      "A living museum of Newari art and architecture, Dwarika's Hotel offers an unmatched cultural luxury experience in the heart of Kathmandu with hand-carved woodwork and heritage restoration.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 150, 170, "Heritage wing"),
      makeRate("deluxe", "CP", 200, 230, "Garden view, restored woodwork"),
      makeRate("suite", "CP", 320, 360, "Dwarika Suite with private terrace"),
    ],
  },
  {
    name: "Hyatt Regency Kathmandu",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Taragaon, Boudha, Kathmandu",
    description:
      "Set on 37 acres adjacent to the Boudhanath Stupa, Hyatt Regency Kathmandu blends traditional Nepali architecture with modern luxury and panoramic Himalayan views.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 130, 150, "Regency room"),
      makeRate("deluxe", "CP", 170, 195, "Club room with lounge access"),
      makeRate("suite", "CP", 280, 320, "Regency Suite"),
    ],
  },
  {
    name: "Soaltee Crowne Plaza",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Tahachal, Kathmandu",
    description:
      "One of Nepal's first five-star hotels, the Soaltee Crowne Plaza features expansive grounds, a casino, and has hosted world leaders and royalty since 1966.",
    amenities: [...LUXURY_AMENITIES, "Casino"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 110, 130, "Crowne room"),
      makeRate("deluxe", "CP", 150, 175, "Executive floor with lounge"),
      makeRate("suite", "CP", 250, 290, "Presidential Suite"),
    ],
  },
  {
    name: "Yak & Yeti Hotel",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Durbar Marg, Kathmandu",
    description:
      "A landmark on Durbar Marg, Yak & Yeti combines a restored Rana-era palace with a modern wing, featuring lush gardens and Nepal's finest dining experiences.",
    amenities: [...LUXURY_AMENITIES, "Casino"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 120, 140, "Heritage wing"),
      makeRate("deluxe", "CP", 160, 185, "Deluxe room with garden view"),
      makeRate("suite", "CP", 270, 310, "Yak & Yeti Suite"),
    ],
  },
  {
    name: "Hotel Shangri-La",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Lazimpat, Kathmandu",
    description:
      "Nestled in the embassy district, Hotel Shangri-La offers a tranquil garden oasis with refined service and easy access to Thamel and the diplomatic quarter.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 100, 120, "Garden wing"),
      makeRate("deluxe", "CP", 140, 165, "Shambala wing"),
      makeRate("suite", "CP", 230, 270, "Shangri-La Suite"),
    ],
  },
  {
    name: "Marriott Kathmandu",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Naxal, Kathmandu",
    description:
      "Marriott Kathmandu delivers world-class international hospitality with modern amenities, a rooftop bar with mountain views, and easy access to major attractions.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "15:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 130, 150, "Deluxe room"),
      makeRate("deluxe", "CP", 175, 200, "Executive room with lounge"),
      makeRate("suite", "CP", 290, 330, "Marriott Suite"),
    ],
  },
  {
    name: "Radisson Hotel Kathmandu",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Lazimpat, Kathmandu",
    description:
      "Radisson Hotel Kathmandu provides polished international standards with spacious rooms, excellent dining, and a convenient Lazimpat location.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 100, 120, "Superior room"),
      makeRate("deluxe", "CP", 135, 160, "Business class room"),
      makeRate("suite", "CP", 220, 260, "Radisson Suite"),
    ],
  },
  {
    name: "The Everest Hotel",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "New Baneshwor, Kathmandu",
    description:
      "Towering over Kathmandu's skyline, The Everest Hotel offers panoramic views of the Himalayas from its upper floors and a prime location near the convention center.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 95, 115, "Mountain view room"),
      makeRate("deluxe", "CP", 130, 155, "Executive room"),
      makeRate("suite", "CP", 210, 250, "Everest Suite"),
    ],
  },
  {
    name: "Hotel Annapurna",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Durbar Marg, Kathmandu",
    description:
      "A Durbar Marg institution since 1965, Hotel Annapurna combines old-world charm with modern conveniences and is renowned for its diverse dining venues.",
    amenities: [...LUXURY_AMENITIES, "Casino"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 90, 110, "Standard room"),
      makeRate("deluxe", "CP", 125, 150, "Deluxe room"),
      makeRate("suite", "CP", 200, 240, "Annapurna Suite"),
    ],
  },
  {
    name: "Kathmandu Marriott Hotel",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Naxal, Nagpokhari, Kathmandu",
    description:
      "The flagship Marriott property in Nepal featuring contemporary design, an infinity pool, and rooftop dining with unobstructed mountain panoramas.",
    amenities: [...LUXURY_AMENITIES, "Infinity Pool", "Rooftop Bar"],
    checkInTime: "15:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 140, 160, "Deluxe room"),
      makeRate("deluxe", "CP", 180, 210, "Executive room, M Club access"),
      makeRate("suite", "CP", 300, 350, "Presidential Suite"),
    ],
  },
  {
    name: "Aloft Kathmandu Thamel",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Thamel, Kathmandu",
    description:
      "A vibrant lifestyle hotel in the heart of Thamel, Aloft brings Marriott's contemporary design ethos with a rooftop bar, WXYZ lounge, and tech-forward rooms.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Rooftop Bar",
      "Fitness Center",
      "Room Service",
      "Laundry Service",
      "Co-working Space",
    ],
    checkInTime: "15:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 90, 110, "Aloft room"),
      makeRate("deluxe", "CP", 120, 145, "Savvy Suite"),
      makeRate("suite", "CP", 180, 220, "Breezy Suite"),
    ],
  },
  {
    name: "Fairfield by Marriott Kathmandu",
    city: "Kathmandu",
    starRating: 5,
    category: "luxury",
    address: "Thamel, Kathmandu",
    description:
      "Fairfield by Marriott offers reliable international-standard accommodation in Thamel with bright modern rooms and easy access to dining and nightlife.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Fitness Center",
      "Room Service",
      "Laundry Service",
      "Business Center",
      "Airport Transfer",
    ],
    checkInTime: "15:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 80, 100, "Fairfield room"),
      makeRate("deluxe", "CP", 110, 130, "Fairfield Suite"),
      makeRate("suite", "CP", 160, 190, "Executive Suite"),
    ],
  },

  // =========================================================================
  // 5-STAR LUXURY – POKHARA (~6)
  // =========================================================================
  {
    name: "Temple Tree Resort & Spa",
    city: "Pokhara",
    starRating: 5,
    category: "luxury",
    address: "Lakeside, Pokhara",
    description:
      "Temple Tree Resort & Spa is a lakeside luxury retreat offering spa treatments, a swimming pool, and stunning Annapurna views from manicured gardens.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 100, 120, "Garden view room"),
      makeRate("deluxe", "CP", 140, 165, "Lake view room"),
      makeRate("suite", "CP", 220, 260, "Annapurna Suite"),
    ],
  },
  {
    name: "Pokhara Grande",
    city: "Pokhara",
    starRating: 5,
    category: "luxury",
    address: "Lakeside, Pokhara",
    description:
      "Pokhara Grande stands as the city's premier luxury hotel with elegant rooms, multiple restaurants, and direct views of Phewa Lake and the Annapurna range.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 90, 110, "Superior room"),
      makeRate("deluxe", "CP", 130, 155, "Deluxe lake view"),
      makeRate("suite", "CP", 200, 240, "Grande Suite"),
    ],
  },
  {
    name: "Fishtail Lodge",
    city: "Pokhara",
    starRating: 5,
    category: "luxury",
    address: "Lakeside, Pokhara",
    description:
      "Accessible only by pontoon raft across Phewa Lake, Fishtail Lodge offers a unique island-like setting with iconic views of Machhapuchhre (Fishtail) mountain.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Bar",
      "Garden",
      "Room Service",
      "Boat Transfer",
      "Bird Watching",
      "Laundry Service",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 110, 130, "Garden room"),
      makeRate("deluxe", "CP", 150, 175, "Lake-facing room"),
      makeRate("suite", "CP", 240, 280, "Fishtail Suite"),
    ],
  },
  {
    name: "Waterfront Resort",
    city: "Pokhara",
    starRating: 5,
    category: "luxury",
    address: "Lakeside 6, Pokhara",
    description:
      "A modern lakeside resort with infinity pool overlooking Phewa Lake, Waterfront Resort combines contemporary luxury with breathtaking Himalayan panoramas.",
    amenities: [...LUXURY_AMENITIES, "Infinity Pool"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 95, 115, "Premium room"),
      makeRate("deluxe", "CP", 135, 160, "Lakefront deluxe"),
      makeRate("suite", "CP", 210, 250, "Waterfront Suite"),
    ],
  },
  {
    name: "Tiger Mountain Pokhara Lodge",
    city: "Pokhara",
    starRating: 5,
    category: "luxury",
    address: "Lekhnath, Pokhara",
    description:
      "Perched high above the Pokhara valley, Tiger Mountain Lodge offers a secluded eco-luxury experience with hand-built stone cottages and 180-degree Annapurna views.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Bar",
      "Garden",
      "Guided Hikes",
      "Bird Watching",
      "Yoga",
      "Library",
      "Bonfire",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 150, 180, "Stone cottage, full board"),
      makeRate("deluxe", "MAP", 200, 240, "Premium cottage with fireplace"),
    ],
  },
  {
    name: "Shangri-La Village Resort",
    city: "Pokhara",
    starRating: 5,
    category: "luxury",
    address: "Gharipatan, Pokhara",
    description:
      "Set within 7 acres of landscaped gardens, Shangri-La Village Resort provides a peaceful retreat with traditional Nepali architecture and mountain views.",
    amenities: LUXURY_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 85, 105, "Garden room"),
      makeRate("deluxe", "CP", 120, 145, "Deluxe room"),
      makeRate("suite", "CP", 190, 230, "Village Suite"),
    ],
  },

  // =========================================================================
  // 4-STAR – KATHMANDU (~10)
  // =========================================================================
  {
    name: "Hotel Shanker",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Lazimpat, Kathmandu",
    description:
      "A converted Rana-era palace, Hotel Shanker retains its regal heritage with ornate architecture, a peaceful garden, and comfortable modern rooms.",
    amenities: FOUR_STAR_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 50, 65, "Standard room"),
      makeRate("deluxe", "CP", 70, 85, "Heritage deluxe"),
      makeRate("suite", "CP", 110, 135, "Palace Suite"),
    ],
  },
  {
    name: "Kantipur Temple House",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Jyatha, Thamel, Kathmandu",
    description:
      "An award-winning heritage hotel built with reclaimed Newari woodwork, Kantipur Temple House offers an authentic cultural experience steps from Thamel.",
    amenities: [...FOUR_STAR_AMENITIES, "Heritage Courtyard", "Cultural Programs"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 45, 60, "Heritage room"),
      makeRate("deluxe", "CP", 65, 80, "Deluxe heritage room"),
    ],
  },
  {
    name: "Hotel Manaslu",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Lazimpat, Kathmandu",
    description:
      "A reliable four-star property in Lazimpat, Hotel Manaslu offers spacious rooms, a lovely garden, and consistent service for business and leisure travellers.",
    amenities: FOUR_STAR_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 45, 58, "Standard room"),
      makeRate("deluxe", "CP", 65, 78, "Deluxe room"),
      makeRate("suite", "CP", 100, 125, "Manaslu Suite"),
    ],
  },
  {
    name: "Baber Mahal Vilas",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Baber Mahal, Kathmandu",
    description:
      "A boutique heritage hotel in the restored Baber Mahal complex, offering intimate luxury with exquisite Rana-period architecture and gourmet dining.",
    amenities: [...FOUR_STAR_AMENITIES, "Heritage Courtyard", "Art Gallery"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 60, 75, "Heritage room"),
      makeRate("deluxe", "CP", 80, 100, "Palace room"),
      makeRate("suite", "CP", 130, 160, "Vilas Suite"),
    ],
  },
  {
    name: "Hotel Tibet International",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Boudha, Kathmandu",
    description:
      "Located near the Boudhanath Stupa, Hotel Tibet International provides comfortable accommodation with a distinct Tibetan cultural ambiance.",
    amenities: FOUR_STAR_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 40, 55, "Standard room"),
      makeRate("deluxe", "CP", 60, 75, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Yak",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Durbar Marg, Kathmandu",
    description:
      "Centrally located on Durbar Marg, Hotel Yak offers solid four-star service with easy access to shopping, dining, and Kathmandu's cultural landmarks.",
    amenities: FOUR_STAR_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 45, 60, "Standard room"),
      makeRate("deluxe", "CP", 65, 80, "Deluxe room"),
      makeRate("suite", "CP", 105, 130, "Executive Suite"),
    ],
  },
  {
    name: "Hotel Himalaya",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Sahid Sukra Marg, Lalitpur",
    description:
      "Set in a former Rana palace with 4 acres of gardens, Hotel Himalaya offers a tranquil escape in Lalitpur with mountain views and excellent conferencing facilities.",
    amenities: [...FOUR_STAR_AMENITIES, "Tennis Court", "Swimming Pool"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 50, 65, "Standard room"),
      makeRate("deluxe", "CP", 70, 90, "Mountain view deluxe"),
      makeRate("suite", "CP", 115, 140, "Himalaya Suite"),
    ],
  },
  {
    name: "Summit Hotel",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Kopundole Height, Lalitpur",
    description:
      "Perched on Kopundole Hill, Summit Hotel is an eco-conscious property with organic gardens, butterfly conservatory, and panoramic mountain views.",
    amenities: [...FOUR_STAR_AMENITIES, "Organic Garden", "Butterfly Conservatory"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 45, 58, "Garden room"),
      makeRate("deluxe", "CP", 65, 80, "Mountain view room"),
    ],
  },
  {
    name: "Gokarna Forest Resort",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Gokarna, Kathmandu",
    description:
      "Located within a protected forest reserve and featuring an 18-hole golf course, Gokarna Forest Resort provides a nature retreat just 20 minutes from Kathmandu.",
    amenities: [...FOUR_STAR_AMENITIES, "Golf Course", "Spa", "Nature Trails"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 65, 80, "Forest view room"),
      makeRate("deluxe", "CP", 90, 110, "Deluxe room"),
      makeRate("suite", "CP", 140, 170, "Presidential Suite"),
    ],
  },
  {
    name: "Hotel Malla",
    city: "Kathmandu",
    starRating: 4,
    category: "business",
    address: "Lekhnath Marg, Kathmandu",
    description:
      "A well-established four-star hotel near the Royal Palace, Hotel Malla offers reliable service, multiple dining options, and a convenient central location.",
    amenities: FOUR_STAR_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 48, 62, "Standard room"),
      makeRate("deluxe", "CP", 68, 85, "Deluxe room"),
      makeRate("suite", "CP", 110, 135, "Malla Suite"),
    ],
  },

  // =========================================================================
  // 4-STAR – POKHARA (~6)
  // =========================================================================
  {
    name: "Hotel Barahi",
    city: "Pokhara",
    starRating: 4,
    category: "business",
    address: "Lakeside, Pokhara",
    description:
      "Hotel Barahi is Pokhara's most popular lakeside four-star hotel, offering comfortable rooms, a rooftop pool, and direct views of Phewa Lake.",
    amenities: [...FOUR_STAR_AMENITIES, "Rooftop Pool"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 55, 70, "Standard room"),
      makeRate("deluxe", "CP", 75, 95, "Lake view deluxe"),
      makeRate("suite", "CP", 120, 150, "Barahi Suite"),
    ],
  },
  {
    name: "Mount Kailash Resort",
    city: "Pokhara",
    starRating: 4,
    category: "business",
    address: "Lakeside, Pokhara",
    description:
      "Mount Kailash Resort offers a peaceful lakeside setting with well-appointed rooms, a swimming pool, and panoramic views of the Annapurna range.",
    amenities: [...FOUR_STAR_AMENITIES, "Swimming Pool"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 45, 60, "Standard room"),
      makeRate("deluxe", "CP", 65, 82, "Deluxe mountain view"),
    ],
  },
  {
    name: "Hotel Lake Shore",
    city: "Pokhara",
    starRating: 4,
    category: "business",
    address: "Lakeside, Pokhara",
    description:
      "Directly on the shores of Phewa Lake, Hotel Lake Shore offers stunning waterfront views, boating access, and comfortable four-star accommodation.",
    amenities: FOUR_STAR_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 42, 55, "Garden room"),
      makeRate("deluxe", "CP", 60, 75, "Lake view room"),
    ],
  },
  {
    name: "Begnas Lake Resort",
    city: "Pokhara",
    starRating: 4,
    category: "business",
    address: "Begnas Lake, Pokhara",
    description:
      "Away from the bustle of Lakeside, Begnas Lake Resort provides a serene escape on the quieter Begnas Lake with lush surroundings and eco-conscious design.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Boating",
      "Nature Trails",
      "Bird Watching",
      "Room Service",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 50, 65, "Lake view room"),
      makeRate("deluxe", "CP", 70, 88, "Premium lake room"),
    ],
  },
  {
    name: "Lakeside Retreat",
    city: "Pokhara",
    starRating: 4,
    category: "business",
    address: "Lakeside 6, Pokhara",
    description:
      "A modern four-star hotel on the quieter end of Lakeside, offering clean contemporary design and excellent value with mountain and lake views.",
    amenities: FOUR_STAR_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 40, 52, "Standard room"),
      makeRate("deluxe", "CP", 58, 72, "Deluxe room"),
    ],
  },
  {
    name: "Temple Garden Resort",
    city: "Pokhara",
    starRating: 4,
    category: "business",
    address: "Lakeside, Pokhara",
    description:
      "Temple Garden Resort blends traditional Nepali design with modern comforts, featuring lush gardens, a spa, and convenient lakeside access.",
    amenities: [...FOUR_STAR_AMENITIES, "Spa", "Garden"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 48, 62, "Garden room"),
      makeRate("deluxe", "CP", 68, 85, "Superior room"),
    ],
  },

  // =========================================================================
  // BOUTIQUE HOTELS (~12)
  // =========================================================================
  {
    name: "Dwarika's Resort Dhulikhel",
    city: "Dhulikhel",
    starRating: 5,
    category: "boutique",
    address: "Dhulikhel, Kavrepalanchok",
    description:
      "An ultra-luxury Himalayan retreat by the Dwarika's group, featuring a world-class spa, infinity pool, and panoramic sunrise views from Dhulikhel ridge.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Bar",
      "Infinity Pool",
      "Spa",
      "Yoga Studio",
      "Meditation Center",
      "Organic Garden",
      "Library",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 120, 145, "Pavilion room"),
      makeRate("deluxe", "CP", 170, 200, "Himalayan view pavilion"),
      makeRate("suite", "CP", 280, 330, "Dwarika Suite with plunge pool"),
    ],
  },
  {
    name: "Famous Farm Bhaktapur",
    city: "Bhaktapur",
    starRating: 4,
    category: "boutique",
    address: "Katunje, Bhaktapur",
    description:
      "A charming hilltop farm-stay overlooking the medieval city of Bhaktapur, Famous Farm offers organic cuisine, yoga sessions, and authentic rural Nepali life.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Organic Farm",
      "Yoga",
      "Cooking Classes",
      "Cultural Tours",
      "Garden",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "CP", 55, 70, "Farm cottage"),
      makeRate("deluxe", "CP", 75, 95, "Deluxe cottage with terrace"),
    ],
  },
  {
    name: "Newa Chen Boutique",
    city: "Kathmandu",
    starRating: 4,
    category: "boutique",
    address: "Patan Durbar Square, Lalitpur",
    description:
      "A beautifully restored Newari townhouse on Patan Durbar Square, Newa Chen offers an immersive heritage experience with traditional architecture and modern comforts.",
    amenities: BOUTIQUE_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 60, 75, "Heritage room"),
      makeRate("deluxe", "CP", 85, 105, "Durbar Square view room"),
    ],
  },
  {
    name: "The Pavilions Himalayas",
    city: "Pokhara",
    starRating: 5,
    category: "boutique",
    address: "Sedi Bagar, Pokhara",
    description:
      "An award-winning eco-luxury lodge offering private villas with heated plunge pools, organic farm-to-table dining, and unobstructed Annapurna panoramas.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Bar",
      "Spa",
      "Yoga Studio",
      "Private Plunge Pool",
      "Organic Farm",
      "Cooking Classes",
      "Library",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "MAP", 110, 135, "Village villa"),
      makeRate("deluxe", "MAP", 160, 195, "Village villa with plunge pool"),
      makeRate("suite", "MAP", 250, 300, "Farm House Suite"),
    ],
  },
  {
    name: "Hotel Manang",
    city: "Kathmandu",
    starRating: 3,
    category: "boutique",
    address: "Thamel, Kathmandu",
    description:
      "A Thamel stalwart, Hotel Manang provides clean, well-managed rooms with a rooftop restaurant and a central location popular with trekkers and travellers.",
    amenities: BOUTIQUE_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 30, 40, "Standard room"),
      makeRate("deluxe", "CP", 45, 58, "Deluxe room"),
    ],
  },
  {
    name: "Dwarika Hotel Heritage",
    city: "Kathmandu",
    starRating: 5,
    category: "boutique",
    address: "Battisputali, Kathmandu",
    description:
      "The heritage wing of the legendary Dwarika's Hotel, featuring meticulously restored 13th-century woodcarvings and traditional Nepali craftsmanship throughout.",
    amenities: [...BOUTIQUE_AMENITIES, "Spa", "Swimming Pool", "Bar"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 140, 165, "Heritage room"),
      makeRate("deluxe", "CP", 190, 225, "Premium heritage room"),
      makeRate("suite", "CP", 300, 350, "Heritage Suite"),
    ],
  },
  {
    name: "Pilgrims Guest House",
    city: "Kathmandu",
    starRating: 3,
    category: "boutique",
    address: "Thamel, Kathmandu",
    description:
      "A well-known Thamel guest house catering to trekkers and backpackers, Pilgrims offers clean rooms, a garden cafe, and a reliable travel desk.",
    amenities: ["WiFi", "Restaurant", "Garden", "Travel Desk", "Laundry Service"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 25, 35, "Standard room"),
      makeRate("deluxe", "CP", 40, 52, "Deluxe room"),
    ],
  },
  {
    name: "Kathmandu Guest House",
    city: "Kathmandu",
    starRating: 4,
    category: "boutique",
    address: "Thamel, Kathmandu",
    description:
      "The legendary Kathmandu Guest House has been welcoming travellers since 1968. Set around a peaceful garden courtyard in the heart of Thamel.",
    amenities: [...BOUTIQUE_AMENITIES, "Swimming Pool", "Spa"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 50, 65, "Heritage room"),
      makeRate("deluxe", "CP", 75, 95, "Deluxe garden room"),
      makeRate("suite", "CP", 120, 150, "KGH Suite"),
    ],
  },
  {
    name: "Hotel Courtyard",
    city: "Kathmandu",
    starRating: 4,
    category: "boutique",
    address: "Thamel, Kathmandu",
    description:
      "A modern boutique hotel in Thamel with a tranquil inner courtyard, contemporary design, and attentive personalised service.",
    amenities: BOUTIQUE_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 50, 65, "Courtyard room"),
      makeRate("deluxe", "CP", 72, 90, "Premium room"),
    ],
  },
  {
    name: "Z Hotel",
    city: "Kathmandu",
    starRating: 4,
    category: "boutique",
    address: "Thamel, Kathmandu",
    description:
      "Z Hotel brings a contemporary aesthetic to Thamel with sleek minimalist rooms, a rooftop bar, and artful touches throughout its stylish interiors.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Rooftop Bar",
      "Room Service",
      "Laundry Service",
      "Airport Transfer",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 55, 70, "Z Room"),
      makeRate("deluxe", "CP", 78, 98, "Z Suite"),
    ],
  },
  {
    name: "1905 Heritage Boutique",
    city: "Kathmandu",
    starRating: 4,
    category: "boutique",
    address: "Kantipath, Kathmandu",
    description:
      "Housed in a restored 1905 Rana-era mansion, this boutique hotel preserves century-old architecture while offering all modern comforts and a gourmet restaurant.",
    amenities: [...BOUTIQUE_AMENITIES, "Bar", "Heritage Garden"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 65, 82, "Heritage room"),
      makeRate("deluxe", "CP", 90, 115, "Palace room"),
      makeRate("suite", "CP", 140, 175, "1905 Suite"),
    ],
  },

  // =========================================================================
  // MOUNTAIN LODGES – EVEREST REGION (~10)
  // =========================================================================
  {
    name: "Everest View Hotel",
    city: "Namche Bazaar",
    starRating: 3,
    category: "mountain_lodge",
    address: "Syangboche, Khumbu",
    description:
      "The world's highest-altitude hotel at 3,880m, Everest View Hotel offers unobstructed views of Everest, Lhotse, and Ama Dablam from every room.",
    amenities: [
      "Restaurant",
      "Hot Shower",
      "Oxygen Supply",
      "Heater",
      "Charging Station",
      "Common Room",
    ],
    checkInTime: "13:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 50, 60, "Standard room with Everest view"),
      makeRate("deluxe", "MAP", 70, 85, "Deluxe room with panoramic view"),
    ],
  },
  {
    name: "Yeti Mountain Home Namche",
    city: "Namche Bazaar",
    starRating: 3,
    category: "mountain_lodge",
    address: "Namche Bazaar, Khumbu",
    description:
      "Part of the premium Yeti Mountain Home chain, this Namche lodge offers heated rooms, hot showers, and genuine Sherpa hospitality at 3,440m.",
    amenities: LODGE_AMENITIES,
    checkInTime: "13:00",
    checkOutTime: "10:00",
    roomRates: [
      makeRate("standard", "MAP", 40, 50, "Standard heated room"),
      makeRate("deluxe", "MAP", 55, 68, "Deluxe room with ensuite"),
    ],
  },
  {
    name: "Yeti Mountain Home Lukla",
    city: "Lukla",
    starRating: 3,
    category: "mountain_lodge",
    address: "Lukla, Khumbu",
    description:
      "The gateway lodge of the Yeti Mountain Home chain at Lukla, offering comfortable accommodation for trekkers arriving by air to begin the Everest trail.",
    amenities: LODGE_AMENITIES,
    checkInTime: "13:00",
    checkOutTime: "10:00",
    roomRates: [
      makeRate("standard", "MAP", 35, 45, "Standard room"),
      makeRate("deluxe", "MAP", 50, 62, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Everest View",
    city: "Namche Bazaar",
    starRating: 3,
    category: "mountain_lodge",
    address: "Syangboche Ridge, Khumbu",
    description:
      "A Japanese-built heritage lodge perched on Syangboche ridge, offering one of the most dramatic panoramas of Mount Everest available from any hotel in the world.",
    amenities: [
      "Restaurant",
      "Hot Shower",
      "Heater",
      "Oxygen Supply",
      "Sun Terrace",
      "Common Room",
    ],
    checkInTime: "13:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 55, 65, "Everest-facing room"),
      makeRate("deluxe", "MAP", 75, 90, "Premium panoramic room"),
    ],
  },
  {
    name: "Namche Hotel",
    city: "Namche Bazaar",
    starRating: 3,
    category: "mountain_lodge",
    address: "Namche Bazaar, Khumbu",
    description:
      "A comfortable mid-range lodge in the heart of Namche Bazaar, the Sherpa capital, offering warm rooms and hearty meals at 3,440m altitude.",
    amenities: LODGE_AMENITIES,
    checkInTime: "13:00",
    checkOutTime: "10:00",
    roomRates: [
      makeRate("standard", "MAP", 30, 38, "Standard room"),
      makeRate("deluxe", "MAP", 42, 52, "Deluxe room"),
    ],
  },
  {
    name: "Panorama Lodge Namche",
    city: "Namche Bazaar",
    starRating: 3,
    category: "mountain_lodge",
    address: "Upper Namche Bazaar, Khumbu",
    description:
      "Set on the upper rim of Namche, Panorama Lodge offers sweeping views of Kongde and Thamserku with comfortable rooms and a well-stocked dining hall.",
    amenities: LODGE_AMENITIES,
    checkInTime: "13:00",
    checkOutTime: "10:00",
    roomRates: [
      makeRate("standard", "MAP", 25, 32, "Standard room"),
      makeRate("deluxe", "MAP", 38, 48, "Mountain view room"),
    ],
  },
  {
    name: "Khumbu Lodge Phakding",
    city: "Lukla",
    starRating: 2,
    category: "mountain_lodge",
    address: "Phakding, Khumbu",
    description:
      "A popular first-night stop on the Everest Base Camp trek, Khumbu Lodge in Phakding provides warm rooms, hot meals, and riverside setting at 2,610m.",
    amenities: ["Restaurant", "Hot Shower", "Charging Station", "Common Room"],
    checkInTime: "13:00",
    checkOutTime: "09:00",
    roomRates: [
      makeRate("standard", "MAP", 20, 28, "Standard twin room"),
    ],
  },
  {
    name: "Sherpa Guide Lodge Lukla",
    city: "Lukla",
    starRating: 2,
    category: "mountain_lodge",
    address: "Lukla, Khumbu",
    description:
      "A well-maintained lodge near Lukla airport offering clean rooms, a warm dining area, and knowledgeable Sherpa staff to help with trek preparations.",
    amenities: ["Restaurant", "Hot Shower", "Charging Station", "Common Room", "Travel Desk"],
    checkInTime: "13:00",
    checkOutTime: "09:00",
    roomRates: [
      makeRate("standard", "MAP", 22, 30, "Standard room"),
    ],
  },
  {
    name: "Mountain Lodge Tengboche",
    city: "Namche Bazaar",
    starRating: 2,
    category: "mountain_lodge",
    address: "Tengboche, Khumbu",
    description:
      "Located beside the famous Tengboche Monastery at 3,867m, this lodge offers a spiritual setting with views of Everest, Ama Dablam, and Nuptse.",
    amenities: ["Restaurant", "Hot Shower", "Common Room", "Charging Station"],
    checkInTime: "13:00",
    checkOutTime: "09:00",
    roomRates: [
      makeRate("standard", "MAP", 25, 35, "Standard room"),
    ],
  },
  {
    name: "Camp de Base Gorak Shep",
    city: "Namche Bazaar",
    starRating: 2,
    category: "mountain_lodge",
    address: "Gorak Shep, Khumbu",
    description:
      "The last settlement before Everest Base Camp at 5,164m, Camp de Base provides basic but essential shelter, warm meals, and a legendary location.",
    amenities: ["Restaurant", "Hot Water Bottle", "Common Room", "Charging Station"],
    checkInTime: "12:00",
    checkOutTime: "08:00",
    roomRates: [
      makeRate("standard", "MAP", 30, 40, "Standard twin room"),
    ],
  },

  // =========================================================================
  // MOUNTAIN LODGES – ANNAPURNA REGION (~8)
  // =========================================================================
  {
    name: "Ker & Downey Mountain Lodge",
    city: "Pokhara",
    starRating: 4,
    category: "mountain_lodge",
    address: "Gurung Heritage Trail, Annapurna",
    description:
      "A chain of luxury trekking lodges on the Gurung Heritage Trail, offering premium comfort with local stone architecture, gourmet meals, and guided experiences.",
    amenities: [
      "Restaurant",
      "Hot Shower",
      "Heater",
      "Library",
      "Guided Treks",
      "Cultural Programs",
      "Garden",
    ],
    checkInTime: "14:00",
    checkOutTime: "10:00",
    roomRates: [
      makeRate("standard", "MAP", 80, 100, "Lodge room"),
      makeRate("deluxe", "MAP", 110, 135, "Premium lodge room"),
    ],
  },
  {
    name: "Hotel Grand Annapurna",
    city: "Pokhara",
    starRating: 3,
    category: "mountain_lodge",
    address: "Birethanti, Annapurna",
    description:
      "A comfortable lodge at the gateway to the Annapurna Circuit, Hotel Grand Annapurna provides a warm welcome before or after trekking adventures.",
    amenities: LODGE_AMENITIES,
    checkInTime: "13:00",
    checkOutTime: "10:00",
    roomRates: [
      makeRate("standard", "MAP", 25, 35, "Standard room"),
      makeRate("deluxe", "MAP", 38, 50, "Deluxe room"),
    ],
  },
  {
    name: "See You Lodge Ghorepani",
    city: "Pokhara",
    starRating: 2,
    category: "mountain_lodge",
    address: "Ghorepani, Annapurna",
    description:
      "A popular lodge at Ghorepani (2,860m) on the Poon Hill route, known for its warm hospitality, hearty meals, and proximity to the famous sunrise viewpoint.",
    amenities: ["Restaurant", "Hot Shower", "Common Room", "Charging Station"],
    checkInTime: "13:00",
    checkOutTime: "08:00",
    roomRates: [
      makeRate("standard", "MAP", 20, 28, "Standard twin room"),
    ],
  },
  {
    name: "Excellent View Lodge Poon Hill",
    city: "Pokhara",
    starRating: 2,
    category: "mountain_lodge",
    address: "Ghorepani, Annapurna",
    description:
      "Named for its commanding views of the Annapurna and Dhaulagiri ranges, Excellent View Lodge is a trekker favourite in the Ghorepani/Poon Hill area.",
    amenities: ["Restaurant", "Hot Shower", "Common Room", "Charging Station", "Sun Terrace"],
    checkInTime: "13:00",
    checkOutTime: "08:00",
    roomRates: [
      makeRate("standard", "MAP", 22, 30, "Mountain view room"),
    ],
  },
  {
    name: "Sanctuary Lodge ABC",
    city: "Pokhara",
    starRating: 2,
    category: "mountain_lodge",
    address: "Annapurna Base Camp, Annapurna",
    description:
      "The highest lodge on the Annapurna Base Camp trail at 4,130m, Sanctuary Lodge offers basic but warm accommodation in a spectacular glacial amphitheatre.",
    amenities: ["Restaurant", "Hot Water Bottle", "Common Room", "Charging Station"],
    checkInTime: "12:00",
    checkOutTime: "08:00",
    roomRates: [
      makeRate("standard", "MAP", 28, 38, "Standard twin room"),
    ],
  },
  {
    name: "Hotel Trekkers Inn Manang",
    city: "Pokhara",
    starRating: 2,
    category: "mountain_lodge",
    address: "Manang, Annapurna Circuit",
    description:
      "A well-known rest stop in Manang village (3,540m), offering acclimatisation days with comfortable rooms, a bakery, and views of Annapurna III and Gangapurna.",
    amenities: ["Restaurant", "Bakery", "Hot Shower", "Common Room", "Charging Station"],
    checkInTime: "13:00",
    checkOutTime: "09:00",
    roomRates: [
      makeRate("standard", "MAP", 22, 30, "Standard room"),
    ],
  },
  {
    name: "Yak Hotel Thorong La",
    city: "Pokhara",
    starRating: 2,
    category: "mountain_lodge",
    address: "Thorong Phedi, Annapurna Circuit",
    description:
      "The last lodge before the Thorong La Pass (5,416m), Yak Hotel provides essential shelter, warm food, and early wake-up calls for the high-pass crossing.",
    amenities: ["Restaurant", "Hot Water Bottle", "Common Room"],
    checkInTime: "12:00",
    checkOutTime: "04:00",
    roomRates: [
      makeRate("standard", "MAP", 25, 35, "Standard twin room"),
    ],
  },
  {
    name: "Mountain View Lodge Tatopani",
    city: "Pokhara",
    starRating: 3,
    category: "mountain_lodge",
    address: "Tatopani, Annapurna",
    description:
      "Located in the hot-spring village of Tatopani (1,190m), this lodge offers natural thermal baths, citrus gardens, and a relaxing post-trek recuperation stop.",
    amenities: [
      "Restaurant",
      "Hot Shower",
      "Hot Springs Access",
      "Garden",
      "Common Room",
      "Charging Station",
    ],
    checkInTime: "13:00",
    checkOutTime: "10:00",
    roomRates: [
      makeRate("standard", "MAP", 22, 30, "Standard room"),
      makeRate("deluxe", "MAP", 35, 45, "Room with hot spring access"),
    ],
  },

  // =========================================================================
  // SAFARI / WILDLIFE LODGES – CHITWAN (~8)
  // =========================================================================
  {
    name: "Tiger Tops Tharu Lodge",
    city: "Chitwan",
    starRating: 4,
    category: "safari_lodge",
    address: "Chitwan National Park, Chitwan",
    description:
      "The legendary Tiger Tops brand offers an authentic Tharu-style lodge at the edge of Chitwan National Park with expert naturalists and ethical wildlife encounters.",
    amenities: SAFARI_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 100, 125, "Tharu cottage"),
      makeRate("deluxe", "MAP", 140, 170, "Premium cottage with garden"),
    ],
  },
  {
    name: "Barahi Jungle Lodge",
    city: "Chitwan",
    starRating: 4,
    category: "safari_lodge",
    address: "Meghauli, Chitwan",
    description:
      "A premium jungle lodge offering luxury tented camps and concrete cottages on the banks of the Rapti River with world-class safari experiences.",
    amenities: [...SAFARI_AMENITIES, "Infinity Pool"],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 90, 115, "Jungle cottage"),
      makeRate("deluxe", "MAP", 130, 160, "Luxury tent with river view"),
      makeRate("suite", "MAP", 200, 245, "Barahi Suite"),
    ],
  },
  {
    name: "Meghauli Serai Taj",
    city: "Chitwan",
    starRating: 5,
    category: "safari_lodge",
    address: "Meghauli, Chitwan",
    description:
      "A Taj Safari property offering the finest wildlife luxury in Nepal, with spacious villas along the Rapti River, a pool, and Taj's legendary service standards.",
    amenities: [...SAFARI_AMENITIES, "Spa", "Private Dining", "Infinity Pool"],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 150, 180, "Riverfront room"),
      makeRate("deluxe", "MAP", 200, 240, "Luxury villa"),
      makeRate("suite", "MAP", 300, 360, "Meghauli Suite"),
    ],
  },
  {
    name: "Green Park Chitwan",
    city: "Chitwan",
    starRating: 3,
    category: "safari_lodge",
    address: "Sauraha, Chitwan",
    description:
      "A well-run mid-range resort in Sauraha, Green Park Chitwan offers comfortable rooms, a pool, and excellent value safari packages into Chitwan National Park.",
    amenities: [...SAFARI_AMENITIES.filter((a) => a !== "Bonfire"), "Swimming Pool"],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 60, 75, "Standard room"),
      makeRate("deluxe", "MAP", 85, 105, "Deluxe cottage"),
    ],
  },
  {
    name: "Sapana Village Lodge",
    city: "Chitwan",
    starRating: 3,
    category: "safari_lodge",
    address: "Sauraha, Chitwan",
    description:
      "A community-oriented eco-lodge in Sauraha with Tharu-style cottages, supporting local villages through sustainable tourism and cultural exchange programmes.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Jungle Safari",
      "Cultural Tours",
      "Village Walk",
      "Bird Watching",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 55, 68, "Tharu cottage"),
      makeRate("deluxe", "MAP", 75, 92, "Deluxe cottage"),
    ],
  },
  {
    name: "Kasara Jungle Resort",
    city: "Chitwan",
    starRating: 4,
    category: "safari_lodge",
    address: "Sauraha, Chitwan",
    description:
      "Kasara Jungle Resort offers a premium safari experience in Sauraha with luxurious rooms, a pool, and expert-guided jungle activities.",
    amenities: SAFARI_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 80, 100, "Jungle room"),
      makeRate("deluxe", "MAP", 115, 140, "Deluxe jungle cottage"),
      makeRate("suite", "MAP", 170, 210, "Kasara Suite"),
    ],
  },
  {
    name: "Hotel Parkside",
    city: "Chitwan",
    starRating: 3,
    category: "safari_lodge",
    address: "Sauraha, Chitwan",
    description:
      "A comfortable Sauraha hotel at the edge of Chitwan National Park buffer zone, offering good-value safari packages and warm Tharu hospitality.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Jungle Safari",
      "Canoe Rides",
      "Bird Watching",
      "Bonfire",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 45, 58, "Standard room"),
      makeRate("deluxe", "MAP", 65, 82, "Deluxe room"),
    ],
  },
  {
    name: "Chitwan Riverside Resort",
    city: "Chitwan",
    starRating: 3,
    category: "safari_lodge",
    address: "Sauraha, Chitwan",
    description:
      "A riverside resort in Sauraha with comfortable bungalows, a pool, and easy access to elephant breeding centre and Chitwan National Park.",
    amenities: [...SAFARI_AMENITIES, "Swimming Pool"],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 50, 62, "Riverside bungalow"),
      makeRate("deluxe", "MAP", 72, 90, "Deluxe bungalow"),
    ],
  },

  // =========================================================================
  // SAFARI / WILDLIFE LODGES – BARDIA (~4)
  // =========================================================================
  {
    name: "Bardia Eco Lodge",
    city: "Bardia",
    starRating: 3,
    category: "safari_lodge",
    address: "Thakurdwara, Bardia",
    description:
      "An eco-friendly lodge at the edge of Bardia National Park, offering intimate wildlife experiences with the best chances of seeing wild Bengal tigers in Nepal.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Jungle Safari",
      "Bird Watching",
      "Canoe Rides",
      "Bonfire",
      "Cultural Tours",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 60, 75, "Eco cottage"),
      makeRate("deluxe", "MAP", 85, 105, "River view cottage"),
    ],
  },
  {
    name: "Tiger Resort Bardia",
    city: "Bardia",
    starRating: 3,
    category: "safari_lodge",
    address: "Thakurdwara, Bardia",
    description:
      "A comfortable jungle resort near Bardia National Park offering guided safaris, elephant encounters, and immersive stays in the remote far-western Terai.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Jungle Safari",
      "Bird Watching",
      "Cultural Tours",
      "Bonfire",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 55, 68, "Standard cottage"),
      makeRate("deluxe", "MAP", 78, 95, "Deluxe cottage"),
    ],
  },
  {
    name: "Bardia Jungle Cottage",
    city: "Bardia",
    starRating: 2,
    category: "safari_lodge",
    address: "Thakurdwara, Bardia",
    description:
      "A rustic lodge providing an authentic jungle experience in Bardia with basic but clean cottages and guided wildlife walks and safaris.",
    amenities: [
      "Restaurant",
      "Garden",
      "Jungle Safari",
      "Bird Watching",
      "Bonfire",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 35, 45, "Jungle cottage"),
    ],
  },
  {
    name: "Bardia Wildlife Resort",
    city: "Bardia",
    starRating: 3,
    category: "safari_lodge",
    address: "Thakurdwara, Bardia",
    description:
      "A well-maintained resort near the park entrance offering comfortable rooms, expert naturalists, and some of the best tiger-spotting odds in Asia.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Jungle Safari",
      "Bird Watching",
      "Canoe Rides",
      "Cultural Tours",
      "Bonfire",
    ],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    roomRates: [
      makeRate("standard", "MAP", 50, 62, "Standard room"),
      makeRate("deluxe", "MAP", 72, 88, "Deluxe cottage"),
    ],
  },

  // =========================================================================
  // HERITAGE PROPERTIES (~6)
  // =========================================================================
  {
    name: "Newa Heritage Hotel",
    city: "Bhaktapur",
    starRating: 3,
    category: "heritage",
    address: "Bhaktapur Durbar Square, Bhaktapur",
    description:
      "A lovingly restored Newari house overlooking Bhaktapur Durbar Square, offering guests a living heritage experience in Nepal's best-preserved medieval city.",
    amenities: HERITAGE_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 35, 48, "Heritage room"),
      makeRate("deluxe", "CP", 50, 65, "Durbar view room"),
    ],
  },
  {
    name: "Palace Hotel Patan",
    city: "Kathmandu",
    starRating: 3,
    category: "heritage",
    address: "Patan Durbar Square, Lalitpur",
    description:
      "Set in a historic building near Patan Durbar Square, Palace Hotel offers traditional Newari architecture with views of ancient temples and artisan workshops.",
    amenities: HERITAGE_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 30, 42, "Heritage room"),
      makeRate("deluxe", "CP", 48, 62, "Square view room"),
    ],
  },
  {
    name: "Heritage Home Bandipur",
    city: "Bandipur",
    starRating: 3,
    category: "heritage",
    address: "Bandipur Bazaar, Bandipur",
    description:
      "A restored Newari merchant house in the hilltop village of Bandipur, offering panoramic Himalayan views, village walks, and a window into traditional life.",
    amenities: [...HERITAGE_AMENITIES, "Terrace", "Village Tours"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 35, 48, "Heritage room"),
      makeRate("deluxe", "CP", 52, 68, "Mountain view room"),
    ],
  },
  {
    name: "Old Inn Bandipur",
    city: "Bandipur",
    starRating: 3,
    category: "heritage",
    address: "Bandipur Bazaar, Bandipur",
    description:
      "The Old Inn occupies a 200-year-old Newari trading house, lovingly restored with traditional materials, and is considered one of Nepal's finest heritage stays.",
    amenities: [...HERITAGE_AMENITIES, "Organic Garden", "Village Tours", "Bar"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 40, 55, "Heritage room"),
      makeRate("deluxe", "CP", 60, 78, "Premium heritage room"),
    ],
  },
  {
    name: "Shivapuri Heights Cottage",
    city: "Kathmandu",
    starRating: 3,
    category: "heritage",
    address: "Shivapuri, Kathmandu",
    description:
      "A tranquil hillside retreat on the edge of Shivapuri National Park, offering nature walks, bird watching, and stunning valley views just 45 minutes from Kathmandu.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Nature Trails",
      "Bird Watching",
      "Library",
      "Room Service",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 45, 58, "Cottage room"),
      makeRate("deluxe", "CP", 65, 82, "Valley view cottage"),
    ],
  },
  {
    name: "Nagarkot Farmhouse Resort",
    city: "Nagarkot",
    starRating: 3,
    category: "heritage",
    address: "Nagarkot, Bhaktapur",
    description:
      "A charming farmhouse resort in Nagarkot offering sunrise views over the Himalayas, organic farm-to-table dining, and a peaceful countryside escape.",
    amenities: [
      "WiFi",
      "Restaurant",
      "Garden",
      "Organic Farm",
      "Sunrise Terrace",
      "Nature Trails",
      "Room Service",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 38, 50, "Farmhouse room"),
      makeRate("deluxe", "CP", 55, 70, "Himalayan view room"),
    ],
  },

  // =========================================================================
  // LUMBINI AREA (~4)
  // =========================================================================
  {
    name: "Hotel Kasai",
    city: "Lumbini",
    starRating: 3,
    category: "business",
    address: "Lumbini, Rupandehi",
    description:
      "A clean and reliable hotel in the Lumbini area, Hotel Kasai offers convenient access to the birthplace of Lord Buddha and surrounding monastic sites.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 25, 35, "Standard room"),
      makeRate("deluxe", "CP", 38, 50, "Deluxe room"),
    ],
  },
  {
    name: "Lumbini Buddha Garden",
    city: "Lumbini",
    starRating: 3,
    category: "business",
    address: "Lumbini Garden, Rupandehi",
    description:
      "Set near the sacred gardens, Lumbini Buddha Garden provides tranquil accommodation for pilgrims and visitors exploring the UNESCO World Heritage birthplace of Buddha.",
    amenities: [...BUDGET_AMENITIES, "Garden", "Meditation Hall"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 28, 38, "Garden room"),
      makeRate("deluxe", "CP", 42, 55, "Deluxe garden room"),
    ],
  },
  {
    name: "Buddha Maya Garden Hotel",
    city: "Lumbini",
    starRating: 3,
    category: "business",
    address: "Lumbini, Rupandehi",
    description:
      "The leading hotel in Lumbini, Buddha Maya Garden offers comfortable rooms, pleasant gardens, and is the preferred base for visitors to the sacred site.",
    amenities: [...BUDGET_AMENITIES, "Garden", "Swimming Pool"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 32, 42, "Standard room"),
      makeRate("deluxe", "CP", 48, 62, "Deluxe room"),
    ],
  },
  {
    name: "Lumbini Hokke Hotel",
    city: "Lumbini",
    starRating: 3,
    category: "business",
    address: "Lumbini, Rupandehi",
    description:
      "A Japanese-managed hotel near Lumbini offering clean, minimalist rooms, a Japanese restaurant, and a serene atmosphere catering to Buddhist pilgrims.",
    amenities: [...BUDGET_AMENITIES, "Japanese Restaurant", "Meditation Garden"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "CP", 30, 40, "Japanese-style room"),
      makeRate("deluxe", "CP", 45, 58, "Deluxe room"),
    ],
  },

  // =========================================================================
  // BUDGET / 3-STAR (~14)
  // =========================================================================
  {
    name: "Hotel Marshyangdi",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "A popular Thamel budget hotel with clean rooms, a rooftop restaurant, and a well-connected location ideal for trekkers and budget-conscious travellers.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 18, 25, "Standard room"),
      makeRate("deluxe", "EP", 28, 35, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Encounter Nepal",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "A friendly Thamel hotel offering clean and affordable accommodation with helpful staff, a travel desk, and easy access to trekking outfitters.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 15, 22, "Standard room"),
      makeRate("deluxe", "EP", 25, 33, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Friends Home",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "A warm and welcoming budget hotel in Thamel with a homely atmosphere, rooftop terrace, and rooms ranging from basic to comfortable.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 16, 23, "Standard room"),
      makeRate("deluxe", "EP", 26, 34, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Holy Himalaya",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "A dependable budget option in Thamel with clean rooms, an in-house restaurant, and attentive staff experienced in assisting trekkers and tourists.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 17, 24, "Standard room"),
      makeRate("deluxe", "EP", 27, 35, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Blue Horizon",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "A modern budget hotel in Thamel offering bright, clean rooms with air conditioning and a convenient central location near shops and restaurants.",
    amenities: [...BUDGET_AMENITIES, "Air Conditioning"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 18, 25, "Standard room"),
      makeRate("deluxe", "EP", 28, 36, "Deluxe room"),
    ],
  },
  {
    name: "Thamel Eco Resort",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "An eco-friendly budget hotel in Thamel featuring solar-heated water, waste reduction practices, and comfortable rooms at wallet-friendly rates.",
    amenities: [...BUDGET_AMENITIES, "Solar Water Heating", "Garden"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 16, 22, "Eco room"),
      makeRate("deluxe", "EP", 25, 32, "Deluxe eco room"),
    ],
  },
  {
    name: "Hotel Landmark Pokhara",
    city: "Pokhara",
    starRating: 3,
    category: "budget",
    address: "Lakeside, Pokhara",
    description:
      "A solid budget choice on Pokhara Lakeside with clean rooms, a rooftop restaurant overlooking Phewa Lake, and helpful staff for trek planning.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 15, 22, "Standard room"),
      makeRate("deluxe", "EP", 25, 33, "Lake view room"),
    ],
  },
  {
    name: "Hotel Middle Path",
    city: "Pokhara",
    starRating: 3,
    category: "budget",
    address: "Lakeside, Pokhara",
    description:
      "Hotel Middle Path offers a calm lakeside retreat with garden seating, clean rooms, and a philosophy of balanced, sustainable hospitality.",
    amenities: [...BUDGET_AMENITIES, "Garden"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 16, 23, "Garden room"),
      makeRate("deluxe", "EP", 26, 35, "Deluxe room"),
    ],
  },
  {
    name: "Pokhara Village Resort",
    city: "Pokhara",
    starRating: 3,
    category: "budget",
    address: "Lakeside, Pokhara",
    description:
      "A village-themed budget resort on Pokhara Lakeside with traditional Nepali-style cottages, a garden, and mountain views from the rooftop terrace.",
    amenities: [...BUDGET_AMENITIES, "Garden", "Rooftop Terrace"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 18, 25, "Village cottage"),
      makeRate("deluxe", "EP", 28, 36, "Deluxe cottage"),
    ],
  },
  {
    name: "Hotel Sacred Valley",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "A quiet budget hotel tucked in a side lane of Thamel, Hotel Sacred Valley offers peaceful rooms away from the main street noise with friendly service.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 15, 21, "Standard room"),
      makeRate("deluxe", "EP", 24, 32, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Mountain View",
    city: "Pokhara",
    starRating: 3,
    category: "budget",
    address: "Lakeside, Pokhara",
    description:
      "A budget-friendly hotel in Pokhara Lakeside with mountain views from upper floors, clean rooms, and easy access to boating and paragliding.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 16, 23, "Standard room"),
      makeRate("deluxe", "EP", 26, 34, "Mountain view room"),
    ],
  },
  {
    name: "Hotel Peace Plaza",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "Hotel Peace Plaza provides clean, no-frills accommodation in Thamel with a small restaurant, travel desk, and rooms at competitive rates.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 15, 20, "Standard room"),
      makeRate("deluxe", "EP", 23, 30, "Deluxe room"),
    ],
  },
  {
    name: "Hotel Buddha",
    city: "Kathmandu",
    starRating: 3,
    category: "budget",
    address: "Thamel, Kathmandu",
    description:
      "A well-known Thamel budget hotel offering reliable clean rooms, an in-house restaurant, and a convenient base for exploring Kathmandu Valley.",
    amenities: BUDGET_AMENITIES,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomRates: [
      makeRate("standard", "EP", 17, 24, "Standard room"),
      makeRate("deluxe", "EP", 27, 35, "Deluxe room"),
    ],
  },
];

// ---------------------------------------------------------------------------
// Destination lookup cache
// ---------------------------------------------------------------------------

// Map hotel city names to destination city names in the DB.
// Some seed hotels use shorthand that may differ from what's in the destinations table.
const CITY_MAP: Record<string, string> = {
  Kathmandu: "Kathmandu",
  Pokhara: "Pokhara",
  Chitwan: "Chitwan",
  Bardia: "Bardia",
  Lumbini: "Lumbini",
  Bhaktapur: "Bhaktapur",
  Dhulikhel: "Dhulikhel",
  Bandipur: "Bandipur",
  Nagarkot: "Nagarkot",
  "Namche Bazaar": "Namche Bazaar",
  Lukla: "Lukla",
};

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

export async function seedNepalHotels(): Promise<{
  hotelsUpserted: number;
  roomRatesInserted: number;
  errors: string[];
}> {
  console.log("🏨 Starting Nepal hotel seed...");

  // 1. Build destination lookup (city → id)
  const allDestinations = await db
    .select({ id: destinations.id, city: destinations.city, country: destinations.country })
    .from(destinations)
    .where(eq(destinations.country, "Nepal"));

  const destMap = new Map<string, number>();
  for (const d of allDestinations) {
    if (d.city) {
      destMap.set(d.city.toLowerCase(), d.id);
    }
  }

  console.log(`  Found ${destMap.size} Nepal destinations in DB`);

  // 2. If destinations are missing, create them
  const neededCities = [...new Set(NEPAL_HOTELS.map((h) => h.city))];
  for (const city of neededCities) {
    const mapped = CITY_MAP[city] || city;
    if (!destMap.has(mapped.toLowerCase())) {
      console.log(`  Creating missing destination: ${mapped}, Nepal`);
      const [created] = await db
        .insert(destinations)
        .values({
          country: "Nepal",
          city: mapped,
          region: getRegion(city),
          description: `${mapped}, Nepal`,
          isActive: true,
        })
        .returning({ id: destinations.id });
      destMap.set(mapped.toLowerCase(), created.id);
    }
  }

  // 3. Upsert hotels and their room rates
  let hotelsUpserted = 0;
  let roomRatesInserted = 0;
  const errors: string[] = [];

  for (const hotel of NEPAL_HOTELS) {
    try {
      const cityKey = (CITY_MAP[hotel.city] || hotel.city).toLowerCase();
      const destId = destMap.get(cityKey);
      if (!destId) {
        errors.push(`No destination found for city: ${hotel.city}`);
        continue;
      }

      // Check if hotel exists
      const existing = await db
        .select({ id: hotels.id })
        .from(hotels)
        .where(eq(hotels.name, hotel.name));

      let hotelId: number;

      const hotelData = {
        name: hotel.name,
        destinationId: destId,
        starRating: hotel.starRating,
        category: hotel.category,
        address: hotel.address,
        description: hotel.description,
        amenities: hotel.amenities,
        checkInTime: hotel.checkInTime,
        checkOutTime: hotel.checkOutTime,
        images: [],
        isActive: true,
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        // Update existing hotel
        await db
          .update(hotels)
          .set(hotelData)
          .where(eq(hotels.id, existing[0].id));
        hotelId = existing[0].id;
      } else {
        // Insert new hotel
        const [inserted] = await db
          .insert(hotels)
          .values(hotelData)
          .returning({ id: hotels.id });
        hotelId = inserted.id;
      }

      hotelsUpserted++;

      // Delete existing room rates, then insert fresh ones
      await db.delete(hotelRoomRates).where(eq(hotelRoomRates.hotelId, hotelId));

      const rateRows = hotel.roomRates.map((r) => ({
        hotelId,
        roomType: r.roomType,
        mealPlan: r.mealPlan,
        costSingle: r.costSingle,
        costDouble: r.costDouble,
        costTriple: r.costTriple,
        costExtraBed: r.costExtraBed,
        costChildWithBed: r.costChildWithBed,
        costChildNoBed: r.costChildNoBed,
        sellSingle: r.sellSingle,
        sellDouble: r.sellDouble,
        sellTriple: r.sellTriple,
        sellExtraBed: r.sellExtraBed,
        sellChildWithBed: r.sellChildWithBed,
        sellChildNoBed: r.sellChildNoBed,
        marginPercent: "50.00",
        currency: "USD",
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
        inclusions: r.inclusions,
        exclusions: r.exclusions,
        vatPercent: "13.00",
        serviceChargePercent: "10.00",
        notes: r.notes,
        isActive: true,
      }));

      if (rateRows.length > 0) {
        await db.insert(hotelRoomRates).values(rateRows);
        roomRatesInserted += rateRows.length;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Error seeding "${hotel.name}": ${msg}`);
      console.error(`  Error seeding "${hotel.name}":`, msg);
    }
  }

  console.log(
    `✅ Nepal hotel seed complete: ${hotelsUpserted} hotels, ${roomRatesInserted} room rates`
  );
  if (errors.length > 0) {
    console.warn(`  ⚠️ ${errors.length} errors encountered`);
  }

  return { hotelsUpserted, roomRatesInserted, errors };
}

// ---------------------------------------------------------------------------
// Helper – map cities to regions
// ---------------------------------------------------------------------------

function getRegion(city: string): string {
  const regionMap: Record<string, string> = {
    Kathmandu: "Bagmati",
    Pokhara: "Gandaki",
    Chitwan: "Narayani",
    Bardia: "Bheri",
    Lumbini: "Lumbini",
    Bhaktapur: "Bagmati",
    Dhulikhel: "Bagmati",
    Bandipur: "Gandaki",
    Nagarkot: "Bagmati",
    "Namche Bazaar": "Khumbu",
    Lukla: "Khumbu",
  };
  return regionMap[city] || "Nepal";
}
