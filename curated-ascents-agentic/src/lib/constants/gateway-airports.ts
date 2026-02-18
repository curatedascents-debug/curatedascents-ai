// Gateway airports for Himalayan destinations

export type GatewayCountry = "nepal" | "bhutan" | "india" | "tibet";

export interface GatewayAirport {
  code: string;
  name: string;
  city: string;
  typicalAirlines: string[];
  notes: string;
}

export const GATEWAY_AIRPORTS: Record<GatewayCountry, { airports: GatewayAirport[] }> = {
  nepal: {
    airports: [
      {
        code: "KTM",
        name: "Tribhuvan International Airport",
        city: "Kathmandu",
        typicalAirlines: ["Qatar Airways", "Turkish Airlines", "Himalaya Airlines", "Nepal Airlines", "Air India", "FlyDubai"],
        notes: "Main international gateway to Nepal. Most flights connect via Doha, Istanbul, or Delhi. Direct flights available from select Asian cities.",
      },
    ],
  },
  bhutan: {
    airports: [
      {
        code: "PBH",
        name: "Paro International Airport",
        city: "Paro",
        typicalAirlines: ["Druk Air", "Bhutan Airlines"],
        notes: "One of the world's most challenging airports. Only Druk Air and Bhutan Airlines operate here. Flights from Delhi, Kathmandu, Bangkok, and Singapore.",
      },
    ],
  },
  india: {
    airports: [
      {
        code: "DEL",
        name: "Indira Gandhi International Airport",
        city: "New Delhi",
        typicalAirlines: ["Air India", "Emirates", "Qatar Airways", "British Airways", "Lufthansa", "United Airlines"],
        notes: "Major international hub with global connections. Gateway for North India, Rajasthan, and connecting flights to Kathmandu and Paro.",
      },
      {
        code: "IXB",
        name: "Bagdogra Airport",
        city: "Siliguri",
        typicalAirlines: ["IndiGo", "Air India", "SpiceJet"],
        notes: "Gateway for Darjeeling, Sikkim, and overland entry to Bhutan. Domestic flights from Delhi, Kolkata, and Mumbai.",
      },
    ],
  },
  tibet: {
    airports: [
      {
        code: "LXA",
        name: "Lhasa Gonggar Airport",
        city: "Lhasa",
        typicalAirlines: ["Air China", "Tibet Airlines", "Sichuan Airlines"],
        notes: "At 3,570m elevation — allow time for acclimatization. Flights from Chengdu, Beijing, and Kathmandu. Tibet Travel Permit required.",
      },
    ],
  },
};

export function getPrimaryAirport(country: GatewayCountry): GatewayAirport {
  return GATEWAY_AIRPORTS[country].airports[0];
}
