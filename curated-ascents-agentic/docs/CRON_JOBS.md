# Cron Jobs (Vercel Cron — `vercel.json`)

18 cron jobs configured. All require `CRON_SECRET` via `Authorization: Bearer` header.

All cron route files use `export const dynamic = "force-dynamic"`.

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Daily 9 AM | `/api/cron/payment-reminders` | Payment due reminders |
| Daily 9 AM | `/api/cron/milestone-notifications` | Payment milestone notifications |
| Daily 10 AM | `/api/cron/trip-briefings` | Pre-departure briefings |
| Daily 10 AM | `/api/cron/feedback-requests` | Post-trip feedback requests |
| Daily 11 AM | `/api/cron/supplier-followup` | Supplier confirmation follow-up |
| Daily 12 PM | `/api/cron/nurture-sequences` | Email nurture automation |
| Daily 2 PM | `/api/cron/lead-reengagement` | Cold lead re-engagement |
| Daily 8 AM | `/api/cron/trip-checkins` | In-trip check-in prompts |
| Daily 8 AM | `/api/cron/invoice-overdue` | Overdue invoice reminders |
| Daily 7 AM | `/api/cron/price-optimization` | Price optimization suggestions |
| Daily 7 AM | `/api/cron/social-media-posting` | Social media post scheduling |
| Daily 6 AM | `/api/cron/demand-analysis` | Demand metrics calculation |
| Daily 6 AM | `/api/cron/blog-publishing` | Scheduled blog post publishing |
| Daily 5 AM | `/api/cron/release-expired-holds` | Release expired inventory |
| Daily 4 AM | `/api/cron/supplier-performance` | Supplier scoring |
| Daily 3 AM | `/api/cron/risk-monitoring` | Travel advisory updates |
| Daily 2 AM | `/api/cron/points-expiry` | Loyalty points expiry warnings |
| Weekly Mon 4 AM | `/api/cron/auto-content-generation` | AI blog content generation |
