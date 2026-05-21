# PROJECT_HANDOFF — Mathura Vrindavan Dham Yatra

**Last updated:** 2026-05-21
**Branch:** main
**Use this file + `PROJECT_CONTEXT.json` as the single source of truth for new sessions.**

---

## 1. Current project state

- **Stack:** Next.js 16.2.3 (App Router) + TS + Tailwind v4 + MongoDB + NextAuth
- **i18n:** `next-intl@4.12.0` — English + Hindi live in production-quality state
- **Theme:** `next-themes@0.4.6` — light/dark/system, class-based, fully working
- **Routing:** `/<locale>/...` prefix with proxy redirect for missing locale
- **Translated scope so far:** Navbar, Footer, Homepage, Listing pages (Packages/Places/Hotels/Restaurants/Blog), Detail pages (Package/Place)
- **Not yet translated:** Booking flow, Review form, Auth (login/register), Customer portal, Static pages (About/FAQ/T&C/Privacy/Developer/Contact/404)
- **DB content (Package/Place names + descriptions):** still single-language English; bilingual schema migration pending (Phase 6)
- **Admin/Superadmin/Driver dashboards:** intentionally NOT translated, NOT dark-themed
- **Type-check:** clean as of last commit
- **Last commit:** `34fa82c feat(i18n+theme): Phase 3d — detail page translations + dark variants`

---

## 2. Completed phases

