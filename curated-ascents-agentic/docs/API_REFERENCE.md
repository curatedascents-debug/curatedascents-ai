# API Endpoints Reference (~179 route files)

## Core APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | AI chat with tool execution |
| POST | `/api/personalize` | Save client email/name |
| GET | `/api/seed-all` | Full database seeding (upsert) |
| GET | `/api/seed` | Basic database seed |
| GET | `/api/seed-agency` | Agency-specific seed data |
| GET | `/api/agent/supplier-contacts` | Internal agent supplier lookup |

## Admin Auth APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/auth/login` | Admin login |
| POST | `/api/admin/auth/logout` | Admin logout |

## Admin CRUD APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/rates` | Rate management |
| POST | `/api/admin/rates/create` | Create new rate |
| GET/PUT/DELETE | `/api/admin/rates/[serviceType]/[id]` | Individual rate CRUD |
| GET/POST | `/api/admin/suppliers` | Supplier management |
| GET/PUT/DELETE | `/api/admin/suppliers/[id]` | Individual supplier |
| GET/POST | `/api/admin/suppliers/[id]/users` | Supplier user management |
| PUT/DELETE | `/api/admin/suppliers/[id]/users/[userId]` | Individual supplier user |
| GET | `/api/admin/suppliers/[id]/performance` | Supplier performance data |
| GET/POST | `/api/admin/suppliers/[id]/communications` | Supplier communications |
| GET/POST | `/api/admin/suppliers/[id]/issues` | Supplier issue tracking |
| GET | `/api/admin/supplier-rankings` | Supplier ranking list |
| GET/POST | `/api/admin/supplier-requests` | Supplier rate requests |
| GET/POST | `/api/admin/hotels` | Hotel management |
| GET/PUT/DELETE | `/api/admin/hotels/[id]` | Individual hotel |
| GET/POST | `/api/admin/clients` | Client management |
| GET/PUT/DELETE | `/api/admin/clients/[id]` | Individual client |
| GET | `/api/admin/clients/[id]/lead-score` | Client lead score |
| GET | `/api/admin/lead-intelligence` | Lead intelligence dashboard |
| GET/POST | `/api/admin/quotes` | Quote management |
| GET/PUT/DELETE | `/api/admin/quotes/[id]` | Individual quote |
| GET | `/api/admin/quotes/[id]/pdf` | Generate quote PDF |
| POST | `/api/admin/quotes/[id]/email-pdf` | Email quote PDF |
| GET/POST | `/api/admin/bookings` | Booking management |
| GET/PUT | `/api/admin/bookings/[id]` | Individual booking |
| GET/POST | `/api/admin/destinations` | Destination management |
| GET/POST | `/api/admin/agencies` | Agency management |
| GET/PUT/DELETE | `/api/admin/agencies/[id]` | Individual agency |
| GET/POST | `/api/admin/agencies/[id]/users` | Agency user management |

## Booking Operations APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/bookings/[id]/milestones` | Payment milestones |
| PUT | `/api/admin/bookings/[id]/milestones/[mid]` | Update milestone |
| GET/POST | `/api/admin/bookings/[id]/suppliers` | Supplier confirmations |
| PUT | `/api/admin/bookings/[id]/suppliers/[sid]` | Update supplier confirmation |
| GET/POST | `/api/admin/bookings/[id]/briefings` | Trip briefings |
| GET | `/api/admin/bookings/[id]/events` | Audit trail |
| GET/POST | `/api/admin/bookings/[id]/risk-assessment` | Booking risk assessment |
| GET/POST | `/api/admin/bookings/[id]/compliance-checks` | Compliance checks |

## Financial APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/invoices` | Invoice management |
| GET/PUT/DELETE | `/api/admin/invoices/[id]` | Individual invoice |
| GET | `/api/admin/invoices/[id]/pdf` | Generate invoice PDF |
| POST | `/api/admin/invoices/[id]/send` | Email invoice to client |
| GET/POST | `/api/admin/payments` | Payment records |
| GET/PUT | `/api/admin/payments/[id]` | Individual payment |
| GET | `/api/admin/financial/reports` | Financial reports |
| GET | `/api/admin/financial/aging` | Accounts receivable aging |

