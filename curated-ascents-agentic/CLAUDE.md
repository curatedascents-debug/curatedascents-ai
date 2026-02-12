# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

CuratedAscents is an AI-powered luxury adventure travel platform for high-net-worth travellers. The AI "Expedition Architect" (powered by DeepSeek) autonomously searches a service catalog of 10+ service types, builds multi-service quotes, and captures leads via natural-language chat. An admin dashboard provides full CRUD for rates, suppliers, and hotels. Geographic focus: Nepal, Tibet, Bhutan, and India.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build (must pass with zero TypeScript errors)
npm run start        # Start production server
npm run lint         # ESLint (Next.js core-web-vitals + TypeScript)
npm run seed         # Seed database: node --loader ts-node/esm src/db/seed.ts
```

Drizzle ORM commands (via npx):
```bash
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply migrations
npx drizzle-kit push       # Push schema directly (skip migrations)
npx drizzle-kit studio     # Visual DB browser
```

### E2E Testing (Playwright)

```bash
npm test                    # Run all tests (all browsers)
npm run test:chromium       # Run tests in Chromium only
npm run test:ui             # Open Playwright UI mode
npm run test:smoke          # Run @smoke tagged tests only
npm run test:regression     # Run @regression tagged tests only
npm run test:admin          # Run @admin tagged tests only
npm run test:portal         # Run @portal tagged tests only
npm run test:agency         # Run @agency tagged tests only
npm run test:auth           # Run @auth tagged tests only
npm run test:api            # Run @api tagged tests only
npm run test:ai-tools       # Run @ai-tools tagged tests only
npm run test:booking        # Run @booking tagged tests only
npm run test:staging        # Run tests against staging URL
npm run test:production     # Run smoke tests against production URL
```

**Test suite:** 223 tests across 47 spec files, 9 categories, 100% pass rate. Config at `tests/playwright.config.ts`.

**Important notes:**
- Tests live in `tests/` directory (excluded from `tsconfig.json` so build is unaffected)
- Tests require `npm run dev` running on localhost:3000 (Playwright starts it automatically via `webServer` config)
- Uses system Chrome (`channel: 'chrome'`) instead of bundled Chromium for macOS 11 compatibility
- Chat tests mock `/api/chat` via `page.route()` — the mock must return `{ message, role }` (NOT `{ response }`) to match the real API format
- Email capture modal triggers after 2nd user message (`newMessages.length >= 4`); tests that send 3+ messages must dismiss it
- Admin API endpoints (`/api/admin/*`) have NO inline auth checks — middleware only protects page routes (`/admin/*`)

## Environment Variables

Defined in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `DEEPSEEK_API_KEY` — DeepSeek chat API key (server-side only, never exposed to client)
- `NEXT_PUBLIC_APP_URL` — Base URL (e.g. `http://localhost:3000`)
- `RESEND_API_KEY` — Resend email API key (for quote/booking notifications)
- `ADMIN_PASSWORD` — Password for admin dashboard access (required)
- `ADMIN_SESSION_SECRET` — Secret key for signing session cookies (change in production)
- `STRIPE_SECRET_KEY` — Stripe API key for payment processing
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signature verification
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe public key for client-side
- `CRON_SECRET` — Secret for Vercel cron job authentication
- `CUSTOMER_JWT_SECRET` — Secret for customer portal JWT sessions (fallback: `ADMIN_SESSION_SECRET`)
- `AGENCY_JWT_SECRET` — Secret for agency portal JWT sessions (fallback: `ADMIN_SESSION_SECRET`)
- `SUPPLIER_JWT_SECRET` — Secret for supplier portal JWT sessions (fallback: `AGENCY_JWT_SECRET`)
- `ENABLE_MSW` — Set to `true` to enable Mock Service Worker for E2E tests (server-side API mocking)
- `R2_ACCOUNT_ID` — Cloudflare R2 account ID (for media library storage)
- `R2_ACCESS_KEY_ID` — Cloudflare R2 access key
- `R2_SECRET_ACCESS_KEY` — Cloudflare R2 secret key
- `R2_BUCKET_NAME` — Cloudflare R2 bucket name (default: `curated-ascents-media`)
- `R2_PUBLIC_URL` — Cloudflare R2 public CDN URL (e.g. `https://media.curatedascents.com`)

## Development Workflow

1. Pull latest from `main` branch
2. Create feature branch: `git checkout -b feature/[name]`
3. Develop locally: `npm run dev` at localhost:3000
4. Run E2E tests: `npm run test:chromium` (223 tests, requires dev server running)
5. Validate build: `npm run build` (zero TypeScript errors required)
6. Push branch, open PR, review, merge to `main`
7. Vercel auto-deploys `main` to production

## Vercel Deployment

- **Git root:** Parent directory (`curatedascents-ai/`)
- **App code:** Subdirectory (`curated-ascents-agentic/`)
- **Vercel project:** `curated-ascents-agentic` with Root Directory = `curated-ascents-agentic`
- **Deploy from git root:** `cd /path/to/curatedascents-ai && npx vercel --prod`
- **Force deploy (bypass build cache):** Add `--force` flag
- **Production URL:** `https://curated-ascents-agentic.vercel.app`
- **Env vars:** Configured in Vercel dashboard (same `DATABASE_URL` as local `.env.local`)
- Do NOT deploy from the subdirectory — it fails with "Root Directory not found"

## Architecture

**Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3 + @tailwindcss/typography, Drizzle ORM, Neon PostgreSQL, Vercel AI SDK (`ai`), Framer Motion

**Brand Identity:**
- **Slogan:** "Beyond Boundaries, Beyond Ordinary" (shown under logo in Navigation and Footer)
- **Logo:** Twin Himalayan peaks with compass accent — `src/components/icons/CuratedAscentsLogo.tsx` (gold stroke SVG)
- **Favicon & Icons:** Navy/gold brand mark at all sizes — `src/app/favicon.ico` (auto-served by Next.js), `public/icons/` (PWA manifest, apple-touch-icon, favicon PNGs)
- **Office:** 4498 Voyageur Way, Carmel, IN 46074, USA
- **Phone:** +1-715-505-4964
- **Email:** hello@curatedascents.com

**Design System:**
- **Fonts:** Playfair Display (serif headings) + DM Sans (body text) via `next/font/google`
- **CSS Variables:** `--font-playfair`, `--font-dm-sans` set on `<html>`, consumed by `tailwind.config.ts`
- **Color Palette (luxury):** navy `#0F1B2D`, gold `#C9A96E`, cream `#F5F0EB`, charcoal `#2A2A2A`, mist `#E8E2DA`, white `#FAFAF8`
- **Tailwind classes:** `bg-luxury-navy`, `text-luxury-gold`, `bg-luxury-cream`, etc.
- **Global CSS:** `src/app/globals.css` — custom utilities `.btn-primary`, `.btn-secondary`, `.glass`, `.section-divider`, `.link-underline`, `.text-gradient`

**Deployment:** Vercel (serverless, auto-deploy from GitHub `main` branch)

**Path alias:** `@/*` maps to `./src/*`

### Routing

**Public Routes:**
- `/` — Luxury homepage with AI chat widget
- `/blog` — Blog listing page (SEO-optimized travel content)
- `/blog/[slug]` — Individual blog post with ReactMarkdown + Tailwind prose
- `/faq` — Frequently asked questions
- `/contact` — Contact page
- `/privacy-policy` — Privacy policy
- `/terms` — Terms of service
- `/payment/success` — Payment confirmation page
- `/payment/cancelled` — Payment cancellation page

**Admin Routes:**
- `/admin` — Admin dashboard (protected)
- `/admin/login` — Admin login page

**Supplier Portal:**
- `/supplier/login` — Supplier login page
- `/supplier/dashboard` — Supplier self-service portal

**Agency Portal:**
- `/agency/login` — Agency user login (email/password with bcryptjs)
- `/agency/dashboard` — Agency dashboard with Clients/Quotes/Bookings/Reports/AI Chat tabs

**Customer Portal:**
- `/portal/login` — Email-based passwordless auth
- `/portal` — Customer dashboard
- `/portal/trips` — Trip history and details
- `/portal/trips/[id]` — Individual trip detail
- `/portal/quotes` — Quote management
- `/portal/quotes/[id]` — Individual quote detail
- `/portal/loyalty` — Loyalty points and tier status
- `/portal/chat` — AI chat (portal mode, skips email prompt)
- `/portal/currency` — Currency converter
- `/portal/settings` — Profile settings

**Other:**
- `/offline` — PWA offline fallback page

**API Routes:**
- `/api/chat` — Core AI chat endpoint with tool execution loop
- `/api/personalize` — Captures user email/name into `clients` table
- `/api/seed-all` — Full database seeding (upsert)
- `/api/seed` — Basic database seed
- `/api/admin/*` — Admin CRUD endpoints (rates, hotels, suppliers, clients, quotes, bookings, agencies, destinations, invoices, payments, pricing, nurture, competitors, reports, blog, media, risk, availability, loyalty, referrals, whatsapp, customer-success, supplier-rankings)
- `/api/blog/*` — Blog post listing and individual post endpoints
- `/api/supplier/*` — Supplier portal endpoints (auth, bookings, rates)
- `/api/portal/*` — Customer portal endpoints (dashboard, bookings, quotes, loyalty, profile, auth)
- `/api/payments/*` — Stripe payment processing
- `/api/currency/*` — Currency conversion
- `/api/customer/*` — Customer loyalty & surveys
- `/api/agency/*` — Agency portal endpoints (auth, chat, clients, bookings, quotes, rates, suppliers)
- `/api/agent/*` — Internal agent endpoints (supplier-contacts)
- `/api/media/*` — Public media endpoints (homepage images)
- `/api/admin/media/*` — Admin media library CRUD, upload, bulk ops, collections, stats
- `/api/whatsapp/*` — WhatsApp webhook and message sending
- `/api/cron/*` — 18 scheduled background jobs (see Cron Jobs section)

### AI Chat Flow (`/api/chat`)

1. User message sent from `ChatInterface` (client component) to `/api/chat`
2. Route handler calls DeepSeek API (`deepseek-chat` model) with conversation history, system prompt, and tool definitions
3. DeepSeek may invoke tools (up to 10 iterations) — tool calls are executed via `tool-executor.ts` which dispatches to `database-tools.ts`
4. **Price sanitization**: Before tool results are sent back to DeepSeek, `sanitizeForClient()` strips all cost/margin fields (`cost*`, `basecost`, `margin*`). This is the critical security boundary preventing the AI from ever seeing internal pricing
5. If database queries return empty, fallback market rates from `fallback-rate-research.ts` are used (clearly labelled as estimates)
6. Final AI response returned to client

### AI Tool Definitions

| Tool | Purpose | Trigger |
|------|---------|---------|
| `search_rates` | Search across all 10 service tables | User asks about pricing |
| `search_hotels` | Search hotels by name/location/stars | User asks about hotels |
| `search_packages` | Search complete tour packages | User asks about itineraries |
| `get_rate_details` | Full detail for a specific rate by ID + serviceType | User wants deep detail |
| `calculate_quote` | Multi-service quote with margin calculation | User requests a price quote |
| `get_destinations` | List destinations, optionally filtered by country | User asks where we operate |
| `get_categories` | List all service categories | User asks what services exist |
| `research_external_rates` | Fallback market-rate estimation | No DB match found |
| `get_booking_status` | Check booking status by reference | User asks about booking |
| `get_payment_schedule` | Get payment milestones | User asks about payments |
| `convert_quote_to_booking` | Convert accepted quote to booking | User confirms booking |
| `check_supplier_confirmations` | Check supplier confirmation status | User asks about confirmations |
| `get_trip_briefing` | Get pre-departure briefing | User asks for trip details |
| `convert_currency` | Convert prices to user's currency | User requests different currency |
| `get_supported_currencies` | List available currencies | User asks about currencies |
| `get_dynamic_price` | Calculate dynamic price with discounts | Check current pricing |
| `check_pricing_promotions` | Check active promotions | User asks about deals |
| `search_photos` | Search media library for destination photos | User asks for photos/images |

### Key Modules (~56 files in `src/lib/`)

**AI & Tools:**
- `src/lib/agents/tool-definitions.ts` — 18 function/tool schemas for DeepSeek
- `src/lib/agents/tool-executor.ts` — Dispatches tool calls to the appropriate handler
- `src/lib/agents/database-tools.ts` — Database query functions for all service types
- `src/lib/agents/chat-processor.ts` — Chat processing pipeline
- `src/lib/agents/agency-chat-processor.ts` — B2B chat with 20% margin pricing, per-service price visibility, agencyId tracking
- `src/lib/agents/fallback-rate-research.ts` — Estimated market rates when DB has no data
- `src/lib/agents/expedition-architect.ts` — Original AI architecture
- `src/lib/agents/expedition-architect-enhanced.ts` — Enhanced version

**Authentication (4 files):**
- `src/lib/auth/customer-auth.ts` — Email verification + JWT sessions via `jose`
- `src/lib/auth/agency-auth.ts` — Agency JWT sessions via `jose` (uses `bcryptjs` for Vercel compatibility)
- `src/lib/auth/supplier-auth.ts` — Supplier user auth (bcryptjs)
- `src/lib/auth/permissions.ts` — Permission checking utilities

**Pricing & Currency:**
- `src/lib/pricing/pricing-engine.ts` — Dynamic pricing with seasonal, demand, early bird, group, loyalty rules
- `src/lib/currency/currency-service.ts` — Multi-currency conversion with cached exchange rates

**Lead Intelligence:**
- `src/lib/lead-intelligence/scoring-engine.ts` — Lead scoring based on engagement signals (0-100)
- `src/lib/lead-intelligence/nurture-engine.ts` — Email nurture sequence automation
- `src/lib/lead-intelligence/seed-sequences.ts` — Sequence templates

**Financial:**
- `src/lib/financial/invoice-engine.ts` — Invoice generation, payment tracking, PDF generation
- `src/lib/stripe/stripe-client.ts` — Stripe SDK wrapper
- `src/lib/stripe/payment-service.ts` — Checkout session creation & webhook handling

**Availability & Inventory:**
- `src/lib/availability/availability-engine.ts` — Calendar, holds, blackouts, permit inventory

**Supplier Relations:**
- `src/lib/suppliers/supplier-relations-engine.ts` — Performance tracking, communications, issue management

**Risk & Compliance:**
- `src/lib/risk/risk-compliance-engine.ts` — Travel advisories, weather alerts, compliance checks

**Customer Success (3 files):**
- `src/lib/customer-success/loyalty-engine.ts` — Points, tiers (Bronze→Platinum), referrals
- `src/lib/customer-success/feedback-engine.ts` — Surveys, post-trip reviews
- `src/lib/customer-success/support-engine.ts` — Support ticket system

**Content & Personalization:**
- `src/lib/content/content-engine.ts` — Content generation pipeline
- `src/lib/content/personalization-engine.ts` — Client content preferences
- `src/lib/content/narrative-generator.ts` — Narrative content generation
- `src/lib/content/destination-guides.ts` — Destination guide data
- `src/lib/content/seed-content.ts` — Content seeding

**Email (20 files):**
- `src/lib/email/send-email.ts` — Email sending via Resend
- `src/lib/email/resend-client.ts` — Resend client wrapper
- `src/lib/email/templates/` — 17 React Email templates (welcome, verification-code, quote-sent, quote-pdf-email, quote-expired, booking-confirmation, payment-reminder, payment-received, invoice-sent, milestone, trip-briefing-7day, trip-briefing-24hour, trip-checkin, feedback-request, supplier-confirmation-request, supplier-communication, lead-reengagement, blog-draft-notification, admin-notification, all-suppliers-confirmed)

**Blog & Social:**
- `src/lib/blog/blog-writer-agent.ts` — AI blog post generation via DeepSeek
- `src/lib/blog/seo-optimizer.ts` — SEO metadata generation
- `src/lib/blog/social-media-formatter.ts` — Social media post formatting
- `src/lib/social/social-media-client.ts` — Social media auto-sharing (Facebook, Instagram, LinkedIn, Twitter/X)

**Media Library:**
- `src/lib/media/r2-client.ts` — Cloudflare R2 upload/delete, image processing (WebP conversion, thumbnails via `sharp`)
- `src/lib/media/media-service.ts` — Full CRUD, search, AI photo search, blog image lookup, bulk ops, collections, stats

**WhatsApp Integration (6 files):**
- `src/lib/whatsapp/whatsapp-client.ts` — WhatsApp Business API client
- `src/lib/whatsapp/message-processor.ts` — Incoming message handling
- `src/lib/whatsapp/message-sender.ts` — Outgoing messages
- `src/lib/whatsapp/session-manager.ts` — Session tracking
- `src/lib/whatsapp/formatters.ts` — Message formatting
- `src/lib/whatsapp/client-linker.ts` — Link WhatsApp messages to clients

**PDF:**
- `src/lib/pdf/styles.ts` — PDF styling constants

**API Helpers:**
- `src/lib/api/agency-context.ts` — Agency request context from middleware headers
- `src/lib/api/supplier-context.ts` — Supplier request context from middleware headers

**Constants (7 files in `src/lib/constants/`):**
- `destinations.ts`, `experiences.ts`, `hero-slides.ts`, `press.ts`, `social-links.ts`, `stats.ts`, `testimonials.ts`

**Animations:**
- `src/lib/animations.ts` — Framer Motion animation configurations

**Homepage Components (Server/Client split for SEO):**
- `src/components/homepage/LuxuryHomepage.tsx` — **Server component** orchestrator, wraps children in `<ChatProvider>`
- `src/components/homepage/ChatContext.tsx` — **Client** React Context providing `openChat/toggleChat/closeChat`, renders `<ChatWidget>` internally
- `src/components/homepage/AnimateOnScroll.tsx` — **Client** wrapper using IntersectionObserver + `data-animate` CSS for scroll reveal animations
- `src/components/homepage/ChatButton.tsx` — **Client** button consuming `useChatContext()` to open chat with optional pre-seeded message
- `src/components/homepage/ScrollLink.tsx` — **Client** button for smooth-scrolling to section IDs
- **Server components** (content in HTML for crawlers): HowItWorks, SignatureJourneys, FounderSection, TrustStrip, FinalCTA
- **Client components** (require JS interactivity): Navigation, HeroSection, TestimonialsSection, Footer, ChatWidget
- `src/components/homepage/index.ts` — Barrel exports for all homepage components

**Blog Components:**
- `src/components/blog/` — BlogList, BlogCard, BlogPost components (luxury navy/gold theme)

### Database Schema (`src/db/schema.ts`)

92 tables + 20+ enums managed by Drizzle ORM.

**CRITICAL: Never use `sql.raw()` for WHERE clauses.** Neon's HTTP driver caches query results by SQL text. Raw SQL generates identical strings on every request, returning stale cached data even after DB updates. Always use Drizzle operators (`eq()`, `and()`, `desc()`, `count()`) which produce parameterized queries that bypass Neon's cache.

Key groupings:

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

### Component Patterns

Homepage uses a **"donut" pattern**: `ChatProvider` (client) wraps the page for chat state, but its `{children}` include server components whose content is in the initial HTML for SEO. Five homepage sections (HowItWorks, SignatureJourneys, FounderSection, TrustStrip, FinalCTA) are server components. Client leaf components (`ChatButton`, `ScrollLink`, `AnimateOnScroll`) handle interactivity. Other pages' components are client components (`"use client"`) using local `useState`/`useRef`. Conversation history is sent with every chat request (stateless backend).

**Admin Dashboard Tabs:**
- **Rates** — Service rates with sub-tabs by category
- **Suppliers** — Supplier management
- **Hotels** — Hotel and room rate management
- **Clients** — Customer records
- **Quotes** — Quote management with PDF export
- **Bookings** — Booking lifecycle with payment tracking
- **Supplier Portal** — Agency/supplier portal management
- **Pricing** — Dynamic pricing rules, demand metrics, price simulator
- **Nurture** — Email nurture sequences and enrollments
- **Competitors** — Competitor rate monitoring and comparison
- **Blog** — AI blog post generation, content management
- **WhatsApp** — WhatsApp Business integration
- **Media** — Media library with upload, search, edit, bulk operations, collections, stats (3 sub-tabs: Library, Collections, Stats)
- **Reports** — Advanced analytics with sub-tabs (Overview, Financial, Suppliers, Leads, Operations)

### E2E Test Architecture (`tests/`)

```
tests/
├── playwright.config.ts              # Multi-env config (local/staging/production)
├── tsconfig.json                      # Test-only TS config with @/* path alias
├── .env.test                          # Local test env vars (DATABASE_URL, JWT secrets, dummy API keys)
├── global-setup.ts                    # Database seeding (Drizzle direct → HTTP fallback)
├── global-teardown.ts                 # Test data cleanup
├── fixtures/
│   ├── auth.fixture.ts                # 5 auth contexts: guest, admin, agency, supplier, portal (JWT via jose)
│   ├── base.fixture.ts                # Extends auth with common helpers
│   └── test-data.fixture.ts           # Constants: routes, API routes, timeouts, test users
├── factories/
│   └── test-data.factory.ts           # Faker-based data generators
├── helpers/
│   ├── db.helpers.ts                  # Drizzle seed/query helpers (dynamic imports for ESM compat)
│   ├── api.helpers.ts                 # API request helpers
│   ├── assertions.helpers.ts          # Custom assertions (toast, API response, DB record)
│   ├── ui.helpers.ts                  # UI interaction helpers
│   └── selectors.ts                   # Shared CSS/aria selectors
├── mocks/
│   ├── chat-responses.ts             # page.route() mock for /api/chat (returns { message, role })
│   ├── stripe-mock.ts                # Stripe checkout/payment status mocks
│   └── external-services.ts          # Currency, personalize, media mocks
├── msw/                               # Server-side mocking (for Next.js process)
│   ├── server.ts                      # MSW setupServer
│   └── handlers/                      # DeepSeek, R2, Stripe, Resend handlers
├── page-objects/                      # 20 Page Object Models
│   ├── ChatWidget.ts                  # Chat: open via [aria-label="Open chat"], messages via .markdown-content
│   ├── AdminDashboardPage.ts          # Admin: switchTab via .first(), expectLoaded with 15s timeout
│   ├── HomePage.ts, BlogPage.ts, PortalDashboardPage.ts, ...
├── reporters/
│   └── summary-reporter.ts           # Custom reporter → test-summary.json
├── specs/                             # 47 spec files across 9 categories
│   ├── admin/ (11), agency/ (3), api/ (7), auth/ (4), chat/ (5)
│   ├── journeys/ (4), portal/ (7), public/ (4), supplier/ (2)
└── ci/
    └── playwright.yml                 # GitHub Actions CI config
```

**Key testing patterns:**
- Auth fixtures generate JWTs programmatically — no server needed for agency/supplier/portal auth
- Admin auth uses hash-based token matching `src/middleware.ts` algorithm
- Chat mocks intercept at browser level via `page.route('**/api/chat', ...)` — must return `{ message: "...", role: "assistant" }`
- Email capture modal blocks chat input after 2nd user message — tests must dismiss it via `chatWidget.skipEmailCapture()` before sending more
- Use `waitForLoadState('networkidle')` after navigation for reliable page load detection
- Use `.first()` with `getByRole('button', { name: /regex/ })` to avoid strict mode violations when multiple buttons match

