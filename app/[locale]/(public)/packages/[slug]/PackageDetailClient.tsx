'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Star, Clock, MapPin, Users, Check, X as XIcon,
  Phone, MessageCircle, Calendar, ChevronRight, ArrowLeft,
} from 'lucide-react'
import { formatCurrency }  from '@/lib/utils'
import ImageGallery          from '@/components/shared/ImageGallery'
import { siteConfig } from '@/config/site'

// Self-contained interfaces — fully required fields on the detail page
export interface ItineraryDay {
  day: number
  title: string
  description: string
  places: string[]
}

export interface Pricing {
  carType: string
  carName: string
  price: number
}

export interface PackageData {
  slug: string
  name: string
  duration: number
  nights: number
  cities: string[]
  basePrice: number
  rating: number
  totalReviews: number
  isPopular: boolean
  highlights: string[]
  shortDescription: string
  inclusions: string[]
  exclusions: string[]
  itinerary: ItineraryDay[]
  pricing:   Pricing[]
  images:    string[]   // always an array, never undefined ([] if empty)
  thumbnail: string     // always a string ('' if empty)
}

const TABS = ['Overview', 'Itinerary', 'Pricing', 'Inclusions', 'Reviews']

// ReviewItem matches ReviewSummary from fetchData.ts exactly
export interface ReviewItem {
  _id:       string
  rating:    number
  title:     string
  comment:   string
  createdAt: string
  customer:  { name: string }
  package?:  { name: string; slug: string }
}

