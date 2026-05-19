'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter }    from 'next/navigation'
import { useSession }                    from 'next-auth/react'
import { motion, AnimatePresence }       from 'framer-motion'
import Link from 'next/link'
import {
  Car, Calendar, Users, MapPin, Phone, Mail, User,
  ChevronRight, Check, ArrowLeft, MessageCircle, LogIn,
} from 'lucide-react'
import toast                   from 'react-hot-toast'
import { cars, durations, addons, siteConfig } from '@/config/site'
import { formatCurrency }       from '@/lib/utils'
import type { PackageSummary }  from '@/lib/fetchData'

const STEPS = ['Trip Details', 'Your Details', 'Confirm & Pay']

/* ─── Types ─────────────────────────────────────────────── */
interface PackageOption extends Pick<PackageSummary, '_id' | 'slug' | 'name' | 'duration' | 'basePrice'> {
  pricing?: { carType: string; price: number }[]
}

/* ─── Booking form (inner, uses useSearchParams) ─────────── */
function BookingForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { data: session, status } = useSession()

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

  /* Fetch active packages for selector */
  useEffect(() => {
    fetch('/api/packages?limit=20')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPackages(d.data)
      })
      .catch(() => {/* silently fail — selector just shows empty */})
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

  const totalPrice    = basePrice + addonTotal
  const advanceAmount = Math.round(totalPrice * 0.3)

  function toggleAddon(id: string) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    )
  }

  /* ── Navigation guards ── */
  function goToStep2() {
    if (!travelDate)            { toast.error('Please select a travel date.');         return }
    if (!pickupLocation.trim()) { toast.error('Please enter your pickup location.');   return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToStep3() {
    if (!name.trim())    { toast.error('Please enter your name.');         return }
    if (!phone.trim())   { toast.error('Please enter your phone number.'); return }
    if (!/^\+?[\d\s-]{8,}$/.test(phone)) {
      toast.error('Please enter a valid phone number.')
      return
    }
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Final submit ── */
  async function handleConfirm() {
    setLoading(true)
    try {
      /* If not logged in, create a guest session or redirect to register */
      if (status === 'unauthenticated') {
        toast.error('Please sign in to confirm your booking.')
        router.push(`/login?callbackUrl=/booking?package=${selectedPackage}&car=${selectedCar}`)
        return
      }

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
          advanceAmount,
          addons:          selectedAddons,
          specialRequests: requests.trim() || undefined,
          customerName:    name.trim(),
          customerPhone:   phone.trim(),
          customerEmail:   email.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Booking failed. Please try again.')
        return
      }

      /* Success! */
      toast.success(
        `Booking confirmed! ID: ${data.data.bookingId} — We'll call you within 30 min. Jai Shri Krishna 🙏`,
        { duration: 7000 },
      )

      router.push(`/booking/confirmation?id=${data.data.bookingId}&amount=${totalPrice}&advance=${advanceAmount}`)

    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please call us directly.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero strip */}
      <div className="py-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}>
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-saffron-400 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-300">Book a Tour</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Book Your Mathura Vrindavan Tour
          </h1>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
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
                {i < STEPS.length - 1 && (
                  <div className="w-8 sm:w-14 h-px mx-2"
                    style={{ background: step > i + 1 ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Not logged in warning */}
          {status === 'unauthenticated' && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-200 bg-amber-900/30 px-4 py-2.5 rounded-xl w-fit">
              <LogIn size={13} />
              You&apos;ll need to <Link href="/login?callbackUrl=/booking" className="underline font-semibold">sign in</Link> to confirm your booking.
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
                    <h2 className="font-bold text-gray-900 text-lg mb-1">Step 1: Trip Details</h2>
                    <p className="text-gray-500 text-sm mb-6">Choose your vehicle, duration, date and pickup.</p>

                    {/* Package selector */}
                    {packages.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                          Select Package (Optional)
                        </label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <button onClick={() => setSelectedPackage('')}
                            className="p-3 rounded-xl text-left transition-all duration-200"
                            style={!selectedPackage
                              ? { border: '2px solid #ff7d0f', background: '#fff8ed' }
                              : { border: '1px solid #e5e7eb', background: '#fff' }
                            }>
                            <p className="text-sm font-semibold text-gray-800">Custom Trip</p>
                            <p className="text-xs text-gray-400 mt-0.5">Select duration & car manually</p>
                          </button>
                          {packages.slice(0, 5).map((pkg) => (
                            <button key={pkg.slug}
                              onClick={() => {
                                setSelectedPackage(pkg.slug)
                                const dur = durations.find((d) => d.days === pkg.duration)
                                if (dur) setSelectedDuration(dur.id)
                              }}
                              className="p-3 rounded-xl text-left transition-all duration-200"
                              style={selectedPackage === pkg.slug
                                ? { border: '2px solid #ff7d0f', background: '#fff8ed' }
                                : { border: '1px solid #e5e7eb', background: '#fff' }
                              }>
                              <p className="text-sm font-semibold text-gray-800 truncate">{pkg.name}</p>
                              <p className="text-xs mt-0.5" style={{ color: '#ff7d0f' }}>
                                from {formatCurrency(pkg.basePrice)} · {pkg.duration}D
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vehicle selector */}
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        <Car size={12} className="inline mr-1" />Choose Your Vehicle
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {cars.map((car) => (
                          <button key={car.id} onClick={() => setSelectedCar(car.id)}
                            className="p-3 rounded-xl text-center transition-all duration-200"
                            style={selectedCar === car.id
                              ? { border: '2px solid #ff7d0f', background: '#fff8ed' }
                              : { border: '1px solid #e5e7eb', background: '#fff' }
                            }>
                            <span className="text-2xl block mb-1">🚗</span>
                            <p className="text-xs font-bold text-gray-900 leading-tight">{car.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{car.capacity}</p>
                            <p className="text-xs font-bold mt-1" style={{ color: '#ff7d0f' }}>
                              ₹{car.basePrice.toLocaleString('en-IN')}/day
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration (only if no package selected) */}
                    {!selectedPackage && (
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                          Trip Duration
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {durations.map((d) => (
                            <button key={d.id} onClick={() => setSelectedDuration(d.id)}
                              className="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-center"
                              style={selectedDuration === d.id
                                ? { border: '2px solid #ff7d0f', background: '#fff8ed', color: '#c74a06' }
                                : { border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280' }
                              }>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date + Pickup */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          <Calendar size={11} className="inline mr-1" />Travel Date *
                        </label>
                        <input type="date" required
                          min={new Date().toISOString().split('T')[0]}
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          <MapPin size={11} className="inline mr-1" />Pickup Location *
                        </label>
                        <input type="text" required
                          placeholder="e.g. Mathura Junction, Hotel name..."
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          className="input-field" />
                      </div>
                    </div>

                    {/* Add-ons */}
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        Add-on Services
                      </label>
                      <div className="space-y-2">
                        {addons.map((addon) => (
                          <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left"
                            style={selectedAddons.includes(addon.id)
                              ? { border: '1.5px solid #ff7d0f', background: '#fff8ed' }
                              : { border: '1px solid #e5e7eb', background: '#fff' }
                            }>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{addon.icon}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{addon.label}</p>
                                <p className="text-xs text-gray-400">{addon.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              <span className="text-sm font-bold"
                                style={{ color: addon.price > 0 ? '#ff7d0f' : '#16a34a' }}>
                                {addon.price > 0 ? `+${formatCurrency(addon.price)}` : 'FREE'}
                              </span>
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={selectedAddons.includes(addon.id)
                                  ? { background: '#ff7d0f' }
                                  : { border: '2px solid #d1d5db', background: '#fff' }
                                }>
                                {selectedAddons.includes(addon.id) && <Check size={11} className="text-white" />}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={goToStep2} className="btn-primary w-full py-4 text-base">
                      Continue to Passenger Details <ChevronRight size={18} />
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
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-saffron-600 mb-5 transition-colors">
                      <ArrowLeft size={15} />Back to Trip Details
                    </button>
                    <h2 className="font-bold text-gray-900 text-lg mb-1">Step 2: Your Details</h2>
                    <p className="text-gray-500 text-sm mb-6">We need your contact info to confirm the booking.</p>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                            <User size={11} className="inline mr-1" />Full Name *
                          </label>
                          <input type="text" placeholder="Ram Sharma" required
                            value={name} onChange={(e) => setName(e.target.value)}
                            className="input-field" autoComplete="name" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                            <Phone size={11} className="inline mr-1" />Phone / WhatsApp *
                          </label>
                          <input type="tel" placeholder="+91 98765 43210" required
                            value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="input-field" autoComplete="tel" />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                            <Mail size={11} className="inline mr-1" />Email Address
                          </label>
                          <input type="email" placeholder="your@email.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="input-field" autoComplete="email" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                            <Users size={11} className="inline mr-1" />Number of Passengers *
                          </label>
                          <select value={passengers}
                            onChange={(e) => setPassengers(e.target.value)}
                            className="input-field">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          Special Requests (Optional)
                        </label>
                        <textarea rows={3}
                          placeholder="Mobility assistance, specific temples, dietary needs..."
                          value={requests} onChange={(e) => setRequests(e.target.value)}
                          className="input-field resize-none" />
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <p className="text-sm text-green-700">
                          Booking confirmation & updates will be sent to your WhatsApp.
                          Our team calls within <strong>30 minutes</strong>.
                        </p>
                      </div>
                    </div>

                    <button onClick={goToStep3} className="btn-primary w-full py-4 text-base mt-6">
                      Review & Confirm Booking <ChevronRight size={18} />
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
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-saffron-600 mb-5 transition-colors">
                      <ArrowLeft size={15} />Back to Your Details
                    </button>
                    <h2 className="font-bold text-gray-900 text-lg mb-5">Step 3: Review & Confirm</h2>

                    {/* Summary sections */}
                    {[
                      {
                        title: '🚗 Trip Details',
                        items: [
                          { label: 'Package',  value: pkgData?.name ?? 'Custom Trip' },
                          { label: 'Vehicle',  value: carData.name },
                          { label: 'Duration', value: durationData.label },
                          { label: 'Date',     value: travelDate ? new Date(travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                          { label: 'Pickup',   value: pickupLocation },
                        ],
                      },
                      {
                        title: '👤 Passenger Details',
                        items: [
                          { label: 'Name',       value: name },
                          { label: 'Phone',      value: phone },
                          { label: 'Email',      value: email || 'Not provided' },
                          { label: 'Passengers', value: `${passengers} people` },
                        ],
                      },
                    ].map((section) => (
                      <div key={section.title} className="mb-4 p-5 rounded-2xl"
                        style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                        <h3 className="font-bold text-gray-800 text-sm mb-3">{section.title}</h3>
                        <div className="space-y-2">
                          {section.items.map((item) => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-gray-500">{item.label}</span>
                              <span className="font-semibold text-gray-800 text-right max-w-[200px] truncate">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Add-ons */}
                    {selectedAddons.length > 0 && (
                      <div className="mb-4 p-4 rounded-2xl"
                        style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                        <h3 className="font-bold text-gray-800 text-sm mb-2">🎁 Add-ons</h3>
                        {addons.filter((a) => selectedAddons.includes(a.id)).map((a) => (
                          <div key={a.id} className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">{a.icon} {a.label}</span>
                            <span className="font-semibold"
                              style={{ color: a.price > 0 ? '#ff7d0f' : '#16a34a' }}>
                              {a.price > 0 ? `+${formatCurrency(a.price)}` : 'FREE'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {requests && (
                      <div className="mb-4 p-4 rounded-2xl"
                        style={{ background: '#fffbeb', border: '1px solid #fef3c7' }}>
                        <p className="text-xs font-semibold text-amber-700 mb-1">Special Requests</p>
                        <p className="text-sm text-gray-700">{requests}</p>
                      </div>
                    )}

                    {/* Payment breakdown */}
                    <div className="p-4 rounded-2xl mb-5"
                      style={{ background: '#fff8ed', border: '1px solid #ffdba8' }}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600">Base price</span>
                        <span className="font-semibold">{formatCurrency(basePrice)}</span>
                      </div>
                      {addonTotal > 0 && (
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600">Add-ons</span>
                          <span className="font-semibold">+{formatCurrency(addonTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold pt-2"
                        style={{ borderTop: '1px solid #ffdba8' }}>
                        <span className="text-gray-900">Total</span>
                        <span style={{ color: '#ff7d0f' }}>{formatCurrency(totalPrice)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Pay <strong className="text-saffron-600">{formatCurrency(advanceAmount)} (30% advance)</strong> to confirm.
                        Remaining <strong>{formatCurrency(totalPrice - advanceAmount)}</strong> on trip day.
                      </p>
                    </div>

                    {/* Not logged in CTA */}
                    {status === 'unauthenticated' && (
                      <div className="p-4 rounded-2xl mb-4"
                        style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <p className="text-sm text-blue-700 font-semibold mb-2">Sign in to confirm your booking</p>
                        <p className="text-xs text-blue-600 mb-3">
                          You need an account to track your booking and receive updates.
                        </p>
                        <Link href="/login?callbackUrl=/booking"
                          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full"
                          style={{ background: '#2563eb', color: '#fff' }}>
                          <LogIn size={13} />Sign In / Create Account
                        </Link>
                      </div>
                    )}

                    <button
                      onClick={handleConfirm}
                      disabled={loading || status === 'unauthenticated'}
                      className="btn-primary w-full py-4 text-base"
                      style={{ opacity: (loading || status === 'unauthenticated') ? 0.7 : 1 }}>
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                      ) : (
                        <>Confirm Booking — {formatCurrency(totalPrice)}</>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
                        `Namaste! I want to book a ${carData.name} for ${durationData.label} on ${travelDate}. Pickup: ${pickupLocation}. Name: ${name}, Phone: ${phone}. Total: ₹${totalPrice}. Please confirm. 🙏`
                      )}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm mt-3 transition-colors"
                      style={{ background: '#dcfce7', color: '#16a34a' }}>
                      <MessageCircle size={16} />Or Book via WhatsApp (no account needed)
                    </a>

                    <p className="text-center text-xs text-gray-400 mt-3">
                      🔒 Secure booking · Free cancellation up to 24 hrs
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Price Summary sidebar ── */}
          <div className="lg:col-span-1">
            <div className="card rounded-2xl p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-semibold text-gray-800">{carData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-800">{durationData.label}</span>
                </div>
                {pkgData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Package</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[150px] truncate">{pkgData.name}</span>
                  </div>
                )}
                {travelDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}
                {Number(passengers) > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Passengers</span>
                    <span className="font-semibold text-gray-800">{passengers}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base price</span>
                  <span className="font-semibold">{formatCurrency(basePrice)}</span>
                </div>
                {addonTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Add-ons</span>
                    <span className="font-semibold">+{formatCurrency(addonTotal)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl" style={{ color: '#ff7d0f' }}>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Advance now (30%)</span>
                  <span className="text-xs font-semibold text-green-600">
                    {formatCurrency(advanceAmount)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: '#f0fdf4', color: '#166534' }}>
                ✓ Free cancellation up to 24 hrs<br />
                ✓ No hidden charges<br />
                ✓ Confirmation within 30 minutes<br />
                ✓ Driver details shared before trip
              </div>

              <a href={`tel:${siteConfig.phone}`}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-full text-sm font-semibold transition-colors"
                style={{ background: '#fff8ed', color: '#c74a06' }}>
                <Phone size={14} />Need help? Call us
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  )
}