### Pricing Rules

- Sell price formula: `Sell = Cost * (1 + Margin%)`
- Default margin: 50% for standard clients
- Agency margin: 20% (configurable per-agency via `agencyMarginOverrides` table)
- MICE groups (20+ pax): 35% margin
- Nepal-specific: 13% VAT + 10% service charge

**Dynamic Pricing Adjustments:**
- Early bird: 5-15% discount (30-90 days ahead)
- Group discounts: 5-15% (6-20+ pax)
- Loyalty tiers: 2-12% (Bronze to Platinum)
- Seasonal multipliers: 0.7x to 1.3x
- Demand-based: ±20% based on booking velocity

### Cron Jobs (Vercel Cron — `vercel.json`)

18 cron jobs configured. All require `CRON_SECRET` via `Authorization: Bearer` header.

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Daily 9 AM | `/api/cron/payment-reminders` | Payment due reminders |
| Daily 9 AM | `/api/cron/milestone-notifications` | Payment milestone notifications |
| Daily 10 AM | `/api/cron/trip-briefings` | Pre-departure briefings |
| Daily 10 AM | `/api/cron/feedback-requests` | Post-trip feedback requests |
| Daily 11 AM | `/api/cron/supplier-followup` | Supplier confirmation follow-up |
| Daily 12 PM | `/api/cron/nurture-sequences` | Email nurture automation |
| Daily 2 PM | `/api/cron/lead-reengagement` | Cold lead re-engagement |
| Daily 8 AM | `/api/cron/trip-checkins` | In-trip check-in prompts |
| Daily 8 AM | `/api/cron/invoice-overdue` | Overdue invoice reminders |
| Daily 7 AM | `/api/cron/price-optimization` | Price optimization suggestions |
| Daily 7 AM | `/api/cron/social-media-posting` | Social media post scheduling |
| Daily 6 AM | `/api/cron/demand-analysis` | Demand metrics calculation |
| Daily 6 AM | `/api/cron/blog-publishing` | Scheduled blog post publishing |
| Daily 5 AM | `/api/cron/release-expired-holds` | Release expired inventory |
| Daily 4 AM | `/api/cron/supplier-performance` | Supplier scoring |
| Daily 3 AM | `/api/cron/risk-monitoring` | Travel advisory updates |
| Daily 2 AM | `/api/cron/points-expiry` | Loyalty points expiry warnings |
| Weekly Mon 4 AM | `/api/cron/auto-content-generation` | AI blog content generation |

