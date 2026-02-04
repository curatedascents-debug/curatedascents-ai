import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  decimal, 
  integer, 
  boolean,
  jsonb,
  date,
  pgEnum
} from 'drizzle-orm/pg-core';

// ============================================
// ENUMS
// ============================================

export const mealPlanEnum = pgEnum('meal_plan', [
  'EP',      // European Plan (Room Only)
  'CP',      // Continental Plan (Bed & Breakfast)
  'MAP',     // Modified American Plan (Breakfast + Dinner)
  'AP',      // American Plan (All Meals)
  'AI'       // All Inclusive
]);

export const roomTypeEnum = pgEnum('room_type', [
  'standard',
  'deluxe', 
  'superior',
  'premium',
  'suite',
  'villa'
]);

export const vehicleTypeEnum = pgEnum('vehicle_type', [
  'sedan',
  'suv',
  'hiace',
  'coaster',
  'bus',
  'land_cruiser',
  '4wd'
]);

export const guideTypeEnum = pgEnum('guide_type', [
  'city',
  'trekking',
  'mountaineering',
  'cultural',
  'naturalist'
]);

export const packageTypeEnum = pgEnum('package_type', [
  'fixed_departure_trek',
  'expedition',
  'tibet_tour',
  'bhutan_program',
  'india_program',
  'multi_country'
]);

// ============================================
// AGENCY/MULTI-TENANT TABLES
// ============================================

export const agencyStatusEnum = pgEnum('agency_status', [
  'pending',
  'active',
  'suspended'
]);

export const agencyUserRoleEnum = pgEnum('agency_user_role', [
  'owner',
  'admin',
  'agent',
  'viewer'
]);

export const agencies = pgTable('agencies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logo: text('logo'),
  primaryColor: text('primary_color').default('#3b82f6'),
  secondaryColor: text('secondary_color').default('#1e293b'),
  accentColor: text('accent_color').default('#60a5fa'),

  defaultMarginPercent: decimal('default_margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  miceMarginPercent: decimal('mice_margin_percent', { precision: 5, scale: 2 }).default('35.00'),
  currency: text('currency').default('USD'),

  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  country: text('country'),

  status: text('status').default('pending'),
  canAccessAllSuppliers: boolean('can_access_all_suppliers').default(false),
  maxUsers: integer('max_users').default(5),

  settings: jsonb('settings'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencyUsers = pgTable('agency_users', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').references(() => agencies.id).notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  phone: text('phone'),

  role: text('role').default('agent'),
  permissions: jsonb('permissions'),

  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencySuppliers = pgTable('agency_suppliers', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').references(() => agencies.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),

  marginOverridePercent: decimal('margin_override_percent', { precision: 5, scale: 2 }),
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }),

  isActive: boolean('is_active').default(true),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow(),
});

export const agencyMarginOverrides = pgTable('agency_margin_overrides', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').references(() => agencies.id).notNull(),

  serviceType: text('service_type'),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  destinationId: integer('destination_id').references(() => destinations.id),

  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).notNull(),

  validFrom: date('valid_from'),
  validTo: date('valid_to'),

  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// SUPPLIER PORTAL TABLES
// ============================================

export const supplierUserRoleEnum = pgEnum('supplier_user_role', [
  'owner',
  'admin',
  'staff',
  'viewer'
]);

export const supplierUsers = pgTable('supplier_users', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  phone: text('phone'),

  role: text('role').default('staff'),
  permissions: jsonb('permissions'),

  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// CORE TABLES
// ============================================

// Contact Person Type (for JSONB array):
// {
//   name: string,
//   designation: string,  // e.g., "General Manager", "Reservation Manager"
//   department: string,   // e.g., "Sales", "Reservations", "Operations"
//   email: string,
//   phoneBusiness: string,
//   phoneMobile: string,
//   phoneWhatsapp: string,
//   isPrimary: boolean
// }

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type'), // hotel, transport, adventure_company, airline, helicopter, dmc, etc.
  country: text('country'),
  city: text('city'),
  
  // Multiple Contact Persons (JSONB array)
  // Each contact: { name, designation, department, email, phoneBusiness, phoneMobile, phoneWhatsapp, isPrimary }
  contacts: jsonb('contacts'),
  
  // Department Emails (Internal Only - Never expose to frontend)
  salesEmail: text('sales_email'),
  reservationEmail: text('reservation_email'),
  accountsEmail: text('accounts_email'),
  operationsEmail: text('operations_email'),
  
  // Main Phone Numbers (Internal Only)
  phoneMain: text('phone_main'),
  phoneSales: text('phone_sales'),
  phoneReservation: text('phone_reservation'),
  phoneEmergency: text('phone_emergency'),
  phoneWhatsapp: text('phone_whatsapp'),
  
  // Online Presence
  website: text('website'),
  bookingPortal: text('booking_portal'),
  
  // Address
  address: text('address'),
  postalCode: text('postal_code'),
  
  // Banking Details (For Payments - Highly Confidential)
  bankName: text('bank_name'),
  bankBranch: text('bank_branch'),
  bankAccountName: text('bank_account_name'),
  bankAccountNumber: text('bank_account_number'),
  bankSwiftCode: text('bank_swift_code'),
  bankIban: text('bank_iban'),
  
  // Payment Terms
  paymentTerms: text('payment_terms'),
  creditLimit: decimal('credit_limit', { precision: 12, scale: 2 }),
  currency: text('currency').default('USD'),
  
  // Contract Info
  contractStartDate: date('contract_start_date'),
  contractEndDate: date('contract_end_date'),
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }),
  
  // Internal Notes
  notes: text('notes'),
  internalRemarks: text('internal_remarks'),
  
  // Rating (Internal assessment)
  reliabilityRating: integer('reliability_rating'),
  qualityRating: integer('quality_rating'),
  valueRating: integer('value_rating'),
  
  isActive: boolean('is_active').default(true),
  isPreferred: boolean('is_preferred').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  country: text('country').notNull(),
  region: text('region'),
  city: text('city'),
  description: text('description'),
  altitude: integer('altitude'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const seasons = pgTable('seasons', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country'),
  startMonth: integer('start_month'),
  endMonth: integer('end_month'),
  priceMultiplier: decimal('price_multiplier', { precision: 3, scale: 2 }).default('1.00'),
  description: text('description'),
});

