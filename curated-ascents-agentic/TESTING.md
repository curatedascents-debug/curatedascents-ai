# Testing Guide

This document covers how to run, write, and maintain the E2E test suite for CuratedAscents.

## Quick Start

```bash
# Run all tests (all browsers)
npm test

# Run chromium only (fastest)
npm run test:chromium

# Interactive UI mode
npm run test:ui

# Run by tag
npm run test:smoke       # Critical smoke tests
npm run test:regression  # Full regression suite
npm run test:ai-tools    # AI chat & tool-calling tests
npm run test:booking     # Booking flow tests
npm run test:admin       # Admin dashboard tests
npm run test:portal      # Customer portal tests
npm run test:agency      # Agency portal tests
npm run test:auth        # Authentication tests
npm run test:api         # API endpoint tests

# Run against staging/production
npm run test:staging
npm run test:production
```

## Directory Structure

```
tests/
├── playwright.config.ts          # Multi-env config (local/staging/production)
├── tsconfig.json                  # Dedicated TS config (not included in build)
├── global-setup.ts                # Database seeding via Drizzle ORM
├── global-teardown.ts             # Test data cleanup
├── .env.test                      # Local test env vars
├── .env.staging                   # Staging env vars
├── .env.production                # Production smoke test vars
│
├── factories/
│   └── test-data.factory.ts       # Faker-based data generators
│
├── fixtures/
│   ├── auth.fixture.ts            # Auth contexts (admin, agency, supplier, portal, guest)
│   ├── base.fixture.ts            # Re-exports auth fixture
│   └── test-data.fixture.ts       # Constants: routes, API endpoints, timeouts
│
├── helpers/
│   ├── api.helpers.ts             # API request helpers
│   ├── assertions.helpers.ts      # Custom assertion helpers
│   ├── db.helpers.ts              # Direct Drizzle DB helpers
│   ├── selectors.ts               # Shared CSS selectors
│   └── ui.helpers.ts              # UI interaction helpers
│
├── mocks/
│   ├── chat-responses.ts          # Canned AI chat responses (page.route)
│   ├── stripe-mock.ts             # Stripe payment mocks (page.route)
│   └── external-services.ts       # Currency, email, media mocks (page.route)
│
├── msw/
│   ├── server.ts                  # MSW node server (intercepts in Next.js process)
│   └── handlers/
│       ├── index.ts               # Handler aggregator
│       ├── deepseek.handler.ts    # DeepSeek chat completions mock
│       ├── r2.handler.ts          # Cloudflare R2 storage mock
│       ├── stripe.handler.ts      # Stripe API mock
│       └── resend.handler.ts      # Resend email mock
│
├── page-objects/                  # 20 Page Object Models
│   ├── HomePage.ts
│   ├── BlogPage.ts
│   ├── ChatWidget.ts
│   ├── AdminLoginPage.ts
│   ├── AdminDashboardPage.ts
│   ├── AgencyLoginPage.ts
│   ├── AgencyDashboardPage.ts
│   ├── SupplierLoginPage.ts
│   ├── SupplierDashboardPage.ts
│   ├── PortalLoginPage.ts
│   ├── PortalDashboardPage.ts
│   ├── PortalTripsPage.ts
│   ├── PortalQuotesPage.ts
│   ├── PortalLoyaltyPage.ts
│   ├── PortalChatPage.ts
│   ├── PortalSettingsPage.ts
│   ├── CurrencyConverterPage.ts
│   ├── PaymentPages.ts
│   ├── StaticPages.ts
│   └── OfflinePage.ts
│
├── reporters/
│   └── summary-reporter.ts       # Custom reporter (features, gaps, failures)
│
├── specs/                         # 57 spec files across 9 categories
│   ├── admin/       (11 files)
│   ├── agency/      (3 files)
│   ├── api/         (17 files)
│   ├── auth/        (4 files)
│   ├── chat/        (5 files)
│   ├── journeys/    (4 files)
│   ├── portal/      (7 files)
│   ├── public/      (4 files)
│   └── supplier/    (2 files)
│
└── ci/
    └── playwright.yml             # GitHub Actions workflow
```

## Test Tags

Every spec file is tagged with one or more categories in its `test.describe()` title. Tags use the `@tag` format and can be used with Playwright's `--grep` flag.

| Tag | Purpose | Example files |
|-----|---------|---------------|
| `@smoke` | Critical path — must pass before deploy | homepage, auth, chat widget, blog |
| `@regression` | Full feature coverage | admin tabs, portal pages, journeys |
| `@ai-tools` | AI chat and tool-calling features | chat-*, agency-chat, portal-chat |
| `@booking` | Booking/quote/payment flows | bookings-tab, quotes-tab, journeys |
| `@admin` | Admin dashboard functionality | all admin/ specs, admin-api |
| `@portal` | Customer portal features | all portal/ specs, portal-api |
| `@agency` | Agency portal features | all agency/ specs, agency-auth |
| `@supplier` | Supplier portal features | supplier-dashboard, supplier-rates |
| `@auth` | Authentication flows | admin/agency/supplier/portal auth |
| `@api` | API endpoint tests | all api/ specs |