## User Roles

| Role | Access |
|------|--------|
| End Customer | AI Chat, quote viewing, payment, loyalty dashboard |
| Travel Agent | AI Chat, admin dashboard, PDF export |
| Platform Admin | Full admin dashboard, all settings |
| Agency | Agency dashboard, B2B AI chat (20% margin pricing), client management |
| Supplier | Supplier portal, rate management, booking confirmations |

## Feature Status & Roadmap

### ✅ Phase 1: Foundation (Complete)
- AI chat with tool calling (DeepSeek)
- Multi-table rate database (10 service types)
- Admin dashboard (Hotels/Suppliers/Rates)
- Quote calculation engine
- Database seeding
- Fallback market rate research

### ✅ Phase 2: Core Business (Complete)
- **PDF Quote Generation** — React-PDF templates with professional formatting
- **Client Management** — Full CRUD with lead tracking
- **Booking Workflow** — Quote-to-booking conversion with payment milestones
- **Email Integration** — Resend with React Email templates
- **Supplier Portal** — White-label agency/supplier self-service
- **Multi-Currency** — Real-time FX rates with 15+ currencies
- **Payment Integration** — Stripe checkout with webhook handling, bank transfer (SWIFT), and cash on arrival for remaining balance

### ✅ Phase 3: Intelligence & Automation (Complete)
- **Dynamic Pricing Engine** — Seasonal, demand, early bird, group, loyalty rules
- **Lead Scoring** — Engagement-based scoring (0-100) with status tracking
- **Email Nurture System** — Automated sequences with enrollment tracking
- **Advanced Reporting** — 5 sub-tabs with date filters and CSV export
- **Competitor Monitoring** — Rate tracking, comparison, market insights
- **Customer Loyalty** — Points, tiers (Bronze→Platinum), referrals
- **Risk & Compliance** — Weather alerts, travel advisories, notifications
- **Supplier Performance** — Response rates, reliability scores, automated follow-up

