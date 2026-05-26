'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarCheck,
  IndianRupee, User, LogOut, Menu, X,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import SimpleThemeSwitcher from '@/components/shared/SimpleThemeSwitcher'

const NAV = [
  { href: '/driver',            icon: <LayoutDashboard size={18} />, label: 'Dashboard'   },
  { href: '/driver/trips',      icon: <CalendarCheck   size={18} />, label: 'My Trips'    },
  { href: '/driver/earnings',   icon: <IndianRupee     size={18} />, label: 'Earnings'    },
  { href: '/driver/profile',    icon: <User            size={18} />, label: 'Profile'     },
]

export default function DriverSidebarWrapper() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/driver' ? pathname === '/driver' : pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="w-9 h-9 bg-saffron-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold" style={{ fontFamily: 'var(--font-hindi)' }}>ॐ</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm">MVTravel</p>
          <p className="text-gray-400 text-xs">Driver Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive(item.href)
                ? 'bg-saffron-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10',
            )}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Theme + Sign out */}
      <div className="p-3 space-y-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="px-1 pb-1">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 px-1">Theme</p>
          <SimpleThemeSwitcher />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{ background: '#111827', minHeight: '100vh' }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 shadow-md"
        style={{ background: '#111827' }}>
        <button onClick={() => setMobileOpen(true)} className="text-white">
          <Menu size={22} />
        </button>
        <span className="text-white font-bold text-sm">Driver Portal</span>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-56 z-50 lg:hidden"
              style={{ background: '#111827' }}>
              <div className="flex justify-end p-3">
                <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}