## Pricing APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/pricing/rules` | Pricing rules CRUD |
| GET/PUT/DELETE | `/api/admin/pricing/rules/[id]` | Individual rule |
| GET | `/api/admin/pricing/demand` | Demand metrics |
| POST | `/api/admin/pricing/simulate` | Price simulation |
| GET | `/api/admin/pricing/analytics` | Pricing analytics |
| GET/POST | `/api/admin/pricing/adjustments` | Price adjustments |

## Availability APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/availability/calendar` | Availability calendar |
| GET | `/api/admin/availability/check` | Check availability |
| GET/POST | `/api/admin/availability/blackouts` | Blackout dates |
| GET/POST | `/api/admin/availability/holds` | Inventory holds |
| GET/POST | `/api/admin/availability/permits` | Permit inventory |

## Loyalty & Referrals APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/loyalty/accounts` | Loyalty accounts |
| GET/PUT | `/api/admin/loyalty/accounts/[id]` | Individual account |
| GET/POST | `/api/admin/loyalty/accounts/[id]/transactions` | Loyalty transactions |
| GET/POST | `/api/admin/referrals` | Referral management |
| GET | `/api/admin/referrals/[code]` | Referral by code |
| GET | `/api/admin/customer-success` | Customer success dashboard |

## Risk & Compliance APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/risk/advisories` | Travel advisories |
| GET/PUT/DELETE | `/api/admin/risk/advisories/[id]` | Individual advisory |
| GET/POST | `/api/admin/risk/weather` | Weather alerts |
| GET/PUT/DELETE | `/api/admin/risk/weather/[id]` | Individual alert |
| GET/POST | `/api/admin/risk/compliance` | Compliance requirements |
| GET/PUT/DELETE | `/api/admin/risk/compliance/[id]` | Individual requirement |
| GET/POST | `/api/admin/risk/emergency-contacts` | Emergency contacts |
| GET/PUT/DELETE | `/api/admin/risk/emergency-contacts/[id]` | Individual contact |

## Content Management APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/content/destinations` | Destination content |
| GET/POST | `/api/admin/content/guides` | Destination guides |
| GET/POST | `/api/admin/content/templates` | Content templates |
| GET/POST | `/api/admin/content/assets` | Content assets |
| POST | `/api/admin/content/generate` | AI content generation |
| POST | `/api/admin/content/seed` | Seed content data |

## Support & Other Admin APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/support/tickets` | Support tickets |
| GET/PUT | `/api/admin/support/tickets/[id]` | Individual ticket |
| GET/POST | `/api/admin/testimonials` | Testimonial management |
| POST | `/api/admin/email-test` | Email template testing |

## Nurture APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/nurture/sequences` | Nurture sequences |
| GET/PUT/DELETE | `/api/admin/nurture/sequences/[id]` | Individual sequence |
| GET/POST | `/api/admin/nurture/enrollments` | Enrollments |

## Competitor APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/competitors` | Competitor rates |
| GET/PUT/DELETE | `/api/admin/competitors/[id]` | Individual rate |
| GET | `/api/admin/competitors/compare` | Price comparison |

## Reports APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/reports` | Main dashboard KPIs |
| GET | `/api/admin/reports/suppliers` | Supplier performance |
| GET | `/api/admin/reports/leads` | Lead intelligence |

## Admin Blog APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/blog/posts` | Blog post management |
| GET/PUT/DELETE | `/api/admin/blog/posts/[id]` | Individual post |
| GET/POST | `/api/admin/blog/categories` | Blog categories |
| POST | `/api/admin/blog/generate` | AI blog post generation |
| GET | `/api/admin/blog/analytics` | Blog analytics dashboard |

## Admin WhatsApp APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/admin/whatsapp/conversations` | WhatsApp conversations |
| GET/PUT | `/api/admin/whatsapp/conversations/[id]` | Individual conversation |
| GET/POST | `/api/admin/whatsapp/templates` | Message templates |