### ✅ Phase 4.1: Luxury Homepage UI — Redesigned (Complete)
- **Design System** — Playfair Display + DM Sans fonts, luxury navy/gold/cream palette, CSS variables
- **Hero Section** — Fullscreen cinematic image with Ken Burns animation, bottom-left content, staggered CSS transitions (no carousel)
- **How It Works** — 3-step process section (Dream → Design → Depart) with custom gold SVG icons, cream background
- **Signature Journeys** — 4 curated journey cards (Nepal, Bhutan, India, Tibet) in 2×2 grid, hover zoom, "Customize" pre-seeds chat
- **Founder / Expertise** — Two-column layout with stats row (28+ Years, 4 Countries, 500+ Expeditions)
- **Testimonials** — Auto-carousel with gold quote marks, navigation dots, navy background
- **Trust Strip** — Partner names + circular destination thumbnails, cream background
- **Final CTA** — Full-width mountain background with dark overlay, centered gold CTA
- **Navigation** — Fixed header with scroll-triggered transparency/blur, gold CTA button, mobile slide-out menu
- **AI Chat Widget** — Gold FAB, navy panel, "Your Private Expedition Architect" subtitle
- **Footer** — Navy/gold theme with luxury styling
- **Blog Pages** — `/blog` and `/blog/[slug]` refined to match luxury navy/gold design system
- **Responsive Design** — Mobile-first luxury aesthetic
- **Performance** — Optimized images, lazy loading, `next/image`, Intersection Observer for scroll animations
- **Server Component SEO** — 5 homepage sections (HowItWorks, SignatureJourneys, FounderSection, TrustStrip, FinalCTA) converted to server components so all headings, descriptions, journey details, and CTAs are in the initial HTML for crawlers
- **"Donut" Pattern** — `ChatProvider` (client) wraps the page for chat state; `ChatButton`, `ScrollLink`, `AnimateOnScroll` are thin client leaf components; no prop drilling for `onChatOpen`
- **CSS Scroll Animations** — `[data-animate]` rules in `globals.css` with `--stagger-index` CSS variable for staggered reveals, `prefers-reduced-motion` and `<noscript>` fallbacks
- **Open Graph & Twitter Cards** — Homepage-specific `og:title`, `og:description`, `og:image` (1200×630 hero crop), `twitter:card: summary_large_image` in `src/app/page.tsx` metadata export
- **JSON-LD Structured Data** — `TravelAgency` schema in `src/app/page.tsx` with business name, address, geo, areaServed, foundingDate, social links, priceRange

