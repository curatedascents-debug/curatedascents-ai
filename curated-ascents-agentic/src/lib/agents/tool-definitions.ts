// src/lib/agents/tool-definitions.ts
// Tool definitions for DeepSeek function calling - Updated with fallback research

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "search_rates",
      description: `Search for rates in the database. Use this to find hotels, transportation, guides, porters, flights, helicopters, permits, packages, and miscellaneous services. 
      
      IMPORTANT: If this returns empty results, use your knowledge to provide approximate market rates. Don't say "I don't have information" - instead provide estimates clearly labeled as such.`,
      parameters: {
        type: "object",
        properties: {
          serviceType: {
            type: "string",
            enum: [
              "hotel",
              "transportation",
              "guide",
              "porter",
              "flight",
              "helicopter_sharing",
              "helicopter_charter",
              "permit",
              "package",
              "miscellaneous",
            ],
            description: "Type of service to search for",
          },
          destination: {
            type: "string",
            description: "Location/destination to search (e.g., Kathmandu, Everest Region, Pokhara)",
          },
          category: {
            type: "string",
            description: "Category filter (e.g., luxury, 5-star, trekking, city)",
          },
          maxPrice: {
            type: "number",
            description: "Maximum price filter",
          },
          country: {
            type: "string",
            enum: ["Nepal", "Tibet", "Bhutan", "India"],
            description: "Country to search in",
          },
        },
        required: ["serviceType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_hotels",
      description: `Search for hotels by location, star rating, or category. Returns hotel details with available room rates.
      
      IMPORTANT: If no hotels found, provide approximate market rates for similar properties in that location.`,
      parameters: {
        type: "object",
        properties: {
          destination: {
            type: "string",
            description: "City or region to search (e.g., Kathmandu, Pokhara, Namche)",
          },
          starRating: {
            type: "integer",
            minimum: 1,
            maximum: 5,
            description: "Star rating filter (1-5)",
          },
          category: {
            type: "string",
            enum: ["Luxury", "Boutique", "Heritage", "Business", "Resort", "Lodge", "Budget"],
            description: "Hotel category",
          },
          hotelName: {
            type: "string",
            description: "Search by specific hotel name",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_packages",
      description: `Search for travel packages including treks, tours, and expeditions.
      
      IMPORTANT: If specific package not found, provide approximate pricing based on similar packages.`,
      parameters: {
        type: "object",
        properties: {
          packageType: {
            type: "string",
            enum: [
              "fixed_departure_trek",
              "expedition",
              "tibet_tour",
              "bhutan_program",
              "india_program",
              "multi_country",
            ],
            description: "Type of package",
          },
          country: {
            type: "string",
            enum: ["Nepal", "Tibet", "Bhutan", "India"],
            description: "Country",
          },
          difficulty: {
            type: "string",
            enum: ["Easy", "Moderate", "Challenging", "Extreme"],
            description: "Difficulty level",
          },
          maxDays: {
            type: "integer",
            description: "Maximum number of days",
          },
          region: {
            type: "string",
            description: "Region (e.g., Everest, Annapurna, Langtang)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_quote",
      description: "Calculate a quote for a client based on selected services and number of travelers",
      parameters: {
        type: "object",
        properties: {
          services: {
            type: "array",
            items: {
              type: "object",
              properties: {
                serviceType: {
                  type: "string",
                  description: "Type of service",
                },
                serviceId: {
                  type: "integer",
                  description: "ID of the specific service/rate",
                },
                quantity: {
                  type: "integer",
                  description: "Number of units (rooms, days, etc.)",
                },
                nights: {
                  type: "integer",
                  description: "Number of nights (for hotels)",
                },
              },
              required: ["serviceType", "serviceId"],
            },
            description: "Array of services to include in quote",
          },
          numberOfPax: {
            type: "integer",
            description: "Number of travelers",
          },
          numberOfRooms: {
            type: "integer",
            description: "Number of rooms needed",
          },
          occupancyType: {
            type: "string",
            enum: ["single", "double", "triple"],
            description: "Room occupancy type",
          },
        },
        required: ["services", "numberOfPax"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_destinations",
      description: "Get list of available destinations we cover",
      parameters: {
        type: "object",
        properties: {
          country: {
            type: "string",
            enum: ["Nepal", "Tibet", "Bhutan", "India"],
            description: "Filter by country",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_service_details",
      description: "Get detailed information about a specific service by ID",
      parameters: {
        type: "object",
        properties: {
          serviceType: {
            type: "string",
            enum: [
              "hotel",
              "transportation",
              "guide",
              "porter",
              "flight",
              "helicopter_sharing",
              "helicopter_charter",
              "permit",
              "package",
              "miscellaneous",
            ],
            description: "Type of service",
          },
          serviceId: {
            type: "integer",
            description: "ID of the service",
          },
        },
        required: ["serviceType", "serviceId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_categories",
      description: "Get the list of available service categories/types (hotel, transportation, guide, etc.)",
      parameters: {
        type: "object",
        properties: {
          destination: {
            type: "string",
            description: "Optional destination to filter categories by",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "research_external_rates",
      description: `Use this when a specific hotel, service, or package is NOT found in our database. 
      This provides approximate market rates based on industry knowledge.
      Always clearly label these as ESTIMATES and offer to get confirmed pricing from suppliers.`,
      parameters: {
        type: "object",
        properties: {
          serviceType: {
            type: "string",
            enum: ["hotel", "transportation", "guide", "porter", "flight", "helicopter", "permit", "package", "activity"],
            description: "Type of service to research",
          },
          serviceName: {
            type: "string",
            description: "Name of the specific hotel, service, or package",
          },
          location: {
            type: "string",
            description: "Location (city, region, or country)",
          },
          category: {
            type: "string",
            description: "Category or star rating if applicable (e.g., '5-star', 'luxury', 'budget')",
          },
          additionalContext: {
            type: "string",
            description: "Any additional context about the request",
          },
        },
        required: ["serviceType", "serviceName", "location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_quote",
      description: `Save a quote to the database. Use this when the client confirms they want a quote saved,
      or when you have gathered enough information to create a formal quote.
      The quote will be saved as a draft and can be viewed in the admin dashboard.`,
      parameters: {
        type: "object",
        properties: {
          clientEmail: {
            type: "string",
            description: "Client's email address (used to link to existing client or create new one)",
          },
          clientName: {
            type: "string",
            description: "Client's name",
          },
          quoteName: {
            type: "string",
            description: "Name/title for the quote (e.g., 'Everest Base Camp Trek - March 2025')",
          },
          destination: {
            type: "string",
            description: "Primary destination",
          },
          numberOfPax: {
            type: "integer",
            description: "Number of travelers",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                serviceType: {
                  type: "string",
                  description: "Type of service",
                },
                serviceName: {
                  type: "string",
                  description: "Name of the service",
                },
                description: {
                  type: "string",
                  description: "Description of the service line item",
                },
                quantity: {
                  type: "integer",
                  description: "Quantity",
                },
                sellPrice: {
                  type: "number",
                  description: "Sell price per unit",
                },
              },
              required: ["serviceType", "serviceName", "sellPrice"],
            },
            description: "Array of quote line items",
          },
        },
        required: ["items"],
      },
    },
  },
  // Booking Operations Tools
  {
    type: "function",
    function: {
      name: "get_booking_status",
      description: `Get the status and details of a booking by its reference number.
      Returns booking status, dates, number of travelers, and payment summary (NO cost prices).
      Use this when a client asks about their booking status.`,
      parameters: {
        type: "object",
        properties: {
          bookingReference: {
            type: "string",
            description: "The booking reference number (e.g., CA-2025-0001)",
          },
        },
        required: ["bookingReference"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_payment_schedule",
      description: `Get the payment schedule (milestones) for a booking.
      Returns due dates, amounts, and paid status. Use when a client asks about payment deadlines.`,
      parameters: {
        type: "object",
        properties: {
          bookingReference: {
            type: "string",
            description: "The booking reference number",
          },
        },
        required: ["bookingReference"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "convert_quote_to_booking",
      description: `Convert an accepted quote to a booking. Use this when a client confirms they want to proceed with a quote.
      Returns the new booking reference and confirmation message.`,
      parameters: {
        type: "object",
        properties: {
          quoteNumber: {
            type: "string",
            description: "The quote number to convert (e.g., QT-2025-0001)",
          },
          clientEmail: {
            type: "string",
            description: "Client's email address for confirmation",
          },
        },
        required: ["quoteNumber"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_supplier_confirmations",
      description: `Check the status of supplier confirmations for a booking.
      Returns service names and confirmed/pending status (NO supplier contact details).
      Use when a client asks if their booking services are confirmed.`,
      parameters: {
        type: "object",
        properties: {
          bookingReference: {
            type: "string",
            description: "The booking reference number",
          },
        },
        required: ["bookingReference"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_trip_briefing",
      description: `Get the trip briefing content for a booking.
      Returns client-facing itinerary info, checklist, and travel details.
      Use when a client asks about their trip details or itinerary.`,
      parameters: {
        type: "object",
        properties: {
          bookingReference: {
            type: "string",
            description: "The booking reference number",
          },
        },
        required: ["bookingReference"],
      },
    },
  },
  // Enhanced Expedition Architect Tools
  {
    type: "function",
    function: {
      name: "check_availability",
      description: `Check real-time availability for a service on specific dates.
      Use this before confirming bookings to ensure services are available.
      Returns availability status and alternatives if not available.`,
      parameters: {
        type: "object",
        properties: {
          serviceType: {
            type: "string",
            enum: [
              "hotel",
              "transportation",
              "guide",
              "porter",
              "flight",
              "helicopter_sharing",
              "helicopter_charter",
              "package",
            ],
            description: "Type of service to check",
          },
          serviceId: {
            type: "integer",
            description: "ID of the specific service",
          },
          startDate: {
            type: "string",
            description: "Start date in YYYY-MM-DD format",
          },
          endDate: {
            type: "string",
            description: "End date in YYYY-MM-DD format",
          },
          quantity: {
            type: "integer",
            description: "Number of units needed (e.g., rooms, guides)",
            default: 1,
          },
        },
        required: ["serviceType", "serviceId", "startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "validate_trek_acclimatization",
      description: `Validate a trek itinerary for proper altitude acclimatization.
      Use this when planning treks to ensure the schedule follows safe altitude gain guidelines.
      Returns validation result with issues and recommendations.`,
      parameters: {
        type: "object",
        properties: {
          itinerary: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: {
                  type: "integer",
                  description: "Day number of the trek",
                },
                location: {
                  type: "string",
                  description: "Overnight location name (e.g., Namche Bazaar, Tengboche)",
                },
                overnightAltitude: {
                  type: "integer",
                  description: "Sleeping altitude in meters (optional if location is known)",
                },
              },
              required: ["day", "location"],
            },
            description: "Array of trek days with locations and altitudes",
          },
        },
        required: ["itinerary"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "validate_permits",
      description: `Validate permit requirements and lead times for a destination.
      Use this when planning trips to restricted areas like Tibet, Upper Mustang, or Dolpo.
      Returns required permits and whether they can be obtained in time.`,
      parameters: {
        type: "object",
        properties: {
          destinationRegion: {
            type: "string",
            enum: ["tibet", "everest", "annapurna", "mustang", "dolpo", "manaslu", "bhutan"],
            description: "The destination region requiring permits",
          },
          tripStartDate: {
            type: "string",
            description: "Trip start date in YYYY-MM-DD format",
          },
          nationality: {
            type: "string",
            description: "Traveler's nationality (some permits have nationality restrictions)",
          },
        },
        required: ["destinationRegion", "tripStartDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upsell_suggestions",
      description: `Get contextual upselling suggestions based on the trip and client preferences.
      Use this to suggest relevant add-ons and upgrades to enhance the client's experience.
      Returns prioritized suggestions with descriptions and price ranges.`,
      parameters: {
        type: "object",
        properties: {
          tripType: {
            type: "string",
            description: "Type of trip (e.g., trek, tour, expedition, cultural)",
          },
          destination: {
            type: "string",
            description: "Primary destination",
          },
          currentServices: {
            type: "array",
            items: { type: "string" },
            description: "List of services already included in the trip",
          },
        },
        required: ["tripType", "destination"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "convert_currency",
      description: `Convert a price from one currency to another using real-time exchange rates.
      Use this when a client asks for prices in their preferred currency or mentions a different currency.
      Returns the converted amount with proper formatting.`,
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "The amount to convert",
          },
          fromCurrency: {
            type: "string",
            description: "Source currency code (e.g., USD, EUR)",
            default: "USD",
          },
          toCurrency: {
            type: "string",
            description: "Target currency code (e.g., EUR, GBP, AUD)",
          },
        },
        required: ["amount", "toCurrency"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_supported_currencies",
      description: `Get the list of currencies we support for pricing and payments.
      Use this when a client asks what currencies they can pay in or see prices in.`,
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  // Dynamic Pricing Tools
  {
    type: "function",
    function: {
      name: "get_dynamic_price",
      description: `Calculate the dynamic price for a service considering all applicable pricing rules.
      This applies seasonal adjustments, demand-based pricing, early bird discounts, group discounts, and loyalty discounts.
      Use this when calculating quotes or when clients ask about current pricing.`,
      parameters: {
        type: "object",
        properties: {
          serviceType: {
            type: "string",
            enum: ["hotel", "transportation", "guide", "porter", "flight", "helicopter_sharing", "helicopter_charter", "permit", "package"],
            description: "Type of service",
          },
          serviceId: {
            type: "integer",
            description: "ID of the specific service",
          },
          basePrice: {
            type: "number",
            description: "Base price of the service in USD",
          },
          travelDate: {
            type: "string",
            description: "Travel date in YYYY-MM-DD format",
          },
          paxCount: {
            type: "integer",
            description: "Number of travelers (for group discounts)",
            default: 1,
          },
          loyaltyTier: {
            type: "string",
            enum: ["bronze", "silver", "gold", "platinum"],
            description: "Client's loyalty tier (if applicable)",
          },
        },
        required: ["serviceType", "serviceId", "basePrice", "travelDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_pricing_promotions",
      description: `Check for any active promotions or special pricing for a destination or service type.
      Use this when clients ask about deals, discounts, or special offers.
      Returns information about current seasonal pricing, early bird discounts, and any promotional rules.`,
      parameters: {
        type: "object",
        properties: {
          destination: {
            type: "string",
            description: "Destination to check promotions for (e.g., Everest, Annapurna, Nepal)",
          },
          serviceType: {
            type: "string",
            enum: ["hotel", "transportation", "guide", "flight", "helicopter", "package", "all"],
            description: "Service type to check (use 'all' for all services)",
          },
          travelMonth: {
            type: "string",
            description: "Month of travel (e.g., 'March', 'October')",
          },
        },
        required: ["destination"],
      },
    },
  },

  // Media Library Tool
  {
    type: "function",
    function: {
      name: "search_photos",
      description:
        "Search the CuratedAscents media library for destination photos. Use this whenever you need images for blog posts, itineraries, trip proposals, or visual content. Returns CDN URLs and metadata for matching photos.",
      parameters: {
        type: "object",
        properties: {
          country: {
            type: "string",
            enum: ["nepal", "india", "tibet", "bhutan"],
            description: "Filter by country",
          },
          destination: {
            type: "string",
            description:
              "Filter by destination name (e.g., 'Kathmandu', 'Rajasthan', 'Paro Valley', 'Everest Region', 'Kerala', 'Ladakh', 'Lhasa')",
          },
          category: {
            type: "string",
            enum: [
              "landscape",
              "hotel",
              "trek",
              "culture",
              "food",
              "wildlife",
              "temple",
              "adventure",
              "wellness",
              "people",
              "aerial",
              "luxury",
              "heritage",
            ],
            description: "Filter by photo category",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description:
              "Filter by tags (e.g., ['sunrise', 'mountain', 'luxury']). Photos matching ANY of the tags will be returned.",
          },
          season: {
            type: "string",
            enum: [
              "spring",
              "summer",
              "monsoon",
              "autumn",
              "winter",
              "all",
            ],
            description:
              "Filter by season — use this to match photos to the trip's travel season",
          },
          serviceType: {
            type: "string",
            description:
              "Filter by service type (hotel, trek, helicopter, etc.)",
          },
          featured: {
            type: "boolean",
            description:
              "If true, return only featured/hero-quality photos",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of photos to return (default: 5, max: 20)",
          },
        },
        required: [],
      },
    },
  },
];
