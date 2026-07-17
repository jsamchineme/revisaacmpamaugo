# Product Requirements Document: Rev. Isaac Mpamaugo — Custom Website with CMS

## 1. Overview

Replace an existing WordPress site with a custom Next.js 15 full-stack web application featuring a built-in Content Management System. The site represents the lifelong ministry of Rev. Isaac Mpamaugo — his sermons, teachings, events, and shared ministry with his wife Rev. Mrs. Edith Mpamaugo.

**Source Design:** `templates/revisaacmpamaugo-reverent-timeless.html` — a complete single-file HTML prototype with all page designs, styles, content, and interactive behavior.

**Source Content:**
- `templates/reverend-isaac-website-copy.md` — all page copy, testimonials, SEO meta
- `templates/reverend-isaac-teachings.md` — full text of 10 teachings
- The HTML template contains inline sermon data (9 items), event data (4 items), and teaching data (10 items) as JavaScript arrays

**Domain:** revisaacmpamaugo.online (currently WordPress)

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG/ISR, file-based routing, API routes |
| Styling | Tailwind CSS v4 | Matches template design system |
| Database | SQLite via Prisma ORM | Zero infrastructure, single file |
| Auth | NextAuth.js v5 | Credentials provider, JWT sessions, role-based |
| Rich Text | TipTap (ProseMirror) | Modern, extensible, React-native editor |
| Forms | React Hook Form + Zod | Type-safe form validation |
| UI Library (Admin) | Radix UI primitives + Tailwind | Accessible, unstyled primitives |
| Drag & Drop | dnd-kit | Section reordering in page editor |
| Image Handling | Sharp | Server-side image optimization |
| Media Upload | Local multer + `/public/uploads` | Self-hosted media |
| Deployment | PM2 + Nginx on VPS | Standalone Next.js output |
| Language | TypeScript (strict mode) | Type safety across the project |

---

## 3. Architecture

```
┌────────────────────────────────────────────────┐
│                  VPS (Linux)                    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Nginx (reverse proxy, SSL via certbot,│    │
│  │  static files for /uploads, _next/**)  │    │
│  └────────────┬───────────────────────────┘    │
│               │                                 │
│  ┌────────────▼───────────────────────────┐    │
│  │  Next.js 15 (standalone build)         │    │
│  │  - Port 3000                           │    │
│  │  - PM2 ecosystem.config.js             │    │
│  │  - ISR for public pages (revalidate: 60)│    │
│  └────────────┬───────────────────────────┘    │
│               │                                 │
│  ┌────────────▼───────────────────────────┐    │
│  │  SQLite (prisma/dev.db)                │    │
│  │  + /public/uploads/ for media          │    │
│  └────────────────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

---

## 4. Content Model & Database Schema

### Prisma Models

```
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  role      UserRole @default(EDITOR)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole { ADMIN EDITOR AUTHOR }

