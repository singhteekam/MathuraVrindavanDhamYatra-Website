'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams }               from 'next/navigation'
import { Link, useRouter }               from '@/i18n/navigation'
import { useSession }                    from 'next-auth/react'
import { useLocale, useTranslations }     from 'next-intl'
import { motion, AnimatePresence }       from 'framer-motion'
import {
  Car, Calendar, Users, MapPin, Phone, Mail, User,
  ChevronRight, Check, ArrowLeft, MessageCircle, LogIn,
  Banknote, CreditCard, Wallet,
} from 'lucide-react'
import toast                   from 'react-hot-toast'
import { cars, durations, addons, siteConfig } from '@/config/site'
import { formatCurrency }       from '@/lib/utils'
import type { PackageSummary }  from '@/lib/fetchData'

// Minimal Razorpay types — only what we use
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

const INTL_LOCALE = { en: 'en-IN', hi: 'hi-IN' } as const

/* ─── Types ─────────────────────────────────────────────── */
interface PackageOption extends Pick<PackageSummary, '_id' | 'slug' | 'duration' | 'basePrice'> {
  name:            string | { en: string; hi: string }
  pricing?:        { carType: string; price: number }[]
  discountPercent?: number
  discountEndsAt?:  string | null
  discountLabel?:   string
}

