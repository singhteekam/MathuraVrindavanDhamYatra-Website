@AGENTS.md

# Mathura Vrindavan Dham Yatra — Claude Instructions

## Key Reference Files
- **[ROUTES.md](ROUTES.md)** — All routes (public, auth, admin, superadmin, API). Check here before adding or modifying any route.
- **[DOCS.md](DOCS.md)** — Full project documentation: tech stack, data models, roles, styling system, env vars.

## Project Essentials

**Stack**: Next.js 16 App Router · React 19 · TypeScript · MongoDB/Mongoose · NextAuth · Tailwind CSS v4

**Four roles**: `customer` → `driver` → `admin` → `superadmin` (each inherits access from the one above)

**Route groups**:
- `app/(admin)/` → `/admin/*` (admin + superadmin)
- `app/(superadmin)/` → `/superadmin/*` (superadmin only)
- `app/(driver)/` → `/driver/*` (driver only)
- `app/[locale]/(public)/` → public-facing pages
- `app/[locale]/(auth)/` → login/register/verify
- `app/[locale]/(customer)/` → customer portal

## Tailwind v4 Notes
This project uses **Tailwind CSS v4** — class names differ from v4:
- Use `shrink-0` not `flex-shrink-0`
- Use `bg-linear-to-br` not `bg-gradient-to-br`
- Use `max-w-50` not `max-w-[200px]` where equivalent
- Always check for canonical class warnings from the IDE hook.

## Bilingual Fields
Content fields (name, description, city, type, tags on Place/Package etc.) are stored as `{ en: string; hi: string }`.
Use the `str()` helper in page files to extract the English string for display in admin panels.

## API Conventions
All responses use helpers from `lib/apiResponse.ts`:
- `successResponse(data)` → `{ success: true, data }`
- `errorResponse(msg, status)` → `{ success: false, error }`
- `paginatedResponse(data, page, limit, total)` → includes `pagination` object

Always check `session?.user?.role` at the top of protected API routes.

## Admin Package Fetching
The packages list API (`GET /api/packages`) filters `isActive: true` by default.
Admin and superadmin panels must pass `?all=true` to see inactive packages.
The API allows `all=true` only for `admin` and `superadmin` roles.

## Settings Architecture
Site settings are stored in MongoDB as a singleton (`Settings` model, `key: 'site'`).
- **Superadmin** can edit: `siteInfo`, `emailConfig` (host/port only), `bookingConfig`
- **Admin** can edit: `bookingConfig` only
- SMTP credentials (user/pass) are **never** stored in DB — Vercel env vars only.

## CSS Custom Properties
Theme-aware variables defined in `app/globals.css`. Use these instead of hard-coded colors:
`--bg-surface`, `--bg-surface-muted`, `--border-muted`, `--text-muted`, `--text-faint`,
`--surface-krishna`, `--surface-saffron`, `--surface-green`, `--surface-red`, `--surface-amber`

## Toggle Components
The `Toggle` component used in settings pages requires:
- `flex-1 min-w-0` on the text div (prevents label text from pushing toggle out of bounds)
- `shrink-0` on the button (prevents toggle pill from shrinking)
- `overflow-hidden` on the outer container