| Phase | What it shipped | Commit |
|---|---|---|
| 0 | `next-intl`, `@formatjs/intl-localematcher`, `negotiator`, types installed | `5c4d34a` |
| 1 | `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, next-intl plugin wrap on `next.config.ts`, placeholder messages JSON | `65e3565` |
| 2 | Routes moved under `app/[locale]/` (public + auth + customer + homepage). New `app/[locale]/layout.tsx`. Admin/superadmin/driver/api/maintenance stay at root. | `229c580` |
| 4 (early) | `proxy.ts` updated: locale detection via Accept-Language, redirects missing-locale URLs, strips locale before role checks. `LOCALE_BYPASS_PREFIXES` for admin/api/etc. | `a8766bf` |
| 5 (partial) | `next/link` → `@/i18n/navigation` Link conversion in 24 files. NextLink retained for `/admin`, `/driver` portal links in Navbar (non-localized). | `a8766bf` |
| 3a | `LanguageSwitcher` + `LocaleHtmlLang` components. Navbar/Footer/BookingNotice translated. | `20d5057`, `ed25155` |
| 3b | All homepage components translated (HeroBanner, StatsBar, FeaturedPackages, PopularPlaces, HowItWorks, WhyChooseUs, Testimonials, CTASection, PackageCard, PlaceCard) | `0d528cf` |
| 3c | Listing pages translated UI chrome (Packages, Places, Hotels, Restaurants, Blog). Data arrays still English. | `3846e4d` |
| 11a | Theme infra: `next-themes` provider, `ThemeSwitcher` component, Tailwind v4 `@custom-variant dark`, semantic CSS variable tokens (`--bg-body`, `--text-primary`, etc.) in globals.css, Navbar dark variants | `cdf3176` |
| 11b | Dark variants across homepage sections + cards + listing pages + filter pills (CSS-var driven for inline-styled elements) | `fddec83` |
| 3d | Package detail + Place detail pages translated AND dark-themed (SectionRenderer for rich_text/highlights/travel_tips/distances/faq) | `34fa82c` |

**Commits ordered (newest first):**
```
34fa82c  Phase 3d — detail pages translation + dark
fddec83  Phase 11b — dark variants public components
cdf3176  Phase 11a — theme infrastructure
3846e4d  Phase 3c — listing page translations
0d528cf  Phase 3b — homepage component translations
ed25155  Phase 3a (cont.) — BookingNotice translation
20d5057  Phase 3a — Navbar/Footer translations + LanguageSwitcher
a8766bf  Phase 4+5(partial) — locale-aware proxy + Link conversion
229c580  Phase 2 — route restructure
65e3565  Phase 1 — i18n config + plugin
5c4d34a  Phase 0 — deps install
```

---

## 3. Remaining phases

| Phase | Task | Effort |
|---|---|---|
| **3e** | Booking flow + Review form translations (3-step booking, confirmation page, review submission) | medium |
| **3f** | Auth (`/login`, `/register`) + Customer portal (`/customer`) translations | medium |
| **3g** | Static pages: About, FAQ, T&C, Privacy, Developer, Contact, 404 root + locale | medium |
| **6** | DB schema migration → `{ en, hi }` objects on Package/Place models. `getLocalized()` helper in `lib/i18nHelpers.ts`. Backward-compat for old flat strings. | **HIGH risk** |
| **7** | Admin/Superadmin forms get English/Hindi tabs. New `components/admin/BilingualField.tsx`. Updates to all package/place create+edit pages. | high |
| **8** | `POST /api/admin/translate` endpoint + `lib/translateService.ts` wrapping Google Translate API. Rate-limit + auth-protected. | low-medium |
| **9** | Update `scripts/seedPlaces.ts` + `seedPackages.ts` to bilingual data (manual Hindi I generate). New `scripts/migrateToI18n.ts` for existing DB rows. Translate booking confirmation emails. | medium |
| **10** | Update `PROJECT_CONTEXT.json` to reflect Next 16 (currently says 15 — bug), add `i18n` section, add `theme` section, refresh model fields, remove duplicate `imageUtils.ts` entry | low |
| **11c** (optional) | Dark variants for areas left light: admin sidebars (if scope changes), detail pages further inline-styled accents, auth pages, customer portal, static pages — done alongside 3e/3f/3g | optional |

---

## 4. Files modified so far

### New files (created during this work)
```
i18n/routing.ts
i18n/request.ts
i18n/navigation.ts
messages/en.json
messages/hi.json
app/[locale]/layout.tsx
components/shared/LanguageSwitcher.tsx
components/shared/LocaleHtmlLang.tsx
components/shared/ThemeProvider.tsx
components/shared/ThemeSwitcher.tsx
PROJECT_HANDOFF.md          (this file)
```

### Modified files
```
package.json                              # +next-intl, +next-themes, +negotiator, +matcher
package-lock.json
next.config.ts                            # wrapped with createNextIntlPlugin
proxy.ts                                  # locale detection + bypass logic
app/layout.tsx                            # added ThemeProvider, suppressHydrationWarning
app/globals.css                           # @custom-variant dark, semantic CSS vars, .card/.input-field theme-aware
components/layout/Navbar.tsx              # i18n + ThemeSwitcher + LanguageSwitcher + dark variants
components/layout/Footer.tsx              # i18n via getTranslations
components/AuthProvider.tsx               # unchanged
components/shared/PackageCard.tsx         # i18n + dark
components/shared/PlaceCard.tsx           # i18n + dark
components/shared/SectionHeader.tsx       # description dark variant
components/home/HeroBanner.tsx            # i18n
components/home/StatsBar.tsx              # i18n
components/home/FeaturedPackages.tsx      # i18n + dark
components/home/PopularPlaces.tsx         # i18n + dark
components/home/HowItWorks.tsx            # i18n + dark
components/home/WhyChooseUs.tsx           # i18n (already dark)
components/home/Testimonials.tsx          # i18n + dark
components/home/CTASection.tsx            # i18n + dark
```

### Files moved (via `git mv` — history preserved)
```
app/(public)/         → app/[locale]/(public)/        (15 files)
app/(auth)/           → app/[locale]/(auth)/          (3 files)
app/(customer)/       → app/[locale]/(customer)/      (2 files)
app/page.tsx          → app/[locale]/page.tsx
```

### Files inside moved tree that were further updated
```
app/[locale]/page.tsx                                              # BookingNotice translated
app/[locale]/(public)/packages/page.tsx                            # metadata only (no translation)
app/[locale]/(public)/packages/PackagesClient.tsx                  # i18n + dark
app/[locale]/(public)/packages/[slug]/page.tsx                     # unchanged (server)
app/[locale]/(public)/packages/[slug]/PackageDetailClient.tsx      # i18n + dark
app/[locale]/(public)/places/page.tsx                              # unchanged (server)
app/[locale]/(public)/places/PlacesClient.tsx                      # i18n + dark
app/[locale]/(public)/places/[slug]/page.tsx                       # unchanged
app/[locale]/(public)/places/[slug]/PlaceDetailClient.tsx          # i18n + dark
app/[locale]/(public)/hotels/HotelsClient.tsx                      # i18n + dark
app/[locale]/(public)/restaurants/RestaurantsClient.tsx            # i18n + dark
app/[locale]/(public)/blog/page.tsx                                # i18n + dark
app/[locale]/(public)/booking/page.tsx                             # Link import only, NOT translated yet
app/[locale]/(public)/booking/confirmation/page.tsx                # Link import only
app/[locale]/(public)/review/page.tsx                              # Link import only
app/[locale]/(public)/about/AboutClient.tsx                        # Link import only
app/[locale]/(public)/contact/ContactClient.tsx                    # NOT touched
app/[locale]/(public)/developer/DeveloperClient.tsx                # Link import only
app/[locale]/(public)/faq/FaqClient.tsx                            # Link import only
app/[locale]/(public)/hotels/page.tsx                              # metadata only
app/[locale]/(public)/not-found.tsx                                # Link import only
app/[locale]/(public)/privacy/page.tsx                             # Link import only
app/[locale]/(public)/restaurants/page.tsx                         # NOT touched
app/[locale]/(public)/terms/page.tsx                               # Link import only
app/[locale]/(auth)/layout.tsx                                     # NOT touched
app/[locale]/(auth)/login/page.tsx                                 # imports updated, NOT translated
app/[locale]/(auth)/register/page.tsx                              # imports updated, NOT translated
app/[locale]/(customer)/layout.tsx                                 # NOT touched
app/[locale]/(customer)/customer/page.tsx                          # imports updated, NOT translated
```

### Untouched, will need work in remaining phases
```
app/not-found.tsx                          # root 404 fallback — still uses next/link
models/Package.ts, Place.ts, Booking.ts, Review.ts, etc.
scripts/seedPlaces.ts, seedPackages.ts, seedSuperAdmin.ts
lib/email.ts                               # email templates English-only
All admin/superadmin/driver files          # by design — out of i18n scope
```

---

## 5. Current i18n architecture

### Library
`next-intl@4.12.0` with **class-based routing** (`localePrefix: 'always'`).

### Config files
- `i18n/routing.ts` — exports `routing` (locales: `['en', 'hi']`, defaultLocale: `'en'`), `Locale` type, `localeNames`
- `i18n/request.ts` — `getRequestConfig` with `hasLocale` validation, dynamic `messages/{locale}.json` import
- `i18n/navigation.ts` — wrapped Link/useRouter/usePathname/redirect/getPathname from `createNavigation(routing)`

### Plugin wiring
`next.config.ts` calls `createNextIntlPlugin('./i18n/request.ts')` and wraps the config with `withNextIntl(...)`.

### Route structure
```
app/
├── [locale]/                 # public + auth + customer + homepage
│   ├── layout.tsx            # validates locale, setRequestLocale, NextIntlClientProvider, LocaleHtmlLang
│   ├── page.tsx              # homepage (BookingNotice + Navbar/Footer manually included)
│   ├── (public)/             # all public routes
│   ├── (auth)/               # login, register
│   ├── (customer)/           # customer dashboard
│   └── not-found.tsx         # locale-aware 404
├── (admin)/                  # NOT localized
├── (superadmin)/             # NOT localized
├── (driver)/                 # NOT localized
├── api/                      # NOT localized
├── maintenance/              # NOT localized
├── layout.tsx                # root — html/body, ThemeProvider, AuthProvider, suppressHydrationWarning
├── not-found.tsx             # fallback 404 for non-locale-matched paths
└── globals.css
```

### Middleware (`proxy.ts`)
Order of operations:
1. Maintenance-mode check (bypass for admin/api/etc.)
2. **Locale detection** — if path doesn't start with `LOCALE_BYPASS_PREFIXES` AND has no locale, redirect to `/{detected}/...` using `getLocale()` via Negotiator + intl-localematcher
3. Auth/role guards — `cleanPath = stripLocale(pathname)` then check role on `/customer` (locale-prefixed), `/admin`, `/superadmin`, `/driver` (flat)

`LOCALE_BYPASS_PREFIXES`: `/admin`, `/superadmin`, `/driver`, `/api`, `/maintenance`, `/_next`, `/favicon`, `/images`

### Link strategy
- **Default:** `import { Link } from '@/i18n/navigation'` — auto-prefixes locale
- **Cross-portal admin/driver links in Navbar:** `import NextLink from 'next/link'` (plain) — used in `ProfileDropdown` based on role
- **Footer's `/sitemap.xml`:** plain `<a>` (route handler, not a page)

### Translation file structure
`messages/en.json` + `messages/hi.json` — flat JSON with feature-keyed namespaces. **ICU placeholders** for interpolation (`{count}`, `{name}`, `{city}`, `{rating}`, `{day}`, `{car}`).

**Namespaces present:**
```
Common              LanguageSwitcher    Navigation
ProfileDropdown     Footer              VisitorBadge
InactivityWatcher   BookingNotice       HeroBanner
StatsBar            FeaturedPackages    PopularPlaces
HowItWorks          WhyChooseUs         Testimonials
CTASection          PackageCard         PlaceCard
PackagesPage        PlacesPage          HotelsPage
RestaurantsPage     BlogPage            PackageDetail
PlaceDetail         ThemeSwitcher
```

### Hindi translation conventions
- Religious proper nouns preserved/transliterated: `बांके बिहारी`, `जन्मभूमि`, `गोवर्धन`, `इस्कॉन`, `राधे राधे`, etc.
- App-UI register, not literary (e.g., "Book Now" → `अभी बुक करें`, not formal Sanskritized)
- English brand/loanwords kept where natural (e.g., AC, GPS, व्हाट्सऐप, ईमेल)

### Translation patterns in code
- **Server components:** `const t = await getTranslations('Namespace')`
- **Client components:** `const t = useTranslations('Namespace')`
- **Async server homepage subcomponents** (like BookingNotice): made async, called with `{/* @ts-expect-error Async Server Component */}` if needed (no such workaround currently used — they just await `getTranslations` cleanly)
- **City filters / Tabs:** kept English `slug` for DB matching + translated `label` for display, e.g.:
  ```
  CITY_KEYS = [{ slug: 'Mathura', key: 'cityMathura' }, ...]
  const CITIES = CITY_KEYS.map(c => ({ ...c, label: t(c.key) }))
  ```

### `<html lang>` syncing
- Root `<html lang="en">` is static (default)
- `components/shared/LocaleHtmlLang.tsx` is a `'use client'` effect that sets `document.documentElement.lang = locale` on mount and locale change. Mounted inside `app/[locale]/layout.tsx` via `NextIntlClientProvider`.

---

## 6. Dark/light mode implementation

### Library
`next-themes@0.4.6` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.

### Tailwind v4 config
Top of `app/globals.css`:
```
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### Semantic CSS variable tokens (globals.css ~lines 93–122)
Two blocks of CSS variables defined for `:root` (light) and `.dark` (dark). Tokens:
```
--bg-body, --bg-surface, --bg-surface-muted, --bg-input
--text-primary, --text-secondary, --text-muted, --text-faint
--border-default, --border-muted
--shadow-card, --shadow-card-hover (overridden in dark)
```

