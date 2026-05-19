'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { motion }              from 'framer-motion'
import {
  CalendarCheck, Clock, CheckCircle, XCircle,
  RefreshCw, MapPin, Car, Phone, LogOut,
  Star, MessageCircle, User, IndianRupee,
} from 'lucide-react'
import toast               from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { siteConfig }      from '@/config/site'

interface Booking {
  _id:             string
  bookingId:       string
  status:          string
  carName:         string
  startDate:       string
  totalAmount:     number
  advanceAmount:   number
  pickupLocation:  string
  totalPassengers: number
  addons:          string[]
  package?:        { _id: string; name: string; slug: string }
  driver?:         { name: string; phone: string; vehicle: { name: string; number: string } }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:         { label: 'Pending',         color: '#d97706', bg: '#fffbeb', icon: <Clock       size={13} /> },
  confirmed:       { label: 'Confirmed',       color: '#2563eb', bg: '#eff6ff', icon: <CheckCircle  size={13} /> },
  driver_assigned: { label: 'Driver Assigned', color: '#7c3aed', bg: '#f5f3ff', icon: <Car          size={13} /> },
  ongoing:         { label: 'On The Way',      color: '#ff7d0f', bg: '#fff8ed', icon: <RefreshCw    size={13} /> },
  completed:       { label: 'Completed',       color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle  size={13} /> },
  cancelled:       { label: 'Cancelled',       color: '#dc2626', bg: '#fff1f2', icon: <XCircle      size={13} /> },
}

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled']

