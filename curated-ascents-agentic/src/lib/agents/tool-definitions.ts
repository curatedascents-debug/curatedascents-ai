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
];
