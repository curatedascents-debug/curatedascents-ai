# E2E Test Architecture (`tests/`)

**380+ tests across 66 spec files, 9 categories, 100% pass rate.**

## Directory Structure

```
tests/
├── playwright.config.ts              # Multi-env config (local/staging/production)
├── tsconfig.json                      # Test-only TS config with @/* path alias
├── .env.test                          # Local test env vars (DATABASE_URL, JWT secrets, dummy API keys)
├── global-setup.ts                    # Database seeding (Drizzle direct -> HTTP fallback)
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
│   └── summary-reporter.ts           # Custom reporter -> test-summary.json
├── specs/                             # 66 spec files across 9 categories
│   ├── admin/ (12), agency/ (3), api/ (21), auth/ (4), chat/ (5)
│   ├── journeys/ (4), portal/ (7), public/ (8), supplier/ (2)
└── ci/
    └── playwright.yml                 # GitHub Actions CI config
```

## Key Testing Patterns

- Auth fixtures generate JWTs programmatically — no server needed for agency/supplier/portal auth
- Admin auth uses hash-based token matching `src/middleware.ts` algorithm
- Chat mocks intercept at browser level via `page.route('**/api/chat', ...)` — must return `{ message: "...", role: "assistant" }`
- Email capture modal blocks chat input after 2nd user message — tests must dismiss it via `chatWidget.skipEmailCapture()` before sending more
- Use `waitForLoadState('networkidle')` after navigation for reliable page load detection
- Use `.first()` with `getByRole('button', { name: /regex/ })` to avoid strict mode violations when multiple buttons match
- Admin API endpoints have inline auth — API tests must include admin auth cookie via `generateAdminToken()` from auth fixture
- MSW (`msw` devDep): server-side mocking via `tests/msw/` + `src/instrumentation.ts` (ENABLE_MSW=true)
- Drizzle direct seeding fails (ESM/CJS conflict with `@neondatabase/serverless`); HTTP `/api/seed-all` fallback works
- Agency auth tests use inline JWT generation via `jose` (same pattern as `auth.fixture.ts`)

## Test Categories

| Category | Specs | Tests | What's Tested |
|----------|-------|-------|---------------|
| api | 21 | ~170 | Admin CRUD, blog, chat, media, payment, portal, financial, availability, risk, loyalty, content, support, agency CRUD, supplier extended, WhatsApp, deduplication, health, security APIs |
| admin | 12 | 50 | All admin dashboard tabs (rates, hotels, suppliers, clients, quotes, bookings, blog, media, pricing, nurture, reports) |
| public | 8 | ~60 | Homepage, blog, static pages, SEO, about, sub-region destinations, itinerary image/formatting |
| portal | 7 | 22 | Customer portal pages (dashboard, trips, quotes, loyalty, chat, currency, settings) |
| auth | 4 | 21 | Admin, agency, supplier, portal authentication flows |
| chat | 5 | 19 | Chat widget, conversation flow, tool responses, personalization/email capture, agency chat |
| journeys | 4 | 12 | End-to-end user journeys (customer booking, admin management, agency booking, supplier confirmation) |
| agency | 3 | 9 | Agency dashboard, chat, reports |
| supplier | 2 | 7 | Supplier dashboard, rates |

## Test Commands

```bash
npm test                    # Run all tests (all browsers)
npm run test:chromium       # Run tests in Chromium only (fastest)
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