### ✅ Phase 4.2: AI-Powered Blog & SEO Engine (Complete)
- **AI Blog Writer Agent** — Generates SEO-optimized travel articles via DeepSeek
- **Content Calendar** — Automated weekly publishing (Monday 4AM UTC cron)
- **SEO Optimization** — Meta tags, structured data, keyword targeting
- **Social Media Integration** — Auto-share to Instagram, Facebook, LinkedIn, Twitter/X
- **Blog Typography** — `@tailwindcss/typography` with `prose` classes for rich markdown rendering
- **Content Types:** Destination guides, travel tips, seasonal content, trip reports, cultural insights
- **CTA Integration** — Each blog links to relevant packages/chat
- **Analytics** — Blog analytics API at `/api/admin/blog/analytics`
- **Static Pages** — `/faq`, `/contact`, `/privacy-policy`, `/terms` using `StaticPageLayout`
- **Seed** — `/api/seed-all` uses upsert (`onConflictDoUpdate` on slug) for reliable re-seeding

### ✅ Phase 5: PWA & Customer Portal (Complete)
- **PWA Support** — `manifest.json`, `sw.js`, install prompt, offline page
- **Customer Auth** — Email verification codes (SHA-256), JWT sessions via `jose`, cookie `customer_session`
- **Customer Portal** — `/portal/*` pages (dashboard, trips, quotes, loyalty, chat, currency, settings)
- **Portal APIs** — `/api/portal/*` (dashboard, bookings, quotes, loyalty, profile, auth)
- **Security** — Portal APIs strip `costPrice`/`margin` fields from responses
- **Middleware** — `handleCustomerRoutes()` injects `x-customer-id/email/name` headers