These power the auto-switch of:
- `body` (background-color + color + transition)
- `.card`
- `.input-field`
- `.section-title`
- Scrollbar track

### Two patterns used for theme application
1. **Tailwind classes:** `bg-white dark:bg-gray-900` everywhere components already used Tailwind utilities
2. **CSS variables in inline styles:** for components with hardcoded `style={{ background: '#fff' }}` — they were rewritten to `style={{ background: 'var(--bg-surface)' }}` etc. (most filter pills, tab buttons, list rows). Avoided full inline-style refactor.

### Components with dark variants applied
- Navbar (all surfaces — sticky bar, dropdowns, mobile drawer, profile menu, login/book CTAs)
- Footer (already dark-by-default `bg-gray-950`)
- All homepage sections (5 wrappers + cards + headers)
- PackageCard, PlaceCard
- SectionHeader description
- Listing pages: Packages, Places, Hotels, Restaurants, Blog (containers + filters + result counts + empty states)
- Package detail + Place detail full coverage (tabs, vehicle selection, inclusions/exclusions, reviews, sidebar, related)

### Components NOT yet dark-themed (intentional / pending)
- Auth pages (`/login`, `/register`) — Phase 3f
- Customer portal — Phase 3f
- Booking flow (3-step form + confirmation) — Phase 3e
- Review form — Phase 3e
- Static pages (About, FAQ, T&C, Privacy, Developer, Contact, 404) — Phase 3g
- All admin/superadmin/driver dashboards — out of scope by design

