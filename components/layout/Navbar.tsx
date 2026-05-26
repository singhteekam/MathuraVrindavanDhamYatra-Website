'use client'

import { useState, useEffect, useRef } from 'react'
import NextLink from 'next/link'
import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Menu, X, ChevronDown, Mail, MapPin,
  LogIn, LayoutDashboard, Car, CalendarCheck,
  LogOut, User, ShieldCheck,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import Image from "next/image";
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import ThemeSwitcher    from '@/components/shared/ThemeSwitcher'

interface NavChild { labelKey: string; href: string; descKey?: string }
interface NavItem  { labelKey: string; href: string; children?: NavChild[] }

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'home', href: '/' },
  {
    labelKey: 'packages', href: '/packages',
    children: [
      { labelKey: 'packagesChildren.sameDayTour',        href: '/packages/same-day-mathura-vrindavan',        descKey: 'packagesChildren.sameDayTourDesc' },
      { labelKey: 'packagesChildren.twoDays',            href: '/packages/2-days-mathura-vrindavan',          descKey: 'packagesChildren.twoDaysDesc' },
      { labelKey: 'packagesChildren.threeDaysGovardhan', href: '/packages/3-days-mathura-vrindavan-govardhan',descKey: 'packagesChildren.threeDaysGovardhanDesc' },
      { labelKey: 'packagesChildren.fourDays',           href: '/packages/4-days-mathura-vrindavan',          descKey: 'packagesChildren.fourDaysDesc' },
      { labelKey: 'packagesChildren.sevenDays',          href: '/packages/7-days-braj-84-kos-yatra',          descKey: 'packagesChildren.sevenDaysDesc' },
      { labelKey: 'packagesChildren.allPackages',        href: '/packages',                                   descKey: 'packagesChildren.allPackagesDesc' },
    ],
  },
  {
    labelKey: 'places', href: '/places',
    children: [
      { labelKey: 'placesChildren.temples',     href: '/places?type=temple',      descKey: 'placesChildren.templesDesc' },
      { labelKey: 'placesChildren.ghats',       href: '/places?type=ghat',        descKey: 'placesChildren.ghatsDesc' },
      { labelKey: 'placesChildren.sacredSites', href: '/places?type=sacred-site', descKey: 'placesChildren.sacredSitesDesc' },
      { labelKey: 'placesChildren.allPlaces',   href: '/places',                  descKey: 'placesChildren.allPlacesDesc' },
    ],
  },
  { labelKey: 'hotels',      href: '/hotels'      },
  { labelKey: 'restaurants', href: '/restaurants' },
  { labelKey: 'blog',        href: '/blog'        },
  {
    labelKey: 'about', href: '/about',
    children: [
      { labelKey: 'aboutUs',   href: '/about',   descKey: 'aboutChildren.aboutUsDesc' },
      { labelKey: 'faq',       href: '/faq',     descKey: 'aboutChildren.faqDesc' },
      { labelKey: 'contactUs', href: '/contact', descKey: 'aboutChildren.contactDesc' },
    ],
  },
]

const ROLE_CONFIG: Record<string, { portal: string; labelKey: string; icon: React.ReactNode }> = {
  superadmin: { portal: '/superadmin', labelKey: 'superadminPanel', icon: <ShieldCheck     size={14} /> },
  admin:      { portal: '/admin',      labelKey: 'adminPanel',      icon: <LayoutDashboard size={14} /> },
  driver:     { portal: '/driver',     labelKey: 'driverPortal',    icon: <Car             size={14} /> },
  customer:   { portal: '/customer',   labelKey: 'myBookings',      icon: <CalendarCheck   size={14} /> },
}

