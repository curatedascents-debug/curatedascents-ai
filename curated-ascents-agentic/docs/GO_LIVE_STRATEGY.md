# Go-Live Strategy — CuratedAscents

> Last updated: April 2026

---

## Business Registration Status

| Item | Status | Notes |
|------|--------|-------|
| Indiana LLC Formation | ✅ Done | |
| EIN (Federal Tax ID) | ✅ Done | |
| Indiana Business Tax Registration | ✅ Done | |
| Business Bank Account | ✅ Done | |
| IATA / TIDS Accreditation | ⬜ Pending | Required for GDS access and airline ticketing |
| ASTA Membership | ⬜ Pending | Credibility for HNW clients |
| Seller of Travel License | ⏳ Post-launch | CA/FL/WA/HI only — register once traction in those states |
| Business Insurance (E&O + GL) | ⬜ Pending | Errors & Omissions + General Liability |

---

## Platform / Technical Readiness

| Item | Status | Notes |
|------|--------|-------|
| Next.js app deployed on Vercel | ✅ Done | https://curated-ascents-agentic.vercel.app |
| Neon PostgreSQL database | ✅ Done | 92 tables, fully seeded |
| Cloudflare R2 media storage | ✅ Done | 134 photos migrated, R2 configured |
| AI Chat (DeepSeek) | ✅ Done | 18 tools, 10 service types |
| Quote & Booking engine | ✅ Done | Quote → Booking → Payment milestones |
| Stripe payments | ✅ Done | Checkout, webhooks, bank transfer, cash |
| Stripe Business Verification (KYB) | ⬜ Pending | Complete to enable full payouts |
| Resend email (curatedascents.com) | ⬜ Pending | Verify domain for production sending |
| Google Business Profile | ⬜ Pending | Carmel, IN — local SEO |
| WhatsApp Business API | ⬜ Pending | Account verification (code already built) |
| Admin dashboard | ✅ Done | Full CRUD — rates, hotels, suppliers, clients, quotes, bookings |
| Customer portal | ✅ Done | /portal — trips, quotes, loyalty, chat |
| Agency dashboard | ✅ Done | B2B AI chat, 20% margin pricing |
| Supplier portal | ✅ Done | Rate management, booking confirmations |
| Security hardening | ✅ Done | Rate limiting, prompt injection protection, auth |
| E2E test suite | ✅ Done | 380+ tests, 100% pass rate |
| PWA support | ✅ Done | manifest.json, service worker, offline page |

---

## Pre-Launch Checklist

### Must-Have Before Launch
- [ ] Complete Stripe KYB verification
- [ ] Verify `curatedascents.com` domain in Resend
- [ ] Set up Google Business Profile (Carmel, IN)
- [ ] Obtain Business Insurance (E&O + General Liability)
- [ ] Final QA pass on live site — golden path: chat → quote → booking → payment
- [ ] Test all email templates with real addresses
- [ ] Confirm all 54 itineraries have correct pricing in DB
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain on Vercel

### Data Cleanup Before Launch
- [ ] **Hotel rates** — Fix 5 hotels with placeholder $100/night rates: Radisson Kathmandu, Hotel Shangri-La, Temple Tree Resort & Spa, Hotel Manaslu, Tiger Tops Tharu Lodge
- [ ] **Guides** — Only 4 records, needs expansion with real guide rates per country/region
- [ ] **Permits & Fees** — Only 5 records, verify all required permits are covered (Everest, Annapurna, Tibet, Bhutan visa, etc.)
- [ ] **Transportation** — 1,537 records may include test/seed data, audit for accuracy
- [ ] **Hotels** — Review all 101 hotels for accuracy, remove duplicates (e.g. "Banbas Resort" appears twice with different categories)

### Nice-to-Have Before Launch
- [ ] IATA / TIDS Accreditation (or partner with an IATA-accredited agency)
- [ ] ASTA Membership
- [ ] WhatsApp Business API verification

---

## Launch Phases

### Phase 1 — Soft Launch (Private Beta)
- Invite 5–10 known contacts / past travellers
- Goal: validate full booking flow end-to-end with real customers
- Monitor: chat quality, quote accuracy, email delivery, payment processing

### Phase 2 — Public Launch
- Announce on LinkedIn, Instagram, Facebook
- Activate blog content calendar (weekly AI-generated posts)
- Submit sitemap to Google Search Console
- Run Google Ads targeting "luxury Nepal trekking", "Bhutan private tour", etc.

### Phase 3 — Growth (Post-Launch)
- WhatsApp go-live (once Business API verified)
- Register Seller of Travel in CA once bookings from California begin
- IATA accreditation for airline ticketing revenue
- Video consultations feature
- Multi-language AI chat
- AR/VR destination previews
- Carbon offset tracking
- Blog enhancements (image galleries, TOC)

---

## Key URLs

| Resource | URL |
|----------|-----|
| Production | https://curated-ascents-agentic.vercel.app |
| Admin Dashboard | https://curated-ascents-agentic.vercel.app/admin |
| Customer Portal | https://curated-ascents-agentic.vercel.app/portal |
| Agency Dashboard | https://curated-ascents-agentic.vercel.app/agency |
| Supplier Portal | https://curated-ascents-agentic.vercel.app/supplier |
| Health Check | https://curated-ascents-agentic.vercel.app/api/health |

---

## Key Contacts & Accounts

| Service | Purpose |
|---------|---------|
| Neon | PostgreSQL database |
| Vercel | Hosting & deployment |
| Cloudflare R2 | Media storage (134 photos) |
| DeepSeek | AI chat engine |
| Resend | Transactional email |
| Stripe | Payment processing |
| Exchangerate-API | Daily FX rates |
