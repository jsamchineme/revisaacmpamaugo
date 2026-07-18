---
slug: campaigns-app
status: drafting
intent: clear
pending-action: write .omo/plans/campaigns-app.md
approach: Separate Next.js 16 app at campaigns/ — Prisma (SQLite, switchable to Neon Postgres), NextAuth v5 (credentials), AdminShell (website-inspired but independent), Twilio WhatsApp Content Templates, Nodemailer SMTP email, click tracking (per-recipient UUID + 302 redirect), events with RSVP form (plus-one, WhatsApp opt-in), re-campaigning from filtered contacts
---

# Draft: campaigns-app

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->
| C1-Foundation | Next.js scaffold, Prisma schema (7 tables), NextAuth, AdminShell layout | active | campaigns/prisma/schema.prisma, campaigns/lib/auth.ts |
| C2-CampaignContact | Admin CRUD campaigns (title, template+variables, message), import/manage contacts, assign to campaigns | active | campaigns/app/admin/campaigns/ |
| C3-Messaging | Twilio WhatsApp (Content Templates) + Nodemailer email, SendLog tracking per recipient per channel | active | campaigns/lib/whatsapp.ts, campaigns/lib/email.ts |
| C4-TrackingAnalytics | Per-recipient UUID click tracking (302 redirect), admin analytics (clicked vs not), filter contacts, re-campaign from filtered set | active | campaigns/app/c/[uuid]/route.ts |
| C5-EventsRegistration | Event CRUD, public event page + RSVP form (plus-one dynamic, WhatsApp opt-in), admin registration viewer, CSV export | active | campaigns/app/admin/events/, campaigns/app/(public)/events/ |

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| Database | SQLite via Prisma (same as website) | Works with Vercel serverless; no cold starts. Switchable to Neon Postgres via datasource change. | Yes — change prisma datasource provider to postgresql |
| Styling | Tailwind CSS v4 (same token palette as website) | Consistent design language; website tokens already defined at campaigns/app/globals.css | Yes |
| Auth | NextAuth v5, JWT sessions, credentials provider, separate admin users from website | Proven pattern in website/lib/auth.ts; independent auth for logical separation | Partially — shared auth would require schema merge |
| Dev server | `next dev -p 3001` (website on 3000, campaigns on 3001) | Avoid port conflicts during parallel dev | Yes |
| Deploy | Separate Vercel project (`campaigns-revisaacmpamaugo`) | Independent deploy; website deploys separately on Vercel | Yes |
| Phone format | E.164 normalization on import | WhatsApp requires E.164; strip non-digits, prepend + if missing, validate | Yes |
| CSRF | Next.js built-in (no manual token management needed with Server Actions) | Framework-level protection; no raw PHP CSRF code needed | N/A |
| Rate limiting | next-rate-limit or custom middleware for login + RSVP | 5 attempts/15min login, 10 submissions/hour RSVP | Yes |

