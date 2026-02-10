import { faker } from '@faker-js/faker';

// Seed faker for reproducible test data (override per test if needed)
faker.seed(42);

// ─── Domain Constants ────────────────────────────────────────────────

const COUNTRIES = ['Nepal', 'Bhutan', 'Tibet', 'India'] as const;

const DESTINATIONS: Record<string, string[]> = {
  Nepal: ['Kathmandu', 'Pokhara', 'Chitwan', 'Lumbini', 'Everest Region', 'Annapurna Region', 'Langtang'],
  Bhutan: ['Paro', 'Thimphu', 'Punakha', 'Bumthang', 'Haa Valley'],
  Tibet: ['Lhasa', 'Shigatse', 'Mount Kailash', 'Namtso Lake', 'Gyantse'],
  India: ['Ladakh', 'Sikkim', 'Darjeeling', 'Rishikesh', 'Varanasi'],
};

const SERVICE_TYPES = [
  'hotel', 'transportation', 'guide', 'porter', 'flight',
  'helicopter_sharing', 'helicopter_charter', 'permit', 'package', 'miscellaneous',
] as const;

const HOTEL_CATEGORIES = ['Luxury', 'Boutique', 'Heritage', 'Business', 'Resort', 'Lodge', 'Budget'] as const;
const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Challenging', 'Extreme'] as const;
const PACKAGE_TYPES = ['trekking', 'cultural', 'adventure', 'wildlife', 'pilgrimage', 'luxury'] as const;
const VEHICLE_TYPES = ['SUV', 'Sedan', 'Bus', 'Minibus', 'Jeep', '4WD'] as const;
const GUIDE_TYPES = ['trekking', 'cultural', 'mountaineering', 'wildlife', 'city'] as const;
const MEAL_PLANS = ['BB', 'HB', 'FB', 'AI', 'RO'] as const;
const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Premium', 'Presidential'] as const;
const LOYALTY_TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const;
const BOOKING_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
const QUOTE_STATUSES = ['draft', 'sent', 'viewed', 'accepted', 'expired', 'rejected'] as const;
const CURRENCIES = ['USD', 'EUR', 'GBP', 'NPR', 'INR', 'AUD', 'CAD', 'JPY', 'CHF'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
}

function futureDate(minDays = 30, maxDays = 180): string {
  return faker.date.future({ years: 0, refDate: new Date(Date.now() + minDays * 86400000) })
    .toISOString().split('T')[0];
}

function pastDate(minDays = 30, maxDays = 365): string {
  return faker.date.past({ years: 1 }).toISOString().split('T')[0];
}

// ─── Factories ───────────────────────────────────────────────────────

export function createDestination(overrides: Partial<ReturnType<typeof createDestination>> = {}) {
  const country = pick(COUNTRIES);
  const city = pick(DESTINATIONS[country]);
  return {
    name: city,
    country,
    region: `${city} Region`,
    description: faker.lorem.paragraph(),
    highlights: faker.lorem.sentences(3),
    bestSeason: pick(['Spring', 'Autumn', 'Winter', 'Summer', 'Year-round']),
    altitude: faker.number.int({ min: 100, max: 8848 }),
    isActive: true,
    ...overrides,
  };
}

export function createCustomerProfile(overrides: Partial<ReturnType<typeof createCustomerProfile>> = {}) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    country: faker.location.country(),
    source: pick(['website', 'referral', 'agency', 'social_media', 'direct']),
    notes: faker.lorem.sentence(),
    preferredCurrency: pick(CURRENCIES),
    travelInterests: pickN(['trekking', 'cultural', 'luxury', 'adventure', 'wildlife', 'photography'], 3),
    ...overrides,
  };
}

export function createHotel(overrides: Partial<ReturnType<typeof createHotel>> = {}) {
  const country = pick(COUNTRIES);
  const destination = pick(DESTINATIONS[country]);
  const stars = faker.number.int({ min: 3, max: 5 });
  return {
    name: `${faker.company.name()} ${pick(['Hotel', 'Resort', 'Lodge', 'Heritage'])}`,
    destination,
    country,
    starRating: stars,
    category: pick(HOTEL_CATEGORIES),
    address: faker.location.streetAddress(),
    description: faker.lorem.paragraph(),
    amenities: pickN(['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Mountain View', 'Garden', 'Room Service'], 5),
    checkInTime: '14:00',
    checkOutTime: '11:00',
    isActive: true,
    ...overrides,
  };
}