### Combining tags

```bash
# Run smoke AND auth tests
npx playwright test --config=tests/playwright.config.ts --grep "@smoke|@auth"

# Run only booking-related API tests (both tags must match)
npx playwright test --config=tests/playwright.config.ts --grep "(?=.*@api)(?=.*@booking)"
```

## Environments

| Environment | `TEST_ENV` | Dev server | Database | MSW |
|-------------|-----------|------------|----------|-----|
| Local | `local` (default) | Auto-started | Real (seeded) | Active |
| Staging | `staging` | No (connects to URL) | Staging DB | No |
| Production | `production` | No (connects to URL) | Prod DB | No |

Production mode only runs `@smoke` and `@auth` specs — no database mutations.

## Authentication Fixtures

Tests use pre-generated auth tokens — no API login calls needed at test time.

```typescript
import { test, expect } from '../../fixtures/auth.fixture';

// Use a pre-authenticated admin page
test('admin can view dashboard', async ({ adminPage }) => {
  await adminPage.goto('/admin');
  await expect(adminPage.getByText('CuratedAscents Admin')).toBeVisible();
});

// Use a guest (unauthenticated) page
test('guest is redirected to login', async ({ guestPage }) => {
  await guestPage.goto('/admin');
  await expect(guestPage).toHaveURL(/\/admin\/login/);
});
```

Available fixtures: `adminPage`, `agencyPage`, `supplierPage`, `portalPage`, `guestPage` (and their `*Context` variants for cookie access).

## Page Object Model (POM)

Every major page has a dedicated POM in `tests/page-objects/`. POMs encapsulate locators and common interactions.

### Using a POM

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';

test('homepage loads correctly', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.expectLoaded();
  await homePage.expectHeroVisible();
});
```

### Creating a new POM

1. Create `tests/page-objects/YourPage.ts`
2. Follow this pattern:

```typescript
import { type Page, type Locator, expect } from '@playwright/test';

export class YourPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.submitButton = page.getByRole('button', { name: /submit/i });
  }

  async goto() {
    await this.page.goto('/your-route');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/your-route/);
    await expect(this.heading).toBeVisible();
  }

  async submit() {
    await this.submitButton.click();
  }
}
```

**Guidelines:**
- Use `getByRole()`, `getByText()`, `getByLabel()` over CSS selectors where possible
- Keep locators as `readonly` properties initialized in the constructor
- Name methods as actions (`goto`, `submit`, `search`) or assertions (`expectLoaded`, `expectError`)

## Test Data Factory

The factory in `tests/factories/test-data.factory.ts` generates realistic travel data using `@faker-js/faker`.

### Available factories

| Factory | Generates |
|---------|-----------|
| `createDestination()` | Nepal/Bhutan/Tibet/India destinations |
| `createCustomerProfile()` | Customer with name, email, preferences |
| `createHotel()` | Hotel with star rating, category, amenities |
| `createHotelRoomRate(hotelId)` | Room rate with pricing |
| `createTransportation()` | Vehicle route with pricing |
| `createGuide()` | Guide with languages, experience |
| `createPackage()` | Full tour package with itinerary |
| `createItinerary()` | Multi-day travel itinerary |
| `createQuote()` | Quote with line items |
| `createBooking()` | Booking with reference, status |
| `createSupplier()` | Supplier with service types |
| `createAgencyUser()` | Agency user with role |
| `createLoyaltyAccount()` | Loyalty tier and points |
| `createChatMessage(role)` | Realistic chat message |
| `createConversationHistory(turns)` | Multi-turn conversation |
| `createMany(factory, count)` | Batch generation |

### Usage

```typescript
import { createCustomerProfile, createBooking, createMany } from '../../factories/test-data.factory';

test('displays customer profile', async ({ page }) => {
  const customer = createCustomerProfile({ country: 'Nepal' });
  // Use customer.name, customer.email, etc.
});

