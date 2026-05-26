'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion }              from 'framer-motion'
import Link                    from 'next/link'
import {
  MapPin, Package, Users, BookOpen, Star,
  ShieldCheck, Settings, ArrowRight, DollarSign,
  Clock, CheckCircle, XCircle, MessageSquare,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsData {
  // New fields added to API
  totalPackages:  number
  totalPlaces:    number
  totalReviews:   number
  pendingReviews: number
  totalUsers:     number
  // Existing nested fields
  bookings: {
    total:     number
    thisMonth: number
    pending:   number
    completed: number
    cancelled: number
    growth:    number
  }
  revenue: {
    total:     number
    thisMonth: number
  }
  users: {
    totalCustomers:  number
    totalDrivers:    number
    availableDrivers:number
  }
  enquiries: {
    unread: number
  }
}

function StatCard({
  label, value, icon, color, bg, href, delay,
}: {
  label: string; value: string | number; icon: React.ReactNode
  color: string; bg: string; href: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}>
      <Link href={href} className="card card-hover rounded-2xl p-5 flex flex-col h-full block">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
          style={{ background: bg, color }}>
          {icon}
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </Link>
    </motion.div>
  )
}

export default function SuperadminDashboard() {
  const [stats,   setStats]   = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (data.success) {
          setStats(data.data)
        } else {
          setError(data.error ?? 'Failed to load stats.')
        }
      })
      .catch((err) => {
        console.error('[Superadmin dashboard]', err)
        setError('Could not connect to the server.')
      })
      .finally(() => setLoading(false))
  }, [])

  const s = stats

  const STAT_CARDS = [
    { label: 'Sacred Places',    value: s?.totalPlaces    ?? 0, icon: <MapPin    size={20} />, color: '#ff7d0f', bg: 'var(--surface-saffron)', href: '/superadmin/places'   },
    { label: 'Tour Packages',    value: s?.totalPackages  ?? 0, icon: <Package   size={20} />, color: '#4338ca', bg: 'var(--surface-krishna)', href: '/superadmin/packages' },
    { label: 'Total Customers',  value: s?.users?.totalCustomers ?? 0, icon: <Users size={20} />, color: '#16a34a', bg: 'var(--surface-green)', href: '/superadmin/users' },
    { label: 'Total Bookings',   value: s?.bookings?.total ?? 0, icon: <BookOpen size={20} />, color: '#0ea5e9', bg: 'var(--surface-blue)', href: '/admin/bookings' },
    { label: 'Published Reviews',value: s?.totalReviews   ?? 0, icon: <Star      size={20} />, color: '#f59e0b', bg: 'var(--surface-amber)', href: '/admin/reviews'  },
    { label: 'Pending Reviews',  value: s?.pendingReviews ?? 0, icon: <Clock     size={20} />, color: '#dc2626', bg: 'var(--surface-red)', href: '/admin/reviews'  },
    { label: 'This Month Revenue', value: formatCurrency(s?.revenue?.thisMonth ?? 0), icon: <DollarSign size={20} />, color: '#16a34a', bg: 'var(--surface-green)', href: '/admin/analytics' },
    { label: 'Unread Enquiries', value: s?.enquiries?.unread ?? 0, icon: <MessageSquare size={20} />, color: '#7c3aed', bg: 'var(--surface-krishna)', href: '/admin/enquiries' },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
            <ShieldCheck size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Superadmin Dashboard
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-12">
          Full platform control — places, settings, packages and all users.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6"
          style={{ background: 'var(--surface-red)', border: '1px solid var(--surface-red-border)' }}>
          <XCircle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Failed to load stats</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card rounded-2xl p-5 animate-pulse">
              <div className="h-10 w-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-7 w-16 bg-gray-100 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Booking status breakdown */}
      {s && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-saffron-500" />Booking Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Pending',   value: s.bookings.pending,   icon: <Clock size={15} />,         color: '#d97706', bg: 'var(--surface-amber)' },
              { label: 'Completed', value: s.bookings.completed, icon: <CheckCircle size={15} />,   color: '#16a34a', bg: 'var(--surface-green)' },
              { label: 'Cancelled', value: s.bookings.cancelled, icon: <XCircle size={15} />,       color: '#dc2626', bg: 'var(--surface-red)' },
              { label: 'This Month',value: s.bookings.thisMonth, icon: <ArrowRight size={15} />,    color: '#4338ca', bg: 'var(--surface-krishna)' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 text-center"
                style={{ background: item.bg }}>
                <div className="flex items-center justify-center gap-1.5 mb-1"
                  style={{ color: item.color }}>
                  {item.icon}
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-5">
        {[
          {
            title: '🗺️ Manage Places',
            desc:  'Add, edit, or feature sacred places — temples, ghats, and heritage sites.',
            href:  '/superadmin/places',
            newHref: '/superadmin/places/new',
          },
          {
            title: '⚙️ Site Settings',
            desc:  'Update business info, contact details, SMTP config, and booking rules.',
            href:  '/superadmin/settings',
            newHref: null,
          },
          {
            title: '👥 User Management',
            desc:  'View all users, change roles, activate or deactivate accounts.',
            href:  '/superadmin/users',
            newHref: null,
          },
          {
            title: '📦 Package Management',
            desc:  'Create and manage tour packages — pricing, itinerary, and visibility.',
            href:  '/superadmin/packages',
            newHref: '/admin/packages/new',
          },
        ].map((action, i) => (
          <motion.div key={action.title}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.07 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{action.desc}</p>
            <div className="flex gap-2">
              <Link href={action.href}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                View All <ArrowRight size={12} />
              </Link>
              {action.newHref && (
                <Link href={action.newHref}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                  style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                  + Add New
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin panel link */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="mt-6 p-4 rounded-2xl flex items-center gap-3"
        style={{ background: 'var(--bg-surface-muted)', border: '1px solid #f3f4f6' }}>
        <Settings size={16} className="text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-500 flex-1">
          For bookings, drivers, customers, and reviews — use the{' '}
          <Link href="/admin" className="font-semibold text-saffron-600 hover:underline">
            Admin Panel ↗
          </Link>
        </p>
      </motion.div>
    </div>
  )
}