export function createHotelRoomRate(hotelId: number, overrides: Partial<ReturnType<typeof createHotelRoomRate>> = {}) {
  return {
    hotelId,
    roomType: pick(ROOM_TYPES),
    mealPlan: pick(MEAL_PLANS),
    costPrice: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
    sellPrice: faker.number.float({ min: 80, max: 800, fractionDigits: 2 }),
    currency: 'USD',
    validFrom: futureDate(0, 30),
    validTo: futureDate(180, 365),
    maxOccupancy: faker.number.int({ min: 1, max: 4 }),
    isActive: true,
    ...overrides,
  };
}

export function createTransportation(overrides: Partial<ReturnType<typeof createTransportation>> = {}) {
  const country = pick(COUNTRIES);
  const destinations = DESTINATIONS[country];
  return {
    vehicleType: pick(VEHICLE_TYPES),
    route: `${pick(destinations)} to ${pick(destinations)}`,
    country,
    costPrice: faker.number.float({ min: 30, max: 300, fractionDigits: 2 }),
    sellPrice: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
    currency: 'USD',
    capacity: faker.number.int({ min: 2, max: 45 }),
    description: faker.lorem.sentence(),
    isActive: true,
    ...overrides,
  };
}

export function createGuide(overrides: Partial<ReturnType<typeof createGuide>> = {}) {
  return {
    name: faker.person.fullName(),
    guideType: pick(GUIDE_TYPES),
    languages: pickN(['English', 'Nepali', 'Hindi', 'Tibetan', 'Dzongkha', 'French', 'German', 'Japanese'], 3),
    experience: faker.number.int({ min: 2, max: 25 }),
    costPerDay: faker.number.float({ min: 30, max: 150, fractionDigits: 2 }),
    sellPerDay: faker.number.float({ min: 50, max: 250, fractionDigits: 2 }),
    currency: 'USD',
    specializations: pickN(['high altitude', 'photography', 'bird watching', 'mountaineering', 'cultural tours'], 2),
    isActive: true,
    ...overrides,
  };
}

