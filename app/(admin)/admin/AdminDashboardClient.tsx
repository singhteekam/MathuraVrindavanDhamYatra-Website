'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarCheck, IndianRupee, Users, Car,
  Mail, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Plus, Eye,
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import StatCard from '@/components/admin/StatCard'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Stats {
  bookings: {
    total: number; thisMonth: number; pending: number
    completed: number; cancelled: number; growth: number
    byStatus: { _id: string; count: number }[]
  }
  revenue:  { total: number; thisMonth: number }
  users:    { totalCustomers: number; totalDrivers: number; availableDrivers: number }
  enquiries:{ unread: number }
  recentBookings: {
    _id: string; bookingId: string; status: string
    startDate: string; totalAmount: number; carName: string
    customer: { name: string; phone: string }
  }[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:         { label: 'Pending',         color: '#d97706', bg: 'var(--surface-amber)',   icon: <Clock      size={13} /> },
  confirmed:       { label: 'Confirmed',       color: '#2563eb', bg: 'var(--surface-blue)',    icon: <CheckCircle size={13} /> },
  driver_assigned: { label: 'Driver Assigned', color: '#7c3aed', bg: 'var(--surface-krishna)', icon: <Car         size={13} /> },
  ongoing:         { label: 'Ongoing',         color: '#16a34a', bg: 'var(--surface-green)',   icon: <RefreshCw   size={13} /> },
  completed:       { label: 'Completed',       color: '#16a34a', bg: 'var(--surface-green)',   icon: <CheckCircle size={13} /> },
  cancelled:       { label: 'Cancelled',       color: '#dc2626', bg: 'var(--surface-red)',     icon: <XCircle     size={13} /> },
}

const QUICK_ACTIONS = [
  { label: 'Add Package',  href: '/admin/packages/new',  icon: <Plus size={16} />, color: '#ff7d0f', bg: 'var(--surface-saffron)' },
  { label: 'Add Place',    href: '/admin/places/new',    icon: <Plus size={16} />, color: '#4338ca', bg: 'var(--surface-krishna)', superadminOnly: true },
  { label: 'Add Driver',   href: '/admin/drivers/new',   icon: <Plus size={16} />, color: '#16a34a', bg: 'var(--surface-green)'   },
  { label: 'View Bookings',href: '/admin/bookings',      icon: <Eye  size={16} />, color: '#db2777', bg: 'var(--surface-red)'     },
]

export default function AdminDashboardClient() {
  const { data: session }  = useSession()
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const role = (session?.user as { role?: string } | undefined)?.role
  const quickActions = QUICK_ACTIONS.filter((action) => !action.superadminOnly || role === 'superadmin')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); else setError('Failed to load stats.') })
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-10 pt-20 lg:pt-10">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !stats) return (
    <div className="flex-1 p-8 lg:p-10 pt-20 lg:pt-10">
      <div className="card rounded-2xl p-8 text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold">{error || 'No data'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4 text-sm py-2 px-5">
          Retry
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title={`Good ${new Date().getHours() < 12 ? 'Morning' : 'Evening'}, Admin 🙏`}
        crumbs={[{ label: 'Dashboard' }]}
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Bookings',
            value: stats.bookings.total,
            icon:  <CalendarCheck size={20} />,
            color: '#ff7d0f', bg: 'var(--surface-saffron)',
            growth: stats.bookings.growth,
            sub:   `${stats.bookings.thisMonth} this month`,
          },
          {
            label: 'Total Revenue',
            value: stats.revenue.total,
            icon:  <IndianRupee size={20} />,
            color: '#16a34a', bg: 'var(--surface-green)',
            isCurrency: true,
            sub: `${formatCurrency(stats.revenue.thisMonth)} this month`,
          },
          {
            label: 'Customers',
            value: stats.users.totalCustomers,
            icon:  <Users size={20} />,
            color: '#4338ca', bg: 'var(--surface-krishna)',
            sub:   `${stats.users.totalDrivers} drivers`,
          },
          {
            label: 'Unread Enquiries',
            value: stats.enquiries.unread,
            icon:  <Mail size={20} />,
            color: '#db2777', bg: 'var(--surface-red)',
            sub:   stats.enquiries.unread > 0 ? 'Needs attention' : 'All caught up',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Booking status breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card rounded-2xl p-5 lg:col-span-1"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Booking Status</h3>
          <div className="space-y-3">
            {[
              { key: 'pending',   value: stats.bookings.pending    },
              { key: 'completed', value: stats.bookings.completed  },
              { key: 'cancelled', value: stats.bookings.cancelled  },
            ].map(({ key, value }) => {
              const cfg = STATUS_CONFIG[key]
              const pct = stats.bookings.total > 0
                ? Math.round((value / stats.bookings.total) * 100)
                : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 font-medium" style={{ color: cfg.color }}>
                      {cfg.icon}{cfg.label}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cfg.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Driver availability */}
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border-muted)' }}>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">Driver Availability</h4>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.users.availableDrivers}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Available</p>
              </div>
              <div className="h-10 w-px bg-gray-100 dark:bg-gray-800" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.users.totalDrivers - stats.users.availableDrivers}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">On Trip</p>
              </div>
              <div className="h-10 w-px bg-gray-100 dark:bg-gray-800" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.users.totalDrivers}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card rounded-2xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Recent Bookings</h3>
            <Link href="/admin/bookings"
              className="text-xs font-semibold"
              style={{ color: '#ff7d0f' }}>
              View all →
            </Link>
          </div>

          {stats.recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No bookings yet</div>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((b) => {
                const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending
                return (
                  <Link
                    key={b._id}
                    href={`/admin/bookings/${b.bookingId}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: 'var(--surface-saffron)' }}
                      >
                        🚗
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-saffron-600 dark:group-hover:text-saffron-400">
                          {b.customer.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {b.bookingId} · {b.carName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <div
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.icon}
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 hidden sm:block">
                        {formatCurrency(b.totalAmount)}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="card rounded-2xl p-5"
      >
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{ background: action.bg, border: `1px solid ${action.color}20` }}
            >
              <span style={{ color: action.color }}>{action.icon}</span>
              <span className="text-sm font-semibold" style={{ color: action.color }}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
