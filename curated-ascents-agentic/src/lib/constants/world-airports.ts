export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const WORLD_AIRPORTS: Airport[] = [
  // --- Gateway airports (Himalayan destinations) ---
  { code: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal" },
  { code: "PBH", name: "Paro International Airport", city: "Paro", country: "Bhutan" },
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India" },
  { code: "IXB", name: "Bagdogra Airport", city: "Siliguri", country: "India" },
  { code: "LXA", name: "Lhasa Gonggar Airport", city: "Lhasa", country: "China" },

  // --- United States (top 20) ---
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States" },
  { code: "LGA", name: "LaGuardia Airport", city: "New York", country: "United States" },
  { code: "EWR", name: "Newark Liberty International Airport", city: "Newark", country: "United States" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States" },
  { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States" },
  { code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States" },
  { code: "DEN", name: "Denver International Airport", city: "Denver", country: "United States" },
  { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States" },
  { code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States" },
  { code: "MIA", name: "Miami International Airport", city: "Miami", country: "United States" },
  { code: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "United States" },
  { code: "IAD", name: "Washington Dulles International Airport", city: "Washington D.C.", country: "United States" },
  { code: "DCA", name: "Ronald Reagan Washington National Airport", city: "Washington D.C.", country: "United States" },
  { code: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States" },
  { code: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States" },
  { code: "MSP", name: "Minneapolis-Saint Paul International Airport", city: "Minneapolis", country: "United States" },
  { code: "DTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", country: "United States" },
  { code: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States" },
  { code: "SLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "United States" },

  // --- Europe (top 20) ---
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { code: "LGW", name: "Gatwick Airport", city: "London", country: "United Kingdom" },
  { code: "STN", name: "Stansted Airport", city: "London", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { code: "ORY", name: "Orly Airport", city: "Paris", country: "France" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { code: "AMS", name: "Amsterdam Schiphol Airport", city: "Amsterdam", country: "Netherlands" },
  { code: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain" },
  { code: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "Spain" },
  { code: "FCO", name: "Leonardo da Vinci-Fiumicino Airport", city: "Rome", country: "Italy" },
  { code: "MXP", name: "Milan Malpensa Airport", city: "Milan", country: "Italy" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { code: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { code: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", country: "Norway" },
  { code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden" },
  { code: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland" },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland" },

  // --- Middle East (top 8) ---
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates" },
  { code: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "United Arab Emirates" },
  { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },
  { code: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia" },
  { code: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia" },
  { code: "BAH", name: "Bahrain International Airport", city: "Manama", country: "Bahrain" },
  { code: "MCT", name: "Muscat International Airport", city: "Muscat", country: "Oman" },
  { code: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel" },

  // --- Asia (top 15) ---
  { code: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
  { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China" },
  { code: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China" },
  { code: "SIN", name: "Changi Airport", city: "Singapore", country: "Singapore" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia" },
  { code: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines" },
  { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam" },
  { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India" },
  { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India" },

  // --- Oceania (top 5) ---
  { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },
  { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia" },

  // --- Africa (top 5) ---
  { code: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "South Africa" },
  { code: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa" },
  { code: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt" },
  { code: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya" },
  { code: "ADD", name: "Addis Ababa Bole International Airport", city: "Addis Ababa", country: "Ethiopia" },

  // --- South America (top 5) ---
  { code: "GRU", name: "São Paulo-Guarulhos International Airport", city: "São Paulo", country: "Brazil" },
  { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina" },
  { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia" },
  { code: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile" },
  { code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru" },

  // --- Canada ---
  { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada" },
  { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada" },
  { code: "YUL", name: "Montréal-Pierre Elliott Trudeau International Airport", city: "Montreal", country: "Canada" },
];

export const GATEWAY_CODES = new Set(["KTM", "PBH", "DEL", "IXB", "LXA"]);

export function searchAirports(query: string, limit = 8): Airport[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return WORLD_AIRPORTS.filter(
    (a) =>
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  ).slice(0, limit);
}