// ============================================
// SERVICE TABLE 1: HOTELS
// ============================================

export const hotels = pgTable('hotels', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  name: text('name').notNull(),
  destinationId: integer('destination_id').references(() => destinations.id),
  starRating: integer('star_rating'),
  category: text('category'),
  address: text('address'),
  description: text('description'),
  amenities: jsonb('amenities'),
  checkInTime: text('check_in_time'),
  checkOutTime: text('check_out_time'),
  images: jsonb('images'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const hotelRoomRates = pgTable('hotel_room_rates', {
  id: serial('id').primaryKey(),
  hotelId: integer('hotel_id').references(() => hotels.id).notNull(),
  roomType: text('room_type').notNull(),
  mealPlan: text('meal_plan').notNull(),
  
  costSingle: decimal('cost_single', { precision: 10, scale: 2 }),
  costDouble: decimal('cost_double', { precision: 10, scale: 2 }),
  costTriple: decimal('cost_triple', { precision: 10, scale: 2 }),
  costExtraBed: decimal('cost_extra_bed', { precision: 10, scale: 2 }),
  costChildWithBed: decimal('cost_child_with_bed', { precision: 10, scale: 2 }),
  costChildNoBed: decimal('cost_child_no_bed', { precision: 10, scale: 2 }),
  
  sellSingle: decimal('sell_single', { precision: 10, scale: 2 }),
  sellDouble: decimal('sell_double', { precision: 10, scale: 2 }),
  sellTriple: decimal('sell_triple', { precision: 10, scale: 2 }),
  sellExtraBed: decimal('sell_extra_bed', { precision: 10, scale: 2 }),
  sellChildWithBed: decimal('sell_child_with_bed', { precision: 10, scale: 2 }),
  sellChildNoBed: decimal('sell_child_no_bed', { precision: 10, scale: 2 }),
  
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  currency: text('currency').default('USD'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  seasonId: integer('season_id').references(() => seasons.id),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  vatPercent: decimal('vat_percent', { precision: 5, scale: 2 }).default('13.00'),
  serviceChargePercent: decimal('service_charge_percent', { precision: 5, scale: 2 }).default('10.00'),
  
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 2: TRANSPORTATION
// ============================================

export const transportation = pgTable('transportation', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  vehicleType: text('vehicle_type').notNull(),
  vehicleName: text('vehicle_name'),
  capacity: integer('capacity'),
  
  routeFrom: text('route_from'),
  routeTo: text('route_to'),
  routeDescription: text('route_description'),
  distanceKm: integer('distance_km'),
  durationHours: decimal('duration_hours', { precision: 4, scale: 1 }),
  
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sellPrice: decimal('sell_price', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  priceType: text('price_type').default('per_vehicle'),
  currency: text('currency').default('USD'),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 3: PERMITS & FEES
// ============================================

export const permitsFees = pgTable('permits_fees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  country: text('country'),
  region: text('region'),
  applicableTo: text('applicable_to'),
  
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sellPrice: decimal('sell_price', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  priceType: text('price_type').default('per_person'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  
  description: text('description'),
  requiredDocuments: text('required_documents'),
  processingTime: text('processing_time'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 4: GUIDES
// ============================================

export const guides = pgTable('guides', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  guideType: text('guide_type').notNull(),
  destination: text('destination'),
  
  licenseNumber: text('license_number'),
  languages: jsonb('languages'),
  specializations: jsonb('specializations'),
  experienceYears: integer('experience_years'),
  
  costPerDay: decimal('cost_per_day', { precision: 10, scale: 2 }),
  sellPerDay: decimal('sell_per_day', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  currency: text('currency').default('USD'),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  maxGroupSize: integer('max_group_size'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 5: PORTERS
// ============================================

export const porters = pgTable('porters', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  region: text('region'),
  
  maxWeightKg: integer('max_weight_kg'),
  
  costPerDay: decimal('cost_per_day', { precision: 10, scale: 2 }),
  sellPerDay: decimal('sell_per_day', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  currency: text('currency').default('USD'),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 6: DOMESTIC FLIGHTS
// ============================================

export const flightsDomestic = pgTable('flights_domestic', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  airlineName: text('airline_name').notNull(),
  flightSector: text('flight_sector').notNull(),
  departureCity: text('departure_city'),
  arrivalCity: text('arrival_city'),
  
  flightDuration: text('flight_duration'),
  baggageAllowanceKg: integer('baggage_allowance_kg'),
  aircraftType: text('aircraft_type'),
  
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sellPrice: decimal('sell_price', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  currency: text('currency').default('USD'),
  fareClass: text('fare_class').default('economy'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  seasonId: integer('season_id').references(() => seasons.id),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 7: HELICOPTER - SHARING
// ============================================

export const helicopterSharing = pgTable('helicopter_sharing', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  routeName: text('route_name').notNull(),
  routeFrom: text('route_from'),
  routeTo: text('route_to'),
  
  flightDuration: text('flight_duration'),
  helicopterType: text('helicopter_type'),
  seatsAvailable: integer('seats_available'),
  minPassengers: integer('min_passengers'),
  
  costPerSeat: decimal('cost_per_seat', { precision: 10, scale: 2 }),
  sellPerSeat: decimal('sell_per_seat', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  currency: text('currency').default('USD'),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 8: HELICOPTER - CHARTER
// ============================================

export const helicopterCharter = pgTable('helicopter_charter', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  routeName: text('route_name').notNull(),
  routeFrom: text('route_from'),
  routeTo: text('route_to'),
  
  flightDuration: text('flight_duration'),
  helicopterType: text('helicopter_type'),
  maxPassengers: integer('max_passengers'),
  maxPayloadKg: integer('max_payload_kg'),
  
  costPerCharter: decimal('cost_per_charter', { precision: 10, scale: 2 }),
  sellPerCharter: decimal('sell_per_charter', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  currency: text('currency').default('USD'),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 9: MISCELLANEOUS SERVICES
// ============================================

export const miscellaneousServices = pgTable('miscellaneous_services', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  name: text('name').notNull(),
  category: text('category').notNull(),
  destination: text('destination'),
  
  description: text('description'),
  duration: text('duration'),
  capacity: integer('capacity'),
  minParticipants: integer('min_participants'),
  
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sellPrice: decimal('sell_price', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  priceType: text('price_type').default('per_person'),
  currency: text('currency').default('USD'),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE TABLE 10: PACKAGED PROGRAMS
// ============================================

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  name: text('name').notNull(),
  packageType: text('package_type').notNull(),
  country: text('country'),
  region: text('region'),
  
  durationDays: integer('duration_days'),
  durationNights: integer('duration_nights'),
  difficulty: text('difficulty'),
  maxAltitude: integer('max_altitude'),
  groupSizeMin: integer('group_size_min'),
  groupSizeMax: integer('group_size_max'),
  
  itinerarySummary: text('itinerary_summary'),
  itineraryDetailed: jsonb('itinerary_detailed'),
  
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sellPrice: decimal('sell_price', { precision: 10, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }).default('50.00'),
  priceType: text('price_type').default('per_person'),
  currency: text('currency').default('USD'),
  
  pricingTiers: jsonb('pricing_tiers'),
  singleSupplement: decimal('single_supplement', { precision: 10, scale: 2 }),
  
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  
  departureDates: jsonb('departure_dates'),
  isFixedDeparture: boolean('is_fixed_departure').default(false),
  
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// BUSINESS TABLES
// ============================================

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').references(() => agencies.id),
  email: text('email').unique().notNull(),
  name: text('name'),
  phone: text('phone'),
  country: text('country'),
  preferences: jsonb('preferences'),
  conversationHistory: jsonb('conversation_history'),
  source: text('source'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').references(() => agencies.id),
  agencyUserId: integer('agency_user_id').references(() => agencyUsers.id),
  clientId: integer('client_id').references(() => clients.id),
  quoteNumber: text('quote_number').unique(),
  quoteName: text('quote_name'),
  destination: text('destination'),
  pdfUrl: text('pdf_url'),

  startDate: date('start_date'),
  endDate: date('end_date'),
  numberOfPax: integer('number_of_pax'),
  numberOfRooms: integer('number_of_rooms'),

  totalSellPrice: decimal('total_sell_price', { precision: 12, scale: 2 }),
  perPersonPrice: decimal('per_person_price', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),

  totalCostPrice: decimal('total_cost_price', { precision: 12, scale: 2 }),
  totalMargin: decimal('total_margin', { precision: 12, scale: 2 }),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }),

  isMICE: boolean('is_mice').default(false),

  status: text('status').default('draft'),
  validUntil: date('valid_until'),

  inclusionsSummary: text('inclusions_summary'),
  exclusionsSummary: text('exclusions_summary'),
  termsConditions: text('terms_conditions'),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const quoteItems = pgTable('quote_items', {
  id: serial('id').primaryKey(),
  quoteId: integer('quote_id').references(() => quotes.id).notNull(),
  
  serviceType: text('service_type').notNull(),
  serviceId: integer('service_id'),
  serviceName: text('service_name'),
  
  description: text('description'),
  quantity: integer('quantity'),
  days: integer('days'),
  nights: integer('nights'),
  
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sellPrice: decimal('sell_price', { precision: 10, scale: 2 }),
  margin: decimal('margin', { precision: 10, scale: 2 }),
  
  currency: text('currency').default('USD'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Operations status enum for bookings
export const operationsStatusEnum = pgEnum('operations_status', [
  'pending',
  'suppliers_contacted',
  'all_confirmed',
  'ready'
]);

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').references(() => agencies.id),
  quoteId: integer('quote_id').references(() => quotes.id),
  clientId: integer('client_id').references(() => clients.id),
  bookingReference: text('booking_reference').unique(),

  status: text('status').default('confirmed'),
  paymentStatus: text('payment_status').default('pending'),

  // Trip dates
  startDate: date('start_date'),
  endDate: date('end_date'),

  // Payment deadlines
  depositDeadline: date('deposit_deadline'),
  balanceDeadline: date('balance_deadline'),

  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }),
  balanceAmount: decimal('balance_amount', { precision: 12, scale: 2 }),
  currency: text('currency').default('USD'),

  // Operations tracking
  operationsStatus: text('operations_status').default('pending'),
  supplierConfirmations: jsonb('supplier_confirmations'),
  operationsNotes: text('operations_notes'),

  // Client info
  specialRequests: text('special_requests'),
  emergencyContact: jsonb('emergency_contact'), // { name, phone, relationship }

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// BOOKING OPERATIONS TABLES
// ============================================

// Audit trail for all booking activities
export const bookingEventTypeEnum = pgEnum('booking_event_type', [
  'created',
  'status_changed',
  'payment_received',
  'supplier_confirmed',
  'briefing_sent',
  'reminder_sent',
  'note_added'
]);

export const bookingEvents = pgTable('booking_events', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).notNull(),
  eventType: text('event_type').notNull(), // Uses bookingEventTypeEnum values
  eventData: jsonb('event_data'), // Additional data specific to event type
  performedBy: text('performed_by'), // 'system', 'admin', user email, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// Payment schedule tracking
export const paymentMilestoneStatusEnum = pgEnum('payment_milestone_status', [
  'pending',
  'paid',
  'overdue',
  'cancelled'
]);

export const paymentMilestones = pgTable('payment_milestones', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).notNull(),
  milestoneType: text('milestone_type').notNull(), // 'deposit', 'balance', 'custom'
  description: text('description'),

  // Expected amounts
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }), // e.g., 30.00 for 30%

  // Dates
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),

  // Actual payment
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }),

  status: text('status').default('pending'), // pending, paid, overdue, cancelled

  // Reminders tracking
  reminderSentAt: timestamp('reminder_sent_at'),
  reminderCount: integer('reminder_count').default(0),

  currency: text('currency').default('USD'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Per-service supplier confirmation tracking
export const supplierConfirmationStatusEnum = pgEnum('supplier_confirmation_status', [
  'pending',
  'sent',
  'confirmed',
  'declined',
  'cancelled'
]);

export const supplierConfirmationRequests = pgTable('supplier_confirmation_requests', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  quoteItemId: integer('quote_item_id').references(() => quoteItems.id),

  // Service info (denormalized for easier querying)
  serviceType: text('service_type').notNull(),
  serviceName: text('service_name').notNull(),
  serviceDetails: jsonb('service_details'), // Room type, dates, quantities, etc.

  // Confirmation tracking
  status: text('status').default('pending'), // pending, sent, confirmed, declined, cancelled
  confirmationNumber: text('confirmation_number'),

  // Timestamps
  requestedAt: timestamp('requested_at'),
  sentAt: timestamp('sent_at'),
  confirmedAt: timestamp('confirmed_at'),

  // Notes
  responseNotes: text('response_notes'), // Notes from supplier
  internalNotes: text('internal_notes'), // Internal admin notes

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Pre-departure trip briefings
export const tripBriefingTypeEnum = pgEnum('trip_briefing_type', [
  '7_day',
  '24_hour',
  'custom'
]);

export const tripBriefings = pgTable('trip_briefings', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).notNull(),
  briefingType: text('briefing_type').notNull(), // '7_day', '24_hour', 'custom'

  // Content
  content: jsonb('content'), // Structured briefing content
  pdfUrl: text('pdf_url'), // Generated PDF URL

  // Status
  sentAt: timestamp('sent_at'),
  viewedAt: timestamp('viewed_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// SEQUENCE TABLES
// ============================================

export const bookingSequence = pgTable('booking_sequence', {
  id: serial('id').primaryKey(),
  year: integer('year').unique().notNull(),
  lastNumber: integer('last_number').default(0).notNull(),
});

// ============================================
// EMAIL LOGS
// ============================================

export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').references(() => agencies.id),

  // Recipient info
  toEmail: text('to_email').notNull(),
  toName: text('to_name'),

  // Email details
  subject: text('subject').notNull(),
  templateType: text('template_type').notNull(), // e.g., 'quote_sent', 'booking_confirmation', 'payment_received', 'welcome', 'admin_notification', 'payment_reminder'

  // Related entities
  clientId: integer('client_id').references(() => clients.id),
  quoteId: integer('quote_id').references(() => quotes.id),
  bookingId: integer('booking_id').references(() => bookings.id),

  // Status tracking
  status: text('status').default('pending').notNull(), // 'pending', 'sent', 'failed'
  resendId: text('resend_id'), // ID returned from Resend API
  errorMessage: text('error_message'),

  // Metadata
  metadata: jsonb('metadata'), // Additional data like payment amount, etc.

  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// LEAD INTELLIGENCE TABLES
// ============================================

// Lead status enum
export const leadStatusEnum = pgEnum('lead_status', [
  'new',           // Just captured, no engagement analysis yet
  'browsing',      // Low intent - just exploring
  'comparing',     // Medium intent - comparing options
  'interested',    // High intent - actively interested
  'ready_to_book', // Very high intent - ready to convert
  'qualified',     // HNW or priority lead
  'converted',     // Converted to booking
  'lost',          // Did not convert
  'dormant'        // No activity for extended period
]);

// Lead scores and intelligence
export const leadScores = pgTable('lead_scores', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull().unique(),

  // Current score (0-100)
  currentScore: integer('current_score').default(0).notNull(),
  status: text('status').default('new').notNull(), // lead_status enum values

  // Score components (for transparency)
  budgetSignalScore: integer('budget_signal_score').default(0),
  timelineScore: integer('timeline_score').default(0),
  engagementScore: integer('engagement_score').default(0),
  intentScore: integer('intent_score').default(0),

  // Detected signals
  detectedBudget: decimal('detected_budget', { precision: 12, scale: 2 }),
  budgetCurrency: text('budget_currency'),
  detectedTravelDates: jsonb('detected_travel_dates'), // { start: Date, end: Date }
  detectedDestinations: jsonb('detected_destinations'), // string[]
  detectedPax: integer('detected_pax'),

  // Engagement metrics
  totalConversations: integer('total_conversations').default(0),
  totalMessages: integer('total_messages').default(0),
  quotesRequested: integer('quotes_requested').default(0),
  quotesReceived: integer('quotes_received').default(0),
  emailsOpened: integer('emails_opened').default(0),
  linksClicked: integer('links_clicked').default(0),

  // Activity tracking
  firstActivityAt: timestamp('first_activity_at'),
  lastActivityAt: timestamp('last_activity_at'),
  lastConversationAt: timestamp('last_conversation_at'),

  // Re-engagement tracking
  reengagementSentAt: timestamp('reengagement_sent_at'),
  reengagementCount: integer('reengagement_count').default(0),

  // HNW flags
  isHighValue: boolean('is_high_value').default(false),
  requiresHumanHandoff: boolean('requires_human_handoff').default(false),
  handoffReason: text('handoff_reason'),

  // Attribution
  source: text('source'), // chat, referral, organic, paid, etc.
  campaign: text('campaign'),
  referredBy: integer('referred_by').references(() => clients.id),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Lead events - tracks all scoring events
export const leadEvents = pgTable('lead_events', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),

  // Event details
  eventType: text('event_type').notNull(), // budget_mentioned, dates_mentioned, quote_requested, email_opened, etc.
  eventData: jsonb('event_data'), // { amount: 10000, currency: 'USD' } or { dates: {...} }

  // Score impact
  scoreChange: integer('score_change').default(0), // Points added/removed
  scoreBefore: integer('score_before'),
  scoreAfter: integer('score_after'),

  // Source of event
  source: text('source'), // chat, email, website, admin
  conversationId: text('conversation_id'), // If from chat

  createdAt: timestamp('created_at').defaultNow(),
});

// Nurture sequences - predefined email campaigns
export const nurtureSequences = pgTable('nurture_sequences', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),

  // Trigger conditions
  triggerType: text('trigger_type').notNull(), // new_lead, abandoned_conversation, post_quote, post_inquiry
  triggerConditions: jsonb('trigger_conditions'), // { minScore: 20, maxScore: 60, daysInactive: 2 }

  // Sequence config
  emails: jsonb('emails').notNull(), // Array of { dayOffset: 0, subject, templateId, conditions }
  totalEmails: integer('total_emails').default(0),

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Nurture enrollments - tracks client enrollment in sequences
export const nurtureEnrollments = pgTable('nurture_enrollments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  sequenceId: integer('sequence_id').references(() => nurtureSequences.id).notNull(),

  // Progress tracking
  currentStep: integer('current_step').default(0), // Index in emails array
  status: text('status').default('active').notNull(), // active, completed, paused, cancelled

  // Email tracking
  emailsSent: integer('emails_sent').default(0),
  emailsOpened: integer('emails_opened').default(0),
  linksClicked: integer('links_clicked').default(0),

  // Scheduling
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  nextEmailAt: timestamp('next_email_at'),
  lastEmailSentAt: timestamp('last_email_sent_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: text('cancel_reason'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