## Payment APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/checkout` | Create Stripe session |
| GET | `/api/payments/status` | Check payment status |
| POST | `/api/payments/webhook` | Stripe webhook handler |

## Currency APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/currency/convert` | Convert amount |
| GET | `/api/currency/rates` | Get exchange rates |
| GET | `/api/admin/fx-rates` | Daily FX rate history (query: `?days=30`, max 365) |

## Customer APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/customer/loyalty` | Loyalty account |
| POST | `/api/customer/surveys/[id]` | Submit survey |

## Public Blog APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/blog/posts` | List published blog posts (with category/destination filters) |
| GET | `/api/blog/posts/[slug]` | Get single blog post by slug |

## Customer Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/portal/auth/send-code` | Send email verification code |
| POST | `/api/portal/auth/verify-code` | Verify code and create session |
| GET | `/api/portal/auth/me` | Current customer session |
| POST | `/api/portal/auth/logout` | End customer session |
| GET | `/api/portal/dashboard` | Customer dashboard data |
| GET | `/api/portal/bookings` | Customer's bookings |
| GET | `/api/portal/bookings/[id]` | Individual booking detail |
| GET | `/api/portal/quotes` | Customer's quotes |
| GET | `/api/portal/quotes/[id]` | Individual quote detail |
| GET | `/api/portal/loyalty` | Loyalty account and transactions |
| POST | `/api/portal/loyalty/redeem` | Redeem loyalty points |
| POST | `/api/portal/loyalty/referral` | Submit referral |
| GET/PUT | `/api/portal/profile` | Customer profile management |

## Agency Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/agency/auth/login` | Agency user login |
| POST | `/api/agency/auth/logout` | Agency logout |
| GET | `/api/agency/auth/me` | Current agency session |
| POST | `/api/agency/chat` | Agency B2B AI chat (20% margin) |
| GET/POST | `/api/agency/clients` | Agency client management |
| GET/PUT/DELETE | `/api/agency/clients/[id]` | Individual client |
| GET/POST | `/api/agency/bookings` | Agency bookings |
| GET | `/api/agency/bookings/[id]` | Individual booking |
| GET/POST | `/api/agency/quotes` | Agency quotes |
| GET/PUT | `/api/agency/quotes/[id]` | Individual quote |
| GET | `/api/agency/rates` | Agency rate sheet |
| GET | `/api/agency/suppliers` | Agency suppliers |

## WhatsApp APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/whatsapp/webhook` | WhatsApp incoming webhook |
| POST | `/api/whatsapp/send` | Send WhatsApp message |

## Media Library APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/media/homepage` | Public homepage images from media library |
| GET/POST | `/api/admin/media` | List/search media, create metadata record |
| POST | `/api/admin/media/upload` | Multipart file upload with R2 processing |
| GET/PUT/DELETE | `/api/admin/media/[id]` | Single media CRUD (soft/hard delete) |
| POST | `/api/admin/media/bulk` | Bulk tag/categorize/delete/collection ops |
| POST | `/api/admin/media/auto-tag` | AI auto-tagging via DeepSeek |
| GET | `/api/admin/media/stats` | Media library statistics |
| GET/POST | `/api/admin/media/collections` | List/create collections |
| GET/PUT/DELETE | `/api/admin/media/collections/[id]` | Single collection CRUD |
| POST | `/api/admin/media/auto-tag-all` | Bulk AI auto-tag all media (DeepSeek) |

## Admin Utility APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/deduplicate` | Detect and remove duplicate seed records |

## Supplier Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/supplier/auth/login` | Supplier login |
| POST | `/api/supplier/auth/logout` | Supplier logout |
| GET | `/api/supplier/auth/me` | Current supplier |
| GET | `/api/supplier/bookings` | Supplier's bookings |
| GET/PUT | `/api/supplier/rates` | Supplier's rates |
| PUT | `/api/supplier/rates/[serviceType]/[id]` | Update individual rate |
