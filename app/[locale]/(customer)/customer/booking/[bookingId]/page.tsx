'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState }           from 'react'
import { useSession }                    from 'next-auth/react'
import { useParams }                     from 'next/navigation'
import { Link, useRouter }               from '@/i18n/navigation'
import { useTranslations, useLocale }    from 'next-intl'
import { motion }                        from 'framer-motion'
import {
  ArrowLeft, Car, Clock, XCircle, RefreshCw,
  Phone, Star, MessageCircle, User, IndianRupee,
  CreditCard, Info, CheckCircle2, MapPin, Calendar,
  Shield,
} from 'lucide-react'
import toast                             from 'react-hot-toast'
import { formatCurrency, formatDate }    from '@/lib/utils'
import { siteConfig }                    from '@/config/site'

type BLField = string | { en: string; hi: string }
function bl(v: BLField | undefined, locale: string): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  return locale === 'hi' ? (v.hi || v.en) : v.en
}

interface BookingDetail {
  _id: string
  bookingId: string
  status: string
  paymentStatus: string
  paymentMethod?: string
  carType: string
  carName: string
  startDate: string
  endDate: string
  duration: number
  pickupLocation: string
  dropLocation?: string
  totalPassengers: number
  totalAmount: number
  advanceAmount: number
  paidAmount?: number
  paymentId?: string
  razorpayOrderId?: string
  addons: string[]
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  specialRequests?: string
  adminNotes?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
  package?: { _id: string; name: BLField; slug: string; duration: number }
  driver?: {
    name: string; phone: string; rating?: number
    avatar?: string; gender?: string; isVerified?: boolean
    vehicle: { name: string; number: string; type?: string; color?: string; image?: string }
  }
  customer?: { name: string; email: string; phone?: string }
}

interface RzpOptions {
  key: string; amount: number; currency: string; name: string
  description: string; order_id: string
  prefill: { name: string; email?: string; contact: string }
  theme: { color: string }
  config?: { display?: { preferences?: { show_default_blocks?: boolean } } }
  handler(r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }): void
  modal?: { ondismiss?(): void }
}
declare global { interface Window { Razorpay: new (o: RzpOptions) => { open(): void } } }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:         { label: 'Pending',         color: '#d97706', bg: 'var(--surface-amber)'   },
  confirmed:       { label: 'Confirmed',       color: '#2563eb', bg: 'var(--surface-blue)'    },
  driver_assigned: { label: 'Driver Assigned', color: '#7c3aed', bg: 'var(--surface-krishna)' },
  ongoing:         { label: 'On The Way',      color: '#ff7d0f', bg: 'var(--surface-saffron)' },
  completed:       { label: 'Completed',       color: '#16a34a', bg: 'var(--surface-green)'   },
  cancelled:       { label: 'Cancelled',       color: '#dc2626', bg: 'var(--surface-red)'     },
}

