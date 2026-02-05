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

No test runner is configured. There are no unit or integration tests.

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

## Development Workflow

1. Pull latest from `main` branch
2. Create feature branch: `git checkout -b feature/[name]`
3. Develop locally: `npm run dev` at localhost:3000
4. Validate build: `npm run build` (zero TypeScript errors required)
5. Push branch, open PR, review, merge to `main`
6. Vercel auto-deploys `main` to production

## Architecture

**Stack:** Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS 4, Drizzle ORM, Neon PostgreSQL

**Deployment:** Vercel (serverless, auto-deploy from GitHub `main` branch)

**Path alias:** `@/*` maps to `./src/*`

### Routing

**Public Routes:**
- `/` — Luxury homepage with floating AI chat widget
- `/blog` — Blog listing page with category filters
- `/blog/[slug]` — Individual blog post with related articles
- `/payment/success` — Payment confirmation page
- `/payment/cancelled` — Payment cancellation page

**Admin Routes:**
- `/admin` — Admin dashboard (protected)
- `/admin/login` — Admin login page

**Supplier Portal:**
- `/supplier/login` — Supplier login page
- `/supplier/dashboard` — Supplier self-service portal

**API Routes:**
- `/api/chat` — Core AI chat endpoint with tool execution loop
- `/api/personalize` — Captures user email/name into `clients` table
- `/api/admin/*` — Admin CRUD endpoints
- `/api/supplier/*` — Supplier portal endpoints
- `/api/payments/*` — Stripe payment processing
- `/api/currency/*` — Currency conversion
- `/api/customer/*` — Customer loyalty & surveys
- `/api/cron/*` — Scheduled background jobs

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

### Key Modules

**AI & Tools:**
- `src/lib/agents/tool-definitions.ts` — Function/tool schemas for DeepSeek
- `src/lib/agents/tool-executor.ts` — Dispatches tool calls to the appropriate handler
- `src/lib/agents/database-tools.ts` — Database query functions for all service types
- `src/lib/agents/fallback-rate-research.ts` — Estimated market rates when DB has no data

**Pricing & Currency:**
- `src/lib/pricing/pricing-engine.ts` — Dynamic pricing with seasonal, demand, early bird, group, loyalty rules
- `src/lib/currency/currency-service.ts` — Multi-currency conversion with cached exchange rates

**Lead Intelligence:**
- `src/lib/nurture/scoring-engine.ts` — Lead scoring based on engagement signals
- `src/lib/nurture/nurture-engine.ts` — Email nurture sequence automation

**Email Templates:**
- `src/components/emails/` — React Email templates for all notifications

### Database Schema (`src/db/schema.ts`)

50+ tables managed by Drizzle ORM. Key groupings:

**Service Tables (10 types):**
- `hotels` + `hotelRoomRates` — Accommodation with room-level pricing
- `transportation` — Vehicles and transfers
- `permitsFees` — Government permits and fees
- `guides` — Guide services
- `porters` — Porter services
- `flightsDomestic` — Domestic flights
- `helicopterSharing` / `helicopterCharter` — Helicopter services
- `miscellaneousServices` — Other services
- `packages` — Complete tour packages

**Business Tables:**
- `clients` — Customer records with contact info
- `quotes` / `quoteItems` — Quote management
- `bookings` — Confirmed bookings
- `bookingEvents` — Audit trail for booking activities
- `paymentMilestones` — Payment schedule tracking
- `supplierConfirmationRequests` — Supplier booking confirmations
- `tripBriefings` — Pre-departure documents

**Pricing & Inventory:**
- `pricingRules` — Dynamic pricing rules
- `seasons` — Seasonal pricing multipliers
- `demandMetrics` — Demand-based pricing data
- `competitorRates` — Competitor price tracking
- `availabilityCalendar` — Service availability
- `inventoryHolds` — Temporary inventory reservations

**Lead & Customer:**
- `leadScores` — Lead scoring data
- `nurtureSequences` / `nurtureEnrollments` — Email nurture automation
- `loyaltyAccounts` / `loyaltyTransactions` — Customer loyalty program
- `referrals` — Referral tracking

**Supplier & Agency:**
- `suppliers` — Supplier records with contacts (JSONB)
- `supplierPerformance` — Supplier performance metrics
- `agencies` — White-label agency portal
- `agencyUsers` — Agency user accounts

**Risk & Compliance:**
- `riskAlerts` — Travel advisories and weather alerts
- `clientNotifications` — Risk notification tracking

### Component Patterns

All React components in `src/components/` are client components (`"use client"`). No global state management — components use local `useState`/`useRef`. Conversation history is sent with every chat request (stateless backend).

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
- **Reports** — Advanced analytics with sub-tabs (Overview, Financial, Suppliers, Leads, Operations)