export default function CustomerPage() {
  const { data: session, status } = useSession()
  const router                    = useRouter()
  const [bookings,         setBookings]         = useState<Booking[]>([])
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set())
  const [loading,          setLoading]          = useState(true)
  const [activeTab,        setActiveTab]        = useState('All')

  const user = session?.user as { name?: string; email?: string; role?: string } | undefined

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    Promise.all([
      fetch('/api/bookings?limit=50').then((r) => r.json()),
      fetch('/api/reviews?myReviews=true&limit=100').then((r) => r.json()),
    ])
      .then(([bData, rData]) => {
        if (bData.success) setBookings(bData.data)
        if (rData.success) {
          // Build a Set of booking _ids that already have a review
          const ids = new Set<string>(
            rData.data.map((r: { booking?: string | { _id?: string } }) => {
              if (typeof r.booking === 'string') return r.booking
              return r.booking?._id ?? ''
            }).filter(Boolean)
          )
          setReviewedBookings(ids)
        }
      })
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }, [status])

  async function cancelBooking(bookingId: string) {
    if (!confirm('Cancel this booking? Cancellation charges may apply.')) return
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'cancelled', cancelReason: 'Cancelled by customer' }),
      })
      if (res.ok) {
        toast.success('Booking cancelled.')
        setBookings((prev) => prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b,
        ))
      }
    } catch {
      toast.error('Failed to cancel booking.')
    }
  }

  const filtered = bookings.filter((b) => {
    if (activeTab === 'Upcoming')  return ['pending', 'confirmed', 'driver_assigned', 'ongoing'].includes(b.status)
    if (activeTab === 'Completed') return b.status === 'completed'
    if (activeTab === 'Cancelled') return b.status === 'cancelled'
    return true
  })

  const upcomingCount  = bookings.filter((b) => ['pending', 'confirmed', 'driver_assigned'].includes(b.status)).length
  const completedCount = bookings.filter((b) => b.status === 'completed').length
  const totalSpent     = bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.totalAmount, 0)

  if (status === 'loading' || (status === 'unauthenticated')) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero header */}
      <div
        className="py-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}
      >
        <div className="container-custom relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
              >
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-saffron-400 text-xs font-semibold uppercase tracking-widest">Jai Shri Krishna 🙏</p>
                <h1 className="text-2xl font-bold text-white">{user?.name ?? 'Welcome back'}</h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/booking"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
                style={{ background: '#ff7d0f', color: '#fff' }}>
                <CalendarCheck size={15} />Book New Tour
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                <LogOut size={15} />Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings',  value: bookings.length,   icon: <CalendarCheck size={18} />, color: '#ff7d0f', bg: '#fff8ed' },
            { label: 'Upcoming Trips',  value: upcomingCount,     icon: <Clock         size={18} />, color: '#4338ca', bg: '#eef2ff' },
            { label: 'Trips Completed', value: completedCount,    icon: <CheckCircle   size={18} />, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Total Spent',     value: formatCurrency(totalSpent), icon: <IndianRupee size={18} />, color: '#db2777', bg: '#fdf2f8', isString: true },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.isString ? stat.value : stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookings */}
        <div className="card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg mb-4">My Bookings</h2>
            <div className="flex gap-2 flex-wrap">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={activeTab === tab
                    ? { background: '#ff7d0f', color: '#fff' }
                    : { background: '#f3f4f6', color: '#6b7280' }
                  }>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🙏</p>
              <p className="text-gray-500 font-medium">No bookings found</p>
              <Link href="/packages"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold"
                style={{ color: '#ff7d0f' }}>
                Browse packages →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((booking, i) => {
                const st = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
                const canCancel = ['pending', 'confirmed'].includes(booking.status)
                return (
                  <motion.div key={booking._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-saffron-600">{booking.bookingId}</span>
                          <span
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: st.bg, color: st.color }}
                          >
                            {st.icon}{st.label}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1">
                          {booking.package?.name ?? booking.carName}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Clock  size={11} />{formatDate(booking.startDate)}</span>
                          <span className="flex items-center gap-1"><Car    size={11} />{booking.carName}</span>
                          <span className="flex items-center gap-1"><MapPin size={11} /><span className="truncate max-w-[180px]">{booking.pickupLocation}</span></span>
                        </div>

                        {/* Driver info if assigned */}
                        {booking.driver && (
                          <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                              {booking.driver.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800">{booking.driver.name}</p>
                              <p className="text-xs text-gray-500">
                                {booking.driver.vehicle.name} · {booking.driver.vehicle.number}
                              </p>
                            </div>
                            <a href={`tel:${booking.driver.phone}`}
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                              style={{ background: '#dcfce7', color: '#16a34a' }}>
                              <Phone size={11} />Call
                            </a>
                          </div>
                        )}

                        {/* Amount */}
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-400 text-xs">Total: </span>
                            <span className="font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">Advance paid: </span>
                            <span className="font-semibold text-green-600">{formatCurrency(booking.advanceAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2 flex-shrink-0">
                        <a
                          href={`https://wa.me/${siteConfig.whatsapp}?text=Namaste! I need help with booking ${booking.bookingId}. 🙏`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                          style={{ background: '#dcfce7', color: '#16a34a' }}>
                          <MessageCircle size={12} />WhatsApp
                        </a>
                        {booking.status === 'completed' && (
                          reviewedBookings.has(booking._id)
                            ? (
                              <span
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                                style={{ background: '#f0fdf4', color: '#16a34a' }}>
                                <Star size={12} fill="currentColor" />Reviewed ✓
                              </span>
                            ) : (
                              <Link
                                href={`/review?booking=${encodeURIComponent(booking._id)}&package=${encodeURIComponent(booking.package?._id ?? '')}&name=${encodeURIComponent(booking.package?.name ?? booking.carName)}`}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                                style={{ background: '#fff8ed', color: '#ff7d0f' }}>
                                <Star size={12} />Leave Review
                              </Link>
                            )
                        )}
                        {canCancel && (
                          <button
                            onClick={() => cancelBooking(booking.bookingId)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                            style={{ background: '#fff1f2', color: '#dc2626' }}>
                            <XCircle size={12} />Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Profile quick section */}
        <div className="grid sm:grid-cols-2 gap-5 mt-6">
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={16} className="text-saffron-500" />Account Details
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Name',  value: user?.name  ?? '—' },
                { label: 'Email', value: user?.email ?? '—' },
                { label: 'Role',  value: user?.role  ?? 'customer' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between p-3 rounded-xl"
                  style={{ background: '#f9fafb' }}>
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-800 capitalize">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-saffron-500" />Need Help?
            </h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              For any booking queries, cancellations, or travel assistance, reach out to us directly.
            </p>
            <div className="space-y-3">
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#dcfce7', color: '#16a34a' }}>
                <MessageCircle size={16} />WhatsApp Us
              </a>
              <a href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#fff8ed', color: '#ff7d0f' }}>
                <Phone size={16} />Call Us — {siteConfig.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}