// ── Profile dropdown ──────────────────────────────────────
function ProfileDropdown() {
  const t                 = useTranslations('ProfileDropdown')
  const { data: session } = useSession()
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)

  const user     = session?.user as { name?: string; email?: string; role?: string } | undefined
  const role     = user?.role ?? 'customer'
  const cfg      = ROLE_CONFIG[role] ?? ROLE_CONFIG.customer
  const initials = (user?.name ?? 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const roleKey  = role === 'admin' ? 'roleAdmin'
                 : role === 'driver' ? 'roleDriver'
                 : role === 'superadmin' ? 'roleSuperadmin'
                 : 'roleCustomer'

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-saffron-300 dark:hover:border-saffron-600 hover:bg-saffron-50 dark:hover:bg-gray-800 transition-all duration-200"
      >
        {/* Avatar circle */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
        >
          {initials}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user?.name?.split(' ')[0] ?? t('user')}</p>
          <p className="text-xs" style={{ color: '#ff7d0f' }}>{t(roleKey)}</p>
        </div>
        <ChevronDown size={12} className={cn('text-gray-400 dark:text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{user?.email}</p>
              <span
                className="inline-flex items-center gap-1.5 mt-2 text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)' }}
              >
                {cfg.icon}{t(roleKey)}
              </span>
            </div>

            {/* Portal — admin/driver use NextLink (not under [locale]); customer uses locale-aware Link */}
            {role === 'customer' ? (
              <Link href={cfg.portal} onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors">
                {cfg.icon}{t(cfg.labelKey)}
              </Link>
            ) : (
              <NextLink href={cfg.portal} onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors">
                {cfg.icon}{t(cfg.labelKey)}
              </NextLink>
            )}

            {/* Profile — same split: admin/driver settings are not localized */}
            {role === 'customer' ? (
              <Link href="/customer" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors">
                <User size={14} />{t('myProfile')}
              </Link>
            ) : (
              <NextLink
                href={role === 'driver' ? '/driver/profile' : role === 'superadmin' ? '/superadmin' : '/admin/settings'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                <User size={14} />{t('myProfile')}
              </NextLink>
            )}

            {/* My bookings - customer only */}
            {role === 'customer' && (
              <Link href="/customer" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors">
                <CalendarCheck size={14} />{t('myBookings')}
              </Link>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={14} />{t('signOut')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Navbar ───────────────────────────────────────────
export default function Navbar() {
  const t                                      = useTranslations('Navigation')
  const { status }                             = useSession()
  const [scrolled,       setScrolled]          = useState(false)
  const [mobileOpen,     setMobileOpen]        = useState(false)
  const [openDropdown,   setOpenDropdown]      = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded]    = useState<string | null>(null)
  const pathname                               = usePathname()
  const isLoggedIn                             = status === 'authenticated'
  const isLoading                              = status === 'loading'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false); setOpenDropdown(null); setMobileExpanded(null)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block text-xs py-2 bg-saffron-600 dark:bg-gray-900 text-white dark:text-gray-300 border-b border-transparent dark:border-gray-800">
        <div className="container-custom flex justify-between items-center">
          <span className="flex items-center gap-1.5"><MapPin size={11} />{t('topBarLocation')}</span>
          <div className="flex items-center gap-6">
            <a href={`tel:${siteConfig.phone}`}  className="flex items-center gap-1.5 hover:text-amber-200 dark:hover:text-saffron-400 transition-colors"><Phone size={11} />{siteConfig.phone}</a>
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-1.5 hover:text-amber-200 dark:hover:text-saffron-400 transition-colors"><Mail  size={11} />{siteConfig.email}</a>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md'
          : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800',
      )}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              {/* <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-saffron-500 to-saffron-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-hindi)' }}>🪈</span>
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="font-bold text-gray-900 text-base" style={{ fontFamily: 'var(--font-serif)' }}>Mathura Vrindavan</p>
                <p className="text-saffron-500 text-xs font-semibold tracking-widest uppercase">Dham Yatra</p>
              </div> */}

              <div className="relative w-24 h-12 sm:w-36 sm:h-14 md:w-48 md:h-20 shrink-0 md:-ml-10">
                <Image
                  src="/logo/logo128x128.png"
                  alt="Mathura Vrindavan Dham Yatra Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <div key={item.labelKey} className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.labelKey)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      pathname === item.href
                        ? 'text-saffron-600 bg-saffron-50 dark:bg-saffron-900/30 dark:text-saffron-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-saffron-600 dark:hover:text-saffron-400 hover:bg-saffron-50 dark:hover:bg-gray-800',
                    )}>
                    {t(item.labelKey)}
                    {item.children && (
                      <ChevronDown size={13} className={cn('mt-px transition-transform duration-200', openDropdown === item.labelKey && 'rotate-180')} />
                    )}
                  </Link>
                  <AnimatePresence>
                    {item.children && openDropdown === item.labelKey && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.13 }}
                        className="absolute top-full left-0 mt-1.5 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}
                            className="flex flex-col px-4 py-3 hover:bg-saffron-50 dark:hover:bg-gray-800 transition-colors group">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-saffron-600 dark:group-hover:text-saffron-400">{t(child.labelKey)}</span>
                            {child.descKey && <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t(child.descKey)}</span>}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right CTAs */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <a href={`tel:${siteConfig.phone}`}
                className="hidden md:flex items-center gap-2 bg-saffron-50 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-400 px-4 py-2 rounded-full text-sm font-semibold hover:bg-saffron-100 dark:hover:bg-saffron-900/50 transition-colors">
                <Phone size={14} />{t('callNow')}
              </a>

              {/* Theme switcher */}
              <ThemeSwitcher />

              {/* Language switcher */}
              <LanguageSwitcher />

              {/* Auth section */}
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
              ) : isLoggedIn ? (
                <ProfileDropdown />
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login"
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-saffron-600 dark:hover:text-saffron-400 px-3 py-2 rounded-lg hover:bg-saffron-50 dark:hover:bg-gray-800 transition-colors">
                    <LogIn size={15} />{t('signIn')}
                  </Link>
                  <Link href="/booking" className="btn-primary text-sm px-5 py-2.5">
                    {t('bookNow')}
                  </Link>
                </div>
              )}


              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 z-50 lg:hidden flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                {/* <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-saffron-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold" style={{ fontFamily: 'var(--font-hindi)' }}>ॐ</span>
                  </div>
                  <span className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>MVTravel</span>
                </div> */}

                <div className="relative w-32 h-12 shrink-0">
                  <Image
                    src="/logo/logo128x128.png"
                    alt="Mathura Vrindavan Dham Yatra Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 p-4 space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <div key={item.labelKey}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => setMobileExpanded(mobileExpanded === item.labelKey ? null : item.labelKey)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400 font-medium text-sm transition-colors"
                        >
                          {t(item.labelKey)}
                          <ChevronDown size={15} className={cn('transition-transform duration-200', mobileExpanded === item.labelKey && 'rotate-180')} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === item.labelKey && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 pl-3 border-l-2 border-saffron-100 dark:border-saffron-900/40 mt-1 mb-1 space-y-0.5">
                                {item.children.map((child) => (
                                  <Link key={child.href} href={child.href}
                                    className="block px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-saffron-600 dark:hover:text-saffron-400 hover:bg-saffron-50 dark:hover:bg-gray-800 transition-colors">
                                    {t(child.labelKey)}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link href={item.href}
                        className={cn('flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors',
                          pathname === item.href
                            ? 'bg-saffron-50 dark:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400',
                        )}>
                        {t(item.labelKey)}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile theme + language switchers */}
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <ThemeSwitcher    variant="mobile" />
                  <LanguageSwitcher variant="mobile" />
                </div>
              </nav>

              {/* Footer CTAs */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3 flex-shrink-0">
                {isLoggedIn ? (
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut size={15} />{t('signOut')}
                  </button>
                ) : (
                  <>
                    <Link href="/booking" className="btn-primary w-full text-sm py-3">{t('bookATour')}</Link>
                    <Link href="/login"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <LogIn size={15} />{t('signIn')}
                    </Link>
                  </>
                )}
                <a href={`tel:${siteConfig.phone}`} className="btn-secondary w-full text-sm py-3">
                  <Phone size={15} />{siteConfig.phone}
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}