### Pricing Rules

- Sell price formula: `Sell = Cost * (1 + Margin%)`
- Default margin: 50% for standard clients
- MICE groups (20+ pax): 35% margin
- Nepal-specific: 13% VAT + 10% service charge

**Dynamic Pricing Adjustments:**
- Early bird: 5-15% discount (30-90 days ahead)
- Group discounts: 5-15% (6-20+ pax)
- Loyalty tiers: 2-12% (Bronze to Platinum)
- Seasonal multipliers: 0.7x to 1.3x
- Demand-based: ±20% based on booking velocity

### Cron Jobs (Vercel Cron)

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Daily 9 AM | `/api/cron/payment-reminders` | Payment due reminders |
| Daily 10 AM | `/api/cron/trip-briefings` | Pre-departure briefings |
| Daily 11 AM | `/api/cron/supplier-followup` | Supplier confirmation follow-up |
| Daily 8 AM | `/api/cron/nurture-sequences` | Email nurture automation |
| Daily 6 AM | `/api/cron/lead-reengagement` | Cold lead re-engagement |
| Weekly | `/api/cron/supplier-performance` | Supplier scoring |
| Daily 5 AM | `/api/cron/update-exchange-rates` | Currency rate updates |
| Hourly | `/api/cron/demand-analysis` | Demand metrics calculation |
| Daily 3 AM | `/api/cron/price-optimization` | Price optimization suggestions |
| Hourly | `/api/cron/release-expired-holds` | Release expired inventory |
| Every 4 hours | `/api/cron/risk-monitoring` | Travel advisory updates |
| Daily 9 AM | `/api/cron/trip-checkins` | In-trip check-in prompts |
| Weekly | `/api/cron/feedback-requests` | Post-trip feedback requests |
| Monthly | `/api/cron/points-expiry` | Loyalty points expiry warnings |
| Daily | `/api/cron/invoice-overdue` | Overdue invoice reminders |
| Daily 6 AM | `/api/cron/blog-publishing` | Publish scheduled blog posts |
| Daily 7 AM | `/api/cron/social-media-posting` | Social media distribution |

## User Roles

| Role | Access |
|------|--------|
| End Customer | AI Chat, quote viewing, payment, loyalty dashboard |
| Travel Agent | AI Chat, admin dashboard, PDF export |
| Platform Admin | Full admin dashboard, all settings |
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
- **Payment Integration** — Stripe checkout with webhook handling

### ✅ Phase 3: Intelligence & Automation (Complete)
- **Dynamic Pricing Engine** — Seasonal, demand, early bird, group, loyalty rules
- **Lead Scoring** — Engagement-based scoring (0-100) with status tracking
- **Email Nurture System** — Automated sequences with enrollment tracking
- **Advanced Reporting** — 5 sub-tabs with date filters and CSV export
- **Competitor Monitoring** — Rate tracking, comparison, market insights
- **Customer Loyalty** — Points, tiers (Bronze→Platinum), referrals
- **Risk & Compliance** — Weather alerts, travel advisories, notifications
- **Supplier Performance** — Response rates, reliability scores, automated follow-up

### ✅ Phase 4.1: Luxury Homepage UI (Complete)
Premium landing page targeting high-net-worth travelers:
- **Hero Section** — Full-screen Himalayan imagery with gradient overlay
- **Featured Experiences** — 6 curated expedition cards with hover effects
- **Trust Signals** — Animated stat counters (500+ expeditions, 2,500+ travelers, 28+ years, 4.9 rating)
- **Testimonial Carousel** — Auto-rotating customer quotes with navigation
- **Destination Highlights** — Bento grid layout (Nepal, Bhutan, Tibet, India)
- **About Section** — Value propositions with split layout
- **AI Chat Widget** — Floating expandable chat panel
- **Responsive Navigation** — Transparent→solid on scroll, mobile hamburger menu
- **Framer Motion Animations** — Smooth fade, slide, and scale transitions
- **Google Fonts** — Playfair Display (headlines) + Inter (body)

**Homepage Components:** `src/components/homepage/`
- `LuxuryHomepage.tsx` — Main orchestrator
- `Navigation.tsx` — Fixed header with scroll detection
- `HeroSection.tsx` — Full-viewport hero with CTAs
- `FeaturedExperiences.tsx` + `ExperienceCard.tsx` — Package grid
- `TrustSignals.tsx` + `StatCard.tsx` + `TestimonialCarousel.tsx` — Social proof
- `DestinationHighlights.tsx` + `DestinationCard.tsx` — Destination grid
- `AboutSection.tsx` — Value propositions
- `Footer.tsx` — 4-column footer
- `ChatWidget.tsx` — Floating chat wrapper

