# Mathura Vrindavan Dham Yatra

A full-stack pilgrimage tourism platform for the Braj region — Mathura, Vrindavan, Govardhan, Gokul, Barsana, and Nandgaon. Built with Next.js 16 App Router, MongoDB, and Tailwind CSS v4.

**Live site:** [mathuravrindavandhamyatra.com](https://mathuravrindavandhamyatra.com)

---

## Features

- **Tour Packages** — Browse, filter, and book packages with tiered car options, add-ons, and hot-deal discounts (strikethrough pricing)
- **Booking System** — Three booking methods: Pay Cash, Book via WhatsApp, and Online Payment (Razorpay). Advance + balance breakdown. Admin notified by email on every booking.
- **Bilingual** — Full English + Hindi support across all public pages and content fields
- **Sacred Places, Hotels & Restaurants** — Discovery pages for the Braj pilgrimage circuit
- **Multi-Role Access** — Four roles (customer → driver → admin → superadmin), each inheriting the one below
- **Driver Portal** — Trip management, earnings overview, profile
- **Admin Panel** — Bookings, packages, places, drivers, customers, reviews, enquiries, analytics, newsletter, settings
- **Superadmin Panel** — Full CRUD on all entities, user role management, site settings, visitor analytics
- **Newsletter System** — Compose HTML newsletters, schedule via Vercel Cron, one-click unsubscribe
- **Visitor Analytics** — Real-time visitor tracking with session logs
- **Maintenance Mode** — Toggle from settings; admin/superadmin bypass automatically
- **Dark Mode** — Full light/dark theme support

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Auth | NextAuth 4 (Credentials + Google OAuth) |
| Database | MongoDB via Mongoose 8 |
| i18n | next-intl 4 |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Images | Cloudinary |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB database (local or Atlas)
- Cloudinary account
- Gmail account for SMTP

### Installation

```bash
git clone https://github.com/your-username/mathura-vrindavan-travel.git
cd mathura-vrindavan-travel/web
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Razorpay (online payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Cron (newsletter scheduler)
CRON_SECRET=your-cron-secret

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MAINTENANCE_MODE=false
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site redirects to `/en` (default locale).

---

## Project Structure

```
web/
├── app/
│   ├── (admin)/admin/          # /admin/* — admin panel
│   ├── (superadmin)/superadmin/ # /superadmin/* — superadmin panel
│   ├── (driver)/driver/        # /driver/* — driver portal
│   ├── [locale]/(public)/      # Public pages (/, /packages, /places, …)
│   ├── [locale]/(auth)/        # /login, /register, /verify-email
│   ├── [locale]/(customer)/    # /customer/* — customer portal
│   ├── api/                    # REST API route handlers
│   └── sitemap.ts              # Dynamic XML sitemap (fetches DB)
│
├── components/
│   ├── admin/                  # Shared admin/superadmin UI components
│   ├── home/                   # Homepage section components
│   ├── layout/                 # Header, footer, sidebar
│   └── shared/                 # ThemeProvider, reusable UI pieces
│
├── lib/
│   ├── auth.ts                 # NextAuth config with role callbacks
│   ├── db.ts                   # MongoDB connection singleton
│   ├── email.ts                # Booking confirmation + admin notification emails
│   ├── newsletterUtils.ts      # HMAC unsubscribe token helpers
│   └── apiResponse.ts          # successResponse / errorResponse helpers
│
├── models/                     # Mongoose schemas
│   ├── User.ts / Booking.ts / Package.ts / Place.ts
│   ├── Driver.ts / Review.ts / Contact.ts
│   ├── Hotel.ts / Restaurant.ts
│   ├── Settings.ts / Newsletter.ts / OwnerProfile.ts
│   └── Visitor.ts / VisitorLog.ts
│
├── messages/
│   ├── en.json                 # English translations
│   └── hi.json                 # Hindi translations
│
├── i18n/
│   ├── routing.ts              # Supported locales: ['en', 'hi']
│   └── request.ts              # next-intl server config
│
├── proxy.ts                    # Middleware: locale redirect, maintenance, auth guards
├── ROUTES.md                   # All routes quick reference
└── DOCS.md                     # Full project documentation
```

---

## Roles & Access

| Role | Access |
|------|--------|
| Guest | All public pages, booking (cash/WhatsApp) |
| Customer | Guest + `/customer/*` (booking history, profile) |
| Driver | Guest + `/driver/*` (trips, earnings, profile) |
| Admin | Guest + Customer + `/admin/*` |
| Superadmin | Everything + `/superadmin/*` |

---

## Booking Flow

1. Customer selects a package and car type on `/booking`
2. Chooses add-ons, travel date, pickup location, passengers
3. Picks a booking method:
   - **Pay Cash** — creates a confirmed booking; admin notified by email
   - **Book via WhatsApp** — creates a booking record and opens a pre-filled WhatsApp message to the business
   - **Online** *(disabled, ready to enable)* — Razorpay order → payment → HMAC verify → booking confirmed
4. Redirected to `/booking/confirmation` with booking ID and payment breakdown

---

## Sitemap

The dynamic sitemap at `/sitemap.xml` is generated by `app/sitemap.ts` and includes:

- All static public pages (both `en` and `hi` locales)
- All blog posts
- All packages fetched from MongoDB
- All places fetched from MongoDB

With `hreflang` alternates for each URL.

---

## Newsletter Cron

Scheduled newsletters are sent by a Vercel Cron job that calls `GET /api/cron/newsletter` daily. Configure the schedule in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/newsletter",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Secure the endpoint with `CRON_SECRET` — Vercel passes it as the `Authorization: Bearer` header.

---

## Re-enabling Online Payments

Online payment buttons are currently commented out pending Razorpay live key setup. See the **Payment Integration** section in [DOCS.md](DOCS.md) for the full step-by-step re-enable guide.

---

## Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Documentation

| File | Purpose |
|------|---------|
| [DOCS.md](DOCS.md) | Full project docs: data models, API patterns, env vars, payment flow, roadmap |
| [ROUTES.md](ROUTES.md) | Quick reference for all public, admin, and API routes |
| [CLAUDE.md](CLAUDE.md) | Instructions for AI coding assistants working on this project |

---

## Developer

Built and maintained by **Teekam Singh**  
contact.singhteekam@gmail.com
