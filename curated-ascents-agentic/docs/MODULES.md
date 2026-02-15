# Key Modules (~56 files in `src/lib/`)

## AI & Tools
- `src/lib/agents/tool-definitions.ts` — 18 function/tool schemas for DeepSeek
- `src/lib/agents/tool-executor.ts` — Dispatches tool calls to the appropriate handler
- `src/lib/agents/database-tools.ts` — Database query functions for all service types
- `src/lib/agents/chat-processor.ts` — Chat processing pipeline
- `src/lib/agents/agency-chat-processor.ts` — B2B chat with 20% margin pricing, per-service price visibility, agencyId tracking
- `src/lib/agents/fallback-rate-research.ts` — Estimated market rates when DB has no data
- `src/lib/agents/expedition-architect.ts` — Original AI architecture
- `src/lib/agents/expedition-architect-enhanced.ts` — Enhanced version

## Authentication (4 files)
- `src/lib/auth/customer-auth.ts` — Email verification + JWT sessions via `jose`
- `src/lib/auth/agency-auth.ts` — Agency JWT sessions via `jose` (uses `bcryptjs` for Vercel compatibility)
- `src/lib/auth/supplier-auth.ts` — Supplier user auth (bcryptjs)
- `src/lib/auth/permissions.ts` — Permission checking utilities

## Pricing & Currency
- `src/lib/pricing/pricing-engine.ts` — Dynamic pricing with seasonal, demand, early bird, group, loyalty rules
- `src/lib/currency/currency-service.ts` — Multi-currency conversion with cached exchange rates, daily FX snapshots via exchangerate-api.com, `updateExchangeRates()` for cron

## Lead Intelligence
- `src/lib/lead-intelligence/scoring-engine.ts` — Lead scoring based on engagement signals (0-100)
- `src/lib/lead-intelligence/nurture-engine.ts` — Email nurture sequence automation
- `src/lib/lead-intelligence/seed-sequences.ts` — Sequence templates

## Financial
- `src/lib/financial/invoice-engine.ts` — Invoice generation, payment tracking, PDF generation
- `src/lib/stripe/stripe-client.ts` — Stripe SDK wrapper
- `src/lib/stripe/payment-service.ts` — Checkout session creation & webhook handling

## Availability & Inventory
- `src/lib/availability/availability-engine.ts` — Calendar, holds, blackouts, permit inventory

## Supplier Relations
- `src/lib/suppliers/supplier-relations-engine.ts` — Performance tracking, communications, issue management

## Risk & Compliance
- `src/lib/risk/risk-compliance-engine.ts` — Travel advisories, weather alerts, compliance checks

## Customer Success (3 files)
- `src/lib/customer-success/loyalty-engine.ts` — Points, tiers (Bronze->Platinum), referrals
- `src/lib/customer-success/feedback-engine.ts` — Surveys, post-trip reviews
- `src/lib/customer-success/support-engine.ts` — Support ticket system

## Content & Personalization
- `src/lib/content/content-engine.ts` — Content generation pipeline
- `src/lib/content/personalization-engine.ts` — Client content preferences
- `src/lib/content/narrative-generator.ts` — Narrative content generation
- `src/lib/content/destination-guides.ts` — Destination guide data
- `src/lib/content/seed-content.ts` — Content seeding

## Email (20 files)
- `src/lib/email/send-email.ts` — Email sending via Resend
- `src/lib/email/resend-client.ts` — Resend client wrapper
- `src/lib/email/templates/` — 17 React Email templates (welcome, verification-code, quote-sent, quote-pdf-email, quote-expired, booking-confirmation, payment-reminder, payment-received, invoice-sent, milestone, trip-briefing-7day, trip-briefing-24hour, trip-checkin, feedback-request, supplier-confirmation-request, supplier-communication, lead-reengagement, blog-draft-notification, admin-notification, all-suppliers-confirmed)

## Blog & Social
- `src/lib/blog/blog-writer-agent.ts` — AI blog post generation via DeepSeek
- `src/lib/blog/seo-optimizer.ts` — SEO metadata generation
- `src/lib/blog/social-media-formatter.ts` — Social media post formatting
- `src/lib/social/social-media-client.ts` — Social media auto-sharing (Facebook, Instagram, LinkedIn, Twitter/X)

## Media Library
- `src/lib/media/r2-client.ts` — Cloudflare R2 upload/delete with local filesystem fallback (`public/uploads/media/`), WebP conversion, thumbnails via `sharp`
- `src/lib/media/media-service.ts` — Full CRUD, search, AI photo search, blog image lookup (filename + tag strategies), bulk ops, collections, stats

## WhatsApp Integration (6 files)
- `src/lib/whatsapp/whatsapp-client.ts` — WhatsApp Business API client
- `src/lib/whatsapp/message-processor.ts` — Incoming message handling
- `src/lib/whatsapp/message-sender.ts` — Outgoing messages
- `src/lib/whatsapp/session-manager.ts` — Session tracking
- `src/lib/whatsapp/formatters.ts` — Message formatting
- `src/lib/whatsapp/client-linker.ts` — Link WhatsApp messages to clients

## PDF
- `src/lib/pdf/styles.ts` — PDF styling constants

## API Helpers
- `src/lib/api/agency-context.ts` — Agency request context from middleware headers
- `src/lib/api/supplier-context.ts` — Supplier request context from middleware headers

## Constants (7 files in `src/lib/constants/`)
- `destinations.ts`, `experiences.ts`, `hero-slides.ts`, `press.ts`, `social-links.ts`, `stats.ts`, `testimonials.ts`

## Animations
- `src/lib/animations.ts` — Framer Motion animation configurations

## Homepage Components (Server/Client split for SEO)
- `src/components/homepage/LuxuryHomepage.tsx` — **Server component** orchestrator, wraps children in `<ChatProvider>`
- `src/components/homepage/ChatContext.tsx` — **Client** React Context providing `openChat/toggleChat/closeChat`, renders `<ChatWidget>` internally
- `src/components/homepage/AnimateOnScroll.tsx` — **Client** wrapper using IntersectionObserver + `data-animate` CSS
- `src/components/homepage/ChatButton.tsx` — **Client** button consuming `useChatContext()` to open chat
- `src/components/homepage/ScrollLink.tsx` — **Client** button for smooth-scrolling to section IDs
- **Server components** (content in HTML for crawlers): HowItWorks, SignatureJourneys, FounderSection, TrustStrip, FinalCTA
- **Client components** (require JS interactivity): Navigation, HeroSection, TestimonialsSection, Footer, ChatWidget
- `src/components/homepage/index.ts` — Barrel exports

## Blog Components
- `src/components/blog/` — BlogList, BlogCard, BlogPost components (luxury navy/gold theme)