export default function BookingDetailPage() {
  const t                             = useTranslations('BookingDetail')
  const locale                        = useLocale()
  const { data: session, status: authStatus } = useSession()
  const router                        = useRouter()
  const { bookingId }                 = useParams<{ bookingId: string }>()

  const [booking,       setBooking]       = useState<BookingDetail | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const user = session?.user as { name?: string; email?: string } | undefined

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/login'); return }
    if (authStatus !== 'authenticated') return

    if (!document.getElementById('rzp-script')) {
      const s    = document.createElement('script')
      s.id       = 'rzp-script'
      s.src      = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(s)
    }

    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBooking(data.data)
        else toast.error(t('toast.loadFailed'))
      })
      .catch(() => toast.error(t('toast.loadFailed')))
      .finally(() => setLoading(false))
  }, [authStatus, bookingId, router, t])

  async function handleRetryPayment() {
    if (!booking) return
    const isFullPay = booking.paymentMethod === 'online_full'
    const payAmount = isFullPay ? booking.totalAmount : booking.advanceAmount
    const payType   = isFullPay ? 'full' : 'advance'

    setActionLoading(true)
    try {
      const res  = await fetch('/api/payment/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: payAmount, bookingId: booking.bookingId }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      const rzp = new window.Razorpay({
        key:         data.data.keyId,
        amount:      data.data.amount,
        currency:    data.data.currency,
        name:        siteConfig.name,
        description: `Booking ${booking.bookingId}`,
        order_id:    data.data.orderId,
        prefill: {
          name:    user?.name    ?? '',
          email:   user?.email   ?? '',
          contact: booking.customerPhone ?? '',
        },
        theme:  { color: '#ff7d0f' },
        config: { display: { preferences: { show_default_blocks: true } } },
        handler: async (resp) => {
          const vRes  = await fetch('/api/payment/verify', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature:  resp.razorpay_signature,
              bookingId:           booking.bookingId,
              paymentType:         payType,
              paidAmount:          payAmount,
            }),
          })
          const vData = await vRes.json()
          if (vData.success) {
            toast.success(t('toast.retrySuccess'))
            setBooking((prev) => prev ? {
              ...prev,
              paymentStatus: isFullPay ? 'paid' : 'partial',
              paidAmount:    payAmount,
              status:        'confirmed',
            } : prev)
          } else {
            toast.error(t('toast.retryFailed'))
          }
          setActionLoading(false)
        },
        modal: { ondismiss: () => setActionLoading(false) },
      })
      rzp.open()
      // loading stays true; handler/ondismiss will release it
    } catch {
      toast.error(t('toast.retryFailed'))
      setActionLoading(false)
    }
  }

  async function handleSwitchToCash() {
    if (!confirm(t('switchToCashConfirm'))) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${booking!.bookingId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ paymentMethod: 'cash' }),
      })
      if (res.ok) {
        toast.success(t('toast.switchedToCash'))
        setBooking((prev) => prev ? { ...prev, paymentMethod: 'cash' } : prev)
      } else {
        toast.error(t('toast.switchFailed'))
      }
    } catch {
      toast.error(t('toast.switchFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm(t('cancelConfirm'))) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${booking!.bookingId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'cancelled', cancelReason: 'Cancelled by customer' }),
      })
      if (res.ok) {
        toast.success(t('toast.cancelled'))
        setBooking((prev) => prev ? { ...prev, status: 'cancelled' } : prev)
      } else {
        toast.error(t('toast.cancelFailed'))
      }
    } catch {
      toast.error(t('toast.cancelFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || authStatus === 'loading' || authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{t('toast.loadFailed')}</p>
        <Link href="/customer" className="text-saffron-600 font-semibold">{t('backToPortal')}</Link>
      </div>
    )
  }

  const st             = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
  const paid           = booking.paidAmount ?? 0
  const balance        = booking.totalAmount - paid
  const isOnlinePending = (
    (booking.paymentMethod === 'online_full' || booking.paymentMethod === 'online_advance') &&
    paid === 0 &&
    booking.status === 'pending'
  )
  const canCancel = ['pending', 'confirmed'].includes(booking.status)

  const methodLabel: Record<string, string> = {
    cash:           t('methodCash'),
    online_full:    t('methodOnlineFull'),
    online_advance: t('methodOnlineAdvance'),
    whatsapp:       t('methodWhatsapp'),
  }
  const payStatusLabel: Record<string, string> = {
    pending:  t('payStatusPending'),
    partial:  t('payStatusPartial'),
    paid:     t('payStatusPaid'),
    refunded: t('payStatusRefunded'),
  }
  const payStatusColor: Record<string, string> = {
    pending:  '#d97706',
    partial:  '#d97706',
    paid:     '#16a34a',
    refunded: '#6b7280',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <div
        className="py-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}
      >
        <div className="container-custom relative z-10">
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={14} />{t('backToPortal')}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
            <span className="font-mono text-sm font-bold text-saffron-400">{booking.bookingId}</span>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: st.bg, color: st.color }}
            >
              {st.label}
            </span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Status timeline — full width */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 card rounded-2xl p-5"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
              <Shield size={15} className="text-saffron-500" />Booking Status
            </h2>
            <BookingStatusTimeline status={booking.status} />
          </motion.div>

          {/* ── Left column (2/3) ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Trip Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card rounded-2xl p-5"
            >
              <SectionHeader icon={<Car size={15} />} title={t('sectionTrip')} />
              <div className="grid sm:grid-cols-2 gap-3">
                {booking.package && (
                  <DetailRow label={t('labelPackage')}    value={bl(booking.package.name, locale)} />
                )}
                <DetailRow label={t('labelCarName')}      value={booking.carName} />
                <DetailRow label={t('labelCarType')}      value={booking.carType} />
                <DetailRow label={t('labelStartDate')}    value={formatDate(booking.startDate)} />
                <DetailRow label={t('labelEndDate')}      value={formatDate(booking.endDate)} />
                <DetailRow label={t('labelDuration')}     value={t('durationNights', { n: booking.duration })} />
                <DetailRow label={t('labelPickup')}       value={booking.pickupLocation} />
                {booking.dropLocation && (
                  <DetailRow label={t('labelDrop')}       value={booking.dropLocation} />
                )}
                <DetailRow label={t('labelPassengers')}   value={t('passengersCount', { n: booking.totalPassengers })} />
              </div>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="card rounded-2xl p-5"
            >
              <SectionHeader icon={<IndianRupee size={15} />} title={t('sectionPayment')} />
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <DetailRow
                  label={t('labelPaymentMethod')}
                  value={methodLabel[booking.paymentMethod ?? ''] ?? '—'}
                />
                <DetailRow
                  label={t('labelPaymentStatus')}
                  value={payStatusLabel[booking.paymentStatus] ?? booking.paymentStatus}
                  valueStyle={{ color: payStatusColor[booking.paymentStatus] ?? '#6b7280' }}
                />
                <DetailRow label={t('labelTotalAmount')}   value={formatCurrency(booking.totalAmount)} bold />
                <DetailRow label={t('labelAdvanceAmount')} value={formatCurrency(booking.advanceAmount)} />
                <DetailRow
                  label={t('labelPaidAmount')}
                  value={formatCurrency(paid)}
                  valueStyle={{ color: paid > 0 ? '#16a34a' : '#6b7280' }}
                />
                <DetailRow
                  label={t('labelBalance')}
                  value={formatCurrency(Math.max(0, balance))}
                  valueStyle={{ color: balance > 0 ? '#d97706' : '#16a34a' }}
                />
                {booking.paymentId && (
                  <DetailRow label={t('labelPaymentId')}      value={booking.paymentId}      mono />
                )}
                {booking.razorpayOrderId && (
                  <DetailRow label={t('labelRazorpayOrder')}  value={booking.razorpayOrderId} mono />
                )}
              </div>

              {/* Payment progress */}
              {booking.totalAmount > 0 && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Payment Progress</span>
                    <span className="font-bold" style={{ color: balance <= 0 ? '#16a34a' : '#ff7d0f' }}>
                      {Math.min(100, Math.round((paid / booking.totalAmount) * 100))}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (paid / booking.totalAmount) * 100)}%`,
                        background: balance <= 0 ? '#16a34a' : 'linear-gradient(90deg, #ff7d0f, #f59e0b)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5 font-semibold">
                    <span style={{ color: '#16a34a' }}>{formatCurrency(paid)} paid</span>
                    {balance > 0
                      ? <span style={{ color: '#d97706' }}>{formatCurrency(balance)} remaining</span>
                      : <span style={{ color: '#16a34a' }}>Fully paid ✓</span>}
                  </div>
                </div>
              )}

              {/* Retry / Switch-to-cash actions */}
              {isOnlinePending && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleRetryPayment}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                    style={{ background: '#ff7d0f', color: '#fff' }}
                  >
                    <CreditCard size={14} />
                    {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : t('retryPayment')}
                  </button>
                  <button
                    onClick={handleSwitchToCash}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                    style={{ background: 'var(--surface-amber)', color: 'var(--text-on-amber)', border: '1px solid var(--surface-amber-border)' }}
                  >
                    <IndianRupee size={14} />
                    {actionLoading ? '...' : t('switchToCash')}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Your Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card rounded-2xl p-5"
            >
              <SectionHeader icon={<User size={15} />} title={t('sectionCustomer')} />
              <div className="grid sm:grid-cols-2 gap-3">
                <DetailRow label={t('labelCustomerName')}  value={booking.customerName  ?? user?.name  ?? '—'} />
                <DetailRow label={t('labelCustomerEmail')} value={booking.customerEmail ?? user?.email ?? '—'} />
                <DetailRow label={t('labelCustomerPhone')} value={booking.customerPhone ?? '—'} />
              </div>
            </motion.div>

          </div>

          {/* ── Right column (1/3) ────────────────────────────── */}
          <div className="space-y-5">

            {/* Driver */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card rounded-2xl p-5"
            >
              <SectionHeader icon={<Car size={15} />} title={t('sectionDriver')} />
              {booking.driver ? (
                <div className="space-y-3">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    {booking.driver.avatar ? (
                      <img src={booking.driver.avatar} alt={booking.driver.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border-2 border-saffron-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                        {booking.driver.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{booking.driver.name}</p>
                        {booking.driver.isVerified && (
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        )}
                      </div>
                      {booking.driver.gender && (
                        <p className="text-xs text-gray-400 capitalize">{booking.driver.gender}</p>
                      )}
                      {booking.driver.rating != null && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ color: s <= Math.round(booking.driver!.rating!) ? '#ff7d0f' : '#d1d5db', fontSize: 11 }}>★</span>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{booking.driver.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle */}
                  {booking.driver.vehicle.image && (
                    <img src={booking.driver.vehicle.image} alt="Vehicle"
                      className="w-full h-32 object-contain rounded-xl border border-gray-100 dark:border-gray-700"
                      style={{ background: 'var(--bg-surface-muted)' }} />
                  )}
                  <div className="p-3 rounded-xl space-y-1.5" style={{ background: 'var(--bg-surface-muted)' }}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vehicle</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{booking.driver.vehicle.name}</span>
                      <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400">{booking.driver.vehicle.number}</span>
                    </div>
                    {(booking.driver.vehicle.color || booking.driver.vehicle.type) && (
                      <p className="text-xs text-gray-500">
                        {[booking.driver.vehicle.color, booking.driver.vehicle.type].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* Call */}
                  <a href={`tel:${booking.driver.phone}`}
                    className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                    <Phone size={13} />{booking.driver.phone}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t('noDriver')}</p>
              )}
            </motion.div>

            {/* Add-ons & Special Requests */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card rounded-2xl p-5"
            >
              <SectionHeader icon={<Star size={15} />} title={t('sectionAddons')} />
              <div className="space-y-4">
                <div>
                  {booking.addons.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {booking.addons.map((a) => (
                        <span
                          key={a}
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{t('noAddons')}</p>
                  )}
                </div>
                {booking.specialRequests && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">{t('labelSpecialRequests')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{booking.specialRequests}</p>
                  </div>
                )}
                {booking.adminNotes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">{t('labelAdminNotes')}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 p-3 rounded-xl leading-relaxed"
                      style={{ background: 'var(--surface-blue)' }}>
                      {booking.adminNotes}
                    </p>
                  </div>
                )}
                {booking.cancelReason && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">{t('labelCancelReason')}</p>
                    <p className="text-sm text-red-600 dark:text-red-400 p-3 rounded-xl leading-relaxed"
                      style={{ background: 'var(--surface-red)' }}>
                      {booking.cancelReason}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Booking Meta */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="card rounded-2xl p-5"
            >
              <SectionHeader icon={<Info size={15} />} title={t('sectionBookingInfo')} />
              <div className="space-y-2">
                <DetailRow label={t('labelBookingId')} value={booking.bookingId} mono />
                <DetailRow
                  label={t('labelBookedOn')}
                  value={new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                />
                <DetailRow
                  label={t('labelUpdatedOn')}
                  value={new Date(booking.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                />
              </div>
            </motion.div>

            {/* WhatsApp support */}
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Namaste! I need help with booking ${booking.bookingId}. 🙏`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 w-full p-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}
            >
              <MessageCircle size={14} />WhatsApp Support
            </a>

            {/* Cancel booking */}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                style={{ background: 'var(--surface-red)', color: 'var(--text-on-red)' }}
              >
                <XCircle size={14} />{t('cancel')}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="font-bold mb-4 flex items-center gap-2 text-saffron-600">
      {icon}
      <span className="text-gray-900 dark:text-white">{title}</span>
    </h2>
  )
}

