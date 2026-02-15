# CuratedAscents — AI-Powered Luxury Adventure Travel

CuratedAscents is an AI-powered luxury adventure travel platform for high-net-worth travellers. The AI "Expedition Architect" (powered by DeepSeek) autonomously searches a service catalog of 10+ service types, builds multi-service quotes, and captures leads via natural-language chat.

**Geographic focus:** Nepal, Tibet, Bhutan, and India.

**Production:** [curated-ascents-agentic.vercel.app](https://curated-ascents-agentic.vercel.app)

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS 3 + @tailwindcss/typography, Framer Motion
- **Database:** Neon PostgreSQL + Drizzle ORM (92 tables)
- **AI:** DeepSeek Chat with 18 tool definitions
- **Media:** Cloudflare R2 (WebP conversion, thumbnails via `sharp`)
- **Payments:** Stripe, Bank Transfer (SWIFT), Cash on Arrival
- **Email:** Resend with React Email templates
- **Hosting:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, DEEPSEEK_API_KEY, etc.

# Push database schema
npx drizzle-kit push

# Seed the database
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Commands

```bash
npm run dev           # Dev server on localhost:3000
npm run build         # Production build (must pass with zero TS errors)
npm run start         # Production server
npm run lint          # ESLint
npm run test:chromium # E2E tests (322 tests, Playwright)
npm test              # All E2E tests (all browsers)
```

## Project Structure

```
src/
├── app/              # Next.js App Router (pages + API routes)
├── components/       # React components (~73)
│   ├── admin/        # Admin dashboard tabs
│   ├── blog/         # Blog components
│   ├── homepage/     # Homepage sections (server + client)
│   └── icons/        # SVG icon components
├── db/               # Drizzle ORM schema + migrations
└── lib/              # Business logic (~56 modules)
    ├── agents/       # AI chat processor + tool definitions
    ├── auth/         # Customer, agency, supplier, admin auth
    ├── blog/         # AI blog writer + SEO optimizer
    ├── email/        # Email service + 17 templates
    ├── media/        # R2 client + media service
    ├── pricing/      # Dynamic pricing engine
    └── whatsapp/     # WhatsApp integration (6 modules)
tests/                # Playwright E2E (322 tests, 57 specs)
docs/                 # Reference documentation
```

## Key Features

- **AI Chat** — Natural language trip planning with 18 database tools
- **Admin Dashboard** — Full CRUD for rates, suppliers, hotels, clients, quotes, bookings, blog, media, reports
- **Customer Portal** — Dashboard, trips, quotes, loyalty, chat, currency converter
- **Agency Portal** — B2B AI chat with 20% margin pricing, client management
- **Supplier Portal** — Rate management, booking confirmations
- **Blog** — AI-generated SEO-optimized travel articles with auto-publishing
- **Media Library** — Cloudflare R2 storage with AI auto-tagging
- **Dynamic Pricing** — Seasonal, demand, early bird, group, loyalty rules
- **PWA** — Installable progressive web app with offline support

## Documentation

- `CLAUDE.md` — Development guide and architecture overview
- `docs/API_REFERENCE.md` — Full API endpoint tables (~179 routes)
- `docs/DATABASE_SCHEMA.md` — All 92 table definitions
- `docs/MODULES.md` — All ~56 lib modules with file paths
- `docs/TESTING.md` — E2E test architecture and patterns
- `docs/CHANGELOG.md` — Feature status and roadmap
- `docs/CRON_JOBS.md` — 18 cron job schedules

## Deployment

```bash
# Deploy to Vercel (from git root directory)
cd /path/to/curatedascents-ai && npx vercel --prod
```

See `CLAUDE.md` for detailed deployment instructions.

## License

Proprietary — All rights reserved.