### Switcher component
`components/shared/ThemeSwitcher.tsx`:
- Default variant (icon dropdown for desktop navbar)
- Mobile variant (in-drawer button list)
- Light / Dark / System options
- Hydration-safe via `mounted` flag + `suppressHydrationWarning`
- Translations: `messages/{en,hi}.json` namespace `ThemeSwitcher`

### Intentionally light-in-dark
- Saffron accent CTA gradients (`linear-gradient(135deg, #fff8ed, #ffefd4)`) on custom-package CTAs, place-detail "Want to visit" panel — kept as visual accents in both modes
- Hero gradients (`linear-gradient(135deg, #1a0a00, ...)`) already deep dark — work in both

---

## 7. Known issues / broken areas

### Pre-existing (not introduced by this work)
- **Tailwind v4 canonical-class lint warnings everywhere** — `flex-shrink-0` → `shrink-0`, `bg-gradient-to-*` → `bg-linear-to-*`. Cosmetic only, both forms work. ~50+ occurrences. Pre-existing.
- **`PROJECT_CONTEXT.json` says Next.js 15** but `package.json` has `next: ^16.2.3`. Needs fixing in Phase 10.
- **`PROJECT_CONTEXT.json` duplicate `imageUtils.ts` entry** under `lib:` (lines 247 + 250) — same key twice with slight description diff. Harmless.
- **Two not-found.tsx files:** `app/not-found.tsx` (root fallback) and `app/[locale]/(public)/not-found.tsx`. Both serve different purposes — root catches `/xyz` (unmatched non-locale), public catches `/<locale>/<unmatched-public>`. Working as designed.

