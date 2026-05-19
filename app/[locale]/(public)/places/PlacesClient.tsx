'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin } from 'lucide-react'
import PlaceCard from '@/components/shared/PlaceCard'
import type { PlaceSummary } from '@/lib/fetchData'
import { cn } from '@/lib/utils'

const CITIES = ['All', 'Mathura', 'Vrindavan', 'Gokul', 'Govardhan', 'Barsana']

const TYPES = [
  { value: 'all',         label: 'All Types',    emoji: '✨' },
  { value: 'temple',      label: 'Temples',      emoji: '🛕' },
  { value: 'ghat',        label: 'Ghats',        emoji: '🌊' },
  { value: 'sacred-site', label: 'Sacred Sites', emoji: '🙏' },
  { value: 'hill',        label: 'Hills',        emoji: '⛰️' },
  { value: 'garden',      label: 'Gardens',      emoji: '🌺' },
]

export default function PlacesClient({ places }: { places: PlaceSummary[] }) {
  const [search,    setSearch]    = useState('')
  const [city,      setCity]      = useState('All')
  const [type,      setType]      = useState('all')

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
    <div className="min-h-screen bg-gray-50">

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
            ✦ Sacred Places ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Explore the Holy Dham of Braj
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base mb-8"
          >
            Discover {places.length}+ sacred temples, holy ghats, and divine sites across
            Mathura, Vrindavan, Gokul, Govardhan and Barsana.
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
              placeholder="Search temples, ghats, sacred sites..."
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
              key={c}
              onClick={() => setCity(c)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={city === c
                ? { background: '#4338ca', color: '#fff', boxShadow: '0 4px 15px rgba(67,56,202,0.35)' }
                : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
              }
            >
              <MapPin size={12} />
              {c}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={city === c
                  ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { background: '#f3f4f6', color: '#9ca3af' }
                }
              >
                {cityCount(c)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Type filter chips ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={type === t.value
                ? { background: '#fff8ed', color: '#c74a06', border: '1.5px solid #ff7d0f' }
                : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
              }
            >
              <span className="text-sm">{t.emoji}</span>
              {t.label}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setCity('All'); setType('all') }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 bg-red-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <X size={13} /> Clear All
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> places
            {city !== 'All' && <> in <span className="font-semibold text-krishna-600">{city}</span></>}
          </p>
          {filtered.some((p) => p.isFeatured) && (
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              ⭐ Featured places shown first
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">No places found</h3>
            <p className="text-gray-500 mb-6 text-sm">Try a different city, type, or search term</p>
            <button
              onClick={() => { setSearch(''); setCity('All'); setType('all') }}
              className="btn-primary"
            >
              Show All Places
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
            Want to Visit These Places?
          </h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto text-sm">
            Book a guided tour with our experienced drivers who know every temple,
            every shortcut, and every aarti timing in Braj.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/packages" className="btn-primary">
              Browse Tour Packages
            </a>
            <a href="/booking" className="btn-secondary"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Book a Custom Tour
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}