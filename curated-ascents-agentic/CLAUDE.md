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

## Development Workflow

1. Pull latest from `main` branch
2. Create feature branch: `git checkout -b feature/[name]`
3. Develop locally: `npm run dev` at localhost:3000
4. Validate build: `npm run build` (zero TypeScript errors required)
5. Push branch, open PR, review, merge to `main`
6. Vercel auto-deploys `main` to production

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Drizzle ORM, Neon PostgreSQL

**Deployment:** Vercel (serverless, auto-deploy from GitHub `main` branch)

**Path alias:** `@/*` maps to `./src/*`

### Routing

- `/` — Chat interface (main user-facing page)
- `/admin` — Admin dashboard for managing rates, suppliers, hotels (protected)
- `/admin/login` — Admin login page (password authentication)
- `/api/chat` — Core AI chat endpoint with tool execution loop
- `/api/personalize` — Captures user email/name into `clients` table
- `/api/admin/auth/login` — Admin authentication endpoint
- `/api/admin/auth/logout` — Admin logout endpoint
- `/api/admin/*` — CRUD endpoints for rates, suppliers, hotels, destinations
- `/api/agent/*` — Agent-facing data endpoints
- `/api/seed`, `/api/seed-all` — Database seeding (idempotent — skips tables that already have data)

### AI Chat Flow (`/api/chat`)

1. User message sent from `ChatInterface` (client component) to `/api/chat`
2. Route handler calls DeepSeek API (`deepseek-chat` model) with conversation history, system prompt, and 8 tool definitions
3. DeepSeek may invoke tools (up to 10 iterations) — tool calls are executed via `tool-executor.ts` which dispatches to `database-tools.ts`
4. **Price sanitization**: Before tool results are sent back to DeepSeek, `sanitizeForClient()` strips all cost/margin fields (`cost*`, `basecost`, `margin*`). This is the critical security boundary preventing the AI from ever seeing internal pricing
5. If database queries return empty, fallback market rates from `fallback-rate-research.ts` are used (clearly labelled as estimates)
6. Final AI response returned to client

### 8 AI Tool Definitions

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

### Key Modules

- `src/lib/agents/tool-definitions.ts` — Function/tool schemas for DeepSeek
- `src/lib/agents/tool-executor.ts` — Dispatches tool calls to the appropriate handler
- `src/lib/agents/database-tools.ts` — Database query functions for all service types (unified cross-table search with `serviceType` discriminator)
- `src/lib/agents/fallback-rate-research.ts` — Estimated market rates when DB has no data

### Database Schema (`src/db/schema.ts`)

19 tables managed by Drizzle ORM. Key groupings:

- **Service tables** (10 types): `hotels` + `hotelRoomRates`, `transportation`, `permitsFees`, `guides`, `porters`, `flightsDomestic`, `helicopterSharing`, `helicopterCharter`, `miscellaneousServices`, `packages`
- **Business tables**: `clients`, `quotes`, `quoteItems`, `bookings`
- **Reference tables**: `suppliers`, `destinations`, `seasons`

Key relationships:
- `suppliers` 1:N `hotels` 1:N `hotelRoomRates`
- `destinations` 1:N `hotels`
- `seasons` 1:N `hotelRoomRates` (rate multipliers)
- `clients` 1:N `quotes` 1:N `quoteItems`
- `quotes` 1:1 `bookings`
- `suppliers.contacts` is a JSONB array (embedded multi-contact with `isPrimary` flag, department, phone channels)

All rate tables have dual pricing: `costPrice` (supplier cost, internal only) and `sellPrice` (customer-facing). The admin dashboard shows both; the chat AI only sees sell prices after sanitization.

### Component Patterns

All React components in `src/components/` are client components (`"use client"`). No global state management — components use local `useState`/`useRef`. Conversation history is sent with every chat request (stateless backend).

The admin dashboard (`AdminDashboard.tsx`) uses a tabbed interface (Rates, Suppliers, Hotels) with:
- Client-side search and filtering (real-time, no API call)
- Stats cards computed client-side from the loaded data
- Modal dialogs for CRUD operations (`HotelModal`, `SupplierModal`, `RateDetailModal`, `EditRateModal`, `AddRateForm`)
- Supplier modal has a multi-tab layout: Basic Info, Contact Persons (JSONB add/remove), Department Contacts, Banking, Notes

### Pricing Rules

- Sell price formula: `Sell = Cost * (1 + Margin%)`
- Default margin: 50% for standard clients
- MICE groups (20+ pax): 35% margin
- Nepal-specific: 13% VAT + 10% service charge

## User Roles

| Role | Access |
|------|--------|
| End Customer | AI Chat at `/`, quote viewing |
| Travel Agent | AI Chat, admin dashboard, PDF quote export (planned) |
| Platform Admin | Full admin dashboard, data seeding, rate management |

## Feature Status & Roadmap

**Built (Phase 1):** AI chat with tool calling, multi-table rate database, admin dashboard (Hotels/Suppliers/Rates), quote calculation engine, DB seeding, fallback research

**Phase 2 (Current):** PDF quote generation, client management interface, extended admin pages (Transportation/Guides/Flights/Permits/Packages), booking workflow (quote-to-booking conversion), email integration

**Phase 3 (Planned):** Multi-currency FX conversion, payment gateway (Stripe/Adyen), white-label agency portal, advanced reporting

### AI Agents Roadmap (Multi-Agent Architecture)

Detailed planning documents for the autonomous multi-agent system are in `docs/`:

- **[docs/AI_AGENTS_ROADMAP.md](docs/AI_AGENTS_ROADMAP.md)** — Full specifications for 10 AI agents, architecture diagrams, implementation phases, and technology decisions
- **[docs/IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md)** — Actionable checklist for tracking progress, schema changes, and API endpoints

**Planned Agents:**
1. Expedition Architect (Enhanced) — Customer-facing chat with availability checks, itinerary optimization
2. Availability & Inventory Agent — Real-time supplier calendar sync, permit tracking
3. Dynamic Pricing Agent — Demand-based pricing, yield management
4. Supplier Relations Agent — Automated booking requests, performance scoring
5. Booking Operations Agent — End-to-end booking lifecycle automation
6. Customer Success Agent — In-trip support, loyalty, referrals
7. Lead Intelligence Agent — Lead scoring, nurture sequences
8. Content & Personalization Agent — PDF generation, personalized messaging
9. Risk & Compliance Agent — Weather monitoring, travel advisories
10. Financial Operations Agent — Invoicing, payments, reporting

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | AI chat with tool execution loop |
| POST | `/api/personalize` | Save client email/name |
| GET | `/api/seed` | Idempotent database seeding |
| GET/POST | `/api/admin/rates` | List / Create hotel room rates |
| GET/PUT/DELETE | `/api/admin/rates/[serviceType]/[id]` | CRUD for specific rate |
| GET/POST | `/api/admin/suppliers` | List / Create suppliers |
| GET/PUT/DELETE | `/api/admin/suppliers/[id]` | CRUD for specific supplier |
| GET/POST | `/api/admin/hotels` | List / Create hotels |
| GET/PUT/DELETE | `/api/admin/hotels/[id]` | CRUD for specific hotel |
| GET/POST | `/api/admin/destinations` | List / Create destinations |
