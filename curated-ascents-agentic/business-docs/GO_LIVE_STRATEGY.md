# Curated Ascents — Go Live Strategy
**Last updated:** May 7, 2026  
**Status:** 🟡 In Progress  
> This is a living document. Update the status of each item as it is completed.

---

## Status Legend
| Symbol | Meaning |
|---|---|
| ✅ | Complete |
| 🟡 | In Progress |
| ⏳ | Waiting on external input |
| ❌ | Not started |

---

## 1. Infrastructure Decisions (Locked)

| Service | Decision | Cost |
|---|---|---|
| Hosting | Vercel Pro | $240/year |
| Database | Neon PostgreSQL (Launch plan) | ~$120/year |
| Media Storage | Cloudflare R2 | ~$10/year |
| Email (transactional) | Resend | $0 (free tier) |
| Email (business) | Google Workspace Business Starter | $84/year |
| Domain | curatedascents.com via GoDaddy | $22/year renewal |
| AI Engine | DeepSeek API | ~$15/year |
| FX Rates | ExchangeRate-API | $0 (free tier) |
| Payments | Stripe | 2.9% + $0.30 per transaction |
| **Total fixed** | | **~$491/year** |

**Notes:**
- Stripe fees are deducted per transaction, not billed upfront
- Google Workspace supports up to 30 email aliases on one $84/year seat (e.g. info@, reservations@, bookings@ all land in one inbox)
- Vercel Pro includes 1TB bandwidth/month and 10M edge requests/month — more than sufficient at launch

---

## 0. Recommended Launch Sequence

Based on current system state (May 7, 2026), complete tasks in this order for the fastest safe path to go-live:

| Priority | Task | Est. Time | Blocks |
|----------|------|-----------|--------|
| 🔴 P0 | **Fix `ENABLE_MSW=false` in Vercel** — currently `true`, runs test mocks in production | 5 min | Live AI chat for real users |
| 🔴 P0 | **Set all missing JWT secrets** (`ADMIN_SESSION_SECRET`, `CUSTOMER_JWT_SECRET`, `SUPPLIER_JWT_SECRET`, `AGENCY_JWT_SECRET`, `CRON_SECRET`) | 10 min | All portal logins, all 19 cron jobs |
| 🔴 P0 | **Change `ADMIN_PASSWORD`** from default before going public | 5 min | Security |
| 🔴 P1 | **DNS setup** — add curatedascents.com to Vercel, update GoDaddy A + CNAME records | 30 min + propagation | Everything on real domain |
| 🔴 P1 | **Resend domain verification** — add SPF/DKIM/DMARC in GoDaddy | 30 min + 24hr propagation | All transactional emails (booking confirmations, payment receipts, portal access codes) |
| 🔴 P1 | **Stripe live mode** — copy live keys to Vercel, register webhook at `https://curatedascents.com/api/payments/webhook` | 20 min | All payments |
| 🟡 P2 | **Bhutan DB rates audit** — current luxury Bhutan rates ($2,500/pp) are unrealistically low; Bhutan SDF alone is $200/night. Audit and correct before taking Bhutan bookings | 1–2 hrs | Bhutan quote accuracy |
| 🟡 P2 | **Blog content review** — AI-generated posts need human read-through before driving traffic | 2–3 hrs | SEO credibility |
| ⏳ P2 | **Hero video** — replace Pexels placeholder in HeroSection.tsx with Ashray's footage | Waiting on Ashray | First impression |
| ⏳ P2 | **Photo library** — upload Ashray's photos via Media tab | Waiting on Ashray | Visual content |
| 🟡 P3 | **Google Workspace setup** — `kiran@curatedascents.com`, info@/reservations@ aliases, Google Calendar booking link | 1 hr | Human email inbox, video consultations |
| ❌ P3 | **Full E2E test suite vs. production** — run all 380+ Playwright tests against live URL | 30 min | Final go/no-go gate |
| ❌ P3 | **Mobile test** — iPhone and Android, confirm chat + checkout work | 20 min | Mobile UX |
| ❌ P3 | **Submit sitemap to Google Search Console** | 10 min | SEO indexing |

> **Fastest path to accepting first booking:** Complete P0 items (20 min) + P1 items (1.5 hrs + DNS propagation overnight). That's ~2 hours of work + one overnight wait.

