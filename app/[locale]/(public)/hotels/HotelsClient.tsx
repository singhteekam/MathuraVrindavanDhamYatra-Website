'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Star, MapPin, Phone, Wifi, UtensilsCrossed, Car, Snowflake } from 'lucide-react'
import { siteConfig } from '@/config/site'

type BLField = string | { en: string; hi: string }

interface HotelData {
  _id:         string
  name:        BLField
  city:        BLField
  address:     BLField
  description: BLField
  amenities:   { en: string; hi: string }[]
  category:    BLField
  rating:      number
  priceRange:  { min: number; max: number }
  isVegOnly:   boolean
  isFeatured:  boolean
}

function bl(v: BLField, locale: string): string {
  if (typeof v === 'string') return v
  return locale === 'hi' ? (v.hi || v.en) : v.en
}

interface Props {
  hotels: HotelData[]
  locale: string
}

const CITY_KEYS = [
  { slug: 'All',       key: 'cityAll' },
  { slug: 'Mathura',   key: 'cityMathura' },
  { slug: 'Vrindavan', key: 'cityVrindavan' },
  { slug: 'Govardhan', key: 'cityGovardhan' },
  { slug: 'Barsana',   key: 'cityBarsana' },
]
const CATEGORY_KEYS = [
  { value: 'all',       key: 'categoryAll'      },
  { value: 'budget',    key: 'categoryBudget'   },
  { value: 'mid-range', key: 'categoryMidRange' },
  { value: 'premium',   key: 'categoryPremium'  },
]

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi:       <Wifi size={13} />,
  AC:         <Snowflake size={13} />,
  Restaurant: <UtensilsCrossed size={13} />,
  Parking:    <Car size={13} />,
}

function formatPrice(min: number, max: number, perNightLabel: string) {
  return `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}${perNightLabel}`
}

export default function HotelsClient({ hotels, locale }: Props) {
  const t                       = useTranslations('HotelsPage')
  const [city,     setCity]     = useState('All')
  const [category, setCategory] = useState('all')

  const CITIES     = CITY_KEYS.map((c) => ({ ...c, label: t(c.key) }))
  const CATEGORIES = CATEGORY_KEYS.map((c) => ({ ...c, label: t(c.key) }))

  const filtered = hotels
    .filter((h: HotelData) => {
      if (city     !== 'All'  && bl(h.city,     'en') !== city)     return false
      if (category !== 'all'  && bl(h.category, 'en') !== category) return false
      return true
    })
    .sort((a: HotelData, b: HotelData) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1e1b4b 100%)' }}
      >
        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            ✦ {t('heroSubtitle')} ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base mb-6"
          >
            {t('heroDescription')}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(t('whatsAppGreeting'))}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              style={{ background: '#22c55e', color: '#fff' }}
            >
              {t('whatsAppHelp')}
            </a>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button key={c.slug} onClick={() => setCity(c.slug)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={city === c.slug
                  ? { background: '#ff7d0f', color: '#fff' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                }
              >
                <MapPin size={11} />{c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={category === cat.value
                  ? { background: '#4338ca', color: '#fff' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('showing')} <strong className="text-gray-800 dark:text-gray-200">{filtered.length}</strong> {t('hotels')}
          {city !== 'All' && <> {t('inCity')} <strong className="text-saffron-600 dark:text-saffron-400">{CITIES.find((c) => c.slug === city)?.label ?? city}</strong></>}
        </p>

        {/* Hotel grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hotel: HotelData, i: number) => (
            <motion.div
              key={hotel._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="card card-hover overflow-hidden flex flex-col"
            >
              {/* Image placeholder */}
              <div className="relative h-44"
                style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🏨</span>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="badge-saffron badge">
                    <MapPin size={9} />{bl(hotel.city, locale)}
                  </span>
                  {hotel.isVegOnly && (
                    <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      {t('pureVeg')}
                    </span>
                  )}
                </div>
                {hotel.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                      {t('recommended')}
                    </span>
                  </div>
                )}
                <div
                  className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fbbf24' }}>
                  <Star size={10} fill="currentColor" />
                  {hotel.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-1">{bl(hotel.name, locale)}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                  <MapPin size={10} />{bl(hotel.address, locale)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-1">{bl(hotel.description, locale)}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {hotel.amenities.map((am: { en: string; hi: string }) => (
                    <span key={am.en}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      {AMENITY_ICONS[am.en] ?? null}{bl(am, locale)}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid #f3f4f6' }}>
                  <div>
                    <p className="text-xs text-gray-400">{t('priceRange')}</p>
                    <p className="text-sm font-bold" style={{ color: '#ff7d0f' }}>
                      {formatPrice(hotel.priceRange.min, hotel.priceRange.max, t('perNight'))}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(t('enquireGreeting', { hotel: bl(hotel.name, locale), city: bl(hotel.city, locale) }))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-colors shrink-0"
                    style={{ background: '#dcfce7', color: '#16a34a' }}
                  >
                    <Phone size={11} /> {t('enquire')}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hotel assistance CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 rounded-3xl p-8 md:p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)', border: '1px solid #ffdba8' }}
        >
          <p className="text-4xl mb-4">🏨</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('ctaTitle')}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            {t('ctaDescription')}
          </p>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(t('whatsAppGreetingShort'))}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            {t('whatsAppHelp')}
          </a>
        </motion.div>
      </div>
    </div>
  )
}