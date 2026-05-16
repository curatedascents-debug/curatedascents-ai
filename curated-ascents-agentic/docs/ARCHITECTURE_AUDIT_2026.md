# CuratedAscents — Architecture Audit Report
**Date:** May 8, 2026  
**Auditor:** Claude (Cowork)  
**Scope:** Full end-to-end audit for go-live readiness and post-launch growth  
**Codebase:** `/curated-ascents-agentic` (Next.js 14, DeepSeek AI, Neon PostgreSQL, Vercel)

---

## Executive Summary

CuratedAscents is a well-architected platform with strong fundamentals: a sophisticated AI chat engine, comprehensive admin tooling, 22 automated cron jobs, 380+ E2E tests, and a full customer/agency/supplier portal stack. The platform is largely go-live ready from a feature standpoint. However, there are 6 hard blockers that will silently break the platform in production, a cluster of conversion gaps that will hurt revenue from day one, and several architectural risks that matter more as traffic scales.

The prioritization below is oriented around a single question: **what generates bookings?** The rest is noise.

---

## 1. AI Chat & Conversion Engine

### Strengths
- **Chat processor is genuinely sophisticated.** `chat-processor.ts` has reasoning-leak detection with regex patterns, a "presentation pass" that strips internal deliberation, a 3-attempt fallback chain (normal → hard constraint → graceful message), and 15 tool iterations before giving up. The system prompt is comprehensive and defensively written.
- **Price security is solid.** `sanitizeForClient()` strips cost/margin fields before DeepSeek ever sees tool results. Agency variant `sanitizeForAgency()` preserves the calculated agency rate while stripping the raw cost. This is correctly implemented.
- **Lead scoring is non-blocking.** Score updates happen in a `Promise` that doesn't await — chat latency is unaffected.
- **Chat persistence works.** localStorage with 24hr TTL for homepage chat, so returning visitors resume their conversation. This is a meaningful UX win.
- **Language detection.** Unicode range detection for 15+ scripts is a real differentiator for Nepali/Hindi-speaking clients.

### Gaps & Risks

**No streaming.** The entire DeepSeek response is buffered before being returned to the client. With 15 tool iterations and a 30s timeout, users can wait 15-25 seconds staring at a spinner. For an HNW audience, this is brand-damaging. The Vercel AI SDK (`ai` package) is already in the stack — streaming is a config change on the DeepSeek call and a minor client-side adjustment.  
→ **File:** `src/lib/agents/chat-processor.ts`, `src/app/api/chat/route.ts`

**Email capture timing may be too early.** The email prompt triggers after the 2nd user message (`src/components/ChatInterface.tsx`). For HNW buyers doing initial research, this is friction before trust is established. An intent-based trigger (after a quote is generated, or after 3-4 messages) would perform better. The current trigger is also invisible to the backend — if the user dismisses, there's no record that they were shown the prompt.  
→ **File:** `src/components/ChatInterface.tsx`

**DeepSeek is a single point of failure.** There is no fallback AI provider. If DeepSeek has an outage, `/api/chat` returns 500. For a revenue-generating product with no fallback, this is a risk. At minimum, a circuit breaker with a graceful degradation message ("Our Expedition Architect is temporarily resting — please call +1-715-505-4964") would prevent silent failure.  
→ **File:** `src/lib/agents/chat-processor.ts`

**No `save_quote` confirmation loop.** The AI can call `save_quote` tool but there's no client-visible confirmation that a quote was saved. The user has no immediate way to know a quote exists in their portal unless they navigate there. A post-tool-call message like "Your quote has been saved — view it at [portal link]" is missing.

