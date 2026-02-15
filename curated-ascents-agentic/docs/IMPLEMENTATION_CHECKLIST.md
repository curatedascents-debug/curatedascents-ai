# Implementation Checklist

> Quick reference for tracking agent implementation progress.
> For full details, see [AI_AGENTS_ROADMAP.md](./AI_AGENTS_ROADMAP.md)

---

## Phase 2A: Core Booking Flow (Q1 2026)

### Infrastructure Setup
- [ ] Set up Helicone/Langfuse for LLM monitoring
- [ ] Configure Upstash Redis for event bus
- [x] Set up Vercel Cron for scheduled tasks (18 cron jobs configured)
- [x] Integrate Stripe for payments (checkout, webhooks, payment status)

### Booking Operations Agent
- [x] Design booking state machine (bookingStatus enum + bookingEvents audit trail)
- [x] Implement quote-to-booking conversion API (`convert_quote_to_booking` tool)
- [x] Create booking confirmation email templates (booking-confirmation, supplier-confirmation-request)
- [x] Build supplier confirmation request workflow (supplierConfirmationRequests table + APIs)
- [x] Implement payment milestone tracking (paymentMilestones table + APIs)
- [x] Add deposit reminder automation (payment-reminders cron)
- [x] Create pre-departure briefing generator (trip-briefings cron, 7-day + 24-hour)
- [ ] Build amendment handling workflow
- [ ] Implement cancellation workflow with policy enforcement

### Enhanced Expedition Architect
- [x] Add real-time availability checking (availability calendar + check APIs)
- [ ] Implement altitude acclimatization logic
- [ ] Add permit lead time validation
- [ ] Build traveler preference profiling
- [ ] Implement contextual upselling suggestions
- [ ] Add conversation memory across sessions

### PDF Quote Generation
- [x] Design quote PDF template
- [x] Implement React-PDF components (`src/lib/pdf/`)
- [x] Add dynamic itinerary rendering
- [x] Include pricing breakdown tables
- [x] Add terms and conditions section
- [x] Implement PDF download/email delivery (`/api/admin/quotes/[id]/pdf`, `/api/admin/quotes/[id]/email-pdf`)

---

## Phase 2B: Lead Optimization (Q2 2026)

### Lead Intelligence Agent
- [x] Define lead scoring model (leadScores table, 0-100 scoring)
- [ ] Implement intent classification
- [x] Build abandoned conversation detector (lead-reengagement cron)
- [x] Create HNW identification logic (lead scoring engine)
- [ ] Set up lead source attribution

### Availability & Inventory Agent
- [x] Build supplier calendar sync framework (availabilityCalendar + availabilitySyncLog)
- [x] Implement permit quota tracking (permitInventory table + APIs)
- [x] Create seasonal blackout management (blackoutDates table + APIs)
- [x] Add overbooking prevention (inventoryHolds table + release-expired-holds cron)
- [ ] Set up low inventory alerts

### Content & Personalization Agent
- [x] Create itinerary narrative generator (narrative-generator.ts)
- [x] Build destination guide templates (destinationGuides table + seed)
- [x] Implement testimonial assembly logic (testimonials management API)
- [x] Create personalized email generator (17 React Email templates)
- [ ] Set up multi-language support

### Email Nurture System
- [x] Design 5-email nurture sequence (nurtureSequences + seed-sequences.ts)
- [x] Implement drip campaign automation (nurture-sequences cron)
- [x] Create re-engagement triggers (lead-reengagement cron)
- [ ] Add email open/click tracking
- [ ] Build A/B testing framework

---

## Phase 3: Revenue Optimization (Q3-Q4 2026)

### Dynamic Pricing Agent
- [x] Build demand-based pricing model (pricingRules + demandMetrics + pricing-engine.ts)
- [x] Implement competitor rate monitoring (competitorRates table + admin APIs)
- [x] Create yield management rules (seasonal, group, early bird, loyalty multipliers)
- [ ] Add cost fluctuation response
- [ ] Set up currency hedge alerts

### Customer Success Agent
- [x] Implement in-trip check-in automation (trip-checkins cron + tripCheckins table)
- [x] Build disruption detection system (risk-monitoring cron + weatherAlerts + travelAdvisories)
- [x] Create NPS survey workflow (feedback-requests cron + feedbackSurveys table)
- [x] Design loyalty program structure (loyaltyAccounts + loyaltyTransactions, Bronze→Platinum tiers)
- [x] Implement referral tracking (referrals table + APIs)

