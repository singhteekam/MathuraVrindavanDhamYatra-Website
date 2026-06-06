'use client'

import { useState, useRef, useEffect } from 'react'
import NextLink           from 'next/link'
import { usePathname }    from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image              from 'next/image'
import {
  Menu, ChevronDown, ExternalLink, LogOut, User, Globe,
  LayoutDashboard, ShieldCheck, Activity, Package, MapPin,
  Hotel, UtensilsCrossed, Users, UserCircle,
  CalendarCheck, Car, BarChart2, MessageSquare, Star,
  Settings, Sun, Moon, Monitor,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

/* ── Public site links ────────────────────────────────────────────────────── */
const PUBLIC_LINKS = [
  { label: 'Home',         href: '/en'             },
  { label: 'Packages',     href: '/en/packages'     },
  { label: 'Places',       href: '/en/places'       },
  { label: 'Hotels',       href: '/en/hotels'       },
  { label: 'Restaurants',  href: '/en/restaurants'  },
  { label: 'Blog',         href: '/en/blog'         },
]

/* ── Role nav items ────────────────────────────────────────────────────────── */
const ADMIN_NAV = [
  { label: 'Dashboard',  href: '/admin',              icon: LayoutDashboard },
  { label: 'Bookings',   href: '/admin/bookings',     icon: CalendarCheck   },
  { label: 'Packages',   href: '/admin/packages',     icon: Package         },
  { label: 'Drivers',    href: '/admin/drivers',      icon: Car             },
  { label: 'Enquiries',  href: '/admin/enquiries',    icon: MessageSquare   },
  { label: 'Reviews',    href: '/admin/reviews',      icon: Star            },
  { label: 'Customers',  href: '/admin/customers',    icon: Users           },
  { label: 'Analytics',  href: '/admin/analytics',    icon: BarChart2       },
  { label: 'Settings',   href: '/admin/settings',     icon: Settings        },
]

const SUPERADMIN_NAV = [
  { label: 'Dashboard',   href: '/superadmin',                        icon: LayoutDashboard },
  { label: 'Visitors',    href: '/superadmin/visitor-analytics',      icon: Activity        },
  { label: 'Places',      href: '/superadmin/places',                 icon: MapPin          },
  { label: 'Packages',    href: '/superadmin/packages',               icon: Package         },
  { label: 'Hotels',      href: '/superadmin/hotels',                 icon: Hotel           },
  { label: 'Restaurants', href: '/superadmin/restaurants',            icon: UtensilsCrossed },
  { label: 'Users',       href: '/superadmin/users',                  icon: Users           },
  { label: 'Owner',       href: '/superadmin/owner',                  icon: UserCircle      },
  { label: 'Settings',    href: '/superadmin/settings',               icon: Settings        },
]

/* ── Theme pill ───────────────────────────────────────────────────────────── */
function ThemePill() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const opts = [
    { v: 'light',  Icon: Sun     },
    { v: 'dark',   Icon: Moon    },
    { v: 'system', Icon: Monitor },
  ] as const
  return (
    <div className="flex items-center gap-0.5 px-0.5 h-7 rounded-lg"
      style={{ background: 'var(--bg-surface-muted)' }}>
      {opts.map(({ v, Icon }) => (
        <button key={v} onClick={() => setTheme(v)}
          className={cn('w-6 h-6 rounded-md flex items-center justify-center transition-all',
            theme === v ? 'bg-saffron-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          )}>
          <Icon size={12} />
        </button>
      ))}
    </div>
  )
}

/* ── Dropdown shell ───────────────────────────────────────────────────────── */
function Dropdown({
  trigger, children, align = 'left',
}: { trigger: React.ReactNode; children: React.ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(p => !p)}>{trigger}</div>
      {open && (
        <div
          className={cn('absolute top-full mt-2 z-[60] rounded-2xl shadow-2xl border overflow-hidden',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          style={{
            background:   'var(--bg-surface)',
            borderColor:  'var(--border-muted)',
            minWidth:     '200px',
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Main PortalHeader ────────────────────────────────────────────────────── */
export default function PortalHeader({ role }: { role: 'admin' | 'superadmin' }) {
  const pathname          = usePathname()
  const { data: session } = useSession()

  const user  = session?.user as { name?: string; email?: string } | undefined
  const nav   = role === 'superadmin' ? SUPERADMIN_NAV : ADMIN_NAV
  const accent = role === 'superadmin'
    ? { gradient: 'linear-gradient(135deg, #4338ca, #1e1b4b)', text: '#a5b4fc', border: '#312e81', label: 'Superadmin' }
    : { gradient: 'linear-gradient(135deg, #ff7d0f, #c74a06)',  text: '#fdba74', border: '#9a3412', label: 'Admin'      }

  /* Open mobile sidebar via custom event — sidebar wrappers listen for this */
  function openSidebar() {
    window.dispatchEvent(new CustomEvent('panel-sidebar-open'))
  }

  return (
    <header className="shrink-0 sticky top-0 z-30 h-14 flex items-center px-4 gap-3 border-b"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-muted)' }}>

      {/* Hamburger (mobile only) */}
      <button onClick={openSidebar}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0"
        style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
        <Menu size={17} />
      </button>

      {/* Logo + role badge */}
      <NextLink href={`/${role}`} className="flex items-center gap-2.5 shrink-0">
        <div className="relative w-24 h-8 sm:w-32 sm:h-9">
          <Image src="/logo/logo128x128.png" alt="Logo" fill className="object-contain" priority />
        </div>
        <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
          style={{ background: accent.gradient, color: '#fff' }}>
          {accent.label}
        </span>
      </NextLink>

      {/* Desktop nav items — visible on lg+ */}
      <nav className="hidden lg:flex items-center gap-0.5 ml-3">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive = href === `/${role}` ? pathname === href : pathname.startsWith(href)
          return (
            <NextLink key={href} href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-saffron-50 dark:bg-saffron-900/25 text-saffron-600 dark:text-saffron-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
              )}>
              <Icon size={13} className="shrink-0" />
              {label}
            </NextLink>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-2">

        {/* View site dropdown */}
        <Dropdown align="right" trigger={
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200">
            <Globe size={13} />
            <span className="hidden md:inline">View Site</span>
            <ChevronDown size={10} />
          </button>
        }>
          <div className="py-2">
            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Public Pages</p>
            {PUBLIC_LINKS.map(link => (
              <NextLink key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 transition-colors font-medium">
                {link.label}
                <ExternalLink size={9} className="opacity-40" />
              </NextLink>
            ))}
          </div>
        </Dropdown>

        {/* Theme toggle */}
        <ThemePill />

        {/* User dropdown */}
        <Dropdown align="right" trigger={
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all hover:border-saffron-300 dark:hover:border-saffron-700"
            style={{ borderColor: 'var(--border-default)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: accent.gradient }}>
              {(user?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight max-w-20 truncate">
                {user?.name?.split(' ')[0] ?? 'Admin'}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: role === 'superadmin' ? '#818cf8' : '#ff7d0f' }}>
                {accent.label}
              </p>
            </div>
            <ChevronDown size={11} className="text-gray-400 hidden sm:block" />
          </button>
        }>
          <div className="py-2">
            {/* Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-muted)' }}>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded text-white"
                style={{ background: accent.gradient }}>
                <ShieldCheck size={9} />{accent.label}
              </span>
            </div>
            <NextLink href={role === 'superadmin' ? '/superadmin' : '/admin/settings'}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 transition-colors">
              <User size={14} />My Profile
            </NextLink>
            {role === 'superadmin' && (
              <NextLink href="/admin"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800 hover:text-saffron-600 transition-colors">
                <LayoutDashboard size={14} />Admin Panel
              </NextLink>
            )}
            <div className="h-px my-1" style={{ background: 'var(--border-muted)' }} />
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut size={14} />Sign Out
            </button>
          </div>
        </Dropdown>
      </div>
    </header>
  )
}