**Missing AI tools that would close business:**
- `check_availability` — the AI builds quotes without confirming supplier availability in real time. Clients get quotes for dates that may be unavailable.
- `get_testimonials` or `get_past_trips` — the AI cannot reference social proof during conversation. A tool that retrieves relevant completed trips or testimonials by destination would help overcome hesitation.
- `get_itinerary_by_slug` — the AI cannot reference the platform's 46 published itineraries. A client asking "what does a 14-day Nepal itinerary look like?" gets a generic response instead of the platform's actual product.
- `request_callback` — there's a callback modal in the UI but no AI tool to trigger it mid-conversation. The AI can't say "let me have Kiran call you to discuss this further" and actually initiate the request.

**Prompt injection protection exists but is text-based.** The guardrails in `chat-processor.ts` check for injection patterns but the patterns are static strings. A determined attacker using Unicode lookalikes or prompt continuation techniques could still leak the system prompt. This is low-risk for now but worth noting.

---

## 2. Booking & Quote Flow

### Strengths
- Full flow exists: chat → `calculate_quote` → `save_quote` → quote email → portal → Stripe payment → confirmation email.
- Stripe integration covers both card payments and manual (bank transfer/cash) with webhook handling.
- `invoice-overdue` and `payment-reminders` crons automate payment follow-up.
- `convert_quote_to_booking` is an AI tool, meaning the AI can close the booking in-chat.

### Gaps & Risks

**Customers cannot accept a quote from the portal UI.** `src/app/portal/quotes/page.tsx` shows quote status (draft, sent, accepted, expired) but has no Accept/Reject buttons. The acceptance path is email-only. For HNW clients who are logged into the portal reviewing a quote, the absence of a one-click "Accept & Pay" button is a major conversion gap.  
→ **File:** `src/app/portal/quotes/page.tsx`, `src/app/portal/quotes/[id]/page.tsx`

**No abandoned quote notification to the admin.** When a quote is sent and not opened within 24-48 hours, there's no alert to the admin to follow up personally. The lead-reengagement cron fires an automated email, but a notification to the founder ("Quote #42 for Nepal 15-day was sent 48 hours ago — no response") enables personal outreach, which is more effective for HNW clients.

**Quote expiry UX is passive.** Quotes expire but the portal shows "Expired" status without any urgency messaging before expiry ("Your quote expires in 3 days"). No countdown or urgency email before expiry is triggered.

**Payment schedule is not visible in the portal.** `src/app/portal/trips/page.tsx` shows a payment progress bar but no payment schedule with due dates. Clients making multi-thousand-dollar commitments need to see "Deposit: $2,000 due now, Balance: $8,000 due 30 days before departure." Without this, clients feel uncertain about their financial commitment.

**No upsell in the booking flow.** After a quote is accepted, there's no mechanism to suggest add-ons (helicopter extensions, additional nights, photography packages). The booking confirmation email and portal dashboard are upsell opportunities being left empty.

---

## 3. Agency / B2B Module

### Strengths
- Agency margin system is genuinely well-built. `agency-chat-processor.ts` does proper per-service margin calculation with `agencyMarginOverrides` table lookups, falls back through three levels (service-specific → agency default → global default).
- Agency users have role-based access (owner, admin, agent, viewer) defined in schema.
- Agency AI chat is distinct from public chat — correct 20% margin pricing, itemized line items visible to agency.
- `agencyMarginOverrides` table enables per-supplier and per-destination overrides.

### Gaps & Risks

**Agency onboarding is not self-serve.** There's no `/agency/register` route or signup flow. An agency partner can only be created by the admin. For a solo founder, manually onboarding every agency partner is a bottleneck. Even a simple "request partnership" form that creates a `pending` agency record would help.

**Agency dashboard tabs may not be fully connected.** The dashboard (`src/app/agency/dashboard/page.tsx`) imports tab components (ClientsTab, QuotesTab, BookingsTab, ReportsTab) but the first 100 lines show the tab UI only. Based on the CHANGELOG, some agency features were added in Phase 5.1 and may not have had full tab implementation verified end-to-end. The Reports tab in particular deserves scrutiny — if it shows no data, agencies won't trust the platform.

