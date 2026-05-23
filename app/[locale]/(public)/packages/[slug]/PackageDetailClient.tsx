'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
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

const TAB_KEYS = ['Overview', 'Itinerary', 'Pricing', 'Inclusions', 'Reviews'] as const
const TAB_LABEL_KEYS = {
  Overview:   'tabOverview',
  Itinerary:  'tabItinerary',
  Pricing:    'tabPricing',
  Inclusions: 'tabInclusions',
  Reviews:    'tabReviews',
} as const

type BLField = string | { en: string; hi: string }
function bl(v: BLField, locale: string): string {
  if (typeof v === 'string') return v
  return locale === 'hi' ? (v.hi || v.en) : v.en
}

// ReviewItem matches ReviewSummary from fetchData.ts exactly
export interface ReviewItem {
  _id:       string
  rating:    number
  title:     BLField
  comment:   BLField
  createdAt: string
  customer:  { name: string }
  package?:  { name: BLField; slug: string }
}

export default function PackageDetailClient({ pkg, reviews = [] }: { pkg: PackageData; reviews?: ReviewItem[] }) {
  const t                              = useTranslations('PackageDetail')
  const locale                         = useLocale()
  const [activeTab,    setActiveTab]   = useState<typeof TAB_KEYS[number]>('Overview')
  const [selectedCar,  setSelectedCar] = useState(pkg.pricing[0]?.carType ?? '')
  const [expandedDay,  setExpandedDay] = useState<number | null>(1)

  const selectedPricing = pkg.pricing.find((p) => p.carType === selectedCar)
  const whatsappMsg     = t('whatsAppGreeting', { name: pkg.name })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

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
            <Link href="/" className="hover:text-saffron-400 transition-colors">{t('breadcrumbHome')}</Link>
            <ChevronRight size={12} />
            <Link href="/packages" className="hover:text-saffron-400 transition-colors">{t('breadcrumbPackages')}</Link>
            <ChevronRight size={12} />
            <span className="text-gray-300 truncate max-w-xs">{pkg.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-saffron badge">
                  <Clock size={11} />{pkg.duration} {pkg.duration === 1 ? t('day') : t('days')}
                  {pkg.nights > 0 && ` / ${pkg.nights} ${pkg.nights > 1 ? t('nights') : t('night')}`}
                </span>
                {pkg.isPopular && (
                  <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                    {t('popular')}
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
                  <span className="text-gray-400">({t('reviewsCount', { count: pkg.totalReviews })})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin size={14} className="text-saffron-400" />
                  {pkg.cities.join(' · ')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users size={14} className="text-saffron-400" />
                  {t('smallGroups')}
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
              <p className="text-gray-300 text-sm mb-1">{t('startingFrom')}</p>
              <p className="text-4xl font-bold mb-1" style={{ color: '#ff7d0f' }}>
                {formatCurrency(pkg.basePrice)}
              </p>
              <p className="text-gray-400 text-xs mb-6">
                {t('perTripInclusive')}
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
                {t('bookThisPackage')}
              </Link>

              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm transition-colors mb-3"
                style={{ background: '#dcfce7', color: '#16a34a' }}
              >
                <MessageCircle size={16} />
                {t('whatsAppEnquiry')}
              </a>

              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Phone size={15} />
                {t('callToBook')} — {siteConfig.phone}
              </a>

              <p className="text-center text-xs text-gray-500 mt-3">
                {t('freeCancellation')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content tabs ── */}
      <div className="sticky top-20 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container-custom">
          <div className="flex gap-1 overflow-x-auto">
            {TAB_KEYS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px"
                style={activeTab === tab
                  ? { borderColor: '#ff7d0f', color: '#ff7d0f' }
                  : { borderColor: 'transparent', color: 'var(--text-muted)' }
                }
              >
                {t(TAB_LABEL_KEYS[tab])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="container-custom py-10">
        <div className="max-w-4xl">

          {/* Overview */}
          {(activeTab as string) === 'Overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

              {/* Photo gallery */}
              {(pkg.images.filter(Boolean).length > 0 || pkg.thumbnail) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                    style={{ fontFamily: 'var(--font-serif)' }}>
                    {t('photoGallery')}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('aboutThisPackage')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">{pkg.shortDescription}</p>

              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('packageHighlights')}</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {pkg.highlights.map((h) => (
                  <div key={h}
                    className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{h}</span>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: '📅', label: t('metaDuration'),     value: `${pkg.duration} ${t('days')}${pkg.nights > 0 ? ` / ${pkg.nights} ${t('nights')}` : ''}` },
                  { icon: '📍', label: t('metaDestinations'), value: pkg.cities.join(', ') },
                  { icon: '⭐', label: t('metaRating'),       value: t('ratingValue', { rating: pkg.rating, count: pkg.totalReviews }) },
                ].map((item) => (
                  <div key={item.label}
                    className="p-5 rounded-2xl text-center bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-100 dark:border-saffron-900/40">
                    <p className="text-3xl mb-2">{item.icon}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">{item.label}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Itinerary */}
          {activeTab === 'Itinerary' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('dayByDay')}
              </h2>
              <div className="space-y-4">
                {pkg.itinerary.map((day) => (
                  <div key={day.day}
                    className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
                        >
                          {day.day}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{t('dayLabel', { day: day.day })}</p>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{day.title}</p>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: expandedDay === day.day ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight size={18} className="text-gray-400 dark:text-gray-500 rotate-90" />
                      </motion.div>
                    </button>

                    {expandedDay === day.day && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
                      >
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-4 mb-4">
                          {day.description}
                        </p>
                        {day.places.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                              {t('placesCovered')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {day.places.map((place) => (
                                <span key={place}
                                  className="text-xs px-3 py-1.5 rounded-full font-medium bg-saffron-50 text-saffron-700 border border-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-300 dark:border-saffron-800/50">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('chooseVehicle')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {t('pricingNote')}
              </p>

              <div className="space-y-3 mb-8">
                {pkg.pricing.map((p) => (
                  <button
                    key={p.carType}
                    onClick={() => setSelectedCar(p.carType)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-200 text-left ${
                      selectedCar === p.carType
                        ? 'bg-saffron-50 dark:bg-saffron-900/20 border-2 border-saffron-500'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">🚗</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{p.carName}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('vehicleFeatures')}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-bold" style={{ color: '#ff7d0f' }}>
                        {formatCurrency(p.price)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t('perTrip')}</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPricing && (
                <div className="rounded-2xl p-5 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40">
                  <p className="text-green-700 dark:text-green-300 font-semibold text-sm mb-1">{t('selected', { car: selectedPricing.carName })}</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(selectedPricing.price)}</p>
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1">{t('selectedNote')}</p>
                </div>
              )}

              <Link
                href={`/booking?package=${pkg.slug}&car=${selectedCar}`}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                <Calendar size={18} />
                {t('bookNow')} — {selectedPricing ? formatCurrency(selectedPricing.price) : ''}
              </Link>
            </motion.div>
          )}

          {/* Inclusions */}
          {activeTab === 'Inclusions' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {t('whatsIncluded')}
                  </h2>
                  <ul className="space-y-3">
                    {pkg.inclusions.map((item) => (
                      <li key={item}
                        className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-red-500">✗</span> {t('notIncluded')}
                  </h2>
                  <ul className="space-y-3">
                    {pkg.exclusions.map((item) => (
                      <li key={item}
                        className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40">
                        <XIcon size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100"
                    style={{ fontFamily: 'var(--font-serif)' }}>
                    {t('customerReviews')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {reviews.length > 0
                      ? (reviews.length === 1 ? t('verifiedReview', { count: reviews.length }) : t('verifiedReviews', { count: reviews.length }))
                      : t('beFirst')}
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
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('reviewCount', { count: pkg.totalReviews })}</p>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-gray-50 dark:bg-gray-900">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noReviewsYet')}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {t('noReviewsHint')}
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
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{review.customer.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
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
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{bl(review.title, locale)}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{bl(review.comment, locale)}</p>
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
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors font-medium">
            <ArrowLeft size={15} />
            {t('backToPackages')}
          </Link>
        </div>
      </div>
    </div>
  )
}