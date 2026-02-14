# Database Schema (`src/db/schema.ts`)

92 tables + 20+ enums managed by Drizzle ORM.

**CRITICAL: Never use `sql.raw()` for WHERE clauses.** Neon's HTTP driver caches query results by SQL text. Raw SQL generates identical strings on every request, returning stale cached data even after DB updates. Always use Drizzle operators (`eq()`, `and()`, `desc()`, `count()`) which produce parameterized queries that bypass Neon's cache.

## Table Groupings

**Agency & Multi-Tenant (4 tables):**
- `agencies` — White-label agency portal
- `agencyUsers` — Agency user accounts
- `agencySuppliers` — Agency-supplier relationships
- `agencyMarginOverrides` — Per-agency/per-service-type custom margins

**Supplier Portal (2 tables):**
- `supplierUsers` — Supplier staff accounts
- `supplierPerformance` — Supplier metrics & scoring

**Currency (2 tables):**
- `supportedCurrencies` — Supported currencies (15+)
- `exchangeRates` — Real-time FX rates

**Service Tables (10 types + 1 room rate):**
- `hotels` + `hotelRoomRates` — Accommodation with room-level pricing
- `transportation` — Vehicles and transfers
- `permitsFees` — Government permits and fees
- `guides` — Guide services
- `porters` — Porter services
- `flightsDomestic` — Domestic flights
- `helicopterSharing` / `helicopterCharter` — Helicopter services
- `miscellaneousServices` — Other services
- `packages` — Complete tour packages

**Business Core (12 tables):**
- `suppliers` — Supplier records with contacts (JSONB)
- `destinations` — Geography (countries + destinations)
- `seasons` — Seasonal pricing multipliers
- `clients` — Customer records with contact info
- `quotes` / `quoteItems` — Quote management
- `bookings` + `bookingEvents` — Confirmed bookings + audit trail
- `paymentMilestones` — Payment schedule tracking
- `supplierConfirmationRequests` — Supplier booking confirmations
- `tripBriefings` — Pre-departure documents
- `bookingSequence` — Booking reference ID generation
- `stripePayments` — Stripe transaction logs
- `emailLogs` — Email sending audit trail

**Financial (7 tables):**
- `invoices` + `invoiceItems` — Invoice management
- `payments` — Payment records
- `paymentAllocations` — Payment-to-invoice allocation
- `commissionRecords` — Supplier commissions
- `creditNotes` — Credit management
- `financialPeriods` — Period closing

**Pricing & Inventory (10 tables):**
- `pricingRules` — Dynamic pricing rules
- `demandMetrics` — Demand-based pricing data (booking velocity)
- `priceAdjustments` — Ad-hoc price adjustments
- `priceHistory` — Price audit trail
- `competitorRates` — Competitor price tracking
- `availabilityCalendar` — Service availability
- `blackoutDates` — Blackout periods
- `permitInventory` — Permit stock tracking
- `inventoryHolds` — Temporary inventory reservations
- `capacityConfig` — Capacity settings
- `availabilitySyncLog` — Sync audit trail

**Supplier Management (5 tables):**
- `supplierCommunications` — Supplier contact logs
- `supplierRateRequests` — Rate request tracking
- `supplierIssues` — Issue tracking
- `supplierRankings` — Ranking system

**Lead & Nurture (5 tables):**
- `leadScores` — Lead scoring data (0-100)
- `leadEvents` — Lead activity tracking
- `nurtureSequences` / `nurtureEnrollments` — Email nurture automation
- `referrals` — Referral tracking

**Customer Success (7 tables):**
- `loyaltyAccounts` / `loyaltyTransactions` — Customer loyalty program (points, tiers)
- `tripCheckins` — In-trip check-in records
- `feedbackSurveys` — Post-trip feedback
- `clientMilestones` — Client event tracking (anniversaries, milestones)
- `supportTickets` + `supportMessages` — Support ticket system

**Risk & Compliance (7 tables):**
- `travelAdvisories` — Travel warnings
- `weatherAlerts` — Weather monitoring
- `complianceRequirements` — Regulatory requirements
- `bookingComplianceChecks` — Pre-trip compliance checks
- `emergencyContacts` — Emergency contact info
- `bookingRiskAssessments` — Risk evaluation per booking
- `riskAlertNotifications` — Alert notification tracking

**Content & Personalization (6 tables):**
- `destinationContent` — Location-based content
- `contentTemplates` — Content templates
- `contentAssets` — Content resources
- `generatedContent` — AI-generated content tracking
- `clientContentPreferences` — Per-client personalization settings
- `destinationGuides` — Generated destination travel guides

**Blog & Social (3 tables):**
- `blogPosts` — Blog articles with SEO metadata, featured images, tags
- `blogCategories` — Blog category taxonomy
- `blogSocialPosts` — Social media cross-posting tracking

**WhatsApp Integration (3 tables):**
- `whatsappConversations` — Chat sessions
- `whatsappMessages` — Message history
- `whatsappTemplates` — Message templates

**Customer Portal (2 tables):**
- `customerVerificationCodes` — Email verification codes (SHA-256 hashed)
- `customerSessions` — JWT session tracking

**Media Library (3 tables):**
- `mediaLibrary` — Image records with CDN URLs, thumbnails, country/destination/category, JSONB tags, usage tracking (7 indexes including GIN on tags)
- `mediaCollections` — Named image collections (e.g. "Nepal Landscapes")
- `mediaCollectionItems` — Junction table linking media to collections
