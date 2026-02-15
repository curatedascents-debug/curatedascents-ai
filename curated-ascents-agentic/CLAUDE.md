# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Detailed reference docs** are in `docs/` — Claude can read them on demand:
> - `docs/API_REFERENCE.md` — Full API endpoint tables (~179 routes)
> - `docs/DATABASE_SCHEMA.md` — All 92 table definitions by grouping
> - `docs/MODULES.md` — All ~56 lib modules with file paths
> - `docs/TESTING.md` — E2E test architecture, patterns, directory structure
> - `docs/CHANGELOG.md` — Feature status & roadmap (Phases 1-6)
> - `docs/CRON_JOBS.md` — 18 cron job schedules

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
npm run test:chromium       # Run tests in Chromium only (fastest)
npm test                    # Run all tests (all browsers)
npm run test:ui             # Open Playwright UI mode
npm run test:smoke          # Run @smoke tagged tests only
```

Tag-specific: `test:admin`, `test:portal`, `test:agency`, `test:auth`, `test:api`, `test:ai-tools`, `test:booking`, `test:regression`, `test:staging`, `test:production`

**Test suite:** 322 tests, 57 spec files, 9 categories, 100% pass rate. Config: `tests/playwright.config.ts`. Full details: `docs/TESTING.md`.

**Critical test notes:**
- Tests live in `tests/` (excluded from `tsconfig.json`)
- Uses system Chrome (`channel: 'chrome'`) for macOS 11 compatibility
- Chat mocks must return `{ message, role }` (NOT `{ response }`)
- Email capture modal triggers after 2nd user message — dismiss via `skipEmailCapture()`
- Admin API endpoints have NO inline auth — middleware only protects page routes

## Environment Variables

Defined in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `DEEPSEEK_API_KEY` — DeepSeek chat API key (server-side only)
- `NEXT_PUBLIC_APP_URL` — Base URL (e.g. `http://localhost:3000`)
- `RESEND_API_KEY` — Resend email API key
- `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` — Admin auth
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe
- `CRON_SECRET` — Vercel cron job auth
- `CUSTOMER_JWT_SECRET` / `AGENCY_JWT_SECRET` / `SUPPLIER_JWT_SECRET` — Portal JWT secrets (fallback chain)
- `ENABLE_MSW` — Enable Mock Service Worker for E2E tests
- `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL` — Cloudflare R2

## Development Workflow

1. Pull latest from `main`, create feature branch
2. Develop: `npm run dev` at localhost:3000
3. Test: `npm run test:chromium` (322 tests)
4. Build: `npm run build` (zero TS errors)
5. Push branch, PR, merge to `main` (Vercel auto-deploys)

## Vercel Deployment

- **Git root:** Parent directory (`curatedascents-ai/`)
- **App code:** Subdirectory (`curated-ascents-agentic/`)
- **Deploy from git root:** `cd /path/to/curatedascents-ai && npx vercel --prod`
- **Force deploy:** Add `--force` flag
- **Production URL:** `https://curated-ascents-agentic.vercel.app`
- Do NOT deploy from the subdirectory — it fails with "Root Directory not found"

## Architecture

**Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3 + @tailwindcss/typography, Drizzle ORM, Neon PostgreSQL, Vercel AI SDK (`ai`), Framer Motion

**Path alias:** `@/*` maps to `./src/*`

**Brand Identity:**
- **Slogan:** "Beyond Boundaries, Beyond Ordinary"
- **Logo:** `src/components/icons/CuratedAscentsLogo.tsx` (gold stroke SVG twin peaks)
- **Favicon:** `src/app/favicon.ico` + `public/icons/` (all sizes)
- **Office:** 4498 Voyageur Way, Carmel, IN 46074, USA | Phone: +1-715-505-4964

**Design System:**
- **Fonts:** Playfair Display (serif headings) + DM Sans (body) via `next/font/google`
- **CSS Variables:** `--font-playfair`, `--font-dm-sans` on `<html>`
- **Colors:** navy `#0F1B2D`, gold `#C9A96E`, cream `#F5F0EB`, charcoal `#2A2A2A`, mist `#E8E2DA`, white `#FAFAF8`
- **Tailwind:** `bg-luxury-navy`, `text-luxury-gold`, `bg-luxury-cream`, `text-luxury-charcoal`, `bg-luxury-mist`, `bg-luxury-white`
- **Global CSS:** `src/app/globals.css` — `.btn-primary`, `.btn-secondary`, `.glass`, `.section-divider`, `.link-underline`, `.text-gradient`, `.markdown-content` (chat styling)

### Routing (Summary)

**Public:** `/`, `/blog`, `/blog/[slug]`, `/faq`, `/contact`, `/privacy-policy`, `/terms`, `/payment/success`, `/payment/cancelled`
**Admin:** `/admin`, `/admin/login`
**Supplier:** `/supplier/login`, `/supplier/dashboard`
**Agency:** `/agency/login`, `/agency/dashboard` (Clients/Quotes/Bookings/Reports/AI Chat tabs)
**Customer Portal:** `/portal/login`, `/portal`, `/portal/trips`, `/portal/quotes`, `/portal/loyalty`, `/portal/chat`, `/portal/currency`, `/portal/settings`
**API:** `/api/chat`, `/api/admin/*`, `/api/portal/*`, `/api/agency/*`, `/api/supplier/*`, `/api/blog/*`, `/api/payments/*`, `/api/currency/*`, `/api/media/*`, `/api/whatsapp/*`, `/api/cron/*` — See `docs/API_REFERENCE.md` for full list.