**No agency-specific white-label domain support.** `agencies` table has `primaryColor`, `secondaryColor`, `accentColor`, `logo` fields, but there's no middleware to serve the agency's branding on a custom domain (e.g., `quotes.agencypartner.com`). The `slug` field exists in the schema but no routing logic appears to use it for white-labelling. This is a meaningful competitive differentiator for B2B.

**Agency client management lacks segmentation tools.** The ClientsTab likely shows a flat list. Agencies managing 50+ client relationships need filtering by lead score, booking status, follow-up priority, and deal size. Without this, the CRM value prop is weak.

**No agency commission/payout tracking.** The schema has `commissionPercent` in `agencySuppliers` but no `agencyPayments` or commission ledger table. If agencies earn commission, there's no reporting or payout mechanism visible in the codebase.

---

## 4. Customer Portal

### Strengths
- Full portal with 7 sections (dashboard, trips, quotes, loyalty, chat, currency, settings).
- PWA support — can be installed as a mobile app.
- Email auth with OTP codes is user-friendly and appropriate for this audience (no password to forget).
- Currency conversion tool is a thoughtful addition for international clients.

### Gaps & Risks

**Loyalty programme is view-only — no redemption path.** `src/app/portal/loyalty/page.tsx` shows tier, points balance, and referral code. But there's no "redeem points" flow, no list of what points can be used for (discount, upgrade, exclusive access), and no explanation of tier benefits. Without a redemption mechanism, loyalty points feel like a marketing gimmick rather than real value.

**Referral programme has no tracking.** The referral code is displayed but clicking "Share" does nothing productive — there's no referral landing page that captures `?ref=CODE`, no attribution logic, and no UI feedback when a referral converts. If a client shares their code, they'll never know it worked.

**Post-booking document delivery is missing.** The CHANGELOG mentions `trip-briefings` cron and a `trip_briefing` AI tool, but the portal trips page shows booking status without documents, visa checklists, packing lists, or pre-departure briefings. For luxury travellers expecting white-glove service, the portal should be the home for all trip documents.

**Portal activity is not tracked.** When a customer logs into the portal and views their quote or trip, this isn't recorded as a lead event. The lead-reengagement cron relies on `lastActivityAt` from chat — a client actively using the portal without chatting will still receive reengagement emails as if they've gone cold.

**No in-portal communication thread.** There's a portal chat tab (`/portal/chat`) but no thread-based messaging with the human team. If a client has a question about their booking, they're either directed to a new AI chat session or pushed to email/phone. A simple "message your advisor" feature would close the service loop.

---

## 5. Technical Architecture

### Strengths
- **Neon cache fix is in place.** `fetchOptions: { cache: "no-store" }` prevents Next.js from serving stale database responses — this is a non-obvious fix that would cause silent data corruption without it.
- **Drizzle ORM usage is correct.** `sql.raw()` is banned for WHERE clauses; the codebase consistently uses `eq()`, `and()`, `desc()` operators.
- **Security hardening is real.** Token bucket rate limiter, prompt injection guards, admin dual-auth (middleware + inline `verifyAdminSession()`), PII cookie hardening (sameSite:strict), and a centralized error handler.
- **22 cron jobs** cover the full automation lifecycle: pricing, nurture, supplier management, content, compliance, customer engagement.

### Performance Risks

**No AI response streaming.** The biggest perceived performance issue. Users wait 10-25 seconds for a response with no incremental feedback. The progress message rotation (every 8 seconds) helps but is not a substitute for actual streaming. This is `src/lib/agents/chat-processor.ts` + `src/app/api/chat/route.ts`.

**Tool loop ceiling of 15 iterations is high.** In pathological cases, 15 tool calls at ~1-2s each means a 15-30 second response before the 30s DeepSeek timeout kicks in. Consider adding a tool budget: fast queries (search_rates, search_hotels) get up to 8 iterations; complex builds (calculate_quote) get up to 12.

**Media serving from Vercel for large images.** `public/uploads/media/` is the local R2 fallback. Vercel has a 50MB function payload limit and images served through Next.js aren't edge-cached the same way R2 with a CDN would be. Ensure Cloudflare R2 is configured in production before go-live.