export function createPackage(overrides: Partial<ReturnType<typeof createPackage>> = {}) {
  const country = pick(COUNTRIES);
  const packageType = pick(PACKAGE_TYPES);
  const days = faker.number.int({ min: 5, max: 21 });
  return {
    name: `${days}-Day ${country} ${faker.word.adjective()} ${packageType.charAt(0).toUpperCase() + packageType.slice(1)}`,
    packageType,
    country,
    region: pick(DESTINATIONS[country]),
    duration: days,
    difficulty: pick(DIFFICULTY_LEVELS),
    maxGroupSize: faker.number.int({ min: 2, max: 16 }),
    costPrice: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
    sellPrice: faker.number.float({ min: 800, max: 8000, fractionDigits: 2 }),
    currency: 'USD',
    highlights: Array.from({ length: 5 }, () => faker.lorem.sentence()),
    included: pickN(['Accommodation', 'Meals', 'Guide', 'Transport', 'Permits', 'Porter', 'Equipment'], 5),
    excluded: pickN(['International flights', 'Travel insurance', 'Tips', 'Personal expenses', 'Visa fees'], 3),
    itinerary: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: ${faker.lorem.words(4)}`,
      description: faker.lorem.paragraph(),
      altitude: faker.number.int({ min: 100, max: 5500 }),
    })),
    isActive: true,
    ...overrides,
  };
}

export function createItinerary(overrides: Partial<ReturnType<typeof createItinerary>> = {}) {
  const country = pick(COUNTRIES);
  const days = faker.number.int({ min: 7, max: 18 });
  const destinations = DESTINATIONS[country];
  return {
    title: `${country} ${pick(['Explorer', 'Discovery', 'Adventure', 'Heritage', 'Expedition'])} — ${days} Days`,
    country,
    duration: days,
    startDate: futureDate(),
    endDate: futureDate(days + 30, days + 60),
    travelers: faker.number.int({ min: 1, max: 8 }),
    days: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      location: pick(destinations),
      activities: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.lorem.sentence()),
      accommodation: `${faker.company.name()} ${pick(['Hotel', 'Lodge', 'Resort'])}`,
      meals: pick(MEAL_PLANS),
      transfer: i > 0 ? `${pick(VEHICLE_TYPES)} transfer` : 'Airport pickup',
    })),
    ...overrides,
  };
}

export function createQuote(overrides: Partial<ReturnType<typeof createQuote>> = {}) {
  const numServices = faker.number.int({ min: 2, max: 6 });
  return {
    clientId: faker.number.int({ min: 1, max: 100 }),
    status: pick(QUOTE_STATUSES),
    totalAmount: faker.number.float({ min: 1000, max: 15000, fractionDigits: 2 }),
    currency: 'USD',
    validUntil: futureDate(14, 30),
    notes: faker.lorem.sentence(),
    travelers: faker.number.int({ min: 1, max: 8 }),
    startDate: futureDate(),
    duration: faker.number.int({ min: 5, max: 21 }),
    items: Array.from({ length: numServices }, () => ({
      serviceType: pick(SERVICE_TYPES),
      serviceId: faker.number.int({ min: 1, max: 50 }),
      serviceName: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 4 }),
      unitPrice: faker.number.float({ min: 50, max: 2000, fractionDigits: 2 }),
      totalPrice: faker.number.float({ min: 100, max: 4000, fractionDigits: 2 }),
    })),
    ...overrides,
  };
}

export function createBooking(overrides: Partial<ReturnType<typeof createBooking>> = {}) {
  const ref = `CA-${faker.date.recent().getFullYear()}-${faker.string.numeric(3)}`;
  return {
    bookingReference: ref,
    clientId: faker.number.int({ min: 1, max: 100 }),
    quoteId: faker.number.int({ min: 1, max: 50 }),
    status: pick(BOOKING_STATUSES),
    totalAmount: faker.number.float({ min: 2000, max: 20000, fractionDigits: 2 }),
    currency: 'USD',
    startDate: futureDate(),
    endDate: futureDate(30, 60),
    travelers: faker.number.int({ min: 1, max: 8 }),
    specialRequests: faker.lorem.sentence(),
    paymentStatus: pick(['pending', 'partial', 'paid']),
    ...overrides,
  };
}

export function createSupplier(overrides: Partial<ReturnType<typeof createSupplier>> = {}) {
  return {
    name: `${faker.company.name()} ${pick(['Tours', 'Adventures', 'Travels', 'Expeditions'])}`,
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    country: pick(COUNTRIES),
    serviceTypes: pickN(SERVICE_TYPES, faker.number.int({ min: 1, max: 4 })),
    rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
    isActive: true,
    ...overrides,
  };
}

export function createAgencyUser(overrides: Partial<ReturnType<typeof createAgencyUser>> = {}) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    name: `${firstName} ${lastName}`,
    agencyName: `${faker.company.name()} Travel`,
    role: pick(['admin', 'agent', 'viewer']),
    ...overrides,
  };
}

export function createLoyaltyAccount(overrides: Partial<ReturnType<typeof createLoyaltyAccount>> = {}) {
  return {
    clientId: faker.number.int({ min: 1, max: 100 }),
    tier: pick(LOYALTY_TIERS),
    points: faker.number.int({ min: 0, max: 50000 }),
    lifetimePoints: faker.number.int({ min: 0, max: 100000 }),
    lifetimeSpend: faker.number.float({ min: 0, max: 200000, fractionDigits: 2 }),
    ...overrides,
  };
}

export function createChatMessage(role: 'user' | 'assistant' = 'user', overrides: Partial<ReturnType<typeof createChatMessage>> = {}) {
  const userMessages = [
    'I want to trek to Everest Base Camp',
    'What luxury hotels do you have in Kathmandu?',
    'Can you give me a quote for a 10-day Nepal trip?',
    'Tell me about Bhutan trip packages',
    'What permits do I need for the Annapurna Circuit?',
    'I need a helicopter tour to Everest',
    'Book me a cultural tour of the Kathmandu Valley',
    'What are the best destinations for photography?',
    'Do you have group discounts for 6 people?',
    'Convert the price to EUR please',
  ];

  const assistantMessages = [
    'I found several options for your adventure in the Himalayas.',
    'Here are the luxury accommodations available in your destination.',
    'Based on your requirements, here\'s a customized quote.',
    'Great choice! Bhutan offers incredible cultural experiences.',
    'You\'ll need the following permits for your trek.',
  ];

  return {
    role,
    content: role === 'user' ? pick(userMessages) : pick(assistantMessages),
    ...overrides,
  };
}

export function createConversationHistory(turns = 3): Array<{ role: 'user' | 'assistant'; content: string }> {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (let i = 0; i < turns; i++) {
    history.push(createChatMessage('user'));
    history.push(createChatMessage('assistant'));
  }
  return history;
}

// ─── Batch Generators ────────────────────────────────────────────────

export function createMany<T>(factory: (overrides?: Partial<T>) => T, count: number, overrides?: Partial<T>): T[] {
  return Array.from({ length: count }, () => factory(overrides as Partial<T>));
}

// ─── Re-export constants for tests ───────────────────────────────────

export {
  COUNTRIES,
  DESTINATIONS,
  SERVICE_TYPES,
  HOTEL_CATEGORIES,
  DIFFICULTY_LEVELS,
  PACKAGE_TYPES,
  VEHICLE_TYPES,
  MEAL_PLANS,
  ROOM_TYPES,
  LOYALTY_TIERS,
  BOOKING_STATUSES,
  QUOTE_STATUSES,
  CURRENCIES,
};