## Findings (cited - path:lines)
- Website app fully built: Next.js 16, Prisma SQLite, NextAuth v5 credentials, AdminShell, 8 CRUD entities, Tailwind v4 tokens (exploration reports from bg_5c311a3a, bg_7f0e3ef8)
- AdminShell pattern: sidebar nav with SVG icons, breadcrumb, role filtering, mobile hamburger → website/components/admin/AdminShell.tsx
- Form pattern: useState + fetch to /api/admin/[resource], Zod val in API routes → website/app/admin/sermons/SermonForm.tsx
- API pattern: GET list, POST create, GET/PUT/DELETE [id], Zod parse, try/catch → website/app/api/admin/sermons/route.ts
- Design tokens: burgundy #5a2231, gold #b08642, cream #f3ede2, ink #1c1a17 → website/app/globals.css
- NextAuth config: credentials provider, JWT callback adds role, authorized() protects /admin/* → website/lib/auth.config.ts
- Twilio WhatsApp: npm package `twilio`, Content Templates required for outbound marketing outside 24hr window
- Nodemailer: already a dependency in website; SMTP transport with env vars → website/app/api/contact/route.ts (pattern)

## Decisions (with rationale)
1. **Separate Next.js app** (not integrated): User confirmed logical separation. Own package.json, own Prisma, own auth. Reuses patterns but not code.
2. **Template-based WhatsApp** (Option A): User chose template selector + variable filler. Free-form text is blocked by Twilio outside 24hr window.
3. **302 redirect** for click tracking: 301 causes browser caching; 302 ensures every click hits the tracker.
4. **Per-recipient tracking UUIDs**: Generated at send time per CampaignContact row. Enables "filter by click status → re-campaign." Per-campaign UUID only counts clicks, doesn't identify who.
5. **Separate Vercel deploy**: User said website is on Vercel. Campaigns gets its own Vercel project.
6. **SendLog table**: Required for per-recipient delivery status (pending/sent/delivered/failed) per channel (whatsapp/email).

## Scope IN
- Admin login (credentials, bcrypt 12 rounds, session regeneration, rate limiting)
- Admin dashboard (stats: campaigns, contacts, clicks, events)
- Campaign CRUD: title, WhatsApp template selector, template variables, message body (for email)
- Contact management: manual add, CSV import (name, phone, email), E.164 phone normalization, deduplication on phone+email
- Campaign → Contact assignment (M:N via CampaignContact join table)
- WhatsApp messaging via Twilio Content Templates (pre-approved by admin in Twilio dashboard)
- Email messaging via Nodemailer SMTP
- SendLog per recipient per channel (status, error, timestamps)
- Click tracking: GET /c/{uuid} → log click → 302 redirect to campaign link
- Admin click analytics per campaign: total sent, total clicked, click rate, clicked/not-clicked contact lists
- Filter contacts by click status, create new campaign from filtered contacts
- Event CRUD: title, slug, date, description, capacity (nullable), image URL
- Public event page at /events/[slug] with RSVP form
- RSVP form: title, fullname, phone, email (optional), plus-one checkbox (dynamic expansion, max 5 guests), WhatsApp group opt-in checkbox
- Admin registration viewer: table of registrants per event, WhatsApp group filter, CSV export
- Admin CSV export of registrations (RFC 4180, UTF-8 BOM)

## Scope OUT (Must NOT have)
- Payment processing, ticketing, or paid events
- Rich text editor in campaign messages (plain text + template variables only)
- Email template designer (plain text email only)
- WhatsApp free-form messaging (template-only per Twilio policy)
- OAuth/social login (credentials only)
- Multi-tenancy or organization accounts
- A/B testing or campaign scheduling
- SMS fallback channel (WhatsApp + email only)
- Integration with website's auth or database
- Recurring/automated campaigns
- Event waitlist (capacity reached = form closed)
- Image/file attachments in messages
- Campaign message preview (send a test message to self only)
- Analytics dashboards beyond click rate and WhatsApp group filter

## Open questions
(None — all resolved)

## Approval gate
status: reviewed
pending-action: none — all issues fixed, deliver plan
approach: 6-wave parallel build → Metis gap analysis → append todos → fill TL;DR → dual review → fix 10 issues → deliver plan
approved: true
review_required: true
momus_v1: ses_08da3a424ffegWYEXPRuXdj1UU (REJECT — 2 blockers: missing middleware.ts, T12/T13 DAG contradiction)
oracle_v1: ses_08da38840ffeAGKzQYsnQ1yZI9 (REJECT — 8 blockers: middleware, PrismaAdapter models, email click tracking, WhatsApp contract, Twilio format, T16 acceptance, status callback, scaffold)
fixes_applied: All 10 blocking issues resolved — middleware.ts added, PrismaAdapter dropped, email per-recipient {{link}} interpolation, WhatsApp variable mapping contract defined, Twilio to prefix + JSON.stringify, T16 acceptance fixed (1 row), SendLog simplified (no delivered/bounced), T0 scaffold folded into T1, T12/T13 dependency fixed, rate limiting switched to SQLite, re-campaigning API contract clarified (two-call approach), CSP justification corrected
