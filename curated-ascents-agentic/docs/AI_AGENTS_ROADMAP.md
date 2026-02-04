# CuratedAscents AI Agents Roadmap

> **Document Version:** 1.0
> **Created:** February 2026
> **Status:** Planning
> **Owner:** Engineering Team

This document outlines the multi-agent AI architecture for transforming CuratedAscents into a fully autonomous luxury travel platform specializing in cultural, wildlife, adventure, mountaineering, spa, and wellness tours across Nepal, Tibet, Bhutan, and India.

---

## Table of Contents

1. [Vision & Goals](#vision--goals)
2. [Agent Overview](#agent-overview)
3. [Agent Specifications](#agent-specifications)
4. [Architecture](#architecture)
5. [Implementation Phases](#implementation-phases)
6. [Technology Stack](#technology-stack)
7. [Success Metrics](#success-metrics)
8. [Open Questions](#open-questions)

---

## Vision & Goals

### Vision
Create an ecosystem of specialized AI agents that autonomously handle the entire customer journey—from initial inquiry through post-trip follow-up—while maintaining the personalized, white-glove service expected by high-net-worth travelers.

### Goals
- **Reduce manual operations by 80%** through intelligent automation
- **Decrease quote-to-booking time from 48h to 2h** with real-time availability and pricing
- **Increase conversion rate by 40%** through personalized, timely engagement
- **Scale to 10x booking volume** without proportional headcount increase
- **Achieve 95% customer satisfaction** through proactive service recovery

---

## Agent Overview

| # | Agent | Priority | Phase | Status |
|---|-------|----------|-------|--------|
| 1 | Expedition Architect (Enhanced) | P0 | 2A | 🟡 Partial |
| 2 | Availability & Inventory Agent | P1 | 2B | ⚪ Planned |
| 3 | Dynamic Pricing Agent | P2 | 3 | ⚪ Planned |
| 4 | Supplier Relations Agent | P2 | 3 | ⚪ Planned |
| 5 | Booking Operations Agent | P0 | 2A | ⚪ Planned |
| 6 | Customer Success Agent | P2 | 3 | ⚪ Planned |
| 7 | Lead Intelligence Agent | P1 | 2B | ⚪ Planned |
| 8 | Content & Personalization Agent | P1 | 2B | ⚪ Planned |
| 9 | Risk & Compliance Agent | P3 | 4 | ⚪ Planned |
| 10 | Financial Operations Agent | P3 | 4 | ⚪ Planned |

**Legend:** 🟢 Complete | 🟡 Partial | 🔵 In Progress | ⚪ Planned

---

## Agent Specifications

### 1. Expedition Architect Agent (Enhanced)

**Purpose:** Customer-facing conversational AI for trip planning and quote generation

**Current State:** Basic implementation with 8 tools for rate search and quote calculation

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Natural Language Trip Planning | Conversational interface for trip customization | P0 | 🟢 Done |
| Multi-table Rate Search | Search across 10 service types | P0 | 🟢 Done |
| Quote Calculation | Generate quotes with margin rules | P0 | 🟢 Done |
| Traveler Profiling | Build preference profiles (adventure tolerance, luxury level, dietary, mobility) | P0 | ⚪ Planned |
| Itinerary Optimization | Auto-sequence considering altitude acclimatization, distances, permit lead times | P0 | ⚪ Planned |
| Contextual Upselling | Suggest upgrades based on client profile and budget signals | P1 | ⚪ Planned |
| Multi-trip Memory | Remember past trips and preferences across sessions | P1 | ⚪ Planned |
| Real-time Availability | Check supplier calendars before quoting | P0 | ⚪ Planned |

#### Data Requirements
- Client preference history
- Altitude acclimatization rules database
- Permit processing time matrix
- Supplier calendar integrations

#### Integration Points
- Availability Agent (real-time checks)
- Pricing Agent (dynamic margins)
- Lead Intelligence Agent (scoring handoff)

---

### 2. Availability & Inventory Agent

**Purpose:** Backend automation for real-time supply management and inventory control

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Supplier Calendar Sync | Poll/webhook integration with hotels, airlines, helicopter operators | P0 | ⚪ Planned |
| Permit Quota Tracking | Monitor Everest permits, Bhutan visas, Tibet travel permits | P0 | ⚪ Planned |
| Seasonal Blackout Management | Auto-block monsoon, political closures, festival periods | P1 | ⚪ Planned |
| Overbooking Prevention | Lock inventory on quote, release after timeout (48h default) | P0 | ⚪ Planned |
| Low Inventory Alerts | Notify ops when peak-season capacity running low | P1 | ⚪ Planned |
| Capacity Forecasting | Predict availability constraints 90 days out | P2 | ⚪ Planned |

#### Data Requirements
- Supplier API credentials / calendar access
- Permit quota databases (Nepal Tourism Board, Bhutan TCB)
- Historical booking patterns for forecasting
- Blackout date calendar

#### Integration Points
- Expedition Architect (availability queries)
- Booking Operations (inventory locks)
- Supplier Relations (calendar sync requests)

---

### 3. Dynamic Pricing Agent

**Purpose:** Revenue optimization through intelligent, market-responsive pricing

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Demand-based Pricing | Adjust margins based on booking velocity, lead time, seasonality | P1 | ⚪ Planned |
| Competitor Monitoring | Track competitor rates for similar itineraries | P2 | ⚪ Planned |
| Yield Management | Higher margins for last-minute luxury, volume discounts for groups | P1 | ⚪ Planned |
| Cost Fluctuation Response | Auto-adjust when supplier costs change (fuel, permits) | P0 | ⚪ Planned |
| Currency Hedge Alerts | Flag when USD/NPR movements warrant price updates | P2 | ⚪ Planned |
| Price Elasticity Learning | ML model to optimize price points per segment | P3 | ⚪ Planned |

#### Pricing Rules (Current)
```
Base Formula: Sell = Cost × (1 + Margin%)
Default Margin: 50%
MICE Groups (20+ pax): 35%
Nepal-specific: +13% VAT, +10% Service Charge
```

#### Data Requirements
- Historical booking data with price points
- Competitor rate feeds
- Currency exchange rate API
- Supplier cost change notifications

#### Integration Points
- Expedition Architect (price queries)
- Booking Operations (final pricing)
- Financial Operations (margin reporting)

---

### 4. Supplier Relations Agent

**Purpose:** Autonomous supplier communication, performance management, and relationship optimization

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Booking Request Generation | Auto-generate and send booking confirmations to suppliers | P0 | ⚪ Planned |
| Rate Negotiation Prep | Analyze volumes to prepare negotiation briefs | P2 | ⚪ Planned |
| Contract Expiry Tracking | Alert 60 days before contracts expire | P1 | ⚪ Planned |
| Performance Scoring | Track reliability, response time, service quality, complaints | P1 | ⚪ Planned |
| New Supplier Onboarding | Guided intake workflow with document collection | P1 | ⚪ Planned |
| Communication Templates | Multi-language templates (English, Nepali, Hindi, Dzongkha) | P2 | ⚪ Planned |

#### Data Requirements
- Supplier contact matrix (from existing JSONB contacts)
- Contract database with expiry dates
- Booking history per supplier
- Quality feedback data

#### Integration Points
- Booking Operations (confirmation requests)
- Availability Agent (calendar updates)
- Financial Operations (payment terms)

---

### 5. Booking Operations Agent

**Purpose:** End-to-end booking lifecycle automation from quote acceptance to trip completion

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Quote-to-Booking Conversion | Auto-convert accepted quotes, generate booking references | P0 | ⚪ Planned |
| Document Assembly | Compile visa requirements, packing lists, health advisories | P0 | ⚪ Planned |
| Payment Milestone Tracking | Send deposit reminders, balance due notifications | P0 | ⚪ Planned |
| Supplier Confirmation Loop | Chase suppliers for confirmations, escalate non-responses | P0 | ⚪ Planned |
| Pre-departure Briefing | Auto-send 7-day and 24-hour trip briefings | P1 | ⚪ Planned |
| Amendment Handling | Process date changes, room upgrades, activity swaps | P1 | ⚪ Planned |
| Cancellation Workflow | Apply cancellation policies, process refunds | P1 | ⚪ Planned |

#### Booking States
```
QUOTE_SENT → QUOTE_ACCEPTED → DEPOSIT_PENDING → DEPOSIT_PAID →
SUPPLIERS_CONFIRMED → BALANCE_PENDING → BALANCE_PAID →
DOCUMENTS_SENT → IN_PROGRESS → COMPLETED → FEEDBACK_REQUESTED
```

#### Data Requirements
- Quote and booking tables (existing)
- Document templates per destination
- Payment gateway integration
- Supplier confirmation tracking

#### Integration Points
- Expedition Architect (quote handoff)
- Availability Agent (inventory locks)
- Supplier Relations (confirmations)
- Customer Success (trip monitoring)
- Financial Operations (payments)

---

### 6. Customer Success Agent

**Purpose:** Post-sale engagement, in-trip support, and loyalty program management

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| In-trip Check-ins | Proactive WhatsApp/SMS at trip milestones | P1 | ⚪ Planned |
| Real-time Issue Resolution | Monitor for disruptions, provide alternatives | P0 | ⚪ Planned |
| Post-trip Feedback | Automated NPS surveys with follow-up workflows | P1 | ⚪ Planned |
| Loyalty Program Management | Track repeat bookings, trigger VIP upgrades | P2 | ⚪ Planned |
| Referral Program | Generate codes, track conversions, issue credits | P2 | ⚪ Planned |
| Anniversary Reminders | Suggest return trips on booking anniversaries | P2 | ⚪ Planned |
| Review Solicitation | Request reviews on TripAdvisor, Google at optimal time | P2 | ⚪ Planned |

#### Data Requirements
- Client communication preferences
- Trip itinerary with timestamps
- Flight/weather disruption feeds
- NPS and feedback history
- Loyalty points ledger

#### Integration Points
- Booking Operations (trip status)
- Risk Agent (disruption alerts)
- Lead Intelligence (referral tracking)
- Content Agent (personalized messages)

---

### 7. Lead Intelligence Agent

**Purpose:** Lead scoring, qualification, and automated nurture sequences

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Lead Scoring | Score based on budget signals, timeline, engagement depth | P0 | ⚪ Planned |
| Intent Classification | Categorize: browsing / comparing / ready to book | P0 | ⚪ Planned |
| Automated Nurture Sequences | Drip campaigns with destination highlights, deals | P1 | ⚪ Planned |
| Re-engagement Triggers | Detect abandoned conversations, send follow-ups | P0 | ⚪ Planned |
| HNW Identification | Flag high-value leads for human concierge handoff | P0 | ⚪ Planned |
| Source Attribution | Track lead sources, calculate CAC by channel | P2 | ⚪ Planned |

#### Scoring Model (Initial)
```
Budget Signal (mentioned $10k+): +30 points
Specific Dates Mentioned: +25 points
Asked About Availability: +20 points
Requested Quote: +40 points
Opened Email (3+ times): +15 points
Return Visit (within 7 days): +20 points
HNW Threshold: 80+ points
```

#### Data Requirements
- Conversation history and engagement metrics
- Email open/click tracking
- Website behavior (if available)
- Historical conversion data for model training

#### Integration Points
- Expedition Architect (conversation data)
- Content Agent (nurture content)
- Booking Operations (conversion tracking)

---

### 8. Content & Personalization Agent

**Purpose:** Dynamic content generation for proposals, communications, and marketing

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Itinerary Narrative Generation | Transform structured data into compelling prose | P0 | ⚪ Planned |
| PDF Quote Design | Generate branded, beautiful proposal documents | P0 | ⚪ Planned |
| Destination Guides | Auto-generate location-specific travel guides | P1 | ⚪ Planned |
| Social Proof Assembly | Pull relevant testimonials, photos for trip types | P1 | ⚪ Planned |
| Email Personalization | Craft personalized outreach based on profile | P1 | ⚪ Planned |
| Multi-language Support | Generate content in English, Hindi, Mandarin | P2 | ⚪ Planned |

#### Content Templates
- Quote Proposal PDF
- Booking Confirmation
- Pre-departure Guide
- In-trip Day Briefing
- Post-trip Thank You
- Nurture Email Series (5 emails)
- Referral Request

#### Data Requirements
- Destination content library
- Photo/video asset database
- Testimonial repository
- Brand voice guidelines

#### Integration Points
- Expedition Architect (quote content)
- Booking Operations (documents)
- Customer Success (communications)
- Lead Intelligence (nurture content)

---

### 9. Risk & Compliance Agent

**Purpose:** Safety monitoring, regulatory compliance, and emergency response coordination

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Weather Monitoring | Track conditions for trekking routes, helicopter ops | P0 | ⚪ Planned |
| Permit Status Tracking | Monitor Tibet/Bhutan permit approvals, flag delays | P0 | ⚪ Planned |
| Travel Advisory Integration | Pull government advisories, notify affected bookings | P0 | ⚪ Planned |
| Health Compliance | Ensure altitude meds, insurance requirements met | P1 | ⚪ Planned |
| Emergency Protocol Activation | Escalate when clients in affected areas | P0 | ⚪ Planned |
| Visa Requirement Updates | Track visa policy changes per nationality | P1 | ⚪ Planned |

#### Monitoring Sources
- Nepal Department of Hydrology and Meteorology
- India Meteorological Department
- US State Dept / UK FCO travel advisories
- Airline disruption feeds
- Seismic activity monitors

#### Data Requirements
- Client location tracking (opt-in)
- Active booking itineraries
- Emergency contact matrix
- Evacuation provider contracts

#### Integration Points
- Customer Success (disruption alerts)
- Booking Operations (rebooking)
- Supplier Relations (emergency contacts)

---

### 10. Financial Operations Agent

**Purpose:** Accounting automation, payment processing, and financial reporting

#### Features

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Invoice Generation | Auto-generate invoices on booking confirmation | P0 | ⚪ Planned |
| Payment Reconciliation | Match incoming payments to bookings | P0 | ⚪ Planned |
| Supplier Payment Scheduling | Queue payments based on contract terms | P1 | ⚪ Planned |
| Commission Calculation | Calculate agent commissions on completed trips | P1 | ⚪ Planned |
| Financial Reporting | P&L by trip type, destination, season | P1 | ⚪ Planned |
| Tax Compliance | Generate GST/VAT reports per jurisdiction | P2 | ⚪ Planned |
| Currency Management | Multi-currency invoicing, FX gain/loss tracking | P2 | ⚪ Planned |

#### Financial Workflows
```
Quote Accepted → Generate Invoice → Track Deposit →
Confirm Deposit → Generate Balance Invoice → Track Balance →
Confirm Payment → Schedule Supplier Payments →
Trip Completes → Calculate Commissions → Generate Reports
```

#### Data Requirements
- Payment gateway integration (Stripe/Adyen)
- Bank account reconciliation feeds
- Supplier payment terms
- Tax rate tables per jurisdiction
- Commission structures

#### Integration Points
- Booking Operations (invoicing triggers)
- Supplier Relations (payment scheduling)
- All agents (cost tracking)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Web Chat   │  │  WhatsApp    │  │    Email     │                  │
│  │  (Next.js)   │  │   (Twilio)   │  │   (Resend)   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                               │
│                     (Next.js API Routes / Vercel)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AGENT ORCHESTRATION LAYER                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Agent Router / Supervisor                     │   │
│  │              (Routes requests to appropriate agent)              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     MESSAGE BUS / EVENT STREAM                   │   │
│  │                  (Redis Streams / Upstash / SQS)                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │         │         │         │         │         │            │
│         ▼         ▼         ▼         ▼         ▼         ▼            │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐         │
│  │Expedition││Inventory ││ Pricing  ││ Booking  ││ Customer │         │
│  │Architect ││  Agent   ││  Agent   ││   Ops    ││ Success  │         │
│  └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘         │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐         │
│  │  Lead    ││ Content  ││   Risk   ││Financial ││ Supplier │         │
│  │  Intel   ││  Agent   ││  Agent   ││   Ops    ││Relations │         │
│  └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SHARED SERVICES LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   LLM API    │  │  Tool        │  │   Cache      │                  │
│  │  (DeepSeek)  │  │  Registry    │  │   (Redis)    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  PostgreSQL  │  │   Vector DB  │  │  Blob Store  │                  │
│  │    (Neon)    │  │  (Pinecone)  │  │(Vercel Blob) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Agent Communication Patterns

#### Synchronous (Request-Response)
Used when immediate response needed:
- Expedition Architect → Availability Agent (check availability)
- Expedition Architect → Pricing Agent (get dynamic price)

#### Asynchronous (Event-Driven)
Used for background processing:
- Booking Ops → Supplier Relations (send confirmation)
- Customer Success → Content Agent (generate message)
- Lead Intel → Content Agent (prepare nurture sequence)

### Event Types

```typescript
// Core event schema
interface AgentEvent {
  eventId: string;
  eventType: string;
  sourceAgent: string;
  targetAgent?: string; // null for broadcast
  payload: Record<string, unknown>;
  timestamp: Date;
  correlationId: string; // Links related events
}

// Example events
type EventTypes =
  | 'quote.created'
  | 'quote.accepted'
  | 'booking.created'
  | 'booking.confirmed'
  | 'payment.received'
  | 'supplier.confirmed'
  | 'trip.started'
  | 'trip.completed'
  | 'feedback.received'
  | 'alert.weather'
  | 'alert.disruption'
  | 'lead.scored'
  | 'lead.qualified';
```

---

## Implementation Phases

### Phase 2A: Core Booking Flow (Q1 2026)

**Goal:** Enable end-to-end booking without manual intervention

**Deliverables:**
- [ ] Booking Operations Agent (full implementation)
- [ ] Enhanced Expedition Architect (availability check, itinerary optimization)
- [ ] PDF Quote Generation
- [ ] Basic payment tracking
- [ ] Supplier confirmation workflow

**Success Criteria:**
- 50% of bookings processed without human intervention
- Quote-to-booking time < 4 hours
- Zero overbookings

**Estimated Effort:** 8-10 weeks

---

### Phase 2B: Lead Optimization (Q2 2026)

**Goal:** Improve lead conversion through intelligent scoring and engagement

**Deliverables:**
- [ ] Lead Intelligence Agent
- [ ] Availability & Inventory Agent
- [ ] Content & Personalization Agent
- [ ] Email nurture sequences
- [ ] Re-engagement automation

**Success Criteria:**
- Lead scoring model with 70% accuracy
- 25% improvement in conversion rate
- < 2% abandoned conversations without follow-up

**Estimated Effort:** 8-10 weeks

---

### Phase 3: Revenue Optimization (Q3-Q4 2026)

**Goal:** Maximize revenue through dynamic pricing and customer retention

**Deliverables:**
- [ ] Dynamic Pricing Agent
- [ ] Customer Success Agent
- [ ] Supplier Relations Agent
- [ ] Loyalty program
- [ ] Referral system

**Success Criteria:**
- 15% revenue increase from dynamic pricing
- 30% repeat booking rate
- NPS score > 70

**Estimated Effort:** 12-16 weeks

---

### Phase 4: Full Automation (2027)

**Goal:** Complete autonomous operation with minimal human oversight

**Deliverables:**
- [ ] Risk & Compliance Agent
- [ ] Financial Operations Agent
- [ ] Advanced ML models
- [ ] White-label agency portal
- [ ] Full reporting suite

**Success Criteria:**
- 90% of operations fully automated
- Real-time financial visibility
- Proactive risk mitigation

**Estimated Effort:** 16-20 weeks

---

## Technology Stack

### Current Stack
| Component | Technology | Status |
|-----------|------------|--------|
| Framework | Next.js 16 (App Router) | ✅ Production |
| Database | Neon PostgreSQL + Drizzle ORM | ✅ Production |
| LLM | DeepSeek Chat | ✅ Production |
| Email | Resend | ✅ Production |
| Hosting | Vercel | ✅ Production |
| Styling | Tailwind CSS 4 | ✅ Production |

### Planned Additions

| Component | Recommended Technology | Alternatives | Phase |
|-----------|----------------------|--------------|-------|
| Agent Framework | LangGraph | CrewAI, AutoGen | 2A |
| Event Bus | Upstash Redis Streams | AWS SQS, Inngest | 2A |
| PDF Generation | React-PDF | Puppeteer, Prince | 2A |
| Payments | Stripe | Adyen, PayPal | 2A |
| SMS/WhatsApp | Twilio | MessageBird | 2B |
| Vector DB | Pinecone | Weaviate, Qdrant | 2B |
| Monitoring | Helicone | LangSmith, Langfuse | 2A |
| Analytics | PostHog | Mixpanel, Amplitude | 2B |
| Cron/Scheduler | Vercel Cron | Trigger.dev, Inngest | 2A |

### LLM Strategy

| Use Case | Model | Rationale |
|----------|-------|-----------|
| Customer Chat | DeepSeek Chat | Cost-effective, good quality |
| Complex Reasoning | Claude Sonnet | Better reasoning for edge cases |
| Content Generation | Claude Haiku | Fast, cost-effective for templates |
| Embeddings | OpenAI text-embedding-3-small | Best price/performance |

---

## Success Metrics

### Business Metrics

| Metric | Current | Phase 2A Target | Phase 3 Target |
|--------|---------|-----------------|----------------|
| Quote-to-Booking Time | 48h | 4h | 1h |
| Conversion Rate | TBD | +25% | +40% |
| Manual Operations | 100% | 50% | 20% |
| Repeat Booking Rate | TBD | 20% | 30% |
| NPS Score | TBD | 60 | 70+ |

### Technical Metrics

| Metric | Target |
|--------|--------|
| Agent Response Time (p95) | < 3s |
| Tool Execution Success Rate | > 99% |
| System Uptime | 99.9% |
| Error Rate | < 0.1% |
| LLM Cost per Booking | < $2 |

### Agent-Specific KPIs

| Agent | Primary KPI | Secondary KPI |
|-------|-------------|---------------|
| Expedition Architect | Conversation-to-Quote Rate | Avg. Conversation Length |
| Availability Agent | Inventory Accuracy | API Response Time |
| Pricing Agent | Revenue per Booking | Price Competitiveness |
| Booking Ops | Booking Completion Rate | Time-to-Confirmation |
| Customer Success | NPS Score | Issue Resolution Time |
| Lead Intel | Lead Score Accuracy | Qualified Lead Rate |
| Content Agent | Content Engagement Rate | Generation Time |
| Risk Agent | Incident Detection Rate | False Positive Rate |
| Financial Ops | Reconciliation Accuracy | Days Sales Outstanding |
| Supplier Relations | Supplier Response Rate | Contract Renewal Rate |

---

## Open Questions

### Technical Decisions Needed

1. **Agent Framework Selection**
   - LangGraph vs CrewAI vs custom implementation?
   - Need POC to evaluate

2. **Event Bus Architecture**
   - Upstash Redis Streams vs Inngest vs custom?
   - Consider Vercel ecosystem integration

3. **LLM Provider Strategy**
   - Single provider vs multi-provider?
   - When to escalate to more capable models?

4. **Vector Database**
   - Do we need semantic search?
   - If yes, Pinecone vs self-hosted?

### Business Decisions Needed

1. **Pricing Model for Dynamic Pricing**
   - How aggressive should yield management be?
   - What's the floor/ceiling for margins?

2. **Human Handoff Thresholds**
   - When should agents escalate to humans?
   - What's the HNW threshold for white-glove service?

3. **Supplier Integration Depth**
   - API integrations vs email-based workflows?
   - Investment level for key suppliers?

4. **Loyalty Program Structure**
   - Points-based vs tier-based?
   - Earning and redemption rules?

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | Engineering Team | Initial document |

---

## Next Steps

1. [ ] Review and approve this roadmap document
2. [ ] Prioritize Phase 2A deliverables
3. [ ] Conduct LangGraph/CrewAI POC
4. [ ] Define detailed specs for Booking Operations Agent
5. [ ] Set up Helicone for LLM monitoring
6. [ ] Create Figma designs for PDF quote template