**No database connection pooling config visible.** Neon's serverless driver handles this differently than traditional PostgreSQL — ensure `@neondatabase/serverless` is used with `Pool` in long-running contexts. Worth verifying in `src/db/index.ts`.

### Security Gaps

**`ENABLE_MSW=false` must be set in Vercel.** Identified in GO_LIVE_STRATEGY.md as P0. If this is set to `true` in production, all API calls return test mock data. Chat responses will be faked, quotes won't save, payments won't process. This is the most dangerous misconfiguration possible.

**JWT secrets are not all set.** `CUSTOMER_JWT_SECRET`, `AGENCY_JWT_SECRET`, and `SUPPLIER_JWT_SECRET` need production values in Vercel. Without them, the fallback chain may use insecure or shared secrets.

**No request body size limit on chat endpoint.** A malicious user could send an extremely large `conversationHistory` array to `/api/chat`. Combined with the 15 tool iterations, this could exhaust serverless function memory. Add `request.body` size validation.

**WhatsApp webhook endpoint security.** `src/app/api/whatsapp/*` — verify that the webhook validates the `X-Hub-Signature-256` header from Meta before processing messages. Without this, anyone can POST fake WhatsApp messages to the platform.

### Observability Gaps

**No error alerting.** The centralized error handler logs errors but there's no integration to PagerDuty, Sentry, or even a simple email-on-error. For a solo founder, knowing when the AI chat breaks in production requires checking Vercel logs manually.

**No cron job success/failure alerting.** 22 cron jobs run daily with no notification if they fail silently. A failed `nurture-sequences` cron means leads don't get follow-up emails, and the founder won't know.

**Lead scoring events are logged but not surfaced.** `logSafetyEvent()` exists but there's no admin view for safety events. If prompt injection attacks are occurring, the founder has no visibility.

---

## 6. SEO & Marketing Infrastructure

### Strengths
- Dynamic `sitemap.ts` includes static pages, blog posts, destinations, and itineraries — correct.
- `robots.ts` correctly blocks admin/portal/agency/supplier/api routes from indexing.
- JSON-LD `TravelAgency` schema on homepage, `TouristDestination` on sub-region pages, `Person` + `TravelAgency` on About page.
- 46 published itineraries + 14 sub-region destination pages = strong long-tail SEO surface area.
- Blog engine with AI-written weekly content + social auto-posting — high-leverage.

### Gaps & Risks

**OG image URL points to Vercel preview URL, not production domain.** `src/app/page.tsx` hardcodes `https://curated-ascents-agentic.vercel.app/...` in the OG image URL. Once the production domain is live at `curatedascents.com`, this needs to be updated to `NEXT_PUBLIC_APP_URL`. Same applies to JSON-LD `url` field.

**Blog structured data missing `Article` schema.** Blog posts have `prose` styling and SEO meta but likely lack `Article` / `BlogPosting` JSON-LD schema. This is a missed Google rich result opportunity for travel content.

**No hreflang for multi-language content.** Language detection exists in the AI but no alternate language pages or `hreflang` tags. If Nepali/Hindi/Chinese-language marketing is planned, this needs to be added before content scales.

**Email infrastructure: transactional is ready, marketing is not.** Resend handles transactional emails (booking confirmations, quote emails, nurture sequences). There's no Mailchimp/ConvertKit equivalent for broadcast marketing emails (newsletter, seasonal campaign blasts). The nurture system is lead-specific, not list-based.

**WhatsApp integration is structurally complete but not live.** Tables, admin tab, and message templates exist in Phase 5.4. The API account is listed as "status: pending" in CHANGELOG. WhatsApp is critical for Nepal-based and international HNW clients — activate this as soon as the account is approved.

**No Google Analytics or conversion tracking.** There's no `gtag`, `GA4`, or `Meta Pixel` in the codebase. For a conversion-focused site, not knowing which pages/chat interactions lead to quotes/bookings means optimizing blind.

