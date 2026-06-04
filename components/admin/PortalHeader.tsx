'use client'

import { useState, useRef, useEffect } from 'react'
import NextLink           from 'next/link'
import { usePathname }    from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image              from 'next/image'
import {
  ChevronDown, ExternalLink, LogOut, Settings, User,
  LayoutDashboard, ShieldCheck, Activity, Package, MapPin,
  Hotel, UtensilsCrossed, Users, UserCircle, BookOpen,
  CalendarCheck, Car, BarChart2, MessageSquare, Star,
  FileText, Sun, Moon, Monitor, Globe,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const PUBLIC_LINKS = [
  { label: 'Home',         href: '/en'             },
  { label: 'Packages',     href: '/en/packages'     },
  { label: 'Places',       href: '/en/places'       },
  { label: 'Hotels',       href: '/en/hotels'       },
  { label: 'Restaurants',  href: '/en/restaurants'  },
  { label: 'Blog',         href: '/en/blog'         },
]

// Role-specific navigation items
const ADMIN_NAV = [
  { label: 'Dashboard',   href: '/admin',              icon: <LayoutDashboard size={14} /> },
  { label: 'Bookings',    href: '/admin/bookings',     icon: <CalendarCheck   size={14} /> },
  { label: 'Packages',    href: '/admin/packages',     icon: <Package         size={14} /> },
  { label: 'Drivers',     href: '/admin/drivers',      icon: <Car             size={14} /> },
  { label: 'Enquiries',   href: '/admin/enquiries',    icon: <MessageSquare   size={14} /> },
  { label: 'Reviews',     href: '/admin/reviews',      icon: <Star            size={14} /> },
  { label: 'Customers',   href: '/admin/customers',    icon: <Users           size={14} /> },
  { label: 'Analytics',   href: '/admin/analytics',    icon: <BarChart2       size={14} /> },
  { label: 'Settings',    href: '/admin/settings',     icon: <Settings        size={14} /> },
]

const SUPERADMIN_NAV = [
  { label: 'Dashboard',   href: '/superadmin',                         icon: <LayoutDashboard size={14} /> },
  { label: 'Visitors',    href: '/superadmin/visitor-analytics',       icon: <Activity        size={14} /> },
  { label: 'Places',      href: '/superadmin/places',                  icon: <MapPin          size={14} /> },
  { label: 'Packages',    href: '/superadmin/packages',                icon: <Package         size={14} /> },
  { label: 'Hotels',      href: '/superadmin/hotels',                  icon: <Hotel           size={14} /> },
  { label: 'Restaurants', href: '/superadmin/restaurants',             icon: <UtensilsCrossed size={14} /> },
  { label: 'Users',       href: '/superadmin/users',                   icon: <Users           size={14} /> },
  { label: 'Owner',       href: '/superadmin/owner',                   icon: <UserCircle      size={14} /> },
  { label: 'Settings',    href: '/superadmin/settings',                icon: <Settings        size={14} /> },
]

// ── Theme toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-7 h-7" />
  const options = [
    { value: 'light',  icon: <Sun     size={13} /> },
    { value: 'dark',   icon: <Moon    size={13} /> },
    { value: 'system', icon: <Monitor size={13} /> },
  ] as const
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--bg-surface-muted)' }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => setTheme(opt.value)}
          className={cn('p-1.5 rounded-md transition-all', theme === opt.value
            ? 'bg-saffron-500 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          )}>
          {opt.icon}
        </button>
      ))}
    </div>
  )
}