---

## 2. Pre-Launch Checklist

### 2.1 Hosting & Domain Setup
| Task | Status | Notes |
|---|---|---|
| Lock hosting platform (Vercel) | ✅ | Decided April 2026 |
| Add curatedascents.com in Vercel project settings | ❌ | Settings → Domains → Add domain |
| Update GoDaddy DNS — A record for `@` → `76.76.21.21` | ❌ | |
| Update GoDaddy DNS — CNAME for `www` → `cname.vercel-dns.com` | ❌ | Takes 30–60 min to propagate |
| Verify SSL certificate auto-provisioned by Vercel | ❌ | Happens automatically after DNS propagates |
| Update `NEXT_PUBLIC_APP_URL` in Vercel to `https://curatedascents.com` | ❌ | Currently set to localhost:3001 |

### 2.2 Environment Variables (Vercel Production)
All variables below must be set in Vercel → Project Settings → Environment Variables before going live.

| Variable | Status | Action Required |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ❌ | Set to `https://curatedascents.com` |
| `ADMIN_SESSION_SECRET` | ❌ | Currently a placeholder — generate a proper random 32+ char string |
| `ADMIN_PASSWORD` | ❌ | Change from default before going public |
| `CRON_SECRET` | ❌ | Not set — all 19 cron jobs are unprotected without this |
| `CUSTOMER_JWT_SECRET` | ❌ | Not set — customer portal login will fail |
| `SUPPLIER_JWT_SECRET` | ❌ | Not set — supplier portal auth will fail |
| `AGENCY_JWT_SECRET` | ❌ | Currently hardcoded predictable string — randomize |
| `STRIPE_SECRET_KEY` | ❌ | Not set — payments non-functional |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Not set — Stripe webhooks will fail |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ❌ | Not set — checkout won't load |
| `ENABLE_MSW` | ❌ | Must be removed or set to `false` — currently `true` which enables test mocks in production |
| `DATABASE_URL` | ✅ | Set |
| `DEEPSEEK_API_KEY` | ✅ | Set |
| `RESEND_API_KEY` | ✅ | Set |
| `EXCHANGE_RATE_API_KEY` | ✅ | Set |
| `R2_ACCOUNT_ID` | ✅ | Set |
| `R2_ACCESS_KEY_ID` | ✅ | Set |
| `R2_SECRET_ACCESS_KEY` | ✅ | Set |
| `R2_BUCKET_NAME` | ✅ | Set |
| `R2_PUBLIC_URL` | ✅ | Set |
| `ADMIN_EMAIL` | ❌ | Not set |
| `EMAIL_FROM` | ❌ | Not set |

**Optional (post-launch social media features):**
- `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_PAGE_ID`
- `INSTAGRAM_ACCOUNT_ID`
- `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORG_ID`
- `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`

**Optional (WhatsApp — not going live yet):**
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

### 2.3 Content & Media
| Task | Status | Notes |
|---|---|---|
| Hero video — replace Pexels placeholder | ⏳ | Waiting on Ashray to share footage via Google Drive |
| Nepal hotel rates — data collection | 🟡 | Template sent to Nepal team. Template ready at `Nepal_Hotel_Rates_Template.xlsx` |
| Nepal hotel rates — upload to system | ❌ | Once Nepal team returns completed template |
| Photo library — upload Ashray's photos to Media tab | ⏳ | Waiting on Google Drive share from Ashray |
| Content review — blog posts and itineraries | ❌ | AI-generated content needs human review before driving traffic |
| Hero video — update `HeroSection.tsx` with new URL | ❌ | One-line change once video received and uploaded to R2 |

### 2.4 Email Setup

Two separate systems serve two different purposes:

**System 1 — AI Agent Emails (Resend — already built in, $0)**
The platform already uses Resend for all automated/programmatic emails: booking confirmations to hotels, client notifications, payment receipts, portal access codes, nurture sequences. Only the domain needs to be verified.

| Task | Status | Notes |
|---|---|---|
| Verify `curatedascents.com` as sending domain in Resend dashboard | ❌ | Resend generates SPF, DKIM, DMARC records automatically |
| Add Resend DNS records (SPF, DKIM, DMARC) in GoDaddy | ❌ | Propagation takes up to 24 hours |
| Update `EMAIL_FROM` env var to `bookings@curatedascents.com` | ❌ | Or `hello@curatedascents.com` for client-facing emails |
| Test AI booking confirmation email end-to-end | ❌ | |