model Page {
  id              String    @id @default(cuid())
  slug            String    @unique
  title           String
  metaDescription String?
  sections        String?   // JSON array of section objects
  published       Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Sermon {
  id             String    @id @default(cuid())
  slug           String    @unique
  title          String
  description    String?
  category       String?
  scriptureRef   String?
  imageUrl       String?
  audioUrl       String?
  videoUrl       String?
  body           String?   // TipTap JSON output
  published      Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Teaching {
  id             String    @id @default(cuid())
  slug           String    @unique
  title          String
  excerpt        String?
  category       String?
  scriptureRef   String?
  imageUrl       String?
  body           String?   // TipTap JSON output
  published      Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Event {
  id             String    @id @default(cuid())
  slug           String    @unique
  title          String
  excerpt        String?
  category       String?
  date           DateTime?
  imageUrl       String?
  body           String?   // TipTap JSON output
  published      Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Testimonial {
  id        String   @id @default(cuid())
  quote     String
  author    String
  role      String?
  order     Int      @default(0)
  published Boolean  @default(true)
  createdAt DateTime @default(now())
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String // JSON string for complex values
}

model Media {
  id        String   @id @default(cuid())
  filename  String
  url       String
  type      String   // "image" | "document" | "audio"
  size      Int
  createdAt DateTime @default(now())
}
```

### Section Types (Page.sections JSON)

Each Page has a `sections` JSON array. Each section object:

```typescript
interface Section {
  id: string
  type: SectionType
  order: number
  content: Record<string, any>
}

type SectionType =
  | 'hero'            // headline, subheadline, backgroundImage, overlay, buttons[]
  | 'trustStrip'      // stats: [{number, label}]
  | 'featuresGrid'    // title, subtitle, features: [{icon, title, description}]
  | 'aboutPreview'    // headline, body, imageUrl, ctaLabel, ctaLink
  | 'sermonsPreview'  // title, subtitle, count
  | 'eventsPreview'   // title, subtitle, count
  | 'testimonials'    // testimonialIds: string[]
  | 'ctaBand'         // headline, description, buttonLabel, buttonLink, bgColor
  | 'textContent'     // body (rich text)
  | 'imageBlock'      // imageUrl, caption, alignment
  | 'faq'             // items: [{question, answer}]
  | 'steps'           // title, subtitle, steps: [{title, description}]
  | 'contactForm'     // {} // renders contact form
  | 'contactInfo'     // {} // renders from Settings
  | 'grid'            // items: [{icon, title, description}]
  | 'splitContent'    // imageUrl, headline, body, ctaLabel, ctaLink
  | 'pageHero'        // headline, subtitle, eyebrow
  | 'missionVision'   // missionTitle, missionBody, visionTitle, visionBody
```

---

## 5. Route Map

### Public Routes (Next.js App Router)

| Route | File | Source |
|---|---|---|
| `/` | `app/page.tsx` | Page slug="home", renders sections |
| `/about` | `app/about/page.tsx` | Page slug="about" |
| `/ministry` | `app/ministry/page.tsx` | Page slug="ministry" |
| `/contact` | `app/contact/page.tsx` | Page slug="contact" |
| `/sermons` | `app/sermons/page.tsx` | Sermon[] from DB with filters |
| `/sermons/[slug]` | `app/sermons/[slug]/page.tsx` | Single Sermon by slug |
| `/teachings` | `app/teachings/page.tsx` | Teaching[] from DB with filters |
| `/teachings/[slug]` | `app/teachings/[slug]/page.tsx` | Single Teaching by slug |
| `/events` | `app/events/page.tsx` | Event[] from DB with filters |
| `/events/[slug]` | `app/events/[slug]/page.tsx` | Single Event by slug |

### API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/contact` | Public contact form submission |
| GET/POST | `/api/admin/pages` | List / create pages |
| GET/PUT/DELETE | `/api/admin/pages/[id]` | Read / update / delete page |
| GET/POST | `/api/admin/sermons` | List / create sermons |
| GET/PUT/DELETE | `/api/admin/sermons/[id]` | CRUD single sermon |
| GET/POST | `/api/admin/teachings` | List / create teachings |
| GET/PUT/DELETE | `/api/admin/teachings/[id]` | CRUD single teaching |
| GET/POST | `/api/admin/events` | List / create events |
| GET/PUT/DELETE | `/api/admin/events/[id]` | CRUD single event |
| GET/POST | `/api/admin/testimonials` | List / create testimonials |
| GET/PUT/DELETE | `/api/admin/testimonials/[id]` | CRUD single testimonial |
| GET/PUT | `/api/admin/messages/[id]` | Read / mark message |
| GET/POST/DELETE | `/api/admin/media` | Upload / list / delete media |
| GET/POST/PUT/DELETE | `/api/admin/users` | CRUD users |
| GET/PUT | `/api/admin/settings` | Get / update settings |

### Admin Routes

All under `/admin/*`, guarded by middleware. Layout: sidebar + top bar.

| Route | Component |
|---|---|
| `/admin` | Dashboard |
| `/admin/login` | Login page |
| `/admin/pages` | Page list |
| `/admin/pages/[id]/edit` | Section-based page editor |
| `/admin/sermons` | Sermon list / CRUD |
| `/admin/teachings` | Teaching list / CRUD |
| `/admin/events` | Event list / CRUD |
| `/admin/testimonials` | Testimonial list / CRUD |
| `/admin/messages` | Contact message inbox |
| `/admin/media` | Media library |
| `/admin/users` | User management (admin only) |
| `/admin/settings` | Site settings |

---

## 6. Design System

**Must match `templates/revisaacmpamaugo-reverent-timeless.html` exactly.**

### Design Tokens (tailwind.config.ts)

```js
colors: {
  ink: '#1c1a17',
  paper: '#faf7f2',
  cream: '#f3ede2',
  line: '#e3d9c8',
  gold: '#b08642',
  'gold-dark': '#8c6a32',
  burgundy: '#5a2231',
  'burgundy-dark': '#431824',
  muted: '#6b635a',
  white: '#ffffff',
},
fontFamily: {
  serif: ['Cormorant Garamond', 'Georgia', 'serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
boxShadow: {
  card: '0 18px 50px rgba(40,30,20,.12)',
},
borderRadius: {
  DEFAULT: '14px',
}
```

### Shared Components

1. **Header** — Sticky, glass-blur backdrop, logo with "IM" mark + site name, 7 nav links with active gold underline, "Get in Touch" CTA button, hamburger mobile menu at <= 900px
2. **Footer** — Burgundy-dark bg, 3-column grid (about text + socials, quick links, contact + CTA), copyright line
3. **Hero** — Full-width bg image + rgba overlay, h1 headline, p subheadline, button group (btn-gold + btn-ghost)
4. **Trust Strip** — Burgundy bg, 4-column stats (number + label), collapses at 900px to 2-col, 480px 1-col
5. **Card** — White bg, 1px line border, 16:10 image thumbnail with zoom on hover, tag label (gold uppercase), h3 title, p description, colored link. Hover: translateY(-5px) + shadow
6. **Feature Block** — 56px icon circle (cream bg), h3 title, p muted description
7. **Section Head** — Eyebrow (gold-dark uppercase), h2 headline, optional .lead paragraph (muted)
8. **Quote/Testimonial** — Large gold opening quote, italic serif text, author name in gold-dark
9. **CTA Band** — Gradient burgundy-to-burgundy-dark bg, white text, h2 + p + button
10. **Filter Bar** — Centered pill buttons, border line, active = burgundy fill white text
11. **FAQ** — Max-width 780px, border-bottom separator, button toggles with plus -> 45deg rotate, slide-down answer
12. **Modal** — Fixed overlay, centered modal-box with close button, tag + h2 + ref + content paragraphs
13. **Steps** — 3-column grid, numbered circles (burgundy bg, gold text), h3 + p
14. **Contact Form** — Styled inputs with focus gold border, label, submit button, success message
15. **Contact Info** — Icon circles with label + value rows, social icon circles, iframe map
16. **Page Hero** — Cream bg, centered h1 + p + eyebrow
17. **Split Section** — 2-column grid, image + text with eyebrow + h2 + p + button
18. **Grid** — 3-column responsive grid (2-col for split layouts)
19. **Button variants** — btn-primary (burgundy), btn-gold, btn-ghost (line border)

### Responsive

- Default: multi-column layouts
- `<= 900px`: All grids to 1-col, menu hidden (hamburger), trust strip 2-col
- `<= 480px`: Trust strip 1-col

---

## 7. Admin CMS Design

Modern, clean admin panel using Tailwind + Radix UI primitives.

### Layout
- Fixed left sidebar (240px, white bg) — nav links + user info at bottom
- Top bar with breadcrumb + logout
- Main content area

### Sidebar Links
- Dashboard | Pages | Sermons | Teachings | Events | Testimonials | Messages (unread badge) | Media | Users | Settings

### Page Editor (most complex feature)
1. **Section list view** — ordered list of sections with type label + content summary
2. **Drag & drop reorder** — dnd-kit
3. **Add Section** — dropdown button with section type picker
4. **Edit Section** — slide-over panel with type-specific form:
   - Text inputs for short strings
   - TipTap editor for rich text bodies
   - Image selector (media library picker)
   - Color pickers
   - Repeater fields for lists
5. **Delete Section** — confirm dialog
6. **Save / Publish** — saves sections JSON to DB

### TipTap Editor Features
- Bold, italic, heading (h2-h4)
- Blockquote
- Bullet / ordered lists
- Link insertion
- Image from media library
- Scripture reference formatting

---

## 8. Pages Content Reference

### Home page sections (in order)
1. hero: headline="Faithful Service. Timeless Truth.", buttons from template
2. trustStrip: 4 stats
3. featuresGrid: "A Lifetime of Faithfulness"
4. aboutPreview: "A Life Given to the Gospel"
5. sermonsPreview: "Recent Sermons & Teachings"
6. eventsPreview: "Outreach & Events"
7. testimonials: 3 quotes from template
8. ctaBand: "However far the road, grace reaches further."

### About page sections
1. pageHero: "Our Story"
2. textContent: full story from template (5 paragraphs)
3. missionVision: mission + beliefs
4. featuresGrid: "Faithfulness, not flash" (3 items)

### Ministry page sections
1. pageHero: "How Rev. Isaac Serves"
2. grid: 6 ministry areas
3. steps: How to Invite (3 steps)
4. faq: 5 Q&A items

### Contact page sections
1. pageHero: "Get in Touch"
2. contactForm
3. contactInfo

---

## 9. Seed Data

Seed script must populate:
- 1 Admin user (email: admin@isaacmpamaugo.org)
- 6 Pages (home, about, ministry, sermons, events, contact) with sections
- 9 Sermons from template (lines 495-505)
- 4 Events from template (lines 506-511)
- 10 Teachings from template (lines 514-694) or from reverend-isaac-teachings.md
- 3 Testimonials from template (lines 291-295)
- Contact info + social links from reverend-isaac-website-copy.md (lines 314-320)
- Settings: site title, tagline, SEO defaults

---

## 10. Implementation Waves

### Wave 1: Foundation & Architecture
- Initialize Next.js 15 + TypeScript + Tailwind v4
- Prisma schema + SQLite + seed script
- NextAuth config (credentials, JWT, RBAC)
- Auth middleware for /admin/*
- Project folder structure

### Wave 2: Design System & Components
- Tailwind theme with all design tokens from template
- All 19 shared UI components matching template exactly
- Layout with Header + Footer
- Section renderer (type -> component)
- Bento/loading states for data-fetching pages

### Wave 3: Public Pages
- Dynamic page renderer (Page slug -> sections)
- All section-type components
- Sermons list (with category filter) + single sermon page
- Teachings list (with filter) + single teaching page
- Events list (with filter) + single event page
- Contact form + API handler
- SEO metadata + sitemap.xml

### Wave 4: Admin Shell & Auth
- Admin layout with sidebar navigation
- Login page
- Dashboard with stats
- Users CRUD
- Settings page
- Auth guard middleware

### Wave 5: Page Editor
- Page list in admin
- Section-based page editor:
  - Section list with drag-and-drop reorder
  - Add section type picker
  - Type-specific section forms
  - TipTap integration
  - Media library picker
  - Save/publish

### Wave 6: Content Managers
- Sermons CRUD (TipTap body, audio/video URLs)
- Teachings CRUD (TipTap body, scripture ref)
- Events CRUD (date picker, TipTap body)
- Testimonials CRUD
- Contact Messages inbox
- Media Library (upload, browse, delete)

### Wave 7: Deployment
- Next.js standalone config
- PM2 ecosystem.config.js
- Nginx config template
- GitHub Actions CI/CD
- .env.example
- Final testing + audit
