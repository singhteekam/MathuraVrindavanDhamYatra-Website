'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams }           from 'next/navigation'
import Link                    from 'next/link'
import { motion }              from 'framer-motion'
import {
  ArrowLeft, User, Mail, Phone, Calendar, ShoppingBag,
  CheckCircle, XCircle, Clock, ToggleLeft, ToggleRight,
  IndianRupee, MapPin, Car,
} from 'lucide-react'
import toast               from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import AdminPageHeader     from '@/components/admin/AdminPageHeader'

interface Customer {
  _id:           string
  name:          string
  email:         string
  phone?:        string
  role:          string
  isActive:      boolean
  emailVerified: boolean
  createdAt:     string
}

interface Booking {
  _id:            string
  bookingId:      string
  status:         string
  carName:        string
  startDate:      string
  totalAmount:    number
  paidAmount?:    number
  paymentStatus:  string
  pickupLocation: string
  totalPassengers:number
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending:         { label: 'Pending',         color: '#d97706', bg: 'var(--surface-amber)'   },
  confirmed:       { label: 'Confirmed',       color: '#2563eb', bg: 'var(--surface-blue)'    },
  driver_assigned: { label: 'Driver Assigned', color: '#7c3aed', bg: 'var(--surface-krishna)' },
  ongoing:         { label: 'Ongoing',         color: '#ff7d0f', bg: 'var(--surface-saffron)' },
  completed:       { label: 'Completed',       color: '#16a34a', bg: 'var(--surface-green)'   },
  cancelled:       { label: 'Cancelled',       color: '#dc2626', bg: 'var(--surface-red)'     },
}

export default function CustomerDetailPage() {
  const { userId }  = useParams<{ userId: string }>()
  const [customer,  setCustomer]  = useState<Customer | null>(null)
  const [bookings,  setBookings]  = useState<Booking[]>([])
  const [loading,   setLoading]   = useState(true)
  const [toggling,  setToggling]  = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}`).then(r => r.json()),
      fetch(`/api/bookings?customerId=${userId}&limit=50`).then(r => r.json()),
    ]).then(([userData, bookingData]) => {
      if (userData.success)   setCustomer(userData.data)
      else toast.error(userData.error ?? 'Failed to load customer.')
      if (bookingData.success) setBookings(bookingData.data)
    }).catch(() => toast.error('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [userId])

  async function toggleActive() {
    if (!customer) return
    setToggling(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !customer.isActive }),
      })
      const data = await res.json()
      if (res.ok) {
        setCustomer(c => c ? { ...c, isActive: !c.isActive } : c)
        toast.success(customer.isActive ? 'Account deactivated.' : 'Account activated.')
      } else {
        toast.error(data.error ?? 'Failed to update.')
      }
    } catch { toast.error('Network error.') }
    finally { setToggling(false) }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center pt-20 lg:pt-8">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!customer) return (
    <div className="flex-1 p-8 pt-20 lg:pt-8">
      <p className="text-gray-500 dark:text-gray-400">Customer not found.</p>
      <Link href="/admin/customers" className="text-saffron-600 text-sm font-semibold mt-3 inline-block">
        ← Back to Customers
      </Link>
    </div>
  )

  const totalSpent  = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalAmount, 0)
  const completed   = bookings.filter(b => b.status === 'completed').length
  const cancelled   = bookings.filter(b => b.status === 'cancelled').length
  const upcoming    = bookings.filter(b => ['pending','confirmed','driver_assigned','ongoing'].includes(b.status)).length

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title={customer.name}
        crumbs={[
          { label: 'Customers', href: '/admin/customers' },
          { label: customer.name },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left: Profile + actions ── */}
        <div className="space-y-5">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="card rounded-2xl p-5">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate">{customer.name}</h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={customer.isActive
                      ? { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                      : { background: 'var(--surface-red)',   color: 'var(--text-on-red)'   }}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {customer.emailVerified && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'var(--surface-blue)', color: 'var(--text-on-blue)' }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 mb-5">
              {[
                { icon: <Mail  size={13} />, label: 'Email',  value: customer.email              },
                { icon: <Phone size={13} />, label: 'Phone',  value: customer.phone ?? '—'       },
                { icon: <Calendar size={13}/>, label: 'Joined', value: formatDate(customer.createdAt) },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: 'var(--bg-surface-muted)' }}>
                  <span className="text-gray-400 shrink-0">{row.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{row.label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Toggle active */}
            <button
              onClick={toggleActive}
              disabled={toggling}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all disabled:opacity-60"
              style={customer.isActive
                ? { background: 'var(--surface-red)',   border: '1px solid var(--surface-red-border)'   }
                : { background: 'var(--surface-green)', border: '1px solid var(--surface-green-border)' }
              }
            >
              <span className="text-sm font-semibold"
                style={{ color: customer.isActive ? 'var(--text-on-red)' : 'var(--text-on-green)' }}>
                {customer.isActive ? 'Deactivate Account' : 'Activate Account'}
              </span>
              {customer.isActive
                ? <ToggleRight size={20} style={{ color: 'var(--text-on-red)' }} />
                : <ToggleLeft  size={20} style={{ color: 'var(--text-on-green)' }} />
              }
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-4">Booking Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total',     value: bookings.length, color: '#ff7d0f', bg: 'var(--surface-saffron)' },
                { label: 'Upcoming',  value: upcoming,        color: '#4338ca', bg: 'var(--surface-krishna)' },
                { label: 'Completed', value: completed,       color: '#16a34a', bg: 'var(--surface-green)'   },
                { label: 'Cancelled', value: cancelled,       color: '#dc2626', bg: 'var(--surface-red)'     },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: s.bg }}>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-xl text-center" style={{ background: 'var(--surface-amber)' }}>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{formatCurrency(totalSpent)}</p>
            </div>
          </motion.div>
        </div>

        {/* ── Right: Bookings list ── */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Bookings ({bookings.length})</h3>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No bookings yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {bookings.map((booking, i) => {
                  const st = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending
                  return (
                    <motion.div key={booking._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/admin/bookings/${booking.bookingId}`}
                              className="font-mono text-xs font-bold text-saffron-600 hover:underline">
                              {booking.bookingId}
                            </Link>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{booking.carName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-saffron-600">{formatCurrency(booking.totalAmount)}</p>
                          {(booking.paidAmount ?? 0) > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              ✓ {formatCurrency(booking.paidAmount!)} paid
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={11}/>{formatDate(booking.startDate)}</span>
                        <span className="flex items-center gap-1"><MapPin size={11}/><span className="truncate max-w-[180px]">{booking.pickupLocation}</span></span>
                        <span className="flex items-center gap-1"><User size={11}/>{booking.totalPassengers} pax</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  )
}
