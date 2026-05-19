'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import PackageCard from '@/components/shared/PackageCard'
import { cn } from '@/lib/utils'
import type { PackageSummary } from '@/lib/fetchData'

// Use the shared PackageSummary type from fetchData so server + client always agree
type Package = PackageSummary

const DURATION_TABS = [
  { label: 'All',     min: 0,  max: 99 },
  { label: '1 Day',   min: 1,  max: 1  },
  { label: '2-3 Days',min: 2,  max: 3  },
  { label: '4+ Days', min: 4,  max: 99 },
]

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'duration',   label: 'Duration' },
]

const CITIES = ['All', 'Mathura', 'Vrindavan', 'Govardhan', 'Gokul', 'Barsana', 'Agra']

export default function PackagesClient({ packages }: { packages: Package[] }) {
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState(0)
  const [sortBy,      setSortBy]      = useState('popular')
  const [cityFilter,  setCityFilter]  = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [showSort,    setShowSort]    = useState(false)

  const filtered = useMemo(() => {
    let result = [...packages]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cities.some((c) => c.toLowerCase().includes(q)) ||
          p.highlights.some((h) => h.toLowerCase().includes(q)),
      )
    }

    // Duration tab
    const tab = DURATION_TABS[activeTab]
    result = result.filter((p) => p.duration >= tab.min && p.duration <= tab.max)

    // City filter
    if (cityFilter !== 'All') {
      result = result.filter((p) =>
        p.cities.some((c) => c.toLowerCase() === cityFilter.toLowerCase()),
      )
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':  result.sort((a, b) => a.basePrice - b.basePrice); break
      case 'price-desc': result.sort((a, b) => b.basePrice - a.basePrice); break
      case 'rating':     result.sort((a, b) => b.rating - a.rating);       break
      case 'duration':   result.sort((a, b) => a.duration - b.duration);   break
      default:           result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
    }

    return result
  }, [packages, search, activeTab, sortBy, cityFilter])

  function clearFilters() {
    setSearch('')
    setActiveTab(0)
    setSortBy('popular')
    setCityFilter('All')
  }

  const hasActiveFilters = search || activeTab !== 0 || sortBy !== 'popular' || cityFilter !== 'All'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Hero ── */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1e1b4b 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff7d0f, transparent)' }} />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4338ca, transparent)' }} />

        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            ✦ Tour Packages ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Choose Your Perfect Braj Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base mb-8"
          >
            Handcrafted spiritual tour packages for every devotee — from quick day
            trips to extended pilgrimage retreats. All AC vehicles, experienced drivers.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-lg mx-auto relative"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages, cities, temples..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-saffron-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* ── Filter toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          {/* Duration tabs */}
          <div className="flex gap-2 flex-wrap">
            {DURATION_TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={activeTab === i
                  ? { background: '#ff7d0f', color: '#fff', boxShadow: '0 4px 15px rgba(255,125,15,0.35)' }
                  : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: city filter + sort */}
          <div className="flex items-center gap-3">

            {/* City filter */}
            <div className="relative">
              <button
                onClick={() => { setShowFilters(!showFilters); setShowSort(false) }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200',
                  showFilters || cityFilter !== 'All'
                    ? 'bg-saffron-50 border-saffron-300 text-saffron-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                <SlidersHorizontal size={15} />
                {cityFilter === 'All' ? 'Filter by City' : cityFilter}
                <ChevronDown size={13} className={cn('transition-transform', showFilters && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30"
                  >
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => { setCityFilter(city); setShowFilters(false) }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          cityFilter === city
                            ? 'text-saffron-600 bg-saffron-50 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50',
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => { setShowSort(!showSort); setShowFilters(false) }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200',
                  showSort || sortBy !== 'popular'
                    ? 'bg-saffron-50 border-saffron-300 text-saffron-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                Sort
                <ChevronDown size={13} className={cn('transition-transform', showSort && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          sortBy === opt.value
                            ? 'text-saffron-600 bg-saffron-50 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50',
                        )}
                      >
                        {sortBy === opt.value && <span className="mr-2">✓</span>}
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> packages
          {cityFilter !== 'All' && <> in <span className="font-semibold text-saffron-600">{cityFilter}</span></>}
        </p>

        {/* ── Package Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((pkg, i) => (
                <motion.div
                  key={pkg.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <PackageCard {...pkg} />
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">No packages found</h3>
            <p className="text-gray-500 mb-6 text-sm">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Custom package CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl p-8 md:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, #fff8ed, #ffefd4)',
            border: '1px solid #ffdba8',
          }}
        >
          <p className="text-4xl mb-4">✨</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Can&apos;t find the right package?
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            We create fully custom itineraries based on your budget, group size,
            and preferred temples. Just tell us what you need!
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/919999999999?text=Namaste! I need a custom Mathura Vrindavan tour package."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              WhatsApp Us
            </a>
            <a href="/contact" className="btn-secondary">
              Request Custom Package
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}