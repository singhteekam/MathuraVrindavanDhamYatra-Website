import { withAuth, NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse, NextRequest }     from 'next/server'
import { getToken }                      from 'next-auth/jwt'
import { match }                         from '@formatjs/intl-localematcher'
import Negotiator                        from 'negotiator'
import { routing }                       from '@/i18n/routing'

// ─── Routes that bypass maintenance mode ─────────────────────────────────────
// Admin and superadmin can still access the site during maintenance.
// /api routes must stay live so admin can log in and toggle maintenance off.
const MAINTENANCE_BYPASS_PREFIXES = [
  '/maintenance',
  '/admin',
  '/superadmin',
  '/login',
  '/api',
  '/_next',
  '/favicon',
  '/images',
]

// ─── Routes that stay locale-free (never prefixed with /en or /hi) ───────────
// Admin/superadmin/driver dashboards are internal-only — English only.
// API + static assets must never be prefixed.
const LOCALE_BYPASS_PREFIXES = [
  '/admin',
  '/superadmin',
  '/driver',
  '/api',
  '/maintenance',
  '/_next',
  '/favicon',
  '/images',
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function getLocale(req: NextRequest): string {
  // Explicit user preference takes priority over browser Accept-Language
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && (routing.locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale
  }
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => { headers[key] = value })
  const languages = new Negotiator({ headers }).languages()
  return match(
    languages,
    routing.locales as unknown as string[],
    routing.defaultLocale,
  )
}

function pathHasLocale(pathname: string): boolean {
  return routing.locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
  )
}

function isLocaleBypassed(pathname: string): boolean {
  return LOCALE_BYPASS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
}

function stripLocale(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) return '/'
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(`/${loc}`.length)
  }
  return pathname
}

// ─── Main middleware ──────────────────────────────────────────────────────────
export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // ── 1. Maintenance mode check ─────────────────────────────────────────────
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode) {
    const isBypassed = MAINTENANCE_BYPASS_PREFIXES.some((p) => pathname.startsWith(p))

    if (!isBypassed) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      const role  = token?.role as string | undefined

      if (role !== 'admin' && role !== 'superadmin') {
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    }
  }

  // ── 2. Locale detection — redirect missing-locale URLs ────────────────────
  if (!isLocaleBypassed(pathname) && !pathHasLocale(pathname)) {
    const locale = getLocale(req)
    const redirectPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
    const newUrl = new URL(redirectPath, req.url)
    newUrl.search = req.nextUrl.search
    const res = NextResponse.redirect(newUrl)
    res.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 31536000, sameSite: 'lax' })
    return res
  }

  // ── 3. Auth / role guards (only for protected routes) ────────────────────
  // Note: admin/superadmin/driver paths are NOT under [locale].
  // Customer paths ARE under [locale] (e.g., /en/customer, /hi/customer).
  const cleanPath  = stripLocale(pathname)
  const isProtected =
    pathname.startsWith('/admin')      ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/driver')     ||
    cleanPath.startsWith('/customer')

  if (!isProtected) return NextResponse.next()

  return withAuth(
    function authMiddleware(req: NextRequestWithAuth) {
      const token     = req.nextauth.token
      const pathname  = req.nextUrl.pathname
      const cleanPath = stripLocale(pathname)

      // ── Token-level error checks ──────────────────────────────────────────
      if (token?.error === 'AccountDeactivated') {
        return NextResponse.redirect(new URL('/login?error=account_disabled', req.url))
      }
      if (token?.error === 'SessionExpiredInactivity') {
        return NextResponse.redirect(new URL('/login?reason=inactivity', req.url))
      }

      // ── Superadmin routes (no locale prefix) ──────────────────────────────
      if (pathname.startsWith('/superadmin')) {
        if (token?.role !== 'superadmin') {
          return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
        }
      }

      // ── Admin routes (no locale prefix) ───────────────────────────────────
      if (pathname.startsWith('/admin')) {
        if (token?.role !== 'admin' && token?.role !== 'superadmin') {
          return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
        }
        if (pathname.startsWith('/admin/places') && token?.role !== 'superadmin') {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
      }

      // ── Driver routes (no locale prefix) ──────────────────────────────────
      if (pathname.startsWith('/driver')) {
        if (token?.role !== 'driver') {
          return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
        }
      }

      // ── Customer routes (under [locale]) ─────────────────────────────────
      if (cleanPath.startsWith('/customer')) {
        if (!token) {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }

      return NextResponse.next()
    },
    {
      callbacks: {
        authorized: ({ token, req }) => {
          const p     = req.nextUrl.pathname
          const clean = stripLocale(p)
          if (
            p.startsWith('/admin')      ||
            p.startsWith('/superadmin') ||
            p.startsWith('/driver')     ||
            clean.startsWith('/customer')
          ) {
            return !!token
          }
          return true
        },
      },
    },
  )(req as NextRequestWithAuth, {} as never)
}

// ─── Matcher — includes ALL routes so maintenance mode + locale can intercept
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - _next/static (static files)
     *   - _next/image (image optimisation)
     *   - favicon.ico
     *   - public image files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