function BookingStatusTimeline({ status }: { status: string }) {
  const STEPS = [
    { key: 'pending',         label: 'Booked'   },
    { key: 'confirmed',       label: 'Confirmed'},
    { key: 'driver_assigned', label: 'Driver'   },
    { key: 'ongoing',         label: 'On Route' },
    { key: 'completed',       label: 'Done'     },
  ]

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-red)' }}>
        <XCircle size={18} className="text-red-500 shrink-0" />
        <div>
          <p className="font-bold text-red-600 text-sm">Booking Cancelled</p>
          <p className="text-xs text-red-400">This booking has been cancelled.</p>
        </div>
      </div>
    )
  }

  const currentIdx = Math.max(0, STEPS.findIndex(s => s.key === status))

  const elements: React.ReactNode[] = []
  STEPS.forEach((step, i) => {
    const done   = i <= currentIdx
    const active = i === currentIdx
    elements.push(
      <div key={step.key} className="flex flex-col items-center shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={{
            background: done ? '#ff7d0f' : 'var(--bg-surface-muted)',
            color:      done ? '#fff'    : '#9ca3af',
            boxShadow:  active ? '0 0 0 4px rgba(255,125,15,0.2)' : 'none',
          }}>
          {done && !active ? '✓' : i + 1}
        </div>
        <span className="text-[10px] font-semibold mt-1.5 text-center whitespace-nowrap"
          style={{ color: active ? '#ff7d0f' : done ? '#6b7280' : '#d1d5db' }}>
          {step.label}
        </span>
      </div>
    )
    if (i < STEPS.length - 1) {
      elements.push(
        <div key={`c${i}`} className="flex-1 h-0.5 mt-3.5 mx-1"
          style={{ background: i < currentIdx ? '#ff7d0f' : 'var(--bg-surface-muted)' }} />
      )
    }
  })

  return <div className="flex items-start">{elements}</div>
}

function DetailRow({
  label, value, bold, mono, valueStyle,
}: {
  label: string
  value: string
  bold?: boolean
  mono?: boolean
  valueStyle?: React.CSSProperties
}) {
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span
        className={`text-sm ${bold ? 'font-bold' : 'font-semibold'} text-gray-800 dark:text-gray-200 ${mono ? 'font-mono text-xs' : ''} break-all`}
        style={valueStyle}
      >
        {value || '—'}
      </span>
    </div>
  )
}