### ✅ Phase 5.1: Agency AI Chat (Complete)
- **Agency Chat Processor** — Separate B2B chat with agency-specific system prompt
- **20% Margin Pricing** — Agency quotes use cost × 1.20 (vs 50% client-facing), configurable per-agency via `agencyMarginOverrides`
- **Per-Service Pricing** — Agencies see itemized per-service prices (stripped from client chat)
- **Agency Dashboard Chat Tab** — "AI Chat" tab in agency dashboard using `/api/agency/chat`
- **Agency ID Tracking** — Quotes/bookings created via agency chat are tagged with `agencyId`
- **bcryptjs** — Replaced native `bcrypt` with pure-JS `bcryptjs` for Vercel serverless compatibility

### ✅ Phase 5.2: Media Library & AI Photo Integration (Complete)
- **Cloudflare R2 Storage** — S3-compatible object storage with WebP conversion (quality 85, max 2400px) and 400px thumbnail generation via `sharp`
- **Media Library Schema** — `mediaLibrary`, `mediaCollections`, `mediaCollectionItems` tables with GIN index on JSONB tags, composite indexes on (country, destination, category)
- **Media Service** — Full CRUD, search with pagination/sorting, AI photo search for chat tool, blog featured image lookup, bulk operations, collection management, usage tracking, stats
- **Admin Media Tab** — Library grid with upload/search/edit/bulk actions, Collections sub-tab, Stats sub-tab with breakdowns
- **AI Auto-Tag** — DeepSeek-powered image analysis generates tags, description, alt text, category, destination, country, season
- **AI Chat Tool** — `search_photos` tool lets the AI find and share destination photos during conversations
- **Blog Integration** — `generateBlogPost()` automatically searches media library for matching featured images; auto-content cron saves them
- **Homepage Integration** — `/api/media/homepage` serves categorized images; homepage components (Hero, SignatureJourneys, Founder) use media library images with Unsplash fallbacks
- **Admin API Routes** — 8 endpoints: list/search, upload, single CRUD, bulk operations, auto-tag, stats, collections CRUD

### ✅ Phase 5.3: E2E Test Suite (Complete)
- **Playwright E2E Tests** — 223 tests across 47 spec files, 9 categories, 100% pass rate
- **Multi-Environment Config** — `TEST_ENV` selects local/staging/production; each loads own `.env.*` file
- **Auth Fixtures** — Programmatic JWT generation via `jose` for admin, agency, supplier, portal, and guest contexts (no login API calls needed)
- **Page Object Models (20)** — HomePage, BlogPage, ChatWidget, AdminDashboardPage, PortalDashboardPage, SupplierLoginPage, AgencyDashboardPage, and 13 more
- **Browser-Level Mocks** — `page.route()` intercepts for `/api/chat`, Stripe, currency, email (since DeepSeek runs server-side, mock at API response level)
- **MSW (Mock Service Worker)** — Server-side mocking infrastructure for DeepSeek, R2, Stripe, Resend via `src/instrumentation.ts` (`ENABLE_MSW=true`)
- **Database Seeding** — Drizzle ORM direct seeding in `global-setup.ts` with HTTP `/api/seed-all` fallback
- **Test Tags** — `@smoke`, `@regression`, `@admin`, `@portal`, `@agency`, `@auth`, `@api`, `@ai-tools`, `@booking`, `@supplier`
- **Custom Reporter** — `tests/reporters/summary-reporter.ts` outputs features, coverage gaps, failures to `test-summary.json`
- **Data Factory** — `tests/factories/test-data.factory.ts` using `@faker-js/faker` for realistic test data generation
- **CI Config** — `tests/ci/playwright.yml` for GitHub Actions with staging job

**Test Categories:**

| Category | Specs | Tests | What's Tested |
|----------|-------|-------|---------------|
| api | 7 | 53 | Admin CRUD, blog, chat, media, payment, portal APIs |
| admin | 11 | 50 | All admin dashboard tabs (rates, hotels, suppliers, clients, quotes, bookings, blog, media, pricing, nurture, reports) |
| public | 4 | 30 | Homepage, blog, static pages, SEO |
| portal | 7 | 22 | Customer portal pages (dashboard, trips, quotes, loyalty, chat, currency, settings) |
| auth | 4 | 21 | Admin, agency, supplier, portal authentication flows |
| chat | 5 | 19 | Chat widget, conversation flow, tool responses, personalization/email capture, agency chat |
| journeys | 4 | 12 | End-to-end user journeys (customer booking, admin management, agency booking, supplier confirmation) |
| agency | 3 | 9 | Agency dashboard, chat, reports |
| supplier | 2 | 7 | Supplier dashboard, rates |

### ✅ Phase 5.4: WhatsApp Integration — Infrastructure Ready (Complete)
- **WhatsApp Client** — `src/lib/whatsapp/` with 6 modules: client, message-processor, message-sender, session-manager, formatters, client-linker
- **Database Schema** — `whatsappConversations`, `whatsappMessages`, `whatsappTemplates` tables
- **Admin Dashboard Tab** — WhatsApp tab with conversations, templates management
- **API Endpoints** — `/api/whatsapp/webhook` (incoming), `/api/whatsapp/send` (outgoing), `/api/admin/whatsapp/conversations`, `/api/admin/whatsapp/templates`
- **Status:** Infrastructure complete, pending WhatsApp Business API account verification and production credentials

