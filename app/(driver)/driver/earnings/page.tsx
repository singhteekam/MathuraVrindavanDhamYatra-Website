'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, TrendingUp, CalendarCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Trip {
  _id: string
  bookingId: string
  startDate: string
  carName: string
  totalAmount: number
  customer: { name: string }
  package?: { name: string }
}

export default function DriverEarningsPage() {
  const [trips,   setTrips]   = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings?status=completed&limit=50')
      .then((r) => r.json())
      .then((d) => { if (d.success) setTrips(d.data) })
      .catch(() => toast.error('Failed to load earnings.'))
      .finally(() => setLoading(false))
  }, [])

  const totalEarnings   = trips.reduce((sum, t) => sum + t.totalAmount, 0)
  const thisMonth       = new Date()
  const monthEarnings   = trips
    .filter((t) => new Date(t.startDate).getMonth() === thisMonth.getMonth()
      && new Date(t.startDate).getFullYear() === thisMonth.getFullYear())
    .reduce((sum, t) => sum + t.totalAmount, 0)

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
        <p className="text-gray-500 text-sm mt-1">Summary of completed trips and earnings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Earnings',      value: formatCurrency(totalEarnings), icon: <IndianRupee  size={20} />, color: '#16a34a', bg: 'var(--surface-green)' },
          { label: 'This Month',          value: formatCurrency(monthEarnings), icon: <TrendingUp   size={20} />, color: '#ff7d0f', bg: 'var(--surface-saffron)' },
          { label: 'Completed Trips',     value: String(trips.length),          icon: <CalendarCheck size={20}/>, color: '#4338ca', bg: 'var(--surface-krishna)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card rounded-2xl p-5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Trip history table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Trip History</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <IndianRupee size={36} className="mx-auto mb-3 opacity-30" />
            <p>No completed trips yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-surface-muted)', borderBottom: '1px solid #f3f4f6' }}>
                  {['Booking ID', 'Date', 'Customer', 'Package/Car', 'Amount'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trips.map((trip, i) => (
                  <motion.tr
                    key={trip._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-saffron-600">{trip.bookingId}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {formatDate(trip.startDate)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{trip.customer.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {trip.package?.name ?? trip.carName}
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600 whitespace-nowrap">
                      {formatCurrency(trip.totalAmount)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-surface-muted)', borderTop: '2px solid #f3f4f6' }}>
                  <td colSpan={4} className="px-4 py-3 font-bold text-gray-800 text-sm">Total</td>
                  <td className="px-4 py-3 font-bold text-green-600 text-base">
                    {formatCurrency(totalEarnings)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}