**System 2 — Human Email (Google Workspace — $84/year)**
For Kiran's personal inbox only — reading client replies, handling enquiries, personal correspondence.

| Task | Status | Notes |
|---|---|---|
| Sign up for Google Workspace Business Starter | ❌ | $84/year — 1 seat |
| Connect curatedascents.com to Google Workspace | ❌ | Add MX records in GoDaddy |
| Set up kiran@curatedascents.com as primary inbox | ❌ | |
| Set up aliases (info@, reservations@, enquiries@) | ❌ | All land in same inbox, up to 30 aliases free |

### 2.5 Video Consultations
| Task | Status | Notes |
|---|---|---|
| Set up Google Workspace (prerequisite) | ❌ | See email setup above |
| Configure appointment slots in Google Calendar | ❌ | Set your availability, duration (e.g. 45 min), and buffer time between calls |
| Get shareable Google Calendar booking link | ❌ | Format: `calendar.google.com/booking/curatedascents` |
| Add "Book a Video Call" button to "Speak to an Expert" section in `ChatInterface.tsx` | ❌ | Small code change — links to Google Calendar booking page, opens in new tab |
| Test full booking flow (client books → both receive confirmation with Meet link) | ❌ | |

**Approach:** External Google Calendar link (not embedded). Simple, zero extra cost, works immediately. Revisit in-platform integration post-launch based on actual usage.

### 2.6 Payments
| Task | Status | Notes |
|---|---|---|
| Confirm Stripe account is in live mode (not test mode) | ❌ | |
| Copy live Stripe keys to Vercel env vars | ❌ | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Register Stripe webhook endpoint pointing to production URL | ❌ | `https://curatedascents.com/api/payments/webhook` |
| Do a test transaction end-to-end in production | ❌ | |

### 2.7 Final Pre-Launch Checks
| Task | Status | Notes |
|---|---|---|
| Run full E2E test suite against production URL | ❌ | `npm run test` — 380+ tests |
| Confirm all cron jobs are firing correctly | ❌ | Check Vercel dashboard → Cron Jobs tab |
| Confirm AI chat is responding correctly on live site | ❌ | Test a few full conversations |
| Check sitemap is accessible at curatedascents.com/sitemap.xml | ❌ | |
| Check robots.txt at curatedascents.com/robots.txt | ❌ | |
| Submit sitemap to Google Search Console | ❌ | |
| Test on mobile (iPhone and Android) | ❌ | |

---

## 3. Post-Launch Roadmap & Cost Estimates

### 3.0 Chat Conversation Persistence — Layer 2 (DB)

**Completed at launch:** Layer 1 — localStorage persistence. Chat messages survive page refreshes and dropped connections for 24 hours on the same device/browser. Cost: $0. No new infrastructure.

**Post-launch (Layer 2):** Server-side persistence tied to the client record.

| Task | Notes |
|---|---|
| Add `conversation_messages` table to Neon | `id`, `conversation_id`, `client_id` (FK), `role`, `content`, `created_at` |
| Write messages from `/api/chat` route | Insert each user + assistant message after the AI responds |
| Load history on chat open | `GET /api/chat/history?conversationId=xxx` — restore last N messages |
| Tie to email capture | Once a client provides their email, link all future conversations to their client record |
| Admin dashboard view | Surface full conversation history per client in the admin Clients tab |

**Benefit:** Cross-device continuity, full conversation archive for Kiran to review, ability to train/fine-tune on real client queries over time. Cost: $0 extra (within Neon Launch plan).

---

### 3.1 WhatsApp Business API
| Detail | Notes |
|---|---|
| Status | Infrastructure complete — pending Meta account verification |
| Pricing model | Per message delivered (since July 2025 Meta switched from per-conversation to per-message billing) |
| Marketing messages | ~$0.01–$0.14 per message depending on recipient country |
| Utility messages | ~80–90% cheaper than marketing |
| Service replies | Free within 24-hour customer-initiated window |
| Estimated cost | At 500 outbound messages/month (booking confirmations, follow-ups): **~$10–30/month ($120–360/year)** |
| BSP platform fee | If using a third-party provider (Twilio, 360dialog) add ~$10–25/month on top |