// ── Portal header ─────────────────────────────────────────────────────────────
export default function PortalHeader({ role }: { role: 'admin' | 'superadmin' }) {
  const pathname                    = usePathname()
  const { data: session }           = useSession()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [userOpen, setUserOpen]     = useState(false)
  const [siteOpen, setSiteOpen]     = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const siteRef = useRef<HTMLDivElement>(null)

  const user  = session?.user as { name?: string; email?: string; role?: string } | undefined
  const nav   = role === 'superadmin' ? SUPERADMIN_NAV : ADMIN_NAV
  const badge = role === 'superadmin'
    ? { label: 'Superadmin', bg: '#1e1b4b', color: '#a5b4fc' }
    : { label: 'Admin',      bg: '#7c2c00', color: '#fdba74' }

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
      if (siteRef.current && !siteRef.current.contains(e.target as Node)) setSiteOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <header
      className="shrink-0 border-b flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-12"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-muted)' }}
    >
      {/* Logo */}
      <NextLink href={`/${role}`} className="shrink-0 flex items-center gap-2">
        <div className="relative w-20 h-7 sm:w-28 sm:h-8">
          <Image src="/logo/logo128x128.png" alt="Logo" fill className="object-contain" priority />
        </div>
        <span
          className="hidden xs:inline text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </NextLink>

      <span className="text-gray-200 dark:text-gray-700 hidden sm:inline">|</span>

      {/* Nav dropdown (portal pages) */}
      <div ref={menuRef} className="relative hidden sm:block">
        <button
          onClick={() => { setMenuOpen(!menuOpen); setSiteOpen(false); setUserOpen(false) }}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
          style={menuOpen
            ? { background: 'var(--surface-saffron)', color: '#ff7d0f' }
            : { color: 'var(--text-muted)', background: 'transparent' }}
        >
          <LayoutDashboard size={13} />
          <span className="hidden md:inline">Navigate</span>
          <ChevronDown size={11} className={cn('transition-transform', menuOpen && 'rotate-180')} />
        </button>
        {menuOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-52 rounded-2xl shadow-xl border py-2 z-50"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-muted)' }}>
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: badge.color }}>
              {badge.label} Panel
            </p>
            {nav.map(item => (
              <NextLink key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors',
                  pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
                    ? 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                )}>
                <span className="text-saffron-500 shrink-0">{item.icon}</span>
                {item.label}
              </NextLink>
            ))}
          </div>
        )}
      </div>

      {/* View Site dropdown */}
      <div ref={siteRef} className="relative ml-auto sm:ml-0">
        <button
          onClick={() => { setSiteOpen(!siteOpen); setMenuOpen(false); setUserOpen(false) }}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
          style={siteOpen
            ? { background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }
            : { color: 'var(--text-muted)' }}
        >
          <Globe size={13} />
          <span className="hidden sm:inline">View Site</span>
          <ChevronDown size={11} className={cn('transition-transform', siteOpen && 'rotate-180')} />
        </button>
        {siteOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl shadow-xl border py-2 z-50"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-muted)' }}>
            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Public Pages
            </p>
            {PUBLIC_LINKS.map(link => (
              <NextLink key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                onClick={() => setSiteOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors font-medium">
                {link.label}
                <ExternalLink size={9} className="opacity-50" />
              </NextLink>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <ThemeToggle />

      {/* User dropdown */}
      <div ref={userRef} className="relative">
        <button
          onClick={() => { setUserOpen(!userOpen); setMenuOpen(false); setSiteOpen(false) }}
          className="flex items-center gap-2 px-2 py-1 rounded-xl border transition-all"
          style={{ borderColor: 'var(--border-default)', background: 'transparent' }}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: role === 'superadmin' ? 'linear-gradient(135deg, #4338ca, #1e1b4b)' : 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            {(user?.name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-20 truncate">
            {user?.name?.split(' ')[0] ?? 'Admin'}
          </span>
          <ChevronDown size={11} className={cn('text-gray-400 transition-transform', userOpen && 'rotate-180')} />
        </button>
        {userOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl shadow-xl border py-2 z-50"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-muted)' }}>
            {/* Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-muted)' }}>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                style={{ background: badge.bg, color: badge.color }}>
                <ShieldCheck size={9} />{badge.label}
              </span>
            </div>
            {/* Profile link */}
            <NextLink href={role === 'superadmin' ? '/superadmin' : '/admin/settings'}
              onClick={() => setUserOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 transition-colors">
              <User size={14} />My Profile
            </NextLink>
            {role === 'superadmin' && (
              <NextLink href="/admin"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 transition-colors">
                <LayoutDashboard size={14} />Admin Panel
              </NextLink>
            )}
            <div className="border-t my-1" style={{ borderColor: 'var(--border-muted)' }} />
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut size={14} />Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
