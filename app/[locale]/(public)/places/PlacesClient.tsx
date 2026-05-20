'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Search, X, MapPin } from 'lucide-react'
import PlaceCard from '@/components/shared/PlaceCard'
import type { PlaceSummary } from '@/lib/fetchData'

const CITY_KEYS = [
  { slug: 'All',       key: 'cityAll' },
  { slug: 'Mathura',   key: 'cityMathura' },
  { slug: 'Vrindavan', key: 'cityVrindavan' },
  { slug: 'Gokul',     key: 'cityGokul' },
  { slug: 'Govardhan', key: 'cityGovardhan' },
  { slug: 'Barsana',   key: 'cityBarsana' },
]

const TYPE_KEYS = [
  { value: 'all',         key: 'typeAll',        emoji: '✨' },
  { value: 'temple',      key: 'typeTemple',     emoji: '🛕' },
  { value: 'ghat',        key: 'typeGhat',       emoji: '🌊' },
  { value: 'sacred-site', key: 'typeSacredSite', emoji: '🙏' },
  { value: 'hill',        key: 'typeHill',       emoji: '⛰️' },
  { value: 'garden',      key: 'typeGarden',     emoji: '🌺' },
]

export default function PlacesClient({ places }: { places: PlaceSummary[] }) {
  const t                      = useTranslations('PlacesPage')
  const [search, setSearch]    = useState('')
  const [city,   setCity]      = useState('All')
  const [type,   setType]      = useState('all')

  const CITIES = CITY_KEYS.map((c) => ({ ...c, label: t(c.key) }))
  const TYPES  = TYPE_KEYS.map((tp) => ({ ...tp, label: t(tp.key) }))

  const filtered = useMemo(() => {
    let result = [...places]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      )
    }
    if (city !== 'All')  result = result.filter((p) => p.city === city)
    if (type !== 'all')  result = result.filter((p) => p.type === type)
    // Featured first
    return result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
  }, [places, search, city, type])

  const hasFilters = search || city !== 'All' || type !== 'all'

  // city place counts
  const cityCount = (c: string) =>
    c === 'All' ? places.length : places.filter((p) => p.city === c).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero ── */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1a0a00 100%)' }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4338ca, transparent)' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff7d0f, transparent)' }} />

        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            ✦ {t('heroSubtitle')} ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base mb-8"
          >
            {t('heroDescription', { count: places.length })}
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-lg mx-auto relative"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-4 rounded-2xl text-sm bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* ── City tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CITIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCity(c.slug)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={city === c.slug
                ? { background: '#4338ca', color: '#fff', boxShadow: '0 4px 15px rgba(67,56,202,0.35)' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
              }
            >
              <MapPin size={12} />
              {c.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={city === c.slug
                  ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { background: '#f3f4f6', color: '#9ca3af' }
                }
              >
                {cityCount(c.slug)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Type filter chips ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {TYPES.map((tp) => (
            <button
              key={tp.value}
              onClick={() => setType(tp.value)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={type === tp.value
                ? { background: '#fff8ed', color: '#c74a06', border: '1.5px solid #ff7d0f' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
              }
            >
              <span className="text-sm">{tp.emoji}</span>
              {tp.label}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setCity('All'); setType('all') }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 bg-red-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <X size={13} /> {t('clearAll')}
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('showing')} <span className="font-semibold text-gray-800 dark:text-gray-200">{filtered.length}</span> {t('places')}
            {city !== 'All' && <> {t('inCity')} <span className="font-semibold text-krishna-600 dark:text-krishna-400">{CITIES.find((c) => c.slug === city)?.label ?? city}</span></>}
          </p>
          {filtered.some((p) => p.isFeatured) && (
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              {t('featuredFirst')}
            </span>
          )}
        </div>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((place, i) => (
                <motion.div
                  key={place.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <PlaceCard
                    slug={place.slug}
                    name={place.name}
                    city={place.city}
                    type={place.type}
                    shortDescription={place.shortDescription}
                    thumbnail={place.thumbnail}
                    timeRequired={place.timeRequired}
                    entryFee={place.entryFee}
                    isFeatured={place.isFeatured}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-6xl mb-4">🙏</p>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('emptyTitle')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('emptySubtitle')}</p>
            <button
              onClick={() => { setSearch(''); setCity('All'); setType('all') }}
              className="btn-primary"
            >
              {t('showAllPlaces')}
            </button>
          </motion.div>
        )}

        {/* ── Book a tour CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl p-8 md:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          }}
        >
          <p className="text-4xl mb-4">🛕</p>
          <h3
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('ctaTitle')}
          </h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto text-sm">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/packages" className="btn-primary">
              {t('browsePackages')}
            </a>
            <a href="/booking" className="btn-secondary"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {t('bookCustomTour')}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}