### ⚠️ Test Coverage Gap
- E2E test suite remains at 223 tests across 47 spec files, but the codebase has nearly doubled (92 tables, ~179 API routes)
- **Untested subsystems:** Financial (invoices/payments), Availability/Permits, Risk/Compliance, Content Management, WhatsApp, expanded Agency CRUD, Support Tickets
- **Priority for testing:** Financial module (invoice → PDF → email → payment) and availability/permit system (operationally critical for Nepal/Tibet)

### 🔮 Phase 6: Future Enhancements
- **WhatsApp Go-Live** — WhatsApp Business API account verification and production deployment
- **Video Consultations** — Scheduled video calls with travel experts
- **AR/VR Previews** — Virtual destination tours
- **Carbon Offset** — Sustainability tracking and offsets
- **Multi-language** — AI chat in multiple languages
- **Blog Enhancements** — Syntax highlighting, image galleries, table of contents for long posts

## API Endpoints Reference (~179 route files)

### Core APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | AI chat with tool execution |
| POST | `/api/personalize` | Save client email/name |
| GET | `/api/seed-all` | Full database seeding (upsert) |
| GET | `/api/seed` | Basic database seed |
| GET | `/api/seed-agency` | Agency-specific seed data |
| GET | `/api/agent/supplier-contacts` | Internal agent supplier lookup |

### Admin Auth APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/auth/login` | Admin login |
| POST | `/api/admin/auth/logout` | Admin logout |

### Admin CRUD APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/rates` | Rate management |
| POST | `/api/admin/rates/create` | Create new rate |
| GET/PUT/DELETE | `/api/admin/rates/[serviceType]/[id]` | Individual rate CRUD |
| GET/POST | `/api/admin/suppliers` | Supplier management |
| GET/PUT/DELETE | `/api/admin/suppliers/[id]` | Individual supplier |
| GET/POST | `/api/admin/suppliers/[id]/users` | Supplier user management |
| PUT/DELETE | `/api/admin/suppliers/[id]/users/[userId]` | Individual supplier user |
| GET | `/api/admin/suppliers/[id]/performance` | Supplier performance data |
| GET/POST | `/api/admin/suppliers/[id]/communications` | Supplier communications |
| GET/POST | `/api/admin/suppliers/[id]/issues` | Supplier issue tracking |
| GET | `/api/admin/supplier-rankings` | Supplier ranking list |
| GET/POST | `/api/admin/supplier-requests` | Supplier rate requests |
| GET/POST | `/api/admin/hotels` | Hotel management |
| GET/PUT/DELETE | `/api/admin/hotels/[id]` | Individual hotel |
| GET/POST | `/api/admin/clients` | Client management |
| GET/PUT/DELETE | `/api/admin/clients/[id]` | Individual client |
| GET | `/api/admin/clients/[id]/lead-score` | Client lead score |
| GET | `/api/admin/lead-intelligence` | Lead intelligence dashboard |
| GET/POST | `/api/admin/quotes` | Quote management |
| GET/PUT/DELETE | `/api/admin/quotes/[id]` | Individual quote |
| GET | `/api/admin/quotes/[id]/pdf` | Generate quote PDF |
| POST | `/api/admin/quotes/[id]/email-pdf` | Email quote PDF |
| GET/POST | `/api/admin/bookings` | Booking management |
| GET/PUT | `/api/admin/bookings/[id]` | Individual booking |
| GET/POST | `/api/admin/destinations` | Destination management |
| GET/POST | `/api/admin/agencies` | Agency management |
| GET/PUT/DELETE | `/api/admin/agencies/[id]` | Individual agency |
| GET/POST | `/api/admin/agencies/[id]/users` | Agency user management |

### Booking Operations APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/bookings/[id]/milestones` | Payment milestones |
| PUT | `/api/admin/bookings/[id]/milestones/[mid]` | Update milestone |
| GET/POST | `/api/admin/bookings/[id]/suppliers` | Supplier confirmations |
| PUT | `/api/admin/bookings/[id]/suppliers/[sid]` | Update supplier confirmation |
| GET/POST | `/api/admin/bookings/[id]/briefings` | Trip briefings |
| GET | `/api/admin/bookings/[id]/events` | Audit trail |
| GET/POST | `/api/admin/bookings/[id]/risk-assessment` | Booking risk assessment |
| GET/POST | `/api/admin/bookings/[id]/compliance-checks` | Compliance checks |

### Financial APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/invoices` | Invoice management |
| GET/PUT/DELETE | `/api/admin/invoices/[id]` | Individual invoice |
| GET | `/api/admin/invoices/[id]/pdf` | Generate invoice PDF |
| POST | `/api/admin/invoices/[id]/send` | Email invoice to client |
| GET/POST | `/api/admin/payments` | Payment records |
| GET/PUT | `/api/admin/payments/[id]` | Individual payment |
| GET | `/api/admin/financial/reports` | Financial reports |
| GET | `/api/admin/financial/aging` | Accounts receivable aging |

### Pricing APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/pricing/rules` | Pricing rules CRUD |
| GET/PUT/DELETE | `/api/admin/pricing/rules/[id]` | Individual rule |
| GET | `/api/admin/pricing/demand` | Demand metrics |
| POST | `/api/admin/pricing/simulate` | Price simulation |
| GET | `/api/admin/pricing/analytics` | Pricing analytics |
| GET/POST | `/api/admin/pricing/adjustments` | Price adjustments |

### Availability APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/availability/calendar` | Availability calendar |
| GET | `/api/admin/availability/check` | Check availability |
| GET/POST | `/api/admin/availability/blackouts` | Blackout dates |
| GET/POST | `/api/admin/availability/holds` | Inventory holds |
| GET/POST | `/api/admin/availability/permits` | Permit inventory |

### Loyalty & Referrals APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/loyalty/accounts` | Loyalty accounts |
| GET/PUT | `/api/admin/loyalty/accounts/[id]` | Individual account |
| GET/POST | `/api/admin/loyalty/accounts/[id]/transactions` | Loyalty transactions |
| GET/POST | `/api/admin/referrals` | Referral management |
| GET | `/api/admin/referrals/[code]` | Referral by code |
| GET | `/api/admin/customer-success` | Customer success dashboard |