### AI Chat Flow (`/api/chat`)

1. User message from `ChatInterface` to `/api/chat`
2. Route handler calls DeepSeek API with conversation history, system prompt, 18 tool definitions
3. DeepSeek may invoke tools (up to 10 iterations) — dispatched via `tool-executor.ts` to `database-tools.ts`
4. **Price sanitization**: `sanitizeForClient()` strips all cost/margin fields before sending tool results back to DeepSeek
5. Empty DB results fall back to market rate estimates from `fallback-rate-research.ts`
6. Final response returned to client

### AI Tools (18)

`search_rates`, `search_hotels`, `search_packages`, `get_rate_details`, `calculate_quote`, `get_destinations`, `get_categories`, `research_external_rates`, `get_booking_status`, `get_payment_schedule`, `convert_quote_to_booking`, `check_supplier_confirmations`, `get_trip_briefing`, `convert_currency`, `get_supported_currencies`, `get_dynamic_price`, `check_pricing_promotions`, `search_photos`

### Database Schema

92 tables + 20+ enums in `src/db/schema.ts`. See `docs/DATABASE_SCHEMA.md` for full listing.

**CRITICAL: Never use `sql.raw()` for WHERE clauses.** Neon's HTTP driver caches by SQL text. Raw SQL returns stale data. Always use Drizzle operators (`eq()`, `and()`, `desc()`, `count()`).

**Key table groups:** Service tables (10 types), Business core (suppliers, clients, quotes, bookings), Financial (invoices, payments), Pricing & Inventory, Agency & Multi-Tenant, Customer Success, Risk & Compliance, Content, Blog, WhatsApp, Media Library, Customer Portal.

### Component Patterns

Homepage uses a **"donut" pattern**: `ChatProvider` (client) wraps the page; `{children}` are server components for SEO. Five sections (HowItWorks, SignatureJourneys, FounderSection, TrustStrip, FinalCTA) are server components. Client leaf components (`ChatButton`, `ScrollLink`, `AnimateOnScroll`) handle interactivity.

**Admin Dashboard Tabs:** Rates, Suppliers, Hotels, Clients, Quotes, Bookings, Supplier Portal, Pricing, Nurture, Competitors, Blog, WhatsApp, Media (3 sub-tabs), Reports (5 sub-tabs)

### Pricing Rules

- Sell = Cost * (1 + Margin%). Default: 50%, Agency: 20% (configurable), MICE: 35%
- Nepal: 13% VAT + 10% service charge
- Dynamic adjustments: early bird (5-15%), group (5-15%), loyalty (2-12%), seasonal (0.7x-1.3x), demand (+-20%)

## User Roles

| Role | Access |
|------|--------|
| End Customer | AI Chat, quote viewing, payment, loyalty dashboard |
| Platform Admin | Full admin dashboard, all settings |
| Agency | Agency dashboard, B2B AI chat (20% margin), client management |
| Supplier | Supplier portal, rate management, booking confirmations |

## Key Patterns & Conventions

- **Admin APIs** don't check auth inline — middleware handles it
- **Cron jobs**: verify `CRON_SECRET` via `Authorization: Bearer` header, `export const dynamic = "force-dynamic"`
- **Email**: `sendEmail()` from `@/lib/email/send-email.ts`, templates in `src/lib/email/templates/`
- **Chat state**: `useChatContext()` from `ChatContext.tsx` — no prop drilling
- **Blog content**: `ReactMarkdown` with Tailwind `prose` classes in `BlogPost.tsx`
- **Scroll animations**: `[data-animate]` CSS in `globals.css` + `AnimateOnScroll` wrapper (IntersectionObserver)
- **Auth**: Customer (email codes + JWT via `jose`), Agency/Supplier (`bcryptjs` + JWT), Admin (session cookie)
- **Price security**: `sanitizeForClient()` strips cost/margin before AI sees tool results
- **Seed**: `/api/seed-all` uses `onConflictDoUpdate` on slug for reliable upsert
- **Media**: Cloudflare R2 with WebP conversion + thumbnails via `sharp`; local filesystem fallback (`public/uploads/media/`) when R2 not configured
- **SEO**: Dynamic `sitemap.ts` (static pages + blog posts), `robots.ts` (blocks admin/api/portal/agency/supplier)
- **Error pages**: Branded `not-found.tsx` (404) and `error.tsx` (error boundary) matching luxury design
- **Chat markdown**: `.markdown-content` CSS in `globals.css` — compact spacing, gold bold, heading hierarchy, HR/blockquote styling
- **Neon cache fix**: `fetchOptions: { cache: "no-store" }` on Neon client in `src/db/index.ts` prevents Next.js from caching DB queries
