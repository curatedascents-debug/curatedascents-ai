/** Shared test data constants used across all E2E tests */

export const TEST_ADMIN = {
  password: process.env.ADMIN_PASSWORD || 'test-admin-password',
};

export const TEST_AGENCY_USER = {
  email: process.env.TEST_AGENCY_EMAIL || 'test@agency.com',
  password: process.env.TEST_AGENCY_PASSWORD || 'TestAgency123!',
  name: 'Test Agency User',
  agencyName: 'Test Travel Agency',
};

export const TEST_SUPPLIER_USER = {
  email: process.env.TEST_SUPPLIER_EMAIL || 'test@supplier.com',
  password: process.env.TEST_SUPPLIER_PASSWORD || 'TestSupplier123!',
  name: 'Test Supplier User',
  supplierName: 'Test Supplier Co',
};

export const TEST_CUSTOMER = {
  email: process.env.TEST_CUSTOMER_EMAIL || 'test@customer.com',
  name: 'Test Customer',
  clientId: 1,
};

export const ROUTES = {
  // Public
  home: '/',
  blog: '/blog',
  faq: '/faq',
  contact: '/contact',
  privacyPolicy: '/privacy-policy',
  terms: '/terms',

  // Admin
  adminLogin: '/admin/login',
  admin: '/admin',

  // Agency
  agencyLogin: '/agency/login',
  agencyDashboard: '/agency/dashboard',

  // Supplier
  supplierLogin: '/supplier/login',
  supplierDashboard: '/supplier/dashboard',

  // Customer portal
  portalLogin: '/portal/login',
  portal: '/portal',
  portalTrips: '/portal/trips',
  portalQuotes: '/portal/quotes',
  portalLoyalty: '/portal/loyalty',
  portalChat: '/portal/chat',
  portalCurrency: '/portal/currency',
  portalSettings: '/portal/settings',

  // Payment
  paymentSuccess: '/payment/success',
  paymentCancelled: '/payment/cancelled',
};

export const API_ROUTES = {
  chat: '/api/chat',
  personalize: '/api/personalize',
  seedAll: '/api/seed-all',

  // Admin auth
  adminLogin: '/api/admin/auth/login',
  adminLogout: '/api/admin/auth/logout',

  // Admin CRUD
  adminRates: '/api/admin/rates',
  adminSuppliers: '/api/admin/suppliers',
  adminHotels: '/api/admin/hotels',
  adminClients: '/api/admin/clients',
  adminQuotes: '/api/admin/quotes',
  adminBookings: '/api/admin/bookings',
  adminDestinations: '/api/admin/destinations',
  adminAgencies: '/api/admin/agencies',
  adminMedia: '/api/admin/media',
  adminMediaUpload: '/api/admin/media/upload',
  adminMediaStats: '/api/admin/media/stats',
  adminMediaCollections: '/api/admin/media/collections',
  adminBlogAnalytics: '/api/admin/blog/analytics',

  // Pricing
  adminPricingRules: '/api/admin/pricing/rules',
  adminPricingDemand: '/api/admin/pricing/demand',
  adminPricingSimulate: '/api/admin/pricing/simulate',

  // Reports
  adminReports: '/api/admin/reports',
  adminReportsSuppliers: '/api/admin/reports/suppliers',
  adminReportsLeads: '/api/admin/reports/leads',

  // Blog
  blogPosts: '/api/blog/posts',

  // Agency
  agencyLogin: '/api/agency/auth/login',
  agencyLogout: '/api/agency/auth/logout',
  agencyChat: '/api/agency/chat',

  // Supplier
  supplierLogin: '/api/supplier/auth/login',
  supplierLogout: '/api/supplier/auth/logout',
  supplierBookings: '/api/supplier/bookings',
  supplierRates: '/api/supplier/rates',

  // Portal
  portalSendCode: '/api/portal/auth/send-code',
  portalVerifyCode: '/api/portal/auth/verify-code',
  portalLogout: '/api/portal/auth/logout',
  portalDashboard: '/api/portal/dashboard',
  portalBookings: '/api/portal/bookings',
  portalQuotes: '/api/portal/quotes',
  portalLoyalty: '/api/portal/loyalty',
  portalProfile: '/api/portal/profile',

  // Payment
  paymentsCheckout: '/api/payments/checkout',
  paymentsStatus: '/api/payments/status',

  // Currency
  currencyConvert: '/api/currency/convert',
  currencyRates: '/api/currency/rates',

  // Media
  mediaHomepage: '/api/media/homepage',

  // Deduplication
  adminDeduplicate: '/api/admin/deduplicate',

  // Financial
  adminInvoices: '/api/admin/invoices',
  adminPayments: '/api/admin/payments',
  adminFinancialReports: '/api/admin/financial/reports',
  adminFinancialAging: '/api/admin/financial/aging',

  // Availability
  adminAvailabilityCalendar: '/api/admin/availability/calendar',
  adminAvailabilityCheck: '/api/admin/availability/check',
  adminAvailabilityBlackouts: '/api/admin/availability/blackouts',
  adminAvailabilityHolds: '/api/admin/availability/holds',
  adminAvailabilityPermits: '/api/admin/availability/permits',

  // Risk & Compliance
  adminRiskAdvisories: '/api/admin/risk/advisories',
  adminRiskWeather: '/api/admin/risk/weather',
  adminRiskCompliance: '/api/admin/risk/compliance',
  adminRiskEmergencyContacts: '/api/admin/risk/emergency-contacts',

  // Loyalty & Referrals
  adminLoyaltyAccounts: '/api/admin/loyalty/accounts',
  adminReferrals: '/api/admin/referrals',
  adminCustomerSuccess: '/api/admin/customer-success',

  // Content Management
  adminContentDestinations: '/api/admin/content/destinations',
  adminContentGuides: '/api/admin/content/guides',
  adminContentTemplates: '/api/admin/content/templates',
  adminContentAssets: '/api/admin/content/assets',
  adminContentGenerate: '/api/admin/content/generate',
  adminContentSeed: '/api/admin/content/seed',

  // Support
  adminSupportTickets: '/api/admin/support/tickets',

  // Supplier Extended
  adminSupplierRankings: '/api/admin/supplier-rankings',
  adminSupplierRequests: '/api/admin/supplier-requests',

  // WhatsApp
  adminWhatsappConversations: '/api/admin/whatsapp/conversations',
  adminWhatsappTemplates: '/api/admin/whatsapp/templates',

  // Agency CRUD
  agencyMe: '/api/agency/auth/me',
  agencyClients: '/api/agency/clients',
  agencyBookings: '/api/agency/bookings',
  agencyQuotes: '/api/agency/quotes',
  agencyRates: '/api/agency/rates',
  agencySuppliers: '/api/agency/suppliers',
};

export const TIMEOUTS = {
  navigation: 10_000,
  api: 15_000,
  animation: 2_000,
  chatResponse: 20_000,
};
