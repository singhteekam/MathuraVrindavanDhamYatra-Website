'use client'

import { useState }    from 'react'
import Link             from 'next/link'
import { usePathname }  from 'next/navigation'
import { signOut }      from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MapPin, Package, Users, Settings,
  LogOut, Menu, X, Key, ShieldCheck, ChevronRight,
  UtensilsCrossed, Hotel, UserCircle,
} from 'lucide-react'
import SimpleThemeSwitcher from '@/components/shared/SimpleThemeSwitcher'

const NAV = [
  { href: '/superadmin',               icon: <LayoutDashboard  size={18} />, label: 'Dashboard'   },
  { href: '/superadmin/places',        icon: <MapPin           size={18} />, label: 'Places'      },
  { href: '/superadmin/packages',      icon: <Package          size={18} />, label: 'Packages'    },
  { href: '/superadmin/restaurants',   icon: <UtensilsCrossed  size={18} />, label: 'Restaurants' },
  { href: '/superadmin/hotels',        icon: <Hotel            size={18} />, label: 'Hotels'      },
  { href: '/superadmin/users',         icon: <Users            size={18} />, label: 'Users'       },
  { href: '/superadmin/owner',         icon: <UserCircle       size={18} />, label: 'Owner'       },
  { href: '/superadmin/settings',      icon: <Settings         size={18} />, label: 'Settings'    },
]

export default function SuperadminSidebarWrapper() {
  const pathname          = usePathname()
  const [open, setOpen]   = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    href === '/superadmin' ? pathname === href : pathname.startsWith(href)

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #0f0e2a 0%, #1e1b4b 100%)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
          <ShieldCheck size={18} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">Superadmin</p>
            <p className="text-xs text-indigo-400 truncate">Full Access</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}
              onClick={() => mobile && setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: active ? 'rgba(99,102,241,0.25)' : 'transparent',
                color:      active ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
                borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
              }}>
              <span className="shrink-0"
                style={{ color: active ? '#818cf8' : 'rgba(255,255,255,0.45)' }}>
                {item.icon}
              </span>
              {(!collapsed || mobile) && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {(!collapsed || mobile) && active && (
                <ChevronRight size={14} className="ml-auto text-indigo-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Admin portal quick link */}
      {(!collapsed || mobile) && (
        <div className="px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/admin"
            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-3">
            <Key size={12} />Switch to Admin Panel
          </Link>
        </div>
      )}

      {/* Theme + Sign out */}
      <div className="px-3 py-3 space-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {(!collapsed || mobile) && (
          <div className="px-1 pb-1">
            <p className="text-[10px] text-indigo-400/60 uppercase tracking-wider mb-1.5 px-1">Theme</p>
            <SimpleThemeSwitcher />
          </div>
        )}
        <button type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-150 hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          <LogOut size={16} />
          {(!collapsed || mobile) && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-col shrink-0 transition-all duration-200"
        style={{ width: collapsed ? '64px' : '220px' }}>
        <div className="relative h-full">
          <SidebarContent />
          {/* Collapse toggle */}
          <button type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
            style={{ background: '#312e81', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }}>
            {collapsed ? <ChevronRight size={12} /> : <X size={12} />}
          </button>
        </div>
      </div>

      {/* ── Mobile hamburger ── */}
      <button type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: '#1e1b4b', color: '#a5b4fc' }}>
        <Menu size={18} />
      </button>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden overflow-y-auto">
              <SidebarContent mobile />
              <button type="button" onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#a5b4fc' }}>
                <X size={14} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}