### Introduced by current work
- **Root `app/not-found.tsx` still uses plain `next/link`** — after proxy redirect to `/{locale}/<bad>`, but the root 404 doesn't fall through to a localized one. Links inside it go to `/`, `/packages` (non-locale) — proxy will redirect them on click, so they work with one extra hop. Acceptable.
- **`useSearchParams` imports in booking/login/confirmation/review pages** kept from `next/navigation` (not `@/i18n/navigation`). This is correct — useSearchParams is locale-agnostic — but be aware in 3e/3f when translating those pages.
- **Hardcoded data arrays in Hotels/Restaurants/Blog/HowItWorks/WhyChooseUs/Testimonials static fallback** — hotel names, restaurant names, blog post titles, static testimonial review text — all still English. These should move to DB or accept being EN-only for now.

### Potential issues I haven't verified end-to-end
- **`<html lang="en">` static** even on `/hi/*` until LocaleHtmlLang's useEffect fires. First paint shows wrong lang. SEO impact: minor — Google reads content, not just the lang attribute.
- **`PopularPlaces.tsx` PlaceTile inner component** — uses `useTranslations('PopularPlaces')` inside a non-default component but it works fine since it's still client-side. Just slightly unusual pattern.
- **Date locale on testimonials** — Testimonials uses `new Date().toLocaleDateString('en-IN', ...)` hardcoded. Hindi pages should ideally use `'hi-IN'` locale for date formatting. Not yet addressed.

