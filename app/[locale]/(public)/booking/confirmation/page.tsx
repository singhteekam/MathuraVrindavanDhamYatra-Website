'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams }               from 'next/navigation'
import Link                              from 'next/link'
import { motion }                        from 'framer-motion'
import {
  CheckCircle, Phone, MessageCircle, Home, Package,
  Calendar, Car, MapPin, Clock, Copy, Check,
} from 'lucide-react'
import { siteConfig }      from '@/config/site'
import { formatCurrency, formatDate } from '@/lib/utils'

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
  const bookingId    = searchParams.get('id')      ?? ''
  const amount       = Number(searchParams.get('amount')  ?? 0)
  const advance      = Number(searchParams.get('advance') ?? 0)

  const [booking,  setBooking]  = useState<BookingDetail | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    if (!bookingId) { setLoading(false); return }
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooking(d.data) })
      .catch(() => {/* use URL params as fallback */})
      .finally(() => setLoading(false))
  }, [bookingId])

  function copyBookingId() {
    navigator.clipboard.writeText(bookingId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const displayAmount  = booking?.totalAmount  ?? amount
  const displayAdvance = booking?.advanceAmount ?? advance
  const whatsappMsg    = `Namaste! I just confirmed my tour booking. Booking ID: *${bookingId}*. Please confirm the details. 🙏`

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Booking Confirmed!
          </h1>
          <p className="text-saffron-500 font-semibold">Jai Shri Krishna 🙏</p>
        </motion.div>

        {/* Booking ID card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-5 text-center"
          style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)', border: '1px solid #ffdba8' }}
        >
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Your Booking ID</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-bold" style={{ color: '#ff7d0f', fontFamily: 'var(--font-serif)' }}>
              {bookingId || 'Processing...'}
            </p>
            {bookingId && (
              <button onClick={copyBookingId}
                className="p-2 rounded-lg transition-colors"
                style={{ background: '#fff', border: '1px solid #ffdba8' }}
                title="Copy booking ID">
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Save this ID — you&apos;ll need it to track your booking
          </p>
        </motion.div>

        {/* Booking details (from DB if available, else from URL params) */}
        {(booking || displayAmount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card rounded-2xl p-5 mb-5"
          >
            <h3 className="font-bold text-gray-900 mb-4">Booking Details</h3>
            <div className="space-y-3">
              {booking?.carName && (
                <div className="flex items-center gap-2 text-sm">
                  <Car size={14} className="text-saffron-500 flex-shrink-0" />
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="font-semibold text-gray-800">{booking.carName}</span>
                </div>
              )}
              {booking?.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-saffron-500 flex-shrink-0" />
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-800">{formatDate(booking.startDate)}</span>
                </div>
              )}
              {booking?.pickupLocation && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-saffron-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Pickup:</span>
                  <span className="font-semibold text-gray-800">{booking.pickupLocation}</span>
                </div>
              )}

              {/* Payment summary */}
              {displayAmount > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-bold text-gray-900">{formatCurrency(displayAmount)}</span>
                  </div>
                  {displayAdvance > 0 && (
                    <>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-500">Advance to pay</span>
                        <span className="font-bold text-saffron-600">{formatCurrency(displayAdvance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Balance on trip day</span>
                        <span className="font-semibold text-gray-700">{formatCurrency(displayAmount - displayAdvance)}</span>
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
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-saffron-500" />What happens next?
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Our team will call you within 30 minutes to confirm your booking.', time: 'Within 30 min' },
              { step: '2', text: 'We assign a verified driver and share their name, photo & number.', time: 'Same day' },
              { step: '3', text: 'A WhatsApp confirmation with full details is sent to your number.', time: 'After call' },
              { step: '4', text: 'Your driver arrives at the pickup point on time, ready for your journey.', time: 'Trip day' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: '#ff7d0f' }}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
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
            style={{ background: '#22c55e', color: '#fff' }}>
            <MessageCircle size={18} />Confirm via WhatsApp
          </a>

          <a href={`tel:${siteConfig.phone}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <Phone size={16} />{siteConfig.phone}
          </a>

          <div className="grid grid-cols-3 gap-3">
            <Link href="/" className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: '#f3f4f6', color: '#374151' }}>
              <Home size={16} />Home
            </Link>
            <Link href="/packages" className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: '#f3f4f6', color: '#374151' }}>
              <Package size={16} />Packages
            </Link>
            <Link href="/customer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: '#fff8ed', color: '#ff7d0f' }}>
              <Car size={16} />My Trips
            </Link>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          A confirmation email will be sent if you provided your email address.
        </p>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}