### Supplier Relations Agent
- [x] Automate booking request generation (supplier-confirmation-request email + APIs)
- [x] Build supplier performance scoring (supplierPerformance + supplier-performance cron)
- [ ] Create contract expiry tracking
- [ ] Implement new supplier onboarding flow

---

## Phase 4: Full Automation (2027)

### Risk & Compliance Agent
- [ ] Integrate weather monitoring APIs
- [ ] Build permit status tracker
- [ ] Add travel advisory integration
- [ ] Create emergency protocol system

### Financial Operations Agent
- [ ] Automate invoice generation
- [ ] Build payment reconciliation
- [ ] Implement supplier payment scheduling
- [ ] Create commission calculation engine
- [ ] Build financial reporting dashboard

---

## Database Schema Changes Needed

### Phase 2A — Done
- [x] Add `bookingStatus` enum with full state machine
- [x] Create `bookingEvents` table for audit trail
- [x] Add `paymentMilestones` table
- [x] Create `supplierConfirmationRequests` table
- [ ] Add `documents` table for generated PDFs

### Phase 2B — Done
- [x] Create `leadScores` + `leadEvents` tables
- [x] Add `inventoryHolds` table
- [x] Create `nurtureSequences` + `nurtureEnrollments` tables
- [ ] Add `email_events` table (opens, clicks)

### Phase 3 — Done
- [x] Create `pricingRules` + `demandMetrics` + `priceAdjustments` + `priceHistory` tables
- [x] Add `loyaltyAccounts` + `loyaltyTransactions` tables
- [x] Create `referrals` table
- [x] Add `supplierPerformance` table

### Phase 4 — Done
- [x] Create `travelAdvisories` + `weatherAlerts` + `riskAlertNotifications` tables
- [x] Add `invoices` + `invoiceItems` tables
- [x] Create `payments` + `paymentAllocations` tables
- [x] Add `commissionRecords` table

---

## API Endpoints to Build

### Phase 2A
```
POST   /api/bookings                    # Create booking from quote
GET    /api/bookings/[id]               # Get booking details
PUT    /api/bookings/[id]/status        # Update booking status
POST   /api/bookings/[id]/confirmations # Request supplier confirmation
POST   /api/bookings/[id]/documents     # Generate documents
POST   /api/payments/webhook            # Stripe webhook handler
GET    /api/quotes/[id]/pdf             # Generate quote PDF
```

### Phase 2B
```
POST   /api/leads/score                 # Score a lead
GET    /api/availability/[serviceType]  # Check availability
POST   /api/inventory/lock              # Lock inventory
DELETE /api/inventory/lock/[id]         # Release lock
POST   /api/nurture/trigger             # Trigger nurture sequence
```

### Phase 3
```
GET    /api/pricing/dynamic             # Get dynamic price
POST   /api/loyalty/points              # Award points
GET    /api/loyalty/[clientId]          # Get loyalty status
POST   /api/referrals                   # Create referral
GET    /api/suppliers/[id]/performance  # Get supplier score
```

---

## Environment Variables to Add

### Phase 2A
```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
HELICONE_API_KEY=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
```

### Phase 2B
```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
```

### Phase 3
```env
COMPETITOR_SCRAPE_API_KEY=
CURRENCY_API_KEY=
```

---

## Testing Milestones

### Phase 2A
- [ ] End-to-end booking flow test
- [ ] Payment processing test
- [ ] PDF generation test
- [ ] Supplier confirmation workflow test

### Phase 2B
- [ ] Lead scoring accuracy validation
- [ ] Availability check performance test
- [ ] Nurture sequence delivery test

### Phase 3
- [ ] Dynamic pricing A/B test
- [ ] Loyalty program UAT
- [ ] Supplier integration test

---

## Documentation to Create

- [ ] Agent API documentation
- [ ] Event schema documentation
- [ ] Admin user guide
- [ ] Supplier onboarding guide
- [ ] System architecture diagram (detailed)
- [ ] Runbook for common issues

---

*Last updated: February 2026*