### 3.2 Video Consultations
Both scheduling and video are fully covered by Google Workspace at no extra cost.

| Tool | Cost | Notes |
|---|---|---|
| Google Calendar Appointment Scheduling | $0 | Included in Workspace — share a booking link, clients pick a slot, Calendar auto-creates a Meet link and sends invites |
| Google Meet | $0 | Included in Workspace — unlimited meetings, no time limit |

**Total cost: $0.** No Calendly, no Zoom needed.

### 3.3 Social Media Advertising
Paid ads are optional — the AI blog auto-posts organically to social channels at no extra cost. Paid ads are for accelerating reach.

| Platform | Minimum effective budget | Notes |
|---|---|---|
| Google Ads | $50–100/day | Best for capturing high-intent searches ("luxury Nepal trekking", "Everest expedition packages") |
| Facebook/Instagram | $30–50/day | Better for visual storytelling and interest-based targeting of HNW travellers |

**Realistic starter budget for luxury travel:**
- Testing phase (3 months): $1,000–2,000/month across both platforms
- Scaling phase: $3,000–5,000/month once winning creatives are identified
- Annual ad spend (conservative): **$15,000–30,000/year**

Note: Google Ads and Meta ads are self-serve — no agency needed to start. Budget goes directly to the platforms.

### 3.4 SEO & Content Marketing
Your AI blog engine generates and publishes content automatically — this covers organic SEO at $0. If you want to accelerate with a specialist agency:

| Option | Cost | Notes |
|---|---|---|
| DIY (AI blog engine) | $0 | Already built — posts weekly, auto-shares to social |
| Freelance SEO consultant | $500–1,500/month | Good for link building and keyword strategy |
| Luxury travel SEO agency | $3,000–8,000/month | Specialists like Propellic, Avidon — for serious scale |

**Recommendation:** Start with the built-in AI blog engine (free) for the first 6–12 months. Invest in paid SEO only once you have enough traffic data to make informed decisions.

### 3.5 Other Marketing Costs to Budget For
| Item | Estimated Cost | Notes |
|---|---|---|
| Professional photography (beyond Ashray) | $500–2,000/shoot | For marketing materials, brochures |
| Email marketing platform (if outgrowing Resend free tier) | $240/year (Resend Pro) | Kicks in above 3,000 emails/month |
| CRM / marketing automation (future) | $0–$50/month | HubSpot free tier is sufficient at early stage |
| Travel trade shows / exhibitions | $2,000–10,000/event | Optional — Adventure Travel World Summit, WTM London, etc. |
| Google Search Console & Analytics | $0 | Free — already configured in your sitemap |

### 3.6 Summary — Post-Launch Annual Cost Scenarios

| Scenario | Annual Cost | What's Included |
|---|---|---|
| **Lean (launch year)** | ~$491 | Platform infrastructure only — no ads, no paid marketing |
| **Growth (year 2)** | ~$3,600–5,600 | + WhatsApp, video consultations ($0 — fully covered by Google Workspace), light paid social |
| **Scale (year 3+)** | ~$20,000–40,000 | + Serious ad spend, possible SEO agency, trade shows |

All scenarios exclude Stripe transaction fees (2.9% + $0.30 per booking) which come out of revenue.

---

## 4. Key Files & Resources

| Item | Location |
|---|---|
| Nepal hotel rates template | `Nepal_Hotel_Rates_Template.xlsx` |
| Nepal team rates email | `Nepal_Team_Rates_Email.md` |
| Ashray media upload guide | `Ashray_Media_Upload_Guide.md` |
| Hero video placeholder (to replace) | `src/components/homepage/HeroSection.tsx` line 9 |
| Production URL | https://curated-ascents-agentic.vercel.app *(temporary — move to curatedascents.com)* |
| Codebase docs | `docs/` folder — API_REFERENCE.md, DATABASE_SCHEMA.md, MODULES.md, TESTING.md, CHANGELOG.md, CRON_JOBS.md |

---

## 5. Contacts

| Person | Role | Contact |
|---|---|---|
| Kiran Pokhrel | Platform owner | curatedascents@gmail.com / +1-715-505-4964 |
| Ashray | Nepal photography | Via Google Drive share |