test('handles multiple bookings', async ({ page }) => {
  const bookings = createMany(createBooking, 5, { status: 'confirmed' });
  // bookings is an array of 5 confirmed bookings
});
```

The factory is seeded (`faker.seed(42)`) for reproducible data. Override per-test if you need randomness.

## Mocking Strategy

Two mocking layers work together:

### 1. MSW (server-side, in the Next.js process)

MSW intercepts external API calls (DeepSeek, R2, Stripe, Resend) at the Node.js network level inside the Next.js server. Activated when `ENABLE_MSW=true`.

- **When it runs:** Only in local test mode (set via `webServer.env` in config)
- **What it mocks:** DeepSeek chat completions, Cloudflare R2 uploads, Stripe sessions, Resend emails
- **Config:** `tests/msw/handlers/` — edit handlers to change mock responses
- **Bootstrap:** `src/instrumentation.ts` starts MSW on server boot

### 2. Playwright page.route() (browser-side, in the test process)

`page.route()` intercepts API responses at the browser level before they reach the UI.

- **When it runs:** In individual test files that call mock functions
- **What it mocks:** `/api/chat`, `/api/payments/*`, `/api/currency/*`, etc.
- **Config:** `tests/mocks/` — import and call in your test

```typescript
import { mockChatEndpoint } from '../../mocks/chat-responses';

test('chat displays greeting', async ({ page }) => {
  await mockChatEndpoint(page, 'greeting');
  await page.goto('/');
  // Chat will receive the canned greeting response
});
```

**When to use which:**
- Use **MSW** when you need to mock external APIs that the Next.js server calls (DeepSeek, Stripe SDK, etc.)
- Use **page.route()** when you need to mock your own API endpoints or customize responses per test

## Custom Reporter

The summary reporter (`tests/reporters/summary-reporter.ts`) runs automatically and outputs:

1. **Features tested** — grouped by category and tag
2. **Coverage gaps** — pages and API endpoints without direct tests
3. **Failed assertions** — with file, tags, duration, and error message
4. **JSON summary** — written to `test-summary.json` for CI integration

Sample output:
```
══════════════════════════════════════════════════════════
  CuratedAscents Test Suite — 322 tests
══════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────
  FEATURES TESTED (by category)
──────────────────────────────────────────────────────────
  ✓ admin           11 specs   58 tests   58 passed
  ✓ portal           7 specs   32 tests   32 passed
  ✓ api              7 specs   28 tests   28 passed
  ...

──────────────────────────────────────────────────────────
  COVERAGE GAPS
──────────────────────────────────────────────────────────
  Pages without direct tests (1):
    - /offline
  APIs without direct tests (3):
    - /api/admin/competitors
    ...
```

## Adding Tests for a New Feature

Follow this checklist when adding a feature:

### 1. Create a Page Object (if UI)

```bash
# Create tests/page-objects/NewFeaturePage.ts
```

### 2. Create the spec file

Place it in the appropriate category directory under `tests/specs/`:

```bash
tests/specs/admin/new-feature-tab.spec.ts    # Admin feature
tests/specs/portal/new-feature.spec.ts       # Portal feature
tests/specs/api/new-feature-api.spec.ts      # API endpoint
```

### 3. Add tags to the test.describe

```typescript
test.describe('New Feature @admin @regression', () => {
  // ...
});
```

### 4. Write tests using existing patterns

```typescript
import { test, expect } from '../../fixtures/auth.fixture';
import { NewFeaturePage } from '../../page-objects/NewFeaturePage';
import { createCustomerProfile } from '../../factories/test-data.factory';

test.describe('New Feature @portal @regression', () => {
  let featurePage: NewFeaturePage;

  test.beforeEach(async ({ portalPage }) => {
    featurePage = new NewFeaturePage(portalPage);
  });

  test('loads the page', async () => {
    await featurePage.goto();
    await featurePage.expectLoaded();
  });

  test('shows customer data', async () => {
    const customer = createCustomerProfile();
    await featurePage.goto();
    // Assert against UI...
  });
});
```

### 5. Add API tests if the feature has endpoints

```typescript
import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('New Feature API @api @regression', () => {
  test('GET /api/new-feature returns data', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/new-feature`);
    expect(response.ok()).toBeTruthy();
  });
});
```

### 6. Add the route to the reporter's known lists

Edit `tests/reporters/summary-reporter.ts` and add your new page/API to `KNOWN_PAGES` or `KNOWN_APIS` so the coverage gap detection picks it up.

### 7. Add the API route constant

Add to `tests/fixtures/test-data.fixture.ts`:

```typescript
export const API_ROUTES = {
  // ...existing...
  newFeature: '/api/new-feature',
};
```

### 8. Run and verify

```bash
# Run just your new tests
npx playwright test --config=tests/playwright.config.ts tests/specs/portal/new-feature.spec.ts

# Run the full suite to check for regressions
npm run test:chromium

# View the HTML report
npx playwright show-report
```

## CI Integration

Tests run on every push/PR to `main` via `.github/workflows/playwright.yml` (source: `tests/ci/playwright.yml`).

- **Local job:** Runs chromium with MSW mocking and database seeding
- **Staging job:** Runs chromium smoke tests against staging URL (after local passes)
- **Artifacts:** HTML report + test results uploaded with 7-day retention
- **JSON summary:** `test-summary.json` included in artifacts for dashboards

## Troubleshooting

**Tests timeout waiting for dev server:**
The dev server has a 120s startup timeout. If your machine is slow, increase `webServer.timeout` in `playwright.config.ts`.

**Auth fixtures fail:**
Ensure `.env.test` has the correct JWT secrets matching what the app expects. All secrets must be 32+ characters.

**MSW not intercepting:**
Check that `ENABLE_MSW=true` is set in the `webServer.env` block of `playwright.config.ts`. MSW only runs in the Next.js server process, not in the test process.

**Database seed fails:**
The global setup tries direct Drizzle seeding first, then falls back to `GET /api/seed-all`. Ensure `DATABASE_URL` is set in `.env.test`.

**Stale test data:**
Never use `sql.raw()` in db.helpers.ts — always use Drizzle operators. Neon's HTTP driver caches raw SQL text, which causes stale reads.