---

## 8. Important decisions

### Architecture
- **`localePrefix: 'always'`** chosen over `'as-needed'` for clean SEO + URL clarity. Every URL has `/en/` or `/hi/` (no rewrite ambiguity).
- **Admin/Superadmin/Driver NOT under `[locale]`** — internal-only English. Saves significant translation work + admin UI doesn't need it.
- **CSS variable tokens** chosen over rewriting all inline `style={{}}` props to Tailwind. Pragmatic — preserves existing component code mostly intact.
- **Single root layout** for `<html>/<body>` — `<html lang>` updated via client effect (LocaleHtmlLang), not via two-root-layouts split. Avoids deeper refactor.

### Translation policy
- **Google Translate API** chosen (free 500k char/mo) for the future admin-side "🪄 Translate to Hindi" button — user added `GOOGLE_TRANSLATE_API_KEY` to `.env.local` (recommend rotation after work done; key was in chat history).
- **Manual admin entry preferred over auto-on-save** — admin clicks button, reviews Hindi, then submits. Religious terms need review.
- **DB schema migration approach:** `{ en, hi }` objects on translatable fields (Package.name, Package.shortDescription, itinerary.title, etc.). Backward-compat via `getLocalized(field, locale)` helper that handles both old flat strings AND new objects.
- **Slugs stay English** — URLs are SEO-canonical in English (e.g., `/hi/places/banke-bihari-temple` keeps slug English).

### Testing strategy
- User wants commit-per-phase for easy rollback.
- User confirmed STOP points after Phase 2 (route move) and after Phase 6 (DB migration). Other phases tested incrementally.

### User preferences (saved to memory)
- **Ask before code changes** — confirm plans in plain text (`memory/feedback_ask_before_code.md`)
- **Token-optimization mode** active per recent `Context.txt`: minimize tokens, no full rewrites, no repeated summaries, no TODO regeneration, surgical edits only.

---

## 9. Minimal next steps to continue from Phase 3e

### Phase 3e — Booking flow + Review form

**Files to translate:**
1. `app/[locale]/(public)/booking/page.tsx` (3-step booking form — large file)
2. `app/[locale]/(public)/booking/confirmation/page.tsx`
3. `app/[locale]/(public)/review/page.tsx`

**Approach (mirror Phase 3d):**
1. Read each file, extract English strings to translation keys
2. Add `Booking` + `BookingConfirmation` + `ReviewForm` namespaces to `messages/en.json` and `messages/hi.json`
3. Use ICU placeholders for dynamic content (`{packageName}`, `{date}`, `{amount}`, etc.)
4. Replace hardcoded strings with `t(...)` calls
5. Apply dark variants to surfaces (`bg-white dark:bg-gray-900`, text colors, borders)
6. Commit as `feat(i18n+theme): Phase 3e — booking flow + review form translations`

**Special considerations for 3e:**
- Booking form has toast messages (react-hot-toast) → translate via `t('errorX')`/`t('successX')` keys
- Date inputs — locale-aware date formatting may need `'hi-IN'`
- Confirmation page reads `bookingId` from URL — useSearchParams stays from `next/navigation`
- Review form has rating stars + validation messages
- Booking emails (`lib/email.ts`) are separate concern — Phase 9 handles email translation