**Static Data:** `src/lib/constants/`
- `destinations.ts`, `experiences.ts`, `testimonials.ts`, `stats.ts`

**Animations:** `src/lib/animations.ts` — Framer Motion variants

### ✅ Phase 4.2: AI-Powered Blog & SEO Engine (Complete)
Autonomous content creation for organic traffic and social media:
- **AI Blog Writer Agent** — DeepSeek-powered content generation with structured prompts
- **Content Calendar** — Admin dashboard with scheduling and bulk management
- **SEO Optimization** — Auto-generated meta tags, keywords, slugs, read time
- **Social Media Integration** — Platform-specific formatting for Instagram, Facebook, LinkedIn, Twitter/X
- **Content Types:**
  - Destination guides, Travel tips, Packing lists
  - Cultural insights, Seasonal content, Trip reports
- **Public Blog** — Responsive blog listing and article pages with markdown rendering
- **Admin Controls** — Full CRUD, AI generation, category management, analytics

**Blog Components:** `src/components/blog/`
- `BlogList.tsx` — Category-filtered post grid with pagination
- `BlogCard.tsx` — Post preview cards with hover effects
- `BlogPost.tsx` — Full article with markdown, share buttons, related posts

**Admin Components:** `src/components/admin/`
- `BlogTab.tsx` — Posts, categories, schedule, analytics sub-tabs
- `BlogPostModal.tsx` — Create/edit with AI generation

**Blog Libraries:** `src/lib/blog/`
- `blog-writer-agent.ts` — DeepSeek content generation
- `seo-optimizer.ts` — SEO analysis, keyword suggestions, metadata
- `social-media-formatter.ts` — Platform-specific post formatting

**Database Tables:** `blogCategories`, `blogPosts`, `blogSocialPosts`

**Cron Jobs:**
- Daily 6 AM: `/api/cron/blog-publishing` — Publish scheduled posts
- Daily 7 AM: `/api/cron/social-media-posting` — Social media distribution

### 🔮 Phase 5: Future Enhancements
- **Mobile App** — React Native companion app
- **WhatsApp Integration** — AI chat via WhatsApp Business API
- **Video Consultations** — Scheduled video calls with travel experts
- **AR/VR Previews** — Virtual destination tours
- **Carbon Offset** — Sustainability tracking and offsets
- **Multi-language** — AI chat in multiple languages

## API Endpoints Reference

### Core APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | AI chat with tool execution |
| POST | `/api/personalize` | Save client email/name |
| GET | `/api/seed` | Database seeding |

### Admin APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/rates` | Rate management |
| GET/PUT/DELETE | `/api/admin/rates/[serviceType]/[id]` | Individual rate CRUD |
| GET/POST | `/api/admin/suppliers` | Supplier management |
| GET/POST | `/api/admin/hotels` | Hotel management |
| GET/POST | `/api/admin/clients` | Client management |
| GET/POST | `/api/admin/quotes` | Quote management |
| GET/POST | `/api/admin/bookings` | Booking management |
| GET/POST | `/api/admin/destinations` | Destination management |
| GET/POST | `/api/admin/agencies` | Agency management |

### Booking Operations APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/bookings/[id]/milestones` | Payment milestones |
| PUT | `/api/admin/bookings/[id]/milestones/[mid]` | Update milestone |
| GET/POST | `/api/admin/bookings/[id]/suppliers` | Supplier confirmations |
| GET/POST | `/api/admin/bookings/[id]/briefings` | Trip briefings |
| GET | `/api/admin/bookings/[id]/events` | Audit trail |

### Pricing APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/pricing/rules` | Pricing rules CRUD |
| GET | `/api/admin/pricing/demand` | Demand metrics |
| POST | `/api/admin/pricing/simulate` | Price simulation |

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

### Blog APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/blog/posts` | Blog post management |
| GET/PUT/DELETE | `/api/admin/blog/posts/[id]` | Individual post CRUD |
| GET/POST/PUT/DELETE | `/api/admin/blog/categories` | Category management |
| POST | `/api/admin/blog/generate` | AI content generation |
| GET | `/api/blog/posts` | Public blog listing |
| GET | `/api/blog/posts/[slug]` | Public post by slug |

### Reports APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/reports` | Main dashboard KPIs |
| GET | `/api/admin/reports/suppliers` | Supplier performance |
| GET | `/api/admin/reports/leads` | Lead intelligence |

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

### Supplier Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/supplier/auth/login` | Supplier login |
| POST | `/api/supplier/auth/logout` | Supplier logout |
| GET | `/api/supplier/auth/me` | Current supplier |
| GET | `/api/supplier/bookings` | Supplier's bookings |
| GET/PUT | `/api/supplier/rates` | Supplier's rates |