### Risk & Compliance APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/risk/advisories` | Travel advisories |
| GET/PUT/DELETE | `/api/admin/risk/advisories/[id]` | Individual advisory |
| GET/POST | `/api/admin/risk/weather` | Weather alerts |
| GET/PUT/DELETE | `/api/admin/risk/weather/[id]` | Individual alert |
| GET/POST | `/api/admin/risk/compliance` | Compliance requirements |
| GET/PUT/DELETE | `/api/admin/risk/compliance/[id]` | Individual requirement |
| GET/POST | `/api/admin/risk/emergency-contacts` | Emergency contacts |
| GET/PUT/DELETE | `/api/admin/risk/emergency-contacts/[id]` | Individual contact |

### Content Management APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/content/destinations` | Destination content |
| GET/POST | `/api/admin/content/guides` | Destination guides |
| GET/POST | `/api/admin/content/templates` | Content templates |
| GET/POST | `/api/admin/content/assets` | Content assets |
| POST | `/api/admin/content/generate` | AI content generation |
| POST | `/api/admin/content/seed` | Seed content data |

### Support & Other Admin APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/support/tickets` | Support tickets |
| GET/PUT | `/api/admin/support/tickets/[id]` | Individual ticket |
| GET/POST | `/api/admin/testimonials` | Testimonial management |
| POST | `/api/admin/email-test` | Email template testing |

### Nurture APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/nurture/sequences` | Nurture sequences |
| GET/PUT/DELETE | `/api/admin/nurture/sequences/[id]` | Individual sequence |
| GET/POST | `/api/admin/nurture/enrollments` | Enrollments |

### Competitor APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/competitors` | Competitor rates |
| GET/PUT/DELETE | `/api/admin/competitors/[id]` | Individual rate |
| GET | `/api/admin/competitors/compare` | Price comparison |

### Reports APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/reports` | Main dashboard KPIs |
| GET | `/api/admin/reports/suppliers` | Supplier performance |
| GET | `/api/admin/reports/leads` | Lead intelligence |

### Admin Blog APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/blog/posts` | Blog post management |
| GET/PUT/DELETE | `/api/admin/blog/posts/[id]` | Individual post |
| GET/POST | `/api/admin/blog/categories` | Blog categories |
| POST | `/api/admin/blog/generate` | AI blog post generation |
| GET | `/api/admin/blog/analytics` | Blog analytics dashboard |

### Admin WhatsApp APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/whatsapp/conversations` | WhatsApp conversations |
| GET/PUT | `/api/admin/whatsapp/conversations/[id]` | Individual conversation |
| GET/POST | `/api/admin/whatsapp/templates` | Message templates |

### Payment APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/checkout` | Create Stripe session |
| GET | `/api/payments/status` | Check payment status |
| POST | `/api/payments/webhook` | Stripe webhook handler |

### Currency APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/currency/convert` | Convert amount |
| GET | `/api/currency/rates` | Get exchange rates |

### Customer APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/customer/loyalty` | Loyalty account |
| POST | `/api/customer/surveys/[id]` | Submit survey |

### Public Blog APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/blog/posts` | List published blog posts (with category/destination filters) |
| GET | `/api/blog/posts/[slug]` | Get single blog post by slug |

### Customer Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/portal/auth/send-code` | Send email verification code |
| POST | `/api/portal/auth/verify-code` | Verify code and create session |
| GET | `/api/portal/auth/me` | Current customer session |
| POST | `/api/portal/auth/logout` | End customer session |
| GET | `/api/portal/dashboard` | Customer dashboard data |
| GET | `/api/portal/bookings` | Customer's bookings |
| GET | `/api/portal/bookings/[id]` | Individual booking detail |
| GET | `/api/portal/quotes` | Customer's quotes |
| GET | `/api/portal/quotes/[id]` | Individual quote detail |
| GET | `/api/portal/loyalty` | Loyalty account and transactions |
| POST | `/api/portal/loyalty/redeem` | Redeem loyalty points |
| POST | `/api/portal/loyalty/referral` | Submit referral |
| GET/PUT | `/api/portal/profile` | Customer profile management |

### Agency Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/agency/auth/login` | Agency user login |
| POST | `/api/agency/auth/logout` | Agency logout |
| GET | `/api/agency/auth/me` | Current agency session |
| POST | `/api/agency/chat` | Agency B2B AI chat (20% margin) |
| GET/POST | `/api/agency/clients` | Agency client management |
| GET/PUT/DELETE | `/api/agency/clients/[id]` | Individual client |
| GET/POST | `/api/agency/bookings` | Agency bookings |
| GET | `/api/agency/bookings/[id]` | Individual booking |
| GET/POST | `/api/agency/quotes` | Agency quotes |
| GET/PUT | `/api/agency/quotes/[id]` | Individual quote |
| GET | `/api/agency/rates` | Agency rate sheet |
| GET | `/api/agency/suppliers` | Agency suppliers |

### WhatsApp APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/whatsapp/webhook` | WhatsApp incoming webhook |
| POST | `/api/whatsapp/send` | Send WhatsApp message |

### Media Library APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/media/homepage` | Public homepage images from media library |
| GET/POST | `/api/admin/media` | List/search media, create metadata record |
| POST | `/api/admin/media/upload` | Multipart file upload with R2 processing |
| GET/PUT/DELETE | `/api/admin/media/[id]` | Single media CRUD (soft/hard delete) |
| POST | `/api/admin/media/bulk` | Bulk tag/categorize/delete/collection ops |
| POST | `/api/admin/media/auto-tag` | AI auto-tagging via DeepSeek |
| GET | `/api/admin/media/stats` | Media library statistics |
| GET/POST | `/api/admin/media/collections` | List/create collections |
| GET/PUT/DELETE | `/api/admin/media/collections/[id]` | Single collection CRUD |

### Supplier Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/supplier/auth/login` | Supplier login |
| POST | `/api/supplier/auth/logout` | Supplier logout |
| GET | `/api/supplier/auth/me` | Current supplier |
| GET | `/api/supplier/bookings` | Supplier's bookings |
| GET/PUT | `/api/supplier/rates` | Supplier's rates |
| PUT | `/api/supplier/rates/[serviceType]/[id]` | Update individual rate |