/* ─── Booking form (inner, uses useSearchParams) ─────────── */
function BookingForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const locale       = useLocale() as keyof typeof INTL_LOCALE
  const t            = useTranslations('Booking')

  function getLocalName(name: string | { en: string; hi: string } | undefined): string {
    if (!name) return ''
    if (typeof name === 'string') return name
    return (locale === 'hi' ? name.hi : name.en) ?? name.en ?? name.hi ?? ''
  }
  const { data: session, status } = useSession()
  const dateLocale   = INTL_LOCALE[locale] ?? 'en-IN'
  const steps        = [t('stepTripDetailsShort'), t('stepYourDetailsShort'), t('stepConfirmPayShort')]

  const preSlug = searchParams.get('package') ?? ''
  const preCar  = searchParams.get('car')     ?? cars[0].id

  // Step state
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [packages,         setPackages]         = useState<PackageOption[]>([])
  const [selectedPackage,  setSelectedPackage]  = useState(preSlug)
  const [selectedCar,      setSelectedCar]      = useState(preCar)
  const [selectedDuration, setSelectedDuration] = useState(durations[0].id)
  const [travelDate,       setTravelDate]        = useState('')
  const [pickupLocation,   setPickupLocation]    = useState('')
  const [selectedAddons,   setSelectedAddons]    = useState<string[]>(['hotel_help', 'restaurant_help'])
  const [advanceAmount,    setAdvanceAmount]     = useState(500)

  // Step 2
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')
  const [email,      setEmail]      = useState('')
  const [passengers, setPassengers] = useState('2')
  const [requests,   setRequests]   = useState('')

  /* Pre-fill from session if logged in */
  useEffect(() => {
    if (session?.user) {
      const u = session.user as { name?: string; email?: string }
      if (u.name  && !name)  setName(u.name)
      if (u.email && !email) setEmail(u.email)
    }
  }, [session])

  /* Fetch active packages + advance percent */
  useEffect(() => {
    fetch('/api/packages?limit=20')
      .then((r) => r.json())
      .then((d) => { if (d.success) setPackages(d.data) })
      .catch(() => {})
    fetch('/api/settings/booking')
      .then((r) => r.json())
      .then((d) => { if (d.success && typeof d.data.advanceAmount === 'number') setAdvanceAmount(d.data.advanceAmount) })
      .catch(() => {})

    // Load Razorpay script once
    if (!document.getElementById('rzp-script') && !window.Razorpay) {
      const s = document.createElement('script')
      s.id    = 'rzp-script'
      s.src   = 'https://checkout.razorpay.com/v1/checkout.js'
      s.async = true
      document.head.appendChild(s)
    }
  }, [])

  /* Derived pricing */
  const carData      = cars.find((c) => c.id === selectedCar)!
  const durationData = durations.find((d) => d.id === selectedDuration)!
  const pkgData      = packages.find((p) => p.slug === selectedPackage)

  const addonTotal = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  const basePrice = pkgData
    ? (pkgData.pricing?.find((p) => p.carType === selectedCar)?.price ?? pkgData.basePrice)
    : carData.basePrice * durationData.days

  const pkgHasDiscount = (pkgData?.discountPercent ?? 0) > 0 &&
    (!pkgData?.discountEndsAt || new Date(pkgData.discountEndsAt) > new Date())
  const discountSaving = pkgHasDiscount
    ? Math.round(basePrice * ((pkgData!.discountPercent!) / 100))
    : 0
  const effectiveBasePrice = basePrice - discountSaving
  const totalPrice = effectiveBasePrice + addonTotal
  // advanceAmount is a fixed ₹ value set by admin — never exceeds totalPrice
  const safeAdvance = Math.min(advanceAmount, totalPrice)

  const optionStyle = (selected: boolean) => selected
    ? { border: '2px solid #ff7d0f', background: 'rgba(255, 125, 15, 0.12)' }
    : { border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }

  const mutedPanelStyle = {
    background: 'var(--bg-surface-muted)',
    border: '1px solid var(--border-muted)',
  }

  const selectedPackageLabel = getLocalName(pkgData?.name) || t('customTrip')

  function getCarCapacity(capacity: string) {
    const count = Number.parseInt(capacity, 10)
    return Number.isFinite(count) ? t('passengerCount', { count }) : capacity
  }

  function getDurationLabel(id: string, fallback: string) {
    return t(`durations.${id}`) || fallback
  }

  function formatDateLabel(value: string, month: 'short' | 'long' = 'long') {
    if (!value) return '—'
    const options = month === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' } as const
      : { day: 'numeric', month: 'short' } as const
    return new Date(value).toLocaleDateString(dateLocale, options)
  }

  function toggleAddon(id: string) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    )
  }

  /* ── Navigation guards ── */
  function goToStep2() {
    if (!travelDate)            { toast.error(t('toast.selectTravelDate'));      return }
    if (!pickupLocation.trim()) { toast.error(t('toast.enterPickupLocation'));   return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToStep3() {
    if (!name.trim())    { toast.error(t('toast.enterName'));        return }
    if (!phone.trim())   { toast.error(t('toast.enterPhoneNumber')); return }
    if (!/^\+?[\d\s-]{8,}$/.test(phone)) {
      toast.error(t('toast.enterValidPhoneNumber'))
      return
    }
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Shared: create booking in DB ── */
  async function createBooking(paymentMethod: 'cash' | 'online_full' | 'online_advance' | 'whatsapp') {
    const start = new Date(travelDate)
    const end   = new Date(start)
    end.setDate(end.getDate() + durationData.days - 1)

    const res = await fetch('/api/bookings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId:       pkgData?._id ?? undefined,
        carType:         selectedCar,
        carName:         carData.name,
        startDate:       travelDate,
        endDate:         end.toISOString().split('T')[0],
        duration:        durationData.days,
        pickupLocation:  pickupLocation.trim(),
        totalPassengers: Number(passengers),
        totalAmount:     totalPrice,
        originalAmount:  pkgHasDiscount ? basePrice + addonTotal : undefined,
        discountPercent: pkgHasDiscount ? pkgData!.discountPercent : 0,
        advanceAmount:   safeAdvance,
        addons:          selectedAddons,
        specialRequests: requests.trim() || undefined,
        customerName:    name.trim(),
        customerPhone:   phone.trim(),
        customerEmail:   email.trim() || undefined,
        paymentMethod,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? t('toast.bookingFailed'))
      return null
    }
    return data.data as { bookingId: string; id: string; totalAmount: number; advanceAmount: number }
  }

  /* ── Pay Cash ── */
  async function handlePayCash() {
    setLoading(true)
    try {
      const booking = await createBooking('cash')
      if (!booking) return
      toast.success(t('toast.bookingConfirmed', { bookingId: booking.bookingId }), { duration: 5000 })
      router.push(`/booking/confirmation?id=${booking.bookingId}&amount=${totalPrice}&advance=${safeAdvance}&method=cash`)
    } catch { toast.error(t('toast.somethingWentWrong')) }
    finally    { setLoading(false) }
  }

  /* ── Razorpay helper ── */
  async function initiateRazorpay(paymentType: 'full' | 'advance') {
    if (!window.Razorpay) {
      toast.error('Payment gateway is loading. Please try again in a moment.')
      return
    }
    if (status === 'unauthenticated') {
      toast.error(t('toast.signInRequired'))
      router.push(`/login?callbackUrl=/booking?package=${selectedPackage}&car=${selectedCar}`)
      return
    }
    setLoading(true)
    let savedBookingId = ''
    try {
      const method  = paymentType === 'full' ? 'online_full' : 'online_advance'
      const booking = await createBooking(method)
      if (!booking) { setLoading(false); return }
      savedBookingId = booking.bookingId

      const amount = paymentType === 'full' ? totalPrice : safeAdvance
      const orderRes  = await fetch('/api/payment/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount, bookingId: booking.bookingId }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        toast.error(orderData.error ?? 'Could not create payment order.')
        router.push(`/booking/confirmation?id=${booking.bookingId}&amount=${totalPrice}&advance=${safeAdvance}&method=pending`)
        return
      }

      // Keep loading=true until the modal fires (handler or ondismiss)
      // so the button can't be clicked again while the modal is open
      const rzpKey = orderData.data.keyId ?? ''
      if (!rzpKey) {
        toast.error('Payment not configured. Please contact support.')
        setLoading(false)
        return
      }
      const rzp = new window.Razorpay({
        key:         rzpKey,
        amount:      orderData.data.amount,
        currency:    orderData.data.currency,
        name:        'MV Dham Yatra',
        description: paymentType === 'full' ? 'Full Tour Payment' : `Advance Payment ₹${safeAdvance}`,
        order_id:    orderData.data.orderId,
        prefill:     { name: name.trim(), email: email.trim() || undefined, contact: phone.trim() },
        theme:       { color: '#ff7d0f' },
        // Show all payment methods (UPI intent + QR, cards, netbanking, wallets)
        config: {
          display: {
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response) => {
          try {
            const verifyRes  = await fetch('/api/payment/verify', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                ...response,
                bookingId:   booking.bookingId,
                paymentType,
                paidAmount:  amount,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok && verifyData.data?.verified) {
              toast.success(t('toast.paymentSuccess'), { duration: 5000 })
              router.push(`/booking/confirmation?id=${booking.bookingId}&amount=${totalPrice}&advance=${safeAdvance}&method=${paymentType}&paid=${amount}`)
            } else {
              toast.error('Payment verification failed. Please contact support.')
              setLoading(false)
            }
          } catch {
            toast.error(t('toast.somethingWentWrong'))
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            // User closed modal without paying — booking stays pending in DB
            toast.error(t('toast.paymentFailed'), { duration: 5000 })
            setLoading(false)
            router.push(`/booking/confirmation?id=${savedBookingId}&amount=${totalPrice}&advance=${safeAdvance}&method=pending`)
          },
        },
      })
      rzp.open()
      // loading stays true until handler/ondismiss fires — blocks re-clicks
      return // skip the setLoading(false) below
    } catch {
      toast.error(t('toast.somethingWentWrong'))
      setLoading(false)
    }
  }

  /* ── Book on WhatsApp ── */
  async function handleWhatsAppBook() {
    const phone_no = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? siteConfig.whatsapp
    const msg = encodeURIComponent(
      `Namaste! I want to book a ${carData.name} for ${getDurationLabel(durationData.id, durationData.label)} on ${travelDate}. Pickup: ${pickupLocation.trim()}. Name: ${name.trim()}, Phone: ${phone.trim()}. Total: ${formatCurrency(totalPrice)}. 🙏 (Note: If our team does not contact within 30 minutes, please call ${siteConfig.phone})`,
    )
    const waUrl = `https://wa.me/${phone_no}?text=${msg}`

    setLoading(true)
    try {
      const booking = await createBooking('whatsapp')
      if (booking) {
        toast.success(t('toast.whatsappBooked'), { duration: 4000 })
        window.open(waUrl, '_blank')
        router.push(`/booking/confirmation?id=${booking.bookingId}&amount=${totalPrice}&advance=${safeAdvance}&method=whatsapp`)
        return
      }
    } catch {
      // Booking creation failed — still open WhatsApp so the user isn't blocked
    } finally {
      setLoading(false)
    }

    window.open(waUrl, '_blank')
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero strip */}
      <div className="py-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}>
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-saffron-400 transition-colors">{t('breadcrumbHome')}</Link>
            <ChevronRight size={12} />
            <span className="text-gray-300">{t('breadcrumbBookTour')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('heroTitle')}
          </h1>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                    style={step > i + 1
                      ? { background: '#22c55e', color: '#fff' }
                      : step === i + 1
                      ? { background: '#ff7d0f', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.15)', color: '#9ca3af' }
                    }
                  >
                    {step > i + 1 ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${step === i + 1 ? 'text-white' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-8 sm:w-14 h-px mx-2"
                    style={{ background: step > i + 1 ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Sign-in nudge — hidden while online payment is disabled */}
          {false && status === 'unauthenticated' && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-200 bg-amber-900/30 px-4 py-2.5 rounded-xl w-fit">
              <LogIn size={13} />
              {t.rich('signInNotice', {
                signIn: (chunks) => <Link href="/login?callbackUrl=/booking" className="underline font-semibold">{chunks}</Link>,
              })}
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Main form ── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* STEP 1 — Trip Details */}
              {step === 1 && (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="card rounded-2xl p-6 mb-5">
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{t('step1Title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('step1Subtitle')}</p>

                    {/* Package selector */}
                    {packages.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
                          {t('selectPackageOptional')}
                        </label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <button onClick={() => setSelectedPackage('')}
                            className="p-3 rounded-xl text-left transition-all duration-200"
                            style={optionStyle(!selectedPackage)}>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('customTrip')}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('customTripHint')}</p>
                          </button>
                          {packages.slice(0, 5).map((pkg) => {
                            const pkgCardHasDisc = (pkg.discountPercent ?? 0) > 0 &&
                              (!pkg.discountEndsAt || new Date(pkg.discountEndsAt) > new Date())
                            const pkgCardDiscounted = pkgCardHasDisc
                              ? Math.round(pkg.basePrice * (1 - (pkg.discountPercent ?? 0) / 100))
                              : null
                            return (
                              <button key={pkg.slug}
                                onClick={() => {
                                  setSelectedPackage(pkg.slug)
                                  const dur = durations.find((d) => d.days === pkg.duration)
                                  if (dur) setSelectedDuration(dur.id)
                                }}
                                className="p-3 rounded-xl text-left transition-all duration-200"
                                style={optionStyle(selectedPackage === pkg.slug)}>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{getLocalName(pkg.name)}</p>
                                {pkgCardDiscounted ? (
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-xs line-through text-gray-400">{formatCurrency(pkg.basePrice)}</span>
                                    <span className="text-xs font-bold" style={{ color: '#16a34a' }}>{formatCurrency(pkgCardDiscounted)}</span>
                                    <span className="text-[10px] font-bold px-1 rounded" style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>🔥 {pkg.discountPercent}% OFF</span>
                                  </div>
                                ) : (
                                  <p className="text-xs mt-0.5" style={{ color: '#ff7d0f' }}>
                                    {t('packagePriceLine', { price: formatCurrency(pkg.basePrice), days: pkg.duration })}
                                  </p>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Vehicle selector */}
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
                        <Car size={12} className="inline mr-1" />{t('chooseVehicle')}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {cars.map((car) => (
                          <button key={car.id} onClick={() => setSelectedCar(car.id)}
                            className="p-3 rounded-xl text-center transition-all duration-200"
                            style={optionStyle(selectedCar === car.id)}>
                            <span className="text-2xl block mb-1">🚗</span>
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">{car.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{getCarCapacity(car.capacity)}</p>
                            <p className="text-xs font-bold mt-1" style={{ color: '#ff7d0f' }}>
                              {t('carPerDay', { price: formatCurrency(car.basePrice) })}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration (only if no package selected) */}
                    {!selectedPackage && (
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
                          {t('tripDuration')}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {durations.map((d) => (
                            <button key={d.id} onClick={() => setSelectedDuration(d.id)}
                              className="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-center"
                              style={selectedDuration === d.id
                                ? { border: '2px solid #ff7d0f', background: 'rgba(255, 125, 15, 0.12)', color: '#ff7d0f' }
                                : { border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }
                              }>
                              {getDurationLabel(d.id, d.label)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date + Pickup */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          <Calendar size={11} className="inline mr-1" />{t('travelDate')}
                        </label>
                        <input type="date" required
                          min={new Date().toISOString().split('T')[0]}
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          <MapPin size={11} className="inline mr-1" />{t('pickupLocation')}
                        </label>
                        <input type="text" required
                          placeholder={t('pickupPlaceholder')}
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          className="input-field" />
                      </div>
                    </div>

                    {/* Add-ons */}
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
                        {t('addonServices')}
                      </label>
                      <div className="space-y-2">
                        {addons.map((addon) => (
                          <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left"
                            style={selectedAddons.includes(addon.id)
                              ? { border: '1.5px solid #ff7d0f', background: 'rgba(255, 125, 15, 0.12)' }
                              : { border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }
                            }>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{addon.icon}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t(`addons.${addon.id}.label`)}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{t(`addons.${addon.id}.description`)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              <span className="text-sm font-bold"
                                style={{ color: addon.price > 0 ? '#ff7d0f' : '#16a34a' }}>
                                {addon.price > 0 ? `+${formatCurrency(addon.price)}` : t('free')}
                              </span>
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={selectedAddons.includes(addon.id)
                                  ? { background: '#ff7d0f' }
                                  : { border: '2px solid var(--border-default)', background: 'var(--bg-surface)' }
                                }>
                                {selectedAddons.includes(addon.id) && <Check size={11} className="text-white" />}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={goToStep2} className="btn-primary w-full py-4 text-base">
                      {t('continueToPassengerDetails')} <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Your Details */}
              {step === 2 && (
                <motion.div key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="card rounded-2xl p-6 mb-5">
                    <button onClick={() => setStep(1)}
                      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-saffron-600 mb-5 transition-colors">
                      <ArrowLeft size={15} />{t('backToTripDetails')}
                    </button>
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{t('step2Title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('step2Subtitle')}</p>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                            <User size={11} className="inline mr-1" />{t('fullName')}
                          </label>
                          <input type="text" placeholder={t('namePlaceholder')} required
                            value={name} onChange={(e) => setName(e.target.value)}
                            className="input-field" autoComplete="name" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                            <Phone size={11} className="inline mr-1" />{t('phoneWhatsApp')}
                          </label>
                          <input type="tel" placeholder={t('phonePlaceholder')} required
                            value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="input-field" autoComplete="tel" />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                            <Mail size={11} className="inline mr-1" />{t('emailAddress')}
                          </label>
                          <input type="email" placeholder={t('emailPlaceholder')}
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="input-field" autoComplete="email" />
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                            <span>📧</span>{t('emailNote')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                            <Users size={11} className="inline mr-1" />{t('numberOfPassengers')}
                          </label>
                          <select value={passengers}
                            onChange={(e) => setPassengers(e.target.value)}
                            className="input-field">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>{t('passengerOption', { count: n })}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          {t('specialRequestsOptional')}
                        </label>
                        <textarea rows={3}
                          placeholder={t('specialRequestsPlaceholder')}
                          value={requests} onChange={(e) => setRequests(e.target.value)}
                          className="input-field resize-none" />
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/60">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {t.rich('whatsAppUpdateNote', {
                            strong: (chunks) => <strong>{chunks}</strong>,
                          })}
                        </p>
                      </div>
                    </div>

                    <button onClick={goToStep3} className="btn-primary w-full py-4 text-base mt-6">
                      {t('reviewAndConfirmBooking')} <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Review & Confirm */}
              {step === 3 && (
                <motion.div key="step3"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="card rounded-2xl p-6 mb-5">
                    <button onClick={() => setStep(2)}
                      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-saffron-600 mb-5 transition-colors">
                      <ArrowLeft size={15} />{t('backToYourDetails')}
                    </button>
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-5">{t('step3Title')}</h2>

                    {/* Summary sections */}
                    {[
                      {
                        title: t('tripDetailsTitle'),
                        items: [
                          { label: t('summaryPackage'),  value: selectedPackageLabel },
                          { label: t('summaryVehicle'),  value: carData.name },
                          { label: t('summaryDuration'), value: getDurationLabel(durationData.id, durationData.label) },
                          { label: t('summaryDate'),     value: formatDateLabel(travelDate) },
                          { label: t('summaryPickup'),   value: pickupLocation },
                        ],
                      },
                      {
                        title: t('passengerDetailsTitle'),
                        items: [
                          { label: t('summaryName'),       value: name },
                          { label: t('summaryPhone'),      value: phone },
                          { label: t('summaryEmail'),      value: email || t('notProvided') },
                          { label: t('summaryPassengers'), value: t('passengerOption', { count: Number(passengers) }) },
                        ],
                      },
                    ].map((section) => (
                      <div key={section.title} className="mb-4 p-5 rounded-2xl"
                        style={mutedPanelStyle}>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-3">{section.title}</h3>
                        <div className="space-y-2">
                          {section.items.map((item) => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                              <span className="font-semibold text-gray-800 dark:text-gray-100 text-right max-w-[200px] truncate">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Add-ons */}
                    {selectedAddons.length > 0 && (
                      <div className="mb-4 p-4 rounded-2xl"
                        style={mutedPanelStyle}>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2">{t('addOnsTitle')}</h3>
                        {addons.filter((a) => selectedAddons.includes(a.id)).map((a) => (
                          <div key={a.id} className="flex justify-between text-sm py-1">
                            <span className="text-gray-600 dark:text-gray-300">{a.icon} {t(`addons.${a.id}.label`)}</span>
                            <span className="font-semibold"
                              style={{ color: a.price > 0 ? '#ff7d0f' : '#16a34a' }}>
                              {a.price > 0 ? `+${formatCurrency(a.price)}` : t('free')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {requests && (
                      <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">{t('specialRequests')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{requests}</p>
                      </div>
                    )}

                    {/* Payment breakdown */}
                    <div className="p-4 rounded-2xl mb-5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 dark:text-gray-300">{t('basePrice')}</span>
                        <span className={`font-semibold ${pkgHasDiscount ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {formatCurrency(basePrice)}
                        </span>
                      </div>
                      {pkgHasDiscount && (
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                            🔥 {pkgData!.discountPercent}% {pkgData?.discountLabel || 'Discount'}
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">−{formatCurrency(discountSaving)}</span>
                        </div>
                      )}
                      {addonTotal > 0 && (
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600 dark:text-gray-300">{t('addOns')}</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">+{formatCurrency(addonTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold pt-2"
                        style={{ borderTop: '1px solid rgba(255, 125, 15, 0.25)' }}>
                        <span className="text-gray-900 dark:text-white">{t('total')}</span>
                        <span style={{ color: '#ff7d0f' }}>{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>

                    {/* 50% onboarding note */}
                    <div className="flex items-start gap-2 p-3 rounded-xl mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                      <span className="text-amber-500 text-sm mt-0.5">ℹ️</span>
                      <p className="text-xs text-amber-800 dark:text-amber-300">{t('onboardingNote')}</p>
                    </div>

                    {/* ── Payment option cards ── */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">
                      {t('choosePaymentMethod')}
                    </h3>
                    <div className="space-y-3">

                      {/* 1 — Pay Cash */}
                      <button type="button" onClick={handlePayCash}
                        disabled={loading}
                        className="w-full text-left p-4 rounded-2xl border transition-all disabled:opacity-60"
                        style={{ border: '1.5px solid var(--border-default)', background: 'var(--bg-surface)' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(22,163,74,0.12)' }}>
                            <Banknote size={18} className="text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t('payOpt.cash.title')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('payOpt.cash.desc')}</p>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">✓ {t('payOpt.cash.note')}</p>
                          </div>
                          <span className="text-xs font-bold text-green-600 flex-shrink-0">FREE</span>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                   : <>{t('payOpt.cash.btn')}</>}
                        </div>
                      </button>

                      {/* 2 — Pay Full Now (online) — temporarily disabled */}
                      {/* TODO: re-enable when Razorpay live keys are ready
                      <button type="button" onClick={() => initiateRazorpay('full')}
                        disabled={loading || status === 'unauthenticated'}
                        className="w-full text-left p-4 rounded-2xl border transition-all disabled:opacity-60"
                        style={{ border: '1.5px solid var(--border-default)', background: 'var(--bg-surface)' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(37,99,235,0.12)' }}>
                            <CreditCard size={18} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t('payOpt.full.title')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {t('payOpt.full.desc', { amount: formatCurrency(totalPrice) })}
                            </p>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{ color: '#ff7d0f' }}>{formatCurrency(totalPrice)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                   : <>{t('payOpt.full.btn', { amount: formatCurrency(totalPrice) })}</>}
                        </div>
                      </button>
                      */}

                      {/* 3 — Pay Advance (online) — temporarily disabled */}
                      {/* TODO: re-enable when Razorpay live keys are ready
                      {safeAdvance > 0 && (
                        <button type="button" onClick={() => initiateRazorpay('advance')}
                          disabled={loading || status === 'unauthenticated'}
                          className="w-full text-left p-4 rounded-2xl border transition-all disabled:opacity-60"
                          style={{ border: '1.5px solid #ff7d0f', background: 'rgba(255,125,15,0.06)' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(255,125,15,0.15)' }}>
                              <Wallet size={18} style={{ color: '#ff7d0f' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                Pay Advance — {formatCurrency(safeAdvance)} <span className="text-xs font-normal text-gray-400">(same for all bookings)</span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Pay {formatCurrency(safeAdvance)} now to confirm · {formatCurrency(totalPrice - safeAdvance)} balance due on trip
                              </p>
                            </div>
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: '#ff7d0f' }}>{formatCurrency(safeAdvance)}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                     : <>Pay {formatCurrency(safeAdvance)} Now →</>}
                          </div>
                        </button>
                      )}
                      */}

                      {/* 4 — Book on WhatsApp */}
                      <button type="button" onClick={handleWhatsAppBook}
                        disabled={loading}
                        className="w-full text-left p-4 rounded-2xl border transition-all disabled:opacity-60"
                        style={{ border: '1.5px solid var(--border-default)', background: 'var(--bg-surface)' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(34,197,94,0.12)' }}>
                            <MessageCircle size={18} className="text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t('payOpt.whatsapp.title')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('payOpt.whatsapp.desc')}</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              {t('payOpt.whatsapp.note', { phone: siteConfig.phone })}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-green-600 flex-shrink-0">FREE</span>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: '#22c55e' }}>
                          <MessageCircle size={14} />
                          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                   : <>{t('payOpt.whatsapp.btn')}</>}
                        </div>
                      </button>

                    </div>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                      {t('secureBookingNote')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Price Summary sidebar ── */}
          <div className="lg:col-span-1">
            <div className="card rounded-2xl p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('bookingSummary')}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('summaryVehicle')}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{carData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('summaryDuration')}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{getDurationLabel(durationData.id, durationData.label)}</span>
                </div>
                {pkgData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('summaryPackage')}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100 text-right max-w-[150px] truncate">{getLocalName(pkgData.name)}</span>
                  </div>
                )}
                {travelDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('summaryDate')}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {formatDateLabel(travelDate, 'short')}
                    </span>
                  </div>
                )}
                {Number(passengers) > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('summaryPassengers')}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{passengers}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('basePrice')}</span>
                  <span className={`font-semibold ${pkgHasDiscount ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                    {formatCurrency(basePrice)}
                  </span>
                </div>
                {pkgHasDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400 font-semibold">🔥 Discount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">−{formatCurrency(discountSaving)}</span>
                  </div>
                )}
                {addonTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('addOns')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">+{formatCurrency(addonTotal)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">{t('total')}</span>
                  <span className="font-bold text-xl" style={{ color: '#ff7d0f' }}>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                {safeAdvance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Advance now</span>
                    <span className="text-xs font-semibold text-green-600">
                      {formatCurrency(safeAdvance)}
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-xl p-3 text-xs leading-relaxed bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300">
                ✓ {t('benefitFreeCancellation')}<br />
                ✓ {t('benefitNoHiddenCharges')}<br />
                ✓ {t('benefitConfirmation')}<br />
                ✓ {t('benefitDriverDetails')}
              </div>

              <a href={`tel:${siteConfig.phone}`}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-full text-sm font-semibold transition-colors bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300">
                <Phone size={14} />{t('needHelpCall')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  )
}
