# campaigns-app - Work Plan

## TL;DR (For humans)

**What you'll get:** A standalone Next.js campaign management app where you create campaigns, import contact lists, send messages via WhatsApp (using pre-approved Twilio templates) and email, track who clicks your links, filter and re-target contacts, and manage events with public RSVP forms — all through a clean admin dashboard.

**Why this approach:** Building as a separate Next.js app (not integrated into the website) keeps it logically independent — easier to maintain, deploy separately on Vercel, and evolve without touching the church website. We use the same proven tech stack (Next.js, Prisma, NextAuth, Tailwind) that already built the website in one session, so every pattern is battle-tested. WhatsApp uses Twilio Content Templates (required by Twilio policy — you approve the template once, then send it to any number of contacts with variable substitution). Six parallel waves let multiple agents build simultaneously with zero file conflicts.

**What it will NOT do:**
- No WhatsApp free-form text — Twilio requires pre-approved templates. You create the template in Twilio dashboard, we use its SID.
- No payment processing, ticketing, or paid events
- No scheduling or recurring campaigns — send now only
- No integration with the church website's database or user accounts — completely separate

**Effort:** Extra Large
**Risk:** Medium — Twilio WhatsApp template approval is an external dependency, but the app works fully with email-only while waiting for template approval
**Decisions to sanity-check:**
- SQLite (same as website) instead of Neon Postgres — simple, zero cold starts, switchable later
- Separate Vercel deploy (not merged into website's Vercel project) — independent scaling and domains
- Admin auth is separate from website (different admin user accounts for the campaigns app)

Your next move: Approve this plan to start execution, or say "high accuracy" to run the dual review first. Full execution detail follows below.

---

> TL;DR (machine): XL effort, Medium risk — standalone Next.js campaign app with Twilio WhatsApp templates + email messaging, click tracking, re-campaigning, and event RSVP system across 20 todos in 6 parallel waves

## Scope
### Must have
- Admin login (NextAuth v5, credentials provider, bcrypt cost 12, session regeneration, rate limiting 5/15min)
- Admin dashboard: stats cards (campaigns, contacts, sent, clicks, events), recent campaigns, quick actions
- Campaign CRUD: title, WhatsApp template selector (name + SID from Twilio dashboard), template variables (`{{1}}`, `{{2}}`, etc.), email message body
- Contact management: manual add (name, phone, email), CSV import (header: `name,phone,email`), E.164 phone normalization, deduplication on (phone, email) unique constraints
- Campaign → Contact assignment: M:N via CampaignContact join table, bulk assign UI
- WhatsApp messaging: Twilio SDK, Content Template SID lookup, variable interpolation, per-recipient status in SendLog, test-message-to-self
- Email messaging: Nodemailer SMTP transport, per-recipient status in SendLog, optional unsubscribe footer
- Click tracking: `GET /c/[uuid]` → log click (timestamp, IP, user-agent) → 302 redirect to campaign link
- Campaign analytics: sent count, clicked count, click rate %, clicked/not-clicked contact lists
- Filter contacts by click status, create new campaign pre-filled with filtered contacts
- Event CRUD: title, slug, date, description, capacity (nullable), image URL
- Public event page at `/events/[slug]`: event details + RSVP form
- RSVP form: title (Mr/Mrs/Ms/Dr), fullname, phone (E.164), email (optional), plus-one checkbox (dynamic expansion, max 5 guests), WhatsApp group opt-in checkbox
- Admin registration viewer: per-event registrant table, WhatsApp group opt-in filter
- CSV export: RFC 4180, UTF-8 BOM, streaming output, WhatsApp group filter support

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Payment processing, ticketing, or paid events
- Rich text editor (plain text + template variables only)
- Email template designer (plain text email body only)
- WhatsApp free-form messaging (Content Templates only — Twilio policy)
- OAuth/social login (credentials provider only)
- Multi-tenancy or organization accounts
- A/B testing, campaign scheduling, or recurring campaigns
- SMS fallback channel (WhatsApp + email only)
- Integration with website app's auth, database, or components
- Event waitlist (capacity reached = "Registration Closed" message only)
- Image/file attachments in campaign messages
- Campaign message preview beyond test-message-to-self
- Analytics dashboards beyond click rate and WhatsApp group opt-in filter
- Toast notification system (inline status messages sufficient for v1, Radix Toast optional)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: **tests-after** (implement first, verify with curl/psql/Playwright after)
- Framework: Next.js built-in (no Jest/Vitest — verification via HTTP assertions + DB queries + Playwright browser)
- Evidence: `.omo/evidence/campaigns-app/task-<N>/` — curl output, psql query results, Playwright screenshots
- QA per todo: 1 happy-path scenario + 1 failure/edge-case scenario, exact tool + invocation + assertion
- Security verification: curl-based SQL injection attempt, XSS payload in campaign title, unauthenticated access to admin routes, CSRF check on POST without session

## Execution strategy
### Parallel execution waves

**Wave 1 — Foundation** (3 todos, sequential chain)
Scaffold: Next.js app, Prisma schema, auth, admin layout. Everything else depends on this.

**Wave 2 — Entity CRUD** (5 todos, all parallel)
Campaign, Contact, CampaignContact, Event CRUD + Dashboard. All independent files — zero merge conflicts.

**Wave 3 — Messaging Engine** (3 todos, all parallel)
Twilio WhatsApp + Nodemailer email + Campaign send UI. Depends on Campaign and Contact entities from Wave 2.

**Wave 4 — Click tracking, then Analytics + Re-campaigning** (3 todos: T12, then T13+T14 parallel)
Click tracking endpoint first (creates ClickEvent data). Then analytics page + re-campaigning run in parallel (both read ClickEvent data). Depends on messaging engine (UUIDs generated at send time from Wave 3).

**Wave 5 — Public Events** (3 todos, all parallel)
Public event page, RSVP form with plus-one, admin registration viewer + CSV export. Depends on Event CRUD from Wave 2.

**Wave 6 — Polish + QA** (3 todos, all parallel)
Security hardening, UI polish, end-to-end integration QA. Depends on all previous waves.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| T1 (Prisma schema) | — | T2, T3, everything | — |
| T2 (NextAuth) | T1 | T3, everything admin | — |
| T3 (AdminShell) | T2 | T4-T20 | — |
| T4 (Campaign CRUD) | T3 | T11, T13, T14 | T5, T6, T7, T8 |
| T5 (Contact CRUD) | T3 | T6, T11 | T4, T6, T7, T8 |
| T6 (CampaignContact) | T4, T5 | T11, T14 | T7, T8 |
| T7 (Event CRUD) | T3 | T15, T16, T17 | T4, T5, T6, T8 |
| T8 (Dashboard) | T3 | — | T4, T5, T6, T7 |
| T9 (WhatsApp) | T4, T6 | T11, T12, T13 | T10 |
| T10 (Email) | T4, T6 | T11 | T9 |
| T11 (Campaign send UI) | T9, T10 | T12, T13 | — |
| T12 (Click tracking) | T11 | T13, T14 | — |
| T13 (Analytics page) | T12 | T14 | T14 |
| T14 (Re-campaigning) | T13 | — | T13 |
| T15 (Public event page) | T7 | T16 | T16, T17 |
| T16 (RSVP form) | T7 | — | T15, T17 |
| T17 (Registration viewer) | T7 | — | T15, T16 |
| T18 (Security) | T3 | — | T19, T20 |
| T19 (UI polish) | T4-T17 | — | T18, T20 |
| T20 (E2E QA) | T4-T19 | — | T18, T19 |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. Next.js scaffold + Prisma schema — create-next-app, deps, all 8 models, migration, seed admin
  What to do:
    **(A) Scaffold:** Run `npx create-next-app campaigns --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`. Then install: `next-auth@beta @prisma/client prisma bcryptjs zod twilio nodemailer`. Create:
    - `campaigns/lib/db.ts` — PrismaClient singleton (globalThis caching for dev hot reload, matching website pattern)
    - `campaigns/.env.example` — all env vars: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL
    **(B) Schema:** Create `campaigns/prisma/schema.prisma` with datasource `sqlite` (`file:./dev.db`), generator `prisma-client-js`, and these models:
    - **User**: id (String @id @default(cuid())), name (String), email (String @unique), password (String — bcrypt hash, cost 12), phone (String?) — for "Send Test to Self" WhatsApp, role (UserRole enum: ADMIN/EDITOR), createdAt, updatedAt
    - **Campaign**: id, title, whatsappTemplateSid (String? — Twilio Content Template SID), whatsappTemplateVariables (String? — JSON array of variable names from fixed vocabulary: 'name', 'link'), emailBody (String? — plain text, use `{{link}}` as placeholder for the per-recipient trackable URL), link (String — destination URL for click tracking), createdAt, updatedAt
    - **Contact**: id, name, phone (String? @unique — E.164 normalized), email (String?) — no @unique; dedup handled via phone @unique + upsert on import, createdAt, updatedAt
    - **CampaignContact**: id, campaignId (FK → Campaign), contactId (FK → Contact), trackingUuid (String @unique — generated at assignment via crypto.randomUUID()), status (String @default("pending") — pending/sent/failed), createdAt. Add @@unique([campaignId, contactId]).
    - **ClickEvent**: id, campaignContactId (FK → CampaignContact), clickedAt (DateTime @default(now())), ipAddress (String?), userAgent (String?)
    - **SendLog**: id, campaignContactId (FK → CampaignContact), channel (String — whatsapp/email), status (String — pending/sent/failed), errorMessage (String?), sentAt (DateTime?), createdAt. (No delivered/bounced — synchronous status only for v1; Twilio callbacks and delivery tracking deferred.)
    - **Event**: id, title, slug (String @unique), date (DateTime), description (String?), capacity (Int?), imageUrl (String?), createdAt, updatedAt
    - **Registration**: id, eventId (FK → Event), title (String), fullname (String), phone (String), email (String?), plusOne (Boolean @default(false)), plusOneGuests (String? — JSON array of {title, fullname, phone, email?} stored as JSON, NOT separate rows), whatsappOptIn (Boolean @default(false)), createdAt
  Must NOT do: Use PostgreSQL datasource (SQLite only for now — user can switch later). Do not create relation fields that don't exist yet — use simple FKs.
  Parallelization: Wave 1 | Blocked by: — | Blocks: T2, T3, T4-T20
  References: website/prisma/schema.prisma (User, UserRole enum pattern), website/lib/db.ts (PrismaClient singleton pattern — use `globalThis` caching for hot reload)
  Acceptance criteria: `cd campaigns && npx prisma generate && npx prisma db push` exits 0. `npx prisma db seed` creates admin user (admin@campaigns.local / admin123). `sqlite3 prisma/dev.db ".tables"` shows 8 tables.
  QA scenarios:
    - Happy: Run `cd campaigns && npx prisma db seed` → admin user created → `sqlite3 prisma/dev.db "SELECT email FROM User"` returns `admin@campaigns.local`
    - Edge: Run `npx prisma db push` twice → idempotent, no errors
  Commit: Y | feat(campaigns): add Prisma schema with 8 models and SQLite migration

- [x] 2. NextAuth v5 auth + middleware — credentials provider, JWT sessions, login page, route protection
  What to do: Create `campaigns/middleware.ts` (export { auth as middleware } from "@/lib/auth" — REQUIRED for the authorized callback to fire for route protection). Create `campaigns/lib/auth.ts` (NextAuth instance — JWT strategy, NO PrismaAdapter since credentials-only + JWT never uses adapter; configure credentials provider with bcrypt compare). Create `campaigns/lib/auth.config.ts` (credentials provider with bcrypt compare, authorized callback protecting /admin/* routes, redirect to /admin/login). Create `campaigns/app/api/auth/[...nextauth]/route.ts` (handler export). Create `campaigns/app/admin/(auth)/login/page.tsx` (email/password form, signIn("credentials"), error display, redirect on success). Create `campaigns/app/admin/layout.tsx` (auth check wrapper — calls auth() and wraps children in AdminShell). Create `campaigns/types/next-auth.d.ts` (augment Session.user with id + role).
  Must NOT do: Share auth with website app — separate NextAuth instance, separate User table, separate session. Do not use PrismaAdapter (credentials + JWT doesn't need it; Account/Session/VerificationToken models not needed). Do not implement OAuth providers. Do not forget middleware.ts — without it the authorized callback is dead code and admin routes are unprotected.
  Parallelization: Wave 1 | Blocked by: T1 | Blocks: T3, all admin pages | Can parallelize with: —
  References: website/lib/auth.ts (JWT strategy pattern — adapt without PrismaAdapter), website/lib/auth.config.ts (authorized callback — /admin/* protection, role check, redirect to /admin/login), website/app/api/auth/[...nextauth]/route.ts, website/app/admin/(auth)/login/page.tsx (form pattern with useState, signIn, error state), website/types/next-auth.d.ts (module augmentation), npm: next-auth@beta, bcryptjs
  Acceptance criteria: `curl -v http://localhost:3001/admin` returns 302 redirect to `/admin/login`. `curl -X POST http://localhost:3001/api/auth/callback/credentials -d '{"email":"admin@campaigns.local","password":"admin123"}'` returns 200 with set-cookie. `curl -b cookies.txt http://localhost:3001/admin` returns 200.
  QA scenarios:
    - Happy: Navigate to http://localhost:3001/admin/login → fill email/password → redirected to /admin → dashboard visible
    - Failure: Submit wrong password → error message displayed, still on login page
    - Edge: Access /admin/* without session → redirected to /admin/login?callbackUrl=...
  Commit: Y | feat(campaigns): add NextAuth v5 with credentials provider and admin login

- [x] 3. AdminShell layout — sidebar, nav, breadcrumb, top bar, mobile responsive
  What to do: Create `campaigns/components/admin/AdminShell.tsx` (252-line equivalent of website's AdminShell). Must have: fixed left sidebar (60rem width on desktop, hidden on mobile with hamburger toggle), logo "CM" text, nav items (Dashboard, Campaigns, Contacts, Events, Registrations, Settings), each with SVG icon, active state via `pathname.startsWith()`, user avatar + name in sidebar footer, sticky top bar with auto-generated breadcrumb from pathname segments, "View Site" external link, logout button calling `signOut({ redirect: false })` then `router.push("/admin/login")`. Create `campaigns/components/admin/icons.tsx` with SVG icon components.
  Must NOT do: Copy-paste website's AdminShell wholesale — adapt nav items for campaigns app. Do not include website-specific nav items (Pages, Sermons, Teachings, Testimonials, Media, Messages).
  Parallelization: Wave 1 | Blocked by: T2 | Blocks: T4-T19 | Can parallelize with: —
  References: website/components/admin/AdminShell.tsx (full layout pattern — sidebar, nav items with SVG paths, hamburger mobile toggle, breadcrumb generation, logout, role filtering if applicable), website/app/admin/layout.tsx (auth check wrapper)
  Acceptance criteria: Visit http://localhost:3001/admin → AdminShell visible with sidebar, "Dashboard" active. Click hamburger on mobile viewport → sidebar slides in. Click "Campaigns" nav → navigates to /admin/campaigns, breadcrumb shows "Admin > Campaigns". Click logout → redirected to /admin/login.
  QA scenarios:
    - Happy: Visit /admin → sidebar visible with all 6 nav items, top bar with breadcrumb, logout button functional
    - Edge: Visit /admin on mobile (375px viewport) → hamburger visible, sidebar hidden, toggle opens sidebar overlay
  Commit: Y | feat(campaigns): add AdminShell layout with sidebar, nav, and breadcrumb

- [x] 4. Campaign CRUD — list page, new/edit form, API routes
  What to do: Create `campaigns/app/admin/campaigns/page.tsx` (client list page — fetch GET /api/admin/campaigns, search filter, table with title + template + created date, Edit/Delete actions, inline delete confirm modal), `campaigns/app/admin/campaigns/new/page.tsx` (server page rendering CampaignForm without initialData), `campaigns/app/admin/campaigns/[id]/edit/page.tsx` (client page — fetch campaign by id, render CampaignForm with initialData), `campaigns/components/admin/CampaignForm.tsx` (form: title, whatsappTemplateSid — text input for Twilio Content Template SID, whatsappTemplateVariables — validated against fixed vocabulary ['name','link'], emailBody — textarea with hint "Use {{link}} where the per-recipient trackable URL should appear", link — URL input for click destination redirect), `campaigns/app/api/admin/campaigns/route.ts` (GET: list all with search, POST: create with Zod validation), `campaigns/app/api/admin/campaigns/[id]/route.ts` (GET, PUT, DELETE).
  Must NOT do: Implement WhatsApp send from this form — that's T11. Do not create campaign_message field — the email body IS the message.
  Parallelization: Wave 2 | Blocked by: T3 | Blocks: T9, T10, T11, T13, T14 | Can parallelize with: T5, T6, T7, T8
  References: website/app/admin/sermons/page.tsx (list page pattern — useState, useEffect fetch, search bar, category filter, table, Edit/Delete buttons, inline delete modal), website/app/admin/sermons/SermonForm.tsx (form pattern — interface FormData, useState, handleChange, handleSubmit with fetch), website/app/api/admin/sermons/route.ts (API pattern — GET with searchParams, POST with Zod parse), website/lib/validations.ts (Zod schema pattern)
  Acceptance criteria: `curl http://localhost:3001/api/admin/campaigns` returns []. `curl -X POST http://localhost:3001/api/admin/campaigns -H "Content-Type: application/json" -d '{"title":"Test Campaign","emailBody":"Hello","link":"https://example.com"}'` returns created campaign with 201. Visit /admin/campaigns → table shows campaign. Click Edit → form pre-filled. Click Delete → confirm modal → campaign removed.
  QA scenarios:
    - Happy: Create campaign with title + email body → appears in list → edit title → title updated → delete → removed
    - Failure: POST campaign without title → 400 with Zod validation error details
  Commit: Y | feat(campaigns): add Campaign CRUD with list page, form, and API routes

- [x] 5. Contact CRUD + CSV import — list page, add form, CSV upload, API routes
  What to do: Create `campaigns/app/admin/contacts/page.tsx` (client list page — fetch GET /api/admin/contacts, search filter, table with name + phone + email, Delete actions, inline delete modal, "Add Contact" button + "Import CSV" button), `campaigns/components/admin/ContactForm.tsx` (modal or inline form: name, phone, email), `campaigns/components/admin/CsvImport.tsx` (file input accepting .csv, preview table of parsed rows, "Import" button with progress/error feedback), `campaigns/app/api/admin/contacts/route.ts` (GET: list with search, POST: create with Zod + E.164 normalization, POST /import: parse CSV, normalize phones, upsert with dedup on phone+email), `campaigns/app/api/admin/contacts/[id]/route.ts` (GET, PUT, DELETE). Phone normalization: strip all non-digit chars, if starts with 0 assume country code needed (prepend +234 for Nigeria default, configurable), if no + prefix add it. Email uniqueness: soft check, warn on duplicate but allow.
  Must NOT do: Implement bulk assignment to campaigns here — that's T6. Do not validate phone numbers against Twilio lookup API (costs money).
  Parallelization: Wave 2 | Blocked by: T3 | Blocks: T6, T11 | Can parallelize with: T4, T6, T7, T8
  References: website/app/admin/messages/page.tsx (list page with search/filter pattern), website/app/admin/media/page.tsx (drag-drop upload pattern — adapt for CSV), website/lib/validations.ts (Zod patterns)
  Acceptance criteria: `curl -X POST http://localhost:3001/api/admin/contacts -d '{"name":"John","phone":"08012345678","email":"john@test.com"}'` → phone normalized to `+2348012345678`. Upload CSV `name,phone,email\nJane,08098765432,jane@test.com` → 1 contact created, phone normalized. List endpoint shows both contacts. Duplicate phone+email import → upsert, no duplicate rows.
  QA scenarios:
    - Happy: CSV with 3 valid rows → all imported → appear in contacts list with normalized phones
    - Failure: CSV with missing header row → error message "Invalid CSV: missing header row"
    - Edge: CSV with `"Doe, John",+1234567890,john@test.com` → name correctly parsed as "Doe, John" (quoted comma)
  Commit: Y | feat(campaigns): add Contact CRUD with CSV import and E.164 phone normalization

- [x] 6. CampaignContact assignment — assign contacts to campaigns, view assigned contacts, generate tracking UUIDs
  What to do: Create `campaigns/app/admin/campaigns/[id]/contacts/page.tsx` (client page — shows campaign title, contact selector with search, "Assign Selected" button, table of already-assigned contacts with tracking UUID and status), `campaigns/app/api/admin/campaigns/[id]/contacts/route.ts` (GET: list assigned contacts for campaign, POST: bulk assign contactIds → create CampaignContact rows with generated tracking UUID per row, DELETE: remove assignment). UUID generation: use `crypto.randomUUID()` (available in Node 19+, which Next.js 16 runs on). On assignment POST, generate trackingUuid per contact, store in CampaignContact row.
  Must NOT do: Generate UUIDs at campaign creation time — they must be per-contact-per-campaign, generated at assignment time.
  Parallelization: Wave 2 | Blocked by: T4, T5 | Blocks: T9, T10, T11, T14 | Can parallelize with: T7, T8
  References: website/app/admin/campaigns/ (new structure — no existing pattern, but follow contact selector UI convention), campaigns/prisma/schema.prisma (CampaignContact model)
  Acceptance criteria: Create campaign + 3 contacts → assign 2 contacts to campaign → GET /api/admin/campaigns/[id]/contacts returns 2 rows, each with non-null trackingUuid. Assign same contact again → 409 conflict. Delete assignment → contact removed from campaign, GET returns 1 row.
  QA scenarios:
    - Happy: Select 3 contacts from list → click "Assign" → 3 CampaignContact rows created with unique UUIDs → UUIDs displayed in assigned table
    - Failure: POST without contactIds → 400 validation error
    - Edge: Assign contact already assigned → 409 "Contact already assigned to this campaign"
  Commit: Y | feat(campaigns): add CampaignContact assignment with UUID generation

- [x] 7. Event CRUD — list page, new/edit form, API routes
  What to do: Create `campaigns/app/admin/events/page.tsx` (client list page — fetch GET /api/admin/events, table with title + slug + date + capacity, Edit/Delete actions), `campaigns/app/admin/events/new/page.tsx`, `campaigns/app/admin/events/[id]/edit/page.tsx`, `campaigns/components/admin/EventForm.tsx` (title, slug auto-generated from title, date — datetime-local input, description — textarea, capacity — number input nullable, imageUrl — text input), `campaigns/app/api/admin/events/route.ts` (GET, POST with Zod), `campaigns/app/api/admin/events/[id]/route.ts` (GET, PUT, DELETE).
  Must NOT do: Implement RSVP form or public event page — that's T15+ T16. Do not add registration management to this form.
  Parallelization: Wave 2 | Blocked by: T3 | Blocks: T15, T16, T17 | Can parallelize with: T4, T5, T6, T8
  References: website/app/admin/sermons/SermonForm.tsx (form pattern), website/app/admin/sermons/page.tsx (list pattern), website/lib/validations.ts (Zod pattern for sermonSchema — adapt to eventSchema)
  Acceptance criteria: Create event with title "Easter Outreach", date "2026-08-15T10:00", capacity 200 → slug auto-generated as "easter-outreach" → appears in list. Edit capacity to 250 → updated. Delete → removed. GET /api/admin/events returns list.
  QA scenarios:
    - Happy: Create event → edit slug → delete → verify removed from list
    - Failure: Create event without title → 400 validation error
  Commit: Y | feat(campaigns): add Event CRUD with list page, form, and API routes

- [x] 8. Admin dashboard — stats cards, recent items, quick actions
  What to do: Create `campaigns/app/admin/page.tsx` (server component — fetch stats via Prisma directly: total campaigns, total contacts, total sent messages (SUM from SendLog), total clicks (SUM from ClickEvent), total events). Display 5 stat cards in a grid (campaigns, contacts, sent, clicks, events). Below: "Recent Campaigns" table (last 5 campaigns with sent/clicked counts), "Recent Registrations" table (last 10 across all events). "Quick Actions" section with buttons: "New Campaign", "Import Contacts", "Create Event".
  Must NOT do: Use client-side fetching for stats — server component with direct Prisma queries for performance. Do not create API routes just for dashboard stats.
  Parallelization: Wave 2 | Blocked by: T3 | Blocks: — | Can parallelize with: T4, T5, T6, T7
  References: website/app/admin/page.tsx (dashboard pattern — server component, auth() call, Prisma aggregate queries, stat cards, recent items, quick actions), website/components/admin/AdminShell.tsx (sidebar nav "Dashboard" active)
  Acceptance criteria: Visit /admin → 5 stat cards visible with counts (0 on fresh DB). After creating 2 campaigns + 5 contacts → stats update. "New Campaign" button navigates to /admin/campaigns/new.
  QA scenarios:
    - Happy: Fresh DB → all stats show 0, "No recent campaigns" empty state message
    - Happy: Create campaign + contacts → revisit dashboard → stats reflect new counts, campaign appears in "Recent"
  Commit: Y | feat(campaigns): add admin dashboard with stats, recent items, and quick actions

- [x] 9. Twilio WhatsApp integration — template-based messaging, send API
  What to do: Create `campaigns/lib/whatsapp.ts` — exports `sendWhatsAppMessage(phone, contentSid, contactName, trackingLink)` using the `twilio` npm package. Initialize Twilio client from env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (e.g. `whatsapp:+14155238886`). **Variable mapping contract:** `'name' → contactName`, `'link' → trackingLink`. Map to Twilio's positional `contentVariables` as `JSON.stringify({"1": contactName || "", "2": trackingLink})`. Function calls `client.messages.create({ from: process.env.TWILIO_WHATSAPP_FROM, contentSid, contentVariables, to: \`whatsapp:${phone}\` })` — NOTE: `to` MUST be prefixed with `whatsapp:`, and `contentVariables` MUST be a JSON string. Wrap in try/catch, return `{ success: true, messageSid }` or `{ success: false, error }`. Also create `campaigns/lib/sendLog.ts` — helpers to create SendLog rows. Create `campaigns/app/api/admin/campaigns/[id]/send-whatsapp/route.ts` — accepts POST with optional contactId filter, loops through CampaignContact rows, resolves `contactName` and `trackingLink = \`${process.env.APP_URL}/c/${row.trackingUuid}\``, sends WhatsApp to each contact (skip if no phone), creates SendLog per send.
  Must NOT do: Send free-form text (no `body` parameter) — must use Content Template SID + contentVariables per Twilio policy. Do not send to contacts without phone numbers. Do not forget `whatsapp:` prefix on `to` or JSON.stringify on contentVariables. Do not implement Twilio status callback webhook (synchronous status only for v1 — delivered/bounced tracking deferred).
  Parallelization: Wave 3 | Blocked by: T4, T6 | Blocks: T11, T12 | Can parallelize with: T10
  References: npm: twilio (latest), Twilio docs: Messages API with Content Templates (from + contentSid + contentVariables — contentVariables must be JSON string, to must be whatsapp:+E.164), website/lib/cloudinary.ts (env var pattern), campaigns/prisma/schema.prisma (SendLog model)
  Acceptance criteria: With valid TWILIO_* env vars: `sendWhatsAppMessage("+2348012345678", "HX...", "John", "https://localhost:3001/c/test-uuid")` → outgoing `to` is `whatsapp:+2348012345678`, `contentVariables` is `'{"1":"John","2":"https://localhost:3001/c/test-uuid"}'` → returns success → SendLog status "sent". With invalid credentials → SendLog status "failed".
  QA scenarios:
    - Happy: Mocked Twilio client → send to 1 contact → verify `to` starts with `whatsapp:`, contentVariables is JSON string → SendLog created with status "sent"
    - Failure: Invalid Content Template SID → Twilio returns 404 → SendLog status "failed", error message logged
    - Edge: Contact has no phone number → skipped in send loop, no SendLog created for WhatsApp channel
  Commit: Y | feat(campaigns): add Twilio WhatsApp integration with Content Template messaging

- [x] 10. Email integration — Nodemailer SMTP, per-recipient link interpolation, unsubscribe footer
  What to do: Create `campaigns/lib/email.ts` — exports `sendEmail(to, subject, body)` using `nodemailer` with SMTP transport from env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Append unsubscribe footer: "To unsubscribe, reply STOP to this email." Create `campaigns/app/api/admin/campaigns/[id]/send-email/route.ts` — POST loops through CampaignContact rows. **PER-RECIPIENT LINK:** Before sending, replace `{{link}}` in the campaign's `emailBody` with `https://${process.env.APP_URL}/c/${row.trackingUuid}` for that specific recipient. Skip contacts without email. Creates SendLog per send with channel "email".
  Must NOT do: Send static email body without per-recipient link interpolation — click tracking (T12) requires each recipient to have their own unique tracking URL embedded in the message. Do not use third-party email API — SMTP only. Do not send HTML emails — plain text only. Do not send to contacts without email addresses.
  Parallelization: Wave 3 | Blocked by: T4, T6 | Blocks: T11 | Can parallelize with: T9
  References: website/app/api/contact/route.ts (nodemailer pattern — transporter creation, sendMail with to/subject/text, non-blocking error handling), npm: nodemailer
  Acceptance criteria: With valid SMTP_* env vars (use Mailtrap/Ethereal for test): `sendEmail("test@example.com", "Test Campaign", "Hello")` → returns success with messageId. With invalid SMTP → returns error, SendLog status "failed". Sent email includes unsubscribe footer.
  QA scenarios:
    - Happy: SMTP test credentials → send to 1 contact → SendLog created with status "sent"
    - Failure: Invalid SMTP credentials → send returns error → SendLog status "failed"
    - Edge: Contact has no email → skipped, no email SendLog created
  Commit: Y | feat(campaigns): add Nodemailer SMTP email integration with unsubscribe

- [x] 11. Campaign send UI — compose page, channel selection, send with progress, SendLog view
  What to do: Create `campaigns/app/admin/campaigns/[id]/send/page.tsx` (client page — displays campaign title, template variables preview, contact count, channel toggles (WhatsApp on/off, Email on/off), "Send Test to Self" button (prompts for WhatsApp number inline since User model now has `phone` field; falls back to prompt if field is null), "Send to All" button with confirmation modal). Also create `campaigns/app/admin/campaigns/[id]/logs/page.tsx` (view SendLog table for campaign: contact name, channel, status badge, sentAt, error message if failed). Send flow: POST to /api/admin/campaigns/[id]/send-whatsapp and/or /api/admin/campaigns/[id]/send-email, show progress (X of Y sent), update CampaignContact.status to "sent" on success.
  Must NOT do: Implement scheduling (send now only). Do not allow sending twice to same campaign contacts — check CampaignContact.status and skip "sent"/"failed" ones.
  Parallelization: Wave 3 | Blocked by: T9, T10 | Blocks: T12 | Can parallelize with: —
  References: website/app/admin/sermons/page.tsx (inline confirmation modal pattern), website/app/admin/messages/page.tsx (table with status badges)
  Acceptance criteria: Campaign with 3 contacts assigned → visit /admin/campaigns/[id]/send → shows "3 contacts", WhatsApp toggle ON, Email toggle ON → click "Send Test to Self" → test message sent to admin phone/email → click "Send to All" → confirm modal → progress indication → all 3 contacts show "sent" in SendLog. Re-click "Send to All" → "Already sent to 3 contacts" message.
  QA scenarios:
    - Happy: Send to 3 contacts with both channels → 6 SendLog rows (3 WhatsApp + 3 Email), all status "sent"
    - Failure: Send with WhatsApp toggle ON but no TWILIO_* env vars → error message displayed, email sends still proceed
    - Edge: Campaign with only WhatsApp template but no email body → WhatsApp sends, Email toggle disabled with tooltip "No email body configured"
  Commit: Y | feat(campaigns): add campaign send UI with channel selection and SendLog view

- [x] 12. Click tracking endpoint — GET /c/[uuid], log click event, 302 redirect
  What to do: Create `campaigns/app/c/[uuid]/route.ts` (Next.js route handler). GET handler: extract `uuid` from params (await params), query `prisma.campaignContact.findUnique({ where: { trackingUuid: uuid }, include: { campaign: true } })`. If not found → 404. If found: insert `prisma.clickEvent.create({ data: { campaignContactId, ipAddress: request.headers.get("x-forwarded-for") || "unknown", userAgent: request.headers.get("user-agent") || "unknown" } })`, then return `NextResponse.redirect(campaign.link, 302)`. Must NOT do: 301 redirect (browser-cached). Do not expose campaign data in the redirect URL query params.
  Parallelization: Wave 4 | Blocked by: T11 | Blocks: T13, T14 | Can parallelize with: —
  References: campaigns/prisma/schema.prisma (ClickEvent, CampaignContact, Campaign models), Next.js route handler docs (params as Promise, NextResponse.redirect), website/app/(site)/[...slug]/page.tsx (params pattern)
  Acceptance criteria: Create campaign with link="https://example.com", assign contact → get trackingUuid → `curl -v http://localhost:3001/c/{trackingUuid}` → 302 response with Location: https://example.com → query `SELECT * FROM ClickEvent WHERE campaignContactId = {id}` → 1 row with clickedAt, ipAddress, userAgent. Same UUID clicked again → 2 rows (logs all clicks). Invalid UUID → 404.
  QA scenarios:
    - Happy: Click tracking link → redirected to campaign link → ClickEvent row created
    - Edge: Click 5 times → 5 ClickEvent rows, browser follows redirect each time (no 301 caching)
    - Failure: Click non-existent UUID → 404 page
  Commit: Y | feat(campaigns): add click tracking endpoint with UUID lookup and 302 redirect

- [x] 13. Campaign analytics page — click stats, clicked/not-clicked contact lists
  What to do: Create `campaigns/app/admin/campaigns/[id]/analytics/page.tsx` (server component — fetch campaign with contacts and click counts via Prisma). Display: campaign title, total contacts, total sent (from SendLog), total unique clickers (SELECT COUNT(DISTINCT campaignContactId) FROM ClickEvent), total clicks (SELECT COUNT(*) FROM ClickEvent), click rate %. Below: two tables — "Clicked" contacts (DISTINCT contacts with at least 1 ClickEvent) and "Not Clicked" contacts (assigned contacts with zero ClickEvents). Each contact row shows: name, phone, email, click count.
  Must NOT do: Client-side fetch for analytics — server component with direct Prisma aggregates. Do not create API routes just for analytics queries.
  Parallelization: Wave 4 | Blocked by: T11, T12 | Blocks: T14 | Can parallelize with: —
  References: website/app/admin/page.tsx (server component dashboard with Prisma aggregates pattern), campaigns/prisma/schema.prisma (ClickEvent, CampaignContact)
  Acceptance criteria: Campaign with 5 contacts → 3 clicked → analytics page shows "Total Sent: 5", "Unique Clickers: 3", "Click Rate: 60%". Clicked table shows 3 contacts with click counts. Not Clicked table shows 2 contacts.
  QA scenarios:
    - Happy: Click analytics → 3 clickers, 2 non-clickers, 60% rate → data matches DB queries
    - Edge: Campaign with 0 contacts → shows "No contacts assigned" empty state, rate shows "N/A"
  Commit: Y | feat(campaigns): add campaign analytics page with click stats and filtered contact lists

- [x] 14. Re-campaigning — filter contacts by click status, create new campaign from filtered set
  What to do: Add "Create Campaign from These Contacts" button to the Clicked and Not Clicked tables on the analytics page (T13). Flow: (1) Open a mini-form to enter new campaign title → (2) POST to `/api/admin/campaigns` (T4 API, unchanged) to create the campaign → (3) POST to `/api/admin/campaigns/[newId]/contacts` (T6 API) with the filtered contactIds → (4) redirect to the new campaign's page. Two-call approach — no modification needed to T4's API. Add "Re-campaign" button on campaign list page that links to analytics page.
  Must NOT do: Modify T4's API to accept prefillContactIds — use the two-call approach (create campaign, then assign contacts) instead. Do not create a separate "filter builder" UI — the filter is the already-rendered clicked/not-clicked table. Do not duplicate campaign creation logic.
  Parallelization: Wave 4 | Blocked by: T13 | Blocks: — | Can parallelize with: —
  References: campaigns/app/admin/campaigns/[id]/analytics/page.tsx (from T13), campaigns/app/api/admin/campaigns/route.ts (from T4), campaigns/app/api/admin/campaigns/[id]/contacts/route.ts (from T6)
  Acceptance criteria: Campaign A has 5 contacts, 3 clicked → analytics page shows "Clicked" table with 3 contacts → click "Create Campaign from These Contacts" → enter title "Follow-up Campaign" → new Campaign B created → 3 contacts auto-assigned with fresh tracking UUIDs → redirected to Campaign B's page. Campaign B appears in campaign list.
  QA scenarios:
    - Happy: Re-campaign from clicked contacts → new campaign with 3 contacts, each with new UUID
    - Edge: Re-campaign from empty list (0 clicked) → "Create Campaign" button disabled with tooltip "No contacts to re-campaign"
  Commit: Y | feat(campaigns): add re-campaigning from filtered contact lists

- [x] 15. Public event page — display event details with RSVP form shell
  What to do: Create `campaigns/app/(public)/layout.tsx` (minimal layout — just <main> wrapper, no admin sidebar), `campaigns/app/(public)/events/[slug]/page.tsx` (server component — fetch event by slug from Prisma, display title, date (formatted), description, capacity info "X / Y registered"), `campaigns/app/(public)/events/[slug]/EventPageClient.tsx` (client component — renders event details + RSVP form). If event date is in the past → show "This event has ended. Registration is closed." If capacity reached → show "Registration closed — event is full." Otherwise → show RSVP form.
  Must NOT do: Implement the RSVP form logic here — that's T16. This task creates the display + form shell with the form component imported but not yet functional.
  Parallelization: Wave 5 | Blocked by: T7 | Blocks: — | Can parallelize with: T16, T17
  References: website/app/(site)/events/[slug]/page.tsx (public detail page pattern — server component, Prisma findUnique, 404 handling), website/app/(site)/layout.tsx (public layout pattern — minimal chrome, no admin shell)
  Acceptance criteria: Create event "Easter Outreach" with slug "easter-outreach" → visit /events/easter-outreach → page displays title, date, description, "0 / 200 registered", RSVP form visible. Mark event date as past → page shows "Registration closed". Set capacity 0 → create 0 registrations → page shows "Registration closed — event is full."
  QA scenarios:
    - Happy: Visit /events/easter-outreach → event details visible, RSVP form rendered
    - Edge: Visit /events/nonexistent → 404 page
    - Edge: Past event → "Registration closed" message, no form
    - Edge: Full event → "Registration closed — event is full", no form
  Commit: Y | feat(campaigns): add public event page with RSVP form shell

- [x] 16. RSVP form — dynamic plus-one fields, WhatsApp opt-in, validation, submission
  What to do: Build out the RSVP form in `EventPageClient.tsx` (from T15). Fields: title (select: Mr/Mrs/Ms/Dr), fullname (text, required), phone (tel, required, E.164 validation — must match `+[1-9][0-9]{7,14}`), email (email, optional). Plus-one checkbox: when checked, show up to 5 guest rows, each with: title, fullname, phone, email (optional). "Add Guest" button adds a row (max 5). Each guest row has "Remove" button. WhatsApp group opt-in: checkbox "I agree to be added to the event's WhatsApp group". Submit button: POST to `/api/events/[slug]/register` with: `{ title, fullname, phone, email, plusOne: bool, plusOneGuests: [...], whatsappOptIn: bool }`. On success: show "Registration successful!" message with event details. On error: show inline error above form.
  Must NOT do: Use a form library (react-hook-form) — plain useState per existing patterns. Do not send WhatsApp confirmation on registration (separate concern). Do not validate phone against Twilio Lookup API.
  Parallelization: Wave 5 | Blocked by: T7 | Blocks: — | Can parallelize with: T15, T17
  References: website/app/(site)/contact/page.tsx (client form pattern — useState, handleChange, handleSubmit with fetch, loading/error states, success message), campaigns/prisma/schema.prisma (Registration model), website/lib/validations.ts (Zod patterns)
  Acceptance criteria: Visit /events/easter-outreach → fill form: Mr, John Doe, +2348012345678, john@test.com → check plus-one → add guest: Mrs, Jane Doe, +2348098765432 → check WhatsApp opt-in → submit → POST succeeds, "Registration successful!" displayed → query `SELECT * FROM Registration WHERE eventId = {id}` → 1 row with plusOneGuests JSON containing 1 guest object `[{title:"Mrs",fullname:"Jane Doe",phone:"+2348098765432"}]`, whatsappOptIn = true. (Guests stored as JSON on a single Registration row, NOT separate rows — CSV export in T17 flattens them.)
  QA scenarios:
    - Happy: Full registration with 2 plus-one guests → 1 Registration row with JSON guests, WhatsApp opt-in captured
    - Failure: Submit without fullname → inline error "Full name is required"
    - Failure: Submit with invalid phone "12345" → inline error "Phone must be in E.164 format (+1234567890)"
    - Edge: Check plus-one, add 5 guests, try "Add Guest" again → button disabled with "Maximum 5 guests"
    - Edge: Submit without plus-one checked → plusOneGuests = [], only main registration saved
    - Edge: Submit to past event → 400 "Registration closed — event has ended"
    - Edge: Submit to full event → 400 "Registration closed — event is full"
  Commit: Y | feat(campaigns): add RSVP form with dynamic plus-one fields and WhatsApp opt-in

- [x] 17. Admin registration viewer + CSV export — registrant table, WhatsApp filter, export endpoint
  What to do: Create `campaigns/app/admin/events/[id]/registrations/page.tsx` (client page — fetch GET /api/admin/events/[id]/registrations, display table: title, fullname, phone, email, plus-one indicator, WhatsApp opt-in badge, registered at date). Add filter toggle: "All" / "WhatsApp Group Only" (filter by whatsappOptIn = true). Add "Export CSV" button — triggers download of `/api/admin/events/[id]/registrations/export?whatsappOnly=true|false`. Create `campaigns/app/api/admin/events/[id]/registrations/route.ts` (GET: list registrations with optional whatsappOnly filter). Create `campaigns/app/api/admin/events/[id]/registrations/export/route.ts` (GET: generate CSV with headers: title,fullname,phone,email,plusOne,whatsappOptIn,registeredAt — RFC 4180 compliant, UTF-8 BOM prefix, Content-Type: text/csv, Content-Disposition: attachment). Include plus-one guests as separate rows with same registeredAt.
  Must NOT do: Load all registrations into memory for CSV — stream from DB or use cursor. Do not hardcode the BOM as a magic string — use `\xEF\xBB\xBF`.
  Parallelization: Wave 5 | Blocked by: T7 | Blocks: — | Can parallelize with: T15, T16
  References: website/app/admin/messages/page.tsx (table with status badges, filter), campaigns/prisma/schema.prisma (Registration model)
  Acceptance criteria: Event with 5 registrations (3 WhatsApp opt-in, 2 not) → visit /admin/events/[id]/registrations → table shows 5 rows → toggle "WhatsApp Group Only" → table shows 3 rows → click "Export CSV" → downloaded CSV has 3 rows, UTF-8 BOM present, Content-Type: text/csv.
  QA scenarios:
    - Happy: Filter by WhatsApp opt-in → 3 rows → export → CSV has 3 data rows + header
    - Edge: Event with 0 registrations → table shows "No registrations yet", export button disabled
    - Edge: Registration with 2 plus-one guests → CSV shows 3 rows (main + 2 guests) for that registration
    - Edge: Name with comma "Doe, John" → CSV row properly quoted as `"Doe, John"`
  Commit: Y | feat(campaigns): add admin registration viewer with WhatsApp filter and CSV export

- [x] 18. Security hardening — rate limiting, secure headers, session config, SQL injection guard
  What to do: Implement rate limiting on login endpoint: 5 attempts per 15 minutes per IP. **Use SQLite table** (add `RateLimit` model to schema: ip, endpoint, count, windowStart) — in-memory Map won't work on Vercel serverless (each invocation is a fresh instance). Implement rate limiting on RSVP form: 10 submissions per hour per IP via same mechanism. Set secure session cookie config in auth.config.ts: `cookies: { sessionToken: { name: "__Secure-next-auth.session-token", options: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" } } }`. Add `session_regeneration` on login (NextAuth handles this — verify it's configured). Add security headers via `next.config.ts` headers(): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000` (production only). Verify ALL Prisma queries use parameterized inputs (Prisma prevents SQL injection by design — confirm via code review, no `$queryRaw` or `$executeRaw` usage in the codebase).
  Must NOT do: Use in-memory Map for rate limiting (fails on Vercel serverless). Implement OWASP-level security scanner — reasonable defaults sufficient for v1. Do not add CSP headers yet — defer to follow-up once inline-script surface is audited (Tailwind v4 compiles at build time, not via CDN, so CSP is feasible but not needed for v1).
  Parallelization: Wave 6 | Blocked by: T3 | Blocks: — | Can parallelize with: T19, T20
  References: website/lib/auth.config.ts (NextAuth cookie config), Next.js middleware docs (security headers), npm: next-rate-limit (or manual Map-based rate limiter)
  Acceptance criteria: `curl -X POST http://localhost:3001/api/auth/callback/credentials -d '{"email":"admin@campaigns.local","password":"wrong"}'` 6 times rapidly → 6th returns 429. `curl -I http://localhost:3001/admin` → response includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`. `grep -r "rawQuery\|$queryRaw\|$executeRaw" campaigns/` returns no results.
  QA scenarios:
    - Happy: 5 failed logins → rate limit → 6th returns 429 with Retry-After header
    - Edge: Successful login resets rate limit counter
    - Happy: Response headers include security headers
    - Happy: grep for raw SQL → zero findings
  Commit: Y | security(campaigns): add rate limiting, secure headers, and SQL injection guard

- [x] 19. UI polish — responsive admin, loading states, empty states, error handling, toast notifications
  What to do: Review all admin pages for responsive breakpoints (sidebar collapses to hamburger below 768px, tables become stacked cards on mobile). Add loading skeletons or spinners to every client page (use `loading` state with centered `<div className="animate-pulse">`). Add empty state messages to every list/table (e.g., "No campaigns yet. Create your first campaign."). Add error state handling to every fetch (try/catch with user-friendly error message, not raw error). Add inline success/error message banners to every form (green bg for success, red bg for error — same pattern as website). Add simple toast notification component for transient messages (e.g., "Campaign deleted", "Contacts imported").
  Must NOT do: Add Radix Toast (overkill for v1 admin — inline messages sufficient). Do not redesign the layout — polish only. Do not add animations beyond Tailwind transitions.
  Parallelization: Wave 6 | Blocked by: T4-T17 | Blocks: — | Can parallelize with: T18, T20
  References: website/app/admin/sermons/page.tsx (loading state pattern), website/app/admin/settings/page.tsx (inline message banner pattern — green/red bg), website/app/admin/messages/page.tsx (empty state pattern)
  Acceptance criteria: Visit /admin/campaigns on mobile (375px) → sidebar hidden, hamburger visible, table stacks vertically. Delete a campaign → toast "Campaign deleted" appears and auto-dismisses. Visit /admin/contacts with 0 contacts → "No contacts yet. Import your first CSV." empty state with CTA button. Trigger API error → error banner with message, not raw JSON.
  QA scenarios:
    - Happy: Mobile viewport → hamburger menu, stacked table, no horizontal scroll
    - Happy: Empty state → message + action button visible
    - Happy: Delete → toast appears → auto-dismisses after 3s
    - Edge: Slow network → loading skeleton visible while fetching
    - Edge: API error → error banner "Something went wrong. Please try again."
  Commit: Y | style(campaigns): add responsive polish, loading states, empty states, and error handling

- [x] 20. End-to-end integration QA — full flow verification, all acceptance criteria
  What to do: Verify the complete campaign lifecycle from end to end using curl + sqlite3 + Playwright. Run the following sequence as a single script or manual verification:
    1. Seed DB (admin user created)
    2. Login via curl, extract session cookie
    3. Create event "Test Event" via API
    4. Create campaign "Welcome Campaign" via API (with link=https://example.com)
    5. Import 3 contacts via CSV: "Alice,+2348011111111,alice@test.com", "Bob,+2348022222222,bob@test.com", "Charlie,,charlie@test.com" (Charlie has no phone)
    6. Assign all 3 contacts to campaign
    7. Visit campaign send page → Send email to all → verify 3 SendLog rows (2 sent, 1 skipped — Charlie has no phone for WhatsApp)
    8. Click tracking: curl each contact's tracking UUID → verify 302 redirect + ClickEvent rows
    9. Visit analytics → verify 3 sent, 3 clicks, 100% click rate
    10. Re-campaign from "Clicked" → new campaign created with 3 contacts
    11. Visit public event page → submit RSVP for Alice with 1 plus-one guest + WhatsApp opt-in
    12. Visit admin registrations → filter by WhatsApp opt-in → Alice visible
    13. Export CSV → verify Alice's row present, UTF-8 BOM, proper CSV escaping
    14. Security: 6 rapid failed logins → 6th returns 429
    15. Security: access /admin without session → 302 redirect to /admin/login
  Must NOT do: Skip any step — every acceptance criteria from T1-T19 must be verified. Do not report "pass" unless actual curl output or DB query confirms it.
  Parallelization: Wave 6 | Blocked by: T4-T19 | Blocks: — | Can parallelize with: T18, T19
  References: All previous todos (T1-T19 acceptance criteria), campaigns/prisma/schema.prisma
  Acceptance criteria: All 15 steps above pass with verified curl output or DB query results captured to .omo/evidence/campaigns-app/task-20/. At least one edge case from each of T1-T19 is re-verified.
  QA scenarios: (This IS the QA task — the 15 steps above are the QA scenarios.)
  Commit: N | (QA evidence only — no code changes expected)


## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit
- [ ] F2. Code quality review
- [ ] F3. Real manual QA
- [ ] F4. Scope fidelity

## Commit strategy
- **Granularity**: 1 commit per todo (19 commits + 1 final evidence-only run). Each commit message follows `type(scope): summary` pattern.
- **Order**: Commits follow wave order (W1 → W2 → W3 → W4 → W5 → W6). Within each wave, todos are independent — commit order within a wave doesn't matter.
- **Branch**: `feat/campaigns-app` from `main`.
- **Final merge**: After all 20 todos complete + Final Verification Wave passes → merge to `main`.

## Success criteria
1. Admin can log in, see dashboard with stats, navigate all 6 sidebar items
2. Admin can create a campaign with title, WhatsApp template SID, template variables, email body, and destination link
3. Admin can import contacts via CSV, see them normalized to E.164 format, with no duplicates
4. Admin can assign contacts to a campaign, generating per-recipient tracking UUIDs
5. Admin can send campaign via email (SMTP) to all assigned contacts, with per-recipient delivery status in SendLog
6. Admin can send campaign via WhatsApp (Twilio Content Template) with variable interpolation
7. Contacts who click the tracking link are logged (ClickEvent) and redirected (302) to the campaign destination
8. Admin views campaign analytics: total sent, unique clickers, total clicks, click rate %, clicked/not-clicked contact lists
9. Admin creates a new campaign from the filtered "clicked" contacts list (re-campaigning)
10. Admin creates an event (title, date, capacity), and a public event page renders at /events/[slug]
11. Public user visits event page, fills RSVP form with plus-one guests and WhatsApp opt-in, submits successfully
12. Public user sees "Registration closed" for past or full events
13. Admin views registrations per event, filters by WhatsApp opt-in, exports filtered CSV (RFC 4180, UTF-8 BOM)
14. Rate limiting blocks brute-force login (5 attempts / 15 min) and RSVP spam (10 submissions / hour)
15. Security headers (X-Content-Type-Options, X-Frame-Options, HSTS) present on all responses
16. All admin routes redirect unauthenticated users to /admin/login
17. Zero raw SQL queries — all database access via Prisma parameterized queries
