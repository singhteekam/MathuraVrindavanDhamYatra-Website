'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, IndianRupee, CalendarCheck,
  Car, Star, Users, AlertCircle,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Stats {
  bookings: {
    total: number
    thisMonth: number
    completed: number
    cancelled: number
    pending: number
    byStatus: { _id: string; count: number }[]
  }
  revenue: { total: number; thisMonth: number }
  users:   { totalCustomers: number; totalDrivers: number; availableDrivers: number }
}

const CAR_BREAKDOWN = [
  { name: 'Swift Dzire',    type: 'swift',  emoji: 'ðŸš—', share: 35, color: '#ff7d0f' },
  { name: 'Maruti Ertiga',  type: 'ertiga', emoji: 'ðŸš', share: 28, color: '#4338ca' },
  { name: 'Toyota Innova',  type: 'innova', emoji: 'ðŸš™', share: 22, color: '#16a34a' },
  { name: 'Maruti Eeco',    type: 'eeco',   emoji: 'ðŸšŒ', share: 10, color: '#db2777' },
  { name: 'Innova Crysta',  type: 'crysta', emoji: 'ðŸš˜', share:  5, color: '#d97706' },
]

const TOP_PACKAGES = [
  { name: 'Same Day Mathura Vrindavan', bookings: 145, revenue: 290000 },
  { name: '2 Days Mathura Vrindavan',   bookings:  89, revenue: 311500 },
  { name: '3 Days Govardhan',           bookings:  54, revenue: 270000 },
  { name: '4 Days Complete Braj',       bookings:  38, revenue: 285000 },
  { name: '7 Days 84 Kos Yatra',        bookings:  12, revenue: 216000 },
]

export default function AdminAnalyticsPage() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); else toast.error('Failed to load stats.') })
      .catch(() => toast.error('Failed to load stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-8 pt-20 lg:pt-8">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return (
    <div className="flex-1 p-8 pt-20 lg:pt-8">
      <div className="card rounded-2xl p-10 text-center">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">Could not load analytics data.</p>
      </div>
    </div>
  )

  const completionRate = stats.bookings.total > 0
    ? Math.round((stats.bookings.completed / stats.bookings.total) * 100)
    : 0

  const cancellationRate = stats.bookings.total > 0
    ? Math.round((stats.bookings.cancelled / stats.bookings.total) * 100)
    : 0

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title="Analytics"
        crumbs={[{ label: 'Analytics' }]}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label:  'Total Revenue',
            value:  formatCurrency(stats.revenue.total),
            sub:    `${formatCurrency(stats.revenue.thisMonth)} this month`,
            icon:   <IndianRupee size={20} />,
            color:  '#16a34a', bg: 'var(--surface-green)',
          },
          {
            label:  'Total Bookings',
            value:  stats.bookings.total,
            sub:    `${stats.bookings.thisMonth} this month`,
            icon:   <CalendarCheck size={20} />,
            color:  '#ff7d0f', bg: 'var(--surface-saffron)',
          },
          {
            label:  'Completion Rate',
            value:  `${completionRate}%`,
            sub:    `${stats.bookings.completed} completed`,
            icon:   <TrendingUp size={20} />,
            color:  '#4338ca', bg: 'var(--surface-krishna)',
          },
          {
            label:  'Total Customers',
            value:  stats.users.totalCustomers,
            sub:    `${stats.users.totalDrivers} drivers on platform`,
            icon:   <Users size={20} />,
            color:  '#db2777', bg: 'var(--surface-red)',
          },
        ].map((kpi, i) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: kpi.bg, color: kpi.color }}>
              {kpi.icon}
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Booking status breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-5">Booking Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Completed',  value: stats.bookings.completed, color: '#16a34a', max: stats.bookings.total },
              { label: 'Pending',    value: stats.bookings.pending,   color: '#f59e0b', max: stats.bookings.total },
              { label: 'Cancelled',  value: stats.bookings.cancelled, color: '#dc2626', max: stats.bookings.total },
            ].map((item) => {
              const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{item.value}</span>
                      <span className="text-xs text-gray-400">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rate summary */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-5"
            style={{ borderTop: '1px solid var(--border-muted)' }}>
            <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface-green)' }}>
              <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Completion Rate</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface-red)' }}>
              <p className="text-2xl font-bold text-red-500">{cancellationRate}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Cancellation Rate</p>
            </div>
          </div>
        </motion.div>

        {/* Vehicle type breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-5">Vehicle Type Popularity</h3>
          <div className="space-y-4">
            {CAR_BREAKDOWN.map((car) => (
              <div key={car.type}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <span>{car.emoji}</span>{car.name}
                  </span>
                  <span className="font-bold text-gray-900">{car.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${car.share}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: car.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-5">
            * Based on estimated booking distribution across vehicle types
          </p>
        </motion.div>
      </div>

      {/* Top packages */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="card rounded-2xl overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Top Performing Packages</h3>
          <p className="text-xs text-gray-400 mt-0.5">Estimated based on package popularity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-surface-muted)', borderBottom: '1px solid #f3f4f6' }}>
                {['Package', 'Est. Bookings', 'Est. Revenue', 'Popularity'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PACKAGES.map((pkg, i) => {
                const maxBookings = TOP_PACKAGES[0].bookings
                const pct = Math.round((pkg.bookings / maxBookings) * 100)
                return (
                  <tr key={pkg.name}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7c2f' : '#e5e7eb', color: i > 2 ? '#6b7280' : '#fff' }}
                        >
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-800 text-xs">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{pkg.bookings}</td>
                    <td className="px-4 py-3 font-semibold text-saffron-600">{formatCurrency(pkg.revenue)}</td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-saffron-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick insights */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: <Star size={20} />,
            label: 'Avg. Booking Value',
            value: stats.bookings.completed > 0
              ? formatCurrency(Math.round(stats.revenue.total / stats.bookings.completed))
              : 'N/A',
            color: '#f59e0b', bg: 'var(--surface-amber)',
          },
          {
            icon: <Car size={20} />,
            label: 'Available Drivers',
            value: `${stats.users.availableDrivers} / ${stats.users.totalDrivers}`,
            color: '#16a34a', bg: 'var(--surface-green)',
          },
          {
            icon: <TrendingUp size={20} />,
            label: 'This Month Bookings',
            value: stats.bookings.thisMonth,
            color: '#4338ca', bg: 'var(--surface-krishna)',
          },
        ].map((item) => (
          <div key={item.label} className="card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}