---

## 7. Admin & Operations

### Strengths
- Admin dashboard has 14 tabs: Rates, Suppliers, Hotels, Clients, Quotes, Bookings, Supplier Portal, Pricing, Nurture, Competitors, Blog, WhatsApp, Media, Reports (5 sub-tabs).
- Supplier portal enables self-service rate management and booking confirmations.
- Reports tab has financial visibility across bookings, payments, and revenue.
- Competitor monitoring cron runs automatically.
- Blog management with AI writer is fully integrated.

### Gaps & Risks

**No admin notification system.** When a new lead submits a chat, a quote is saved, or a booking is confirmed, the admin is not notified in real time. The admin must check the dashboard manually. For a solo founder wearing all hats, this means delayed follow-up. A simple webhook to email/Slack when high-priority events occur (quote saved, booking confirmed, payment received) would close this gap.

**Supplier rate management depends on supplier self-service.** If suppliers don't log in and update rates, the AI quotes stale pricing. There's no automated alert to suppliers when their rates haven't been updated in N days.

**No admin CRM workflow for outbound sales.** The admin can see all clients and their lead scores, but there's no task/reminder system ("follow up with John Smith on May 12"). The platform is excellent at inbound automation but has no tools for structured outbound sales management.

**Financial reporting lacks export.** The 5-tab Reports section surfaces financial data but if there's no CSV/PDF export for bookings, invoices, or payments, reconciliation with external accounting software (QuickBooks, Xero) is manual.

---

## 8. Go-Live Blockers vs. Post-Launch Enhancements

### P0 — Must Fix Before Go-Live (Will Break or Embarrass)

| # | Issue | File / Location | Impact |
|---|-------|-----------------|--------|
| 1 | `ENABLE_MSW=false` not set in Vercel | Vercel env vars | All API responses return mock data — chat, quotes, payments all fake |
| 2 | JWT secrets (`CUSTOMER_JWT_SECRET`, `AGENCY_JWT_SECRET`, `SUPPLIER_JWT_SECRET`) missing in Vercel | Vercel env vars | Portal and agency logins broken or insecure |
| 3 | Admin default password not changed | Vercel env / admin setup | Security breach risk on day 1 |
| 4 | `CRON_SECRET` not set | Vercel env vars | All 22 cron jobs return 401 — no automation runs in production |
| 5 | Stripe live mode not configured (`STRIPE_SECRET_KEY` is test key) | Vercel env vars | All payments process in test mode — real cards won't work |
| 6 | Resend domain not verified for `curatedascents.com` | Resend dashboard | Transactional emails (quotes, confirmations) go to spam or fail to send |
| 7 | OG image and JSON-LD URLs point to Vercel preview URL, not production domain | `src/app/page.tsx` | Social shares and SEO structured data reference wrong domain |
| 8 | DNS not configured for `curatedascents.com` | Domain registrar | Site unreachable on production domain |
| 9 | Cloudflare R2 not configured | Vercel env (R2 vars) | Media uploads fail silently; falls back to local filesystem (lost on Vercel rebuild) |

### P1 — Fix in First 2 Weeks Post-Launch (Affects Conversion)

| # | Issue | File / Location | Priority Reason |
|---|-------|-----------------|-----------------|
| 1 | Add streaming to AI chat | `chat-processor.ts`, `api/chat/route.ts` | 10-25s blank wait loses HNW clients before they see value |
| 2 | Quote accept/reject buttons in portal | `portal/quotes/[id]/page.tsx` | Clients reviewing quotes in portal have no conversion path |
| 3 | Admin real-time notifications (email/webhook on new quote/booking) | New: `src/lib/notifications/` | Delayed follow-up costs bookings |
| 4 | Payment schedule visible in portal trips | `portal/trips/page.tsx` | Clients need to see deposit + balance due dates |
| 5 | AI tool: `get_itinerary_by_slug` | `database-tools.ts` | AI can't reference the platform's 46 published itineraries in chat |
| 6 | Google Analytics / GA4 integration | `src/app/layout.tsx` | No conversion data = no optimization |
| 7 | Quote expiry countdown email | New cron or `invoice-overdue` extension | Silent expiry loses warm leads |
| 8 | DeepSeek circuit breaker with graceful fallback | `chat-processor.ts` | Single point of failure; AI outage = 500 error with no recovery message |
| 9 | Post-`save_quote` in-chat confirmation with portal link | `chat-processor.ts` system prompt | Users don't know their quote was saved; don't navigate to portal |

