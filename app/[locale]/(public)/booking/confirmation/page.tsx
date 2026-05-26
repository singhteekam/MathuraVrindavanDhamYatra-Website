'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams }               from 'next/navigation'
import { Link }                          from '@/i18n/navigation'
import { useLocale, useTranslations }     from 'next-intl'
import { motion }                        from 'framer-motion'
import {
  CheckCircle, Phone, MessageCircle, Home, Package,
  Calendar, Car, MapPin, Clock, Copy, Check,
} from 'lucide-react'
import { siteConfig }      from '@/config/site'
import { formatCurrency } from '@/lib/utils'

const INTL_LOCALE = { en: 'en-IN', hi: 'hi-IN' } as const

interface BookingDetail {
  bookingId:      string
  status:         string
  carName:        string
  startDate:      string
  pickupLocation: string
  totalAmount:    number
  advanceAmount:  number
  addons:         string[]
  customer:       { name: string; phone: string }
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const locale       = useLocale() as keyof typeof INTL_LOCALE
  const t            = useTranslations('BookingConfirmation')
  const bookingId    = searchParams.get('id')      ?? ''
  const amount       = Number(searchParams.get('amount')  ?? 0)
  const advance      = Number(searchParams.get('advance') ?? 0)
  const method       = searchParams.get('method') ?? ''      // cash | full | advance | whatsapp | pending
  const paid         = Number(searchParams.get('paid')    ?? 0)

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    if (!bookingId) return
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooking(d.data) })
      .catch(() => {/* use URL params as fallback */})
  }, [bookingId])

  function copyBookingId() {
    navigator.clipboard.writeText(bookingId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const displayAmount  = booking?.totalAmount  ?? amount
  const displayAdvance = booking?.advanceAmount ?? advance
  // Resolve paid amount: prefer URL param (set by payment handler) over DB value
  const displayPaid    = paid > 0 ? paid : (booking as (BookingDetail & { paidAmount?: number }) | null)?.paidAmount ?? 0
  const dateLocale     = INTL_LOCALE[locale] ?? 'en-IN'
  const whatsappMsg    = t('whatsAppMessage', { bookingId })

  function formatDisplayDate(value: string) {
    return new Date(value).toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Success animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('title')}
          </h1>
          <p className="text-saffron-500 font-semibold">{t('subtitle')}</p>
        </motion.div>

        {/* Booking ID card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-5 text-center"
          style={{ background: 'var(--surface-saffron)', border: '1px solid var(--surface-saffron-border)' }}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">{t('yourBookingId')}</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-bold" style={{ color: '#ff7d0f', fontFamily: 'var(--font-serif)' }}>
              {bookingId || t('processing')}
            </p>
            {bookingId && (
              <button onClick={copyBookingId}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--surface-saffron-border)' }}
                title={t('copyBookingId')}>
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('saveIdNote')}
          </p>
        </motion.div>

        {/* Booking details (from DB if available, else from URL params) */}
        {(booking || displayAmount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card rounded-2xl p-5 mb-5"
          >
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('bookingDetails')}</h3>
            <div className="space-y-3">
              {booking?.carName && (
                <div className="flex items-center gap-2 text-sm">
                  <Car size={14} className="text-saffron-500 flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400">{t('vehicle')}:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{booking.carName}</span>
                </div>
              )}
              {booking?.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-saffron-500 flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400">{t('date')}:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatDisplayDate(booking.startDate)}</span>
                </div>
              )}
              {booking?.pickupLocation && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-saffron-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 dark:text-gray-400">{t('pickup')}:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{booking.pickupLocation}</span>
                </div>
              )}

              {/* Payment summary — varies by payment method */}
              {displayAmount > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-muted)' }}>
                  {/* Row: total */}
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">{t('totalAmount')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(displayAmount)}</span>
                  </div>

                  {/* Full payment paid online */}
                  {method === 'full' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400 font-semibold">✓ {t('paidOnline')}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(displayPaid || displayAmount)}</span>
                    </div>
                  )}

                  {/* Advance paid online — show paid + balance */}
                  {method === 'advance' && (
                    <>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-green-600 dark:text-green-400 font-semibold">✓ {t('paidOnline')}</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(displayPaid || displayAdvance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('balanceOnTripDay')}</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {formatCurrency(displayAmount - (displayPaid || displayAdvance))}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Cash — show advance to pay + balance */}
                  {method === 'cash' && (
                    <>
                      {displayAdvance > 0 && (
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-500 dark:text-gray-400">{t('advanceToPay')}</span>
                          <span className="font-bold" style={{ color: '#ff7d0f' }}>{formatCurrency(displayAdvance)}</span>
                        </div>
                      )}
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">ℹ️ {t('payLaterCash')}</p>
                    </>
                  )}

                  {/* WhatsApp — pending */}
                  {method === 'whatsapp' && (
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">💬 {t('whatsappNote')}</p>
                  )}

                  {/* Online payment dismissed/failed — still pending */}
                  {method === 'pending' && (
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                      <p className="text-xs text-amber-700 dark:text-amber-400">⚠️ {t('paymentPendingNote')}</p>
                    </div>
                  )}

                  {/* Legacy / unknown method — old behaviour */}
                  {!['full','advance','cash','whatsapp','pending'].includes(method) && displayAdvance > 0 && (
                    <>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-500 dark:text-gray-400">{t('advanceToPay')}</span>
                        <span className="font-bold" style={{ color: '#ff7d0f' }}>{formatCurrency(displayAdvance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('balanceOnTripDay')}</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(displayAmount - displayAdvance)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card rounded-2xl p-5 mb-5"
        >
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-saffron-500" />{t('whatNext')}
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', text: t('nextStep1Text'), time: t('nextStep1Time') },
              { step: '2', text: t('nextStep2Text'), time: t('nextStep2Time') },
              { step: '3', text: t('nextStep3Text'), time: t('nextStep3Time') },
              { step: '4', text: t('nextStep4Text'), time: t('nextStep4Time') },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: '#ff7d0f' }}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.text}</p>
                  <p className="text-xs text-saffron-500 font-semibold mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-semibold text-sm"
            style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
            <MessageCircle size={18} />{t('confirmViaWhatsApp')}
          </a>

          <a href={`tel:${siteConfig.phone}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Phone size={16} />{siteConfig.phone}
          </a>

          <div className="grid grid-cols-3 gap-3">
            <Link href="/" className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-secondary)' }}>
              <Home size={16} />{t('home')}
            </Link>
            <Link href="/packages" className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-secondary)' }}>
              <Package size={16} />{t('packages')}
            </Link>
            <Link href="/customer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'rgba(255, 125, 15, 0.12)', color: '#ff7d0f' }}>
              <Car size={16} />{t('myTrips')}
            </Link>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          {(method === 'full' || method === 'advance')
            ? t('emailConfirmed')
            : method === 'pending'
            ? t('emailPending')
            : t('emailNote')}
        </p>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
