'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Link, useRouter }     from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { motion }              from 'framer-motion'
import {
  CalendarCheck, Clock, CheckCircle, XCircle,
  RefreshCw, MapPin, Car, Phone, LogOut,
  Star, MessageCircle, User, IndianRupee, ChevronRight,
} from 'lucide-react'
import toast               from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { siteConfig }      from '@/config/site'

type BLField = string | { en: string; hi: string }
function bl(v: BLField | undefined, locale: string): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  return locale === 'hi' ? (v.hi || v.en) : v.en
}

interface Booking {
  _id:             string
  bookingId:       string
  status:          string
  carName:         string
  startDate:       string
  totalAmount:     number
  advanceAmount:   number
  paidAmount?:     number
  paymentMethod?:  string
  pickupLocation:  string
  totalPassengers: number
  addons:          string[]
  package?:        { _id: string; name: BLField; slug: string }
  driver?:         { name: string; phone: string; vehicle: { name: string; number: string } }
}

export default function CustomerPage() {
  const t                              = useTranslations('CustomerPortal')
  const locale                         = useLocale()
  const { data: session, status }      = useSession()
  const router                         = useRouter()
  const [bookings,         setBookings]         = useState<Booking[]>([])
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set())
  const [loading,          setLoading]          = useState(true)
  const [activeTab,        setActiveTab]        = useState('All')

  const user = session?.user as { name?: string; email?: string; role?: string; isVerified?: boolean } | undefined

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending:         { label: t('statusPending'),        color: '#d97706', bg: '#fffbeb', icon: <Clock       size={13} /> },
    confirmed:       { label: t('statusConfirmed'),      color: '#2563eb', bg: '#eff6ff', icon: <CheckCircle  size={13} /> },
    driver_assigned: { label: t('statusDriverAssigned'), color: '#7c3aed', bg: '#f5f3ff', icon: <Car          size={13} /> },
    ongoing:         { label: t('statusOngoing'),        color: '#ff7d0f', bg: '#fff8ed', icon: <RefreshCw    size={13} /> },
    completed:       { label: t('statusCompleted'),      color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle  size={13} /> },
    cancelled:       { label: t('statusCancelled'),      color: '#dc2626', bg: '#fff1f2', icon: <XCircle      size={13} /> },
  }

  const TAB_KEYS = [
    { key: 'All',       label: t('tabAll')       },
    { key: 'Upcoming',  label: t('tabUpcoming')  },
    { key: 'Completed', label: t('tabCompleted') },
    { key: 'Cancelled', label: t('tabCancelled') },
  ]

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
          const ids = new Set<string>(
            rData.data.map((r: { booking?: string | { _id?: string } }) => {
              if (typeof r.booking === 'string') return r.booking
              return r.booking?._id ?? ''
            }).filter(Boolean)
          )
          setReviewedBookings(ids)
        }
      })
      .catch(() => toast.error(t('toast.loadFailed')))
      .finally(() => setLoading(false))
  }, [status, t])

  async function cancelBooking(bookingId: string) {
    if (!confirm(t('toast.cancelConfirm'))) return
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'cancelled', cancelReason: 'Cancelled by customer' }),
      })
      if (res.ok) {
        toast.success(t('toast.cancelled'))
        setBookings((prev) => prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b,
        ))
      }
    } catch {
      toast.error(t('toast.cancelFailed'))
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Hero header */}
      <div
        className="py-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}
      >
        <div className="container-custom relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
              >
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-saffron-400 text-xs font-semibold uppercase tracking-widest">{t('greeting')}</p>
                <h1 className="text-2xl font-bold text-white">{user?.name ?? t('welcomeBack')}</h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/booking"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
                style={{ background: '#ff7d0f', color: '#fff' }}>
                <CalendarCheck size={15} />{t('bookNewTour')}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                <LogOut size={15} />{t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('statTotalBookings'),  value: bookings.length,            icon: <CalendarCheck size={18} />, color: '#ff7d0f', bg: '#fff8ed' },
            { label: t('statUpcomingTrips'),  value: upcomingCount,              icon: <Clock         size={18} />, color: '#4338ca', bg: '#eef2ff' },
            { label: t('statTripsCompleted'), value: completedCount,             icon: <CheckCircle   size={18} />, color: '#16a34a', bg: '#f0fdf4' },
            { label: t('statTotalSpent'),     value: formatCurrency(totalSpent), icon: <IndianRupee   size={18} />, color: '#db2777', bg: '#fdf2f8', isString: true },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Email verification banner */}
        {user && user.isVerified === false && (
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl mb-6"
            style={{ background: '#fff8ed', border: '1px solid #fde68a' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📧</span>
              <div>
                <p className="font-semibold text-amber-800">{t('verifyEmailTitle')}</p>
                <p className="text-sm text-amber-700">{t('verifyEmailDesc')}</p>
              </div>
            </div>
            <Link
              href={`/verify-email?email=${encodeURIComponent(user.email ?? '')}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 whitespace-nowrap"
              style={{ background: '#ff7d0f', color: '#fff' }}
            >
              {t('verifyEmailBtn')}
            </Link>
          </div>
        )}

        {/* Bookings */}
        <div className="card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{t('myBookings')}</h2>
            <div className="flex gap-2 flex-wrap">
              {TAB_KEYS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={activeTab === tab.key
                    ? { background: '#ff7d0f', color: '#fff' }
                    : { background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }
                  }>
                  {tab.label}
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
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noBookings')}</p>
              <Link href="/packages"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold"
                style={{ color: '#ff7d0f' }}>
                {t('browsePackages')}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((booking, i) => {
                const st = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
                const canCancel = ['pending', 'confirmed'].includes(booking.status)
                return (
                  <motion.div key={booking._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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

                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {bl(booking.package?.name, locale) || booking.carName}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1"><Clock  size={11} />{formatDate(booking.startDate)}</span>
                          <span className="flex items-center gap-1"><Car    size={11} />{booking.carName}</span>
                          <span className="flex items-center gap-1"><MapPin size={11} /><span className="truncate max-w-[180px]">{booking.pickupLocation}</span></span>
                        </div>

                        {/* Driver info if assigned */}
                        {booking.driver && (
                          <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
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
                              <Phone size={11} />{t('driverCall')}
                            </a>
                          </div>
                        )}

                        {/* Payment info — based on actual paidAmount, not advanceAmount */}
                        {(() => {
                          const paid   = booking.paidAmount ?? 0
                          const method = booking.paymentMethod ?? ''
                          const isCashOrWA = method === 'cash' || method === 'whatsapp'
                          const balance    = booking.totalAmount - paid
                          return (
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <div>
                                <span className="block text-gray-400 dark:text-gray-500 text-xs">{t('labelTotal')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</span>
                              </div>

                              {paid > 0 ? (
                                /* Online payment verified */
                                <>
                                  <div>
                                    <span className="block text-gray-400 dark:text-gray-500 text-xs">{t('labelPaid')}</span>
                                    <span className="font-semibold text-green-600">✓ {formatCurrency(paid)}</span>
                                  </div>
                                  {balance > 0 && (
                                    <div>
                                      <span className="block text-gray-400 dark:text-gray-500 text-xs">{t('labelBalance')}</span>
                                      <span className="font-semibold text-amber-600">{formatCurrency(balance)}</span>
                                    </div>
                                  )}
                                </>
                              ) : isCashOrWA ? (
                                /* Cash / WhatsApp — will pay on trip day */
                                <div>
                                  <span className="block text-gray-400 dark:text-gray-500 text-xs">{t('labelAdvanceDue')}</span>
                                  <span className="font-semibold text-amber-600">{t('labelPaymentCash')}</span>
                                </div>
                              ) : (
                                /* Online payment created but not yet completed */
                                <div>
                                  <span className="block text-gray-400 dark:text-gray-500 text-xs">{t('labelAdvanceDue')}</span>
                                  <span className="font-semibold text-orange-500">{t('labelPaymentPending')}</span>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <Link
                          href={`/customer/booking/${booking.bookingId}`}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                          style={{ background: '#fff8ed', color: '#ff7d0f' }}>
                          <ChevronRight size={12} />{t('viewDetails')}
                        </Link>
                        <a
                          href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(t('whatsappMsg', { bookingId: booking.bookingId }))}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                          style={{ background: '#dcfce7', color: '#16a34a' }}>
                          <MessageCircle size={12} />{t('whatsapp')}
                        </a>
                        {booking.status === 'completed' && (
                          reviewedBookings.has(booking._id)
                            ? (
                              <span
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                                style={{ background: '#f0fdf4', color: '#16a34a' }}>
                                <Star size={12} fill="currentColor" />{t('reviewed')}
                              </span>
                            ) : (
                              <Link
                                href={`/review?booking=${encodeURIComponent(booking._id)}&package=${encodeURIComponent(booking.package?._id ?? '')}&name=${encodeURIComponent(bl(booking.package?.name, locale) || booking.carName)}`}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                                style={{ background: '#fff8ed', color: '#ff7d0f' }}>
                                <Star size={12} />{t('leaveReview')}
                              </Link>
                            )
                        )}
                        {canCancel && (
                          <button
                            onClick={() => cancelBooking(booking.bookingId)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
                            style={{ background: '#fff1f2', color: '#dc2626' }}>
                            <XCircle size={12} />{t('cancel')}
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
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={16} className="text-saffron-500" />{t('accountDetails')}
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: t('labelName'),   value: user?.name  ?? '—' },
                { label: t('labelEmail'),  value: user?.email ?? '—' },
                { label: t('labelRole'),   value: user?.role  ?? 'customer' },
                { label: t('labelStatus'), value: user?.isVerified ? t('statusVerified') : t('statusNotVerified') },
              ].map((row) => (
                <div key={row.label} className="flex justify-between p-3 rounded-xl"
                  style={{ background: 'var(--bg-surface-muted)' }}>
                  <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-saffron-500" />{t('needHelp')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              {t('helpDescription')}
            </p>
            <div className="space-y-3">
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#dcfce7', color: '#16a34a' }}>
                <MessageCircle size={16} />{t('whatsappUs')}
              </a>
              <a href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#fff8ed', color: '#ff7d0f' }}>
                <Phone size={16} />{t('callUs', { phone: siteConfig.phone })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