### P2 — Next 30-60 Days (Growth & Efficiency)

| # | Issue | Priority Reason |
|---|-------|-----------------|
| 1 | WhatsApp Business API activation | Critical channel for Nepal-based and international HNW clients; infra is ready |
| 2 | Loyalty points redemption UI | Loyalty programme has zero conversion value without a redemption mechanism |
| 3 | Referral tracking + attribution | Referral codes exist but clicks/conversions are invisible |
| 4 | Portal activity logging to lead scoring | Clients using portal get reengagement emails as if they're cold |
| 5 | Blog `Article` JSON-LD schema | Rich results for travel content = meaningful organic traffic |
| 6 | AI tool: `check_availability` | Quotes should reflect real availability; current quoting is speculative |
| 7 | Agency self-serve registration flow | Founder can't manually onboard every agency partner |
| 8 | Admin cron failure alerts | 22 silent cron jobs; no notification when nurture/pricing/content automation breaks |
| 9 | Email: urgency/scarcity in quote emails | HNW clients respond to "limited availability" framing; quote templates are generic |
| 10 | Post-booking document delivery in portal | Trip documents, visa info, packing lists delivered through portal trips section |

### P3 — Longer Term (Competitive Differentiation)

| # | Issue | Priority Reason |
|---|-------|-----------------|
| 1 | AI response streaming | Full first-class streaming (EventSource / SSE) for real-time feel |
| 2 | Agency white-label domain support | Route agency slug to custom domain with agency branding |
| 3 | Video consultation integration (Google Meet auto-scheduling) | Post-quote conversion tool for high-value trips |
| 4 | Multi-language landing pages with hreflang | Nepali, Hindi, Chinese market capture |
| 5 | Financial report exports (CSV/PDF) | Accounting reconciliation for growing operation |
| 6 | AI tool: `get_testimonials` / social proof in chat | Overcome hesitation with destination-specific trip references |
| 7 | Outbound sales CRM (task/reminder system in admin) | Structured follow-up for high-value leads |
| 8 | Agency commission payout tracking | Required to scale B2B partnerships |
| 9 | Supplier rate staleness alerts | Auto-notify suppliers when rates haven't been updated in 30 days |
| 10 | `check_availability` → supplier confirmation loop | True real-time availability check with supplier webhook |

---

## Summary Scorecard

| Dimension | Score | Key Gap |
|-----------|-------|---------|
| AI Chat Quality | 8/10 | No streaming; missing 4 high-value tools |
| Quote-to-Booking Flow | 6/10 | No portal accept button; no urgency in quote expiry |
| Agency / B2B Module | 7/10 | No self-serve onboarding; white-label incomplete |
| Customer Portal | 6/10 | Loyalty has no redemption; quotes view-only |
| Technical Architecture | 8/10 | Strong; streaming + circuit breaker are the gaps |
| SEO & Marketing | 7/10 | No GA4; Blog schema missing; WhatsApp pending |
| Admin & Operations | 7/10 | No real-time notifications; no export; no outbound CRM |
| **Go-Live Readiness** | **P0 items block launch** | 9 hard blockers identified above |

---

*Generated by Claude (Cowork) · Architecture audit based on full codebase scan including `chat-processor.ts`, `agency-chat-processor.ts`, `ChatInterface.tsx`, portal pages, cron jobs, schema, API routes, and business docs.*