### Phase 3f — Auth + Customer portal
- `app/[locale]/(auth)/login/page.tsx` + `register/page.tsx` (has `dynamic = 'force-dynamic'`)
- `app/[locale]/(customer)/customer/page.tsx` (My Bookings, Leave Review, Cancel, etc.)
- Add `Auth.*` and `CustomerPortal.*` namespaces

### Phase 3g — Static pages (bulk, lower risk)
- About, FAQ, T&C, Privacy, Developer, Contact, 404
- Contact has a form (POST `/api/contact`)
- T&C and Privacy have ~14 + ~13 sections of long-form legal text — translate carefully, note that English remains legally authoritative

### Phase 6 — DB schema (HIGH RISK — second STOP point per user)
- Decision pending: which fields go bilingual on Package + Place. Plan from earlier convo lives in conversation history.
- Will need `lib/i18nHelpers.ts` with `getLocalized()` + backward-compat shim
- Will need data migration script before deploying

### Phase 7 — Admin bilingual forms
- New `components/admin/BilingualField.tsx`
- Update 6 admin/superadmin form pages

### Phase 8 — Translate API
- `POST /api/admin/translate` — auth-required, rate-limited
- `lib/translateService.ts` — wraps Google Translate

### Phase 9 — Seeds + emails
- Bilingual seed data (I generate Hindi)
- Email templates → Hindi version for Hindi-locale users
- One-time migration script for existing DB rows

### Phase 10 — Final docs
- Update `PROJECT_CONTEXT.json` extensively (Next 16, i18n section, theme section, fixed duplicate, model field changes)
- Manual testing checklist

---

## 10. Temporary hacks / workarounds

1. **`/admin/login` linking** — Navbar's ProfileDropdown portal link for admin/driver uses `NextLink` (plain `next/link`) directly imported alongside locale-aware Link. Renamed to `NextLink` to disambiguate. Customer portal link uses locale-aware Link. **Intentional**, not a hack — there's no clean single-Link API in next-intl 4 for opt-out routes.

2. **`(activeTab as string) === 'Overview'`** in `PackageDetailClient.tsx` — TypeScript narrowed `activeTab` to `typeof TAB_KEYS[number]` after switching to typed state, but tab comparisons need string cast on one line. Cosmetic only.

3. **`<html lang="en">` static** with client-side update — see Known Issues #5. Tracked, not fixed.

4. **Tailwind v4 lint warnings** ignored across the codebase — `flex-shrink-0` vs `shrink-0`, `bg-gradient-to-*` vs `bg-linear-to-*`. Both work; pre-existing across many files.

5. **`whatsappMsg` ICU greeting** in detail pages uses translation key with `{name}`/`{city}`. The text is then `encodeURIComponent`'d for the URL. Hindi WhatsApp greetings work correctly in WhatsApp.

6. **`messages/en.json` `_meta` key** from Phase 1 placeholder is no longer used after Phase 3a populated real keys, but `_meta` is still in both files at the top. Harmless. Can be removed in Phase 10.

7. **PopularPlaces `useTranslations('PopularPlaces')` inside PlaceTile inner component** — works but unusual; passes through React context. Refactor unnecessary.

8. **`messages/hi.json` for Testimonials.staticLocation` set to "भारत"** — covers DB review fallback location. Static `STATIC_TESTIMONIALS` array names remain English (real people's names — not translated).

9. **Theme test note** — server restart required after first install of next-themes for the provider to wire up. Documented in Phase 11a commit message.

10. **`useSearchParams` not from `@/i18n/navigation`** — kept from `next/navigation` in booking/login/confirmation/review. This is the next-intl-recommended pattern (useSearchParams is locale-neutral). Just call out in 3e/3f reviews so it's not "fixed" by mistake.

---

## End of handoff
For deeper architecture context: `AGENTS.md` + `CLAUDE.md` + `PROJECT_CONTEXT.json`.
For user preferences: `memory/feedback_ask_before_code.md`.