export default function PackageDetailClient({ pkg, reviews = [] }: { pkg: PackageData; reviews?: ReviewItem[] }) {
  const [activeTab,    setActiveTab]    = useState('Overview')
  const [selectedCar,  setSelectedCar]  = useState(pkg.pricing[0]?.carType ?? '')
  const [expandedDay,  setExpandedDay]  = useState<number | null>(1)

  const selectedPricing = pkg.pricing.find((p) => p.carType === selectedCar)
  const whatsappMsg = `Namaste! I'm interested in the "${pkg.name}" package. Please share more details. 🙏`

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div
        className="py-14 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1e1b4b 100%)' }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff7d0f, transparent)' }} />

        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-saffron-400 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/packages" className="hover:text-saffron-400 transition-colors">Packages</Link>
            <ChevronRight size={12} />
            <span className="text-gray-300 truncate max-w-xs">{pkg.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-saffron badge">
                  <Clock size={11} />{pkg.duration} {pkg.duration === 1 ? 'Day' : 'Days'}
                  {pkg.nights > 0 && ` / ${pkg.nights} Night${pkg.nights > 1 ? 's' : ''}`}
                </span>
                {pkg.isPopular && (
                  <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                    🔥 Popular
                  </span>
                )}
              </div>

              <h1
                className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {pkg.name}
              </h1>

              <p className="text-gray-300 mb-5 leading-relaxed">{pkg.shortDescription}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-5 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                  <span className="font-semibold text-white">{pkg.rating}</span>
                  <span className="text-gray-400">({pkg.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin size={14} className="text-saffron-400" />
                  {pkg.cities.join(' · ')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users size={14} className="text-saffron-400" />
                  Small groups welcome
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                {pkg.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: price card */}
            <div
              className="rounded-3xl p-6 sm:p-7"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <p className="text-gray-300 text-sm mb-1">Starting from</p>
              <p className="text-4xl font-bold mb-1" style={{ color: '#ff7d0f' }}>
                {formatCurrency(pkg.basePrice)}
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Per trip · All inclusive · No hidden charges
              </p>

              {/* Quick car select */}
              <div className="space-y-2 mb-6">
                {pkg.pricing.slice(0, 3).map((p) => (
                  <button
                    key={p.carType}
                    onClick={() => setSelectedCar(p.carType)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
                    style={selectedCar === p.carType
                      ? { background: 'rgba(255,125,15,0.2)', border: '1.5px solid #ff7d0f' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    <span className="text-sm font-medium text-gray-200">{p.carName}</span>
                    <span className="font-bold" style={{ color: '#ff7d0f' }}>
                      {formatCurrency(p.price)}
                    </span>
                  </button>
                ))}
              </div>

              <Link
                href={`/booking?package=${pkg.slug}&car=${selectedCar}`}
                className="btn-primary w-full text-base py-4 mb-3"
              >
                <Calendar size={18} />
                Book This Package
              </Link>

              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm transition-colors mb-3"
                style={{ background: '#dcfce7', color: '#16a34a' }}
              >
                <MessageCircle size={16} />
                WhatsApp Enquiry
              </a>

              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Phone size={15} />
                Call to Book — {siteConfig.phone}
              </a>

              <p className="text-center text-xs text-gray-500 mt-3">
                Free cancellation up to 24 hrs before trip
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content tabs ── */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-custom">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px"
                style={activeTab === tab
                  ? { borderColor: '#ff7d0f', color: '#ff7d0f' }
                  : { borderColor: 'transparent', color: '#6b7280' }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="container-custom py-10">
        <div className="max-w-4xl">

          {/* Overview */}
          {activeTab === 'Overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

              {/* Photo gallery */}
              {(pkg.images.filter(Boolean).length > 0 || pkg.thumbnail) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'var(--font-serif)' }}>
                    📸 Photo Gallery
                  </h2>
                  <ImageGallery
                    images={
                      pkg.images.filter(Boolean).length > 0
                        ? pkg.images.filter(Boolean)
                        : pkg.thumbnail ? [pkg.thumbnail] : []
                    }
                    name={pkg.name}
                    type="temple"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                About This Package
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">{pkg.shortDescription}</p>

              <h3 className="text-lg font-bold text-gray-900 mb-4">Package Highlights</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {pkg.highlights.map((h) => (
                  <div key={h}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    <span className="text-sm text-gray-700">{h}</span>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: '📅', label: 'Duration', value: `${pkg.duration} Days${pkg.nights > 0 ? ` / ${pkg.nights} Nights` : ''}` },
                  { icon: '📍', label: 'Destinations', value: pkg.cities.join(', ') },
                  { icon: '⭐', label: 'Rating', value: `${pkg.rating}/5 (${pkg.totalReviews} reviews)` },
                ].map((item) => (
                  <div key={item.label}
                    className="p-5 rounded-2xl text-center"
                    style={{ background: '#fff8ed', border: '1px solid #ffefd4' }}>
                    <p className="text-3xl mb-2">{item.icon}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">{item.label}</p>
                    <p className="font-bold text-gray-800 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Itinerary */}
          {activeTab === 'Itinerary' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Day-by-Day Itinerary
              </h2>
              <div className="space-y-4">
                {pkg.itinerary.map((day) => (
                  <div key={day.day}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
                        >
                          {day.day}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Day {day.day}</p>
                          <p className="font-bold text-gray-900">{day.title}</p>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: expandedDay === day.day ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight size={18} className="text-gray-400 rotate-90" />
                      </motion.div>
                    </button>

                    {expandedDay === day.day && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 bg-white"
                        style={{ borderTop: '1px solid #f3f4f6' }}
                      >
                        <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-4">
                          {day.description}
                        </p>
                        {day.places.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Places Covered
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {day.places.map((place) => (
                                <span key={place}
                                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                                  style={{ background: '#fff8ed', color: '#c74a06', border: '1px solid #ffdba8' }}>
                                  🛕 {place}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pricing */}
          {activeTab === 'Pricing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Choose Your Vehicle
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                All prices are per trip, inclusive of driver charges and fuel. No hidden fees.
              </p>

              <div className="space-y-3 mb-8">
                {pkg.pricing.map((p) => (
                  <button
                    key={p.carType}
                    onClick={() => setSelectedCar(p.carType)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-200 text-left"
                    style={selectedCar === p.carType
                      ? { background: '#fff8ed', border: '2px solid #ff7d0f' }
                      : { background: '#fff', border: '1px solid #e5e7eb' }
                    }
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">🚗</span>
                      <div>
                        <p className="font-bold text-gray-900">{p.carName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">AC · GPS · Experienced driver</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-bold" style={{ color: '#ff7d0f' }}>
                        {formatCurrency(p.price)}
                      </p>
                      <p className="text-xs text-gray-400">per trip</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPricing && (
                <div
                  className="rounded-2xl p-5 mb-6"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                >
                  <p className="text-green-700 font-semibold text-sm mb-1">✓ Selected: {selectedPricing.carName}</p>
                  <p className="text-2xl font-bold text-green-800">{formatCurrency(selectedPricing.price)}</p>
                  <p className="text-green-600 text-xs mt-1">Inclusive of all charges · No hidden fees</p>
                </div>
              )}

              <Link
                href={`/booking?package=${pkg.slug}&car=${selectedCar}`}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                <Calendar size={18} />
                Book Now — {selectedPricing ? formatCurrency(selectedPricing.price) : ''}
              </Link>
            </motion.div>
          )}

          {/* Inclusions */}
          {activeTab === 'Inclusions' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-green-500">✓</span> What&apos;s Included
                  </h2>
                  <ul className="space-y-3">
                    {pkg.inclusions.map((item) => (
                      <li key={item}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-red-500">✗</span> Not Included
                  </h2>
                  <ul className="space-y-3">
                    {pkg.exclusions.map((item) => (
                      <li key={item}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                        <XIcon size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
          {/* ── Reviews tab ── */}
          {activeTab === 'Reviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: 'var(--font-serif)' }}>
                    Customer Reviews
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {reviews.length > 0
                      ? `${reviews.length} verified review${reviews.length !== 1 ? 's' : ''} from real customers`
                      : 'Be the first to review this package'}
                  </p>
                </div>
                {pkg.rating > 0 && (
                  <div className="text-center">
                    <p className="text-4xl font-bold" style={{ color: '#f59e0b' }}>
                      {pkg.rating.toFixed(1)}
                    </p>
                    <div className="flex gap-0.5 justify-center my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14}
                          fill={i < Math.round(pkg.rating) ? '#f59e0b' : 'none'}
                          stroke={i < Math.round(pkg.rating) ? '#f59e0b' : '#d1d5db'} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{pkg.totalReviews} reviews</p>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl"
                  style={{ background: '#f9fafb' }}>
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-gray-500 font-medium">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Book this package and share your experience!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="card rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
                          >
                            {review.customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.customer.name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                month: 'long', year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={13}
                              fill={i < review.rating ? '#f59e0b' : 'none'}
                              stroke={i < review.rating ? '#f59e0b' : '#d1d5db'} />
                          ))}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link href="/packages"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-saffron-600 transition-colors font-medium">
            <ArrowLeft size={15} />
            Back to all packages
          </Link>
        </div>
      </div>
    </div>
  )
}