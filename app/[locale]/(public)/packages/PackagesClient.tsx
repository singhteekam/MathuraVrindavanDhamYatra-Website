'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import PackageCard from '@/components/shared/PackageCard'
import { cn } from '@/lib/utils'
import type { PackageSummary } from '@/lib/fetchData'

// Use the shared PackageSummary type from fetchData so server + client always agree
type Package = PackageSummary

const DURATION_TAB_KEYS = [
  { key: 'tabAll',       min: 0, max: 99 },
  { key: 'tabOneDay',    min: 1, max: 1  },
  { key: 'tab23Days',    min: 2, max: 3  },
  { key: 'tab4PlusDays', min: 4, max: 99 },
]

const SORT_OPTION_KEYS = [
  { value: 'popular',    key: 'sortPopular'   },
  { value: 'price-asc',  key: 'sortPriceAsc'  },
  { value: 'price-desc', key: 'sortPriceDesc' },
  { value: 'rating',     key: 'sortRating'    },
  { value: 'duration',   key: 'sortDuration'  },
]

const CITY_KEYS = [
  { slug: 'All',       key: 'cityAll'       },
  { slug: 'Mathura',   key: 'cityMathura'   },
  { slug: 'Vrindavan', key: 'cityVrindavan' },
  { slug: 'Govardhan', key: 'cityGovardhan' },
  { slug: 'Gokul',     key: 'cityGokul'     },
  { slug: 'Barsana',   key: 'cityBarsana'   },
  { slug: 'Agra',      key: 'cityAgra'      },
]

export default function PackagesClient({ packages }: { packages: Package[] }) {
  const t                             = useTranslations('PackagesPage')
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState(0)
  const [sortBy,      setSortBy]      = useState('popular')
  const [cityFilter,  setCityFilter]  = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [showSort,    setShowSort]    = useState(false)

  const DURATION_TABS = DURATION_TAB_KEYS.map((tab) => ({ ...tab, label: t(tab.key) }))
  const SORT_OPTIONS  = SORT_OPTION_KEYS.map((opt) => ({ ...opt, label: t(opt.key) }))
  const CITIES        = CITY_KEYS.map((c) => ({ ...c, label: t(c.key) }))

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

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
            ✦ {t('heroSubtitle')} ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
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
            {t('heroDescription')}
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
              placeholder={t('searchPlaceholder')}
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
                key={tab.key}
                onClick={() => setActiveTab(i)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={activeTab === i
                  ? { background: '#ff7d0f', color: '#fff', boxShadow: '0 4px 15px rgba(255,125,15,0.35)' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
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
                    ? 'bg-saffron-50 dark:bg-saffron-900/30 border-saffron-300 dark:border-saffron-700 text-saffron-700 dark:text-saffron-300'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700',
                )}
              >
                <SlidersHorizontal size={15} />
                {cityFilter === 'All' ? t('filterByCity') : CITIES.find((c) => c.slug === cityFilter)?.label ?? cityFilter}
                <ChevronDown size={13} className={cn('transition-transform', showFilters && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-30"
                  >
                    {CITIES.map((city) => (
                      <button
                        key={city.slug}
                        onClick={() => { setCityFilter(city.slug); setShowFilters(false) }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          cityFilter === city.slug
                            ? 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-900/30 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                        )}
                      >
                        {city.label}
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
                    ? 'bg-saffron-50 dark:bg-saffron-900/30 border-saffron-300 dark:border-saffron-700 text-saffron-700 dark:text-saffron-300'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700',
                )}
              >
                {t('sort')}
                <ChevronDown size={13} className={cn('transition-transform', showSort && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-30"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          sortBy === opt.value
                            ? 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-900/30 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
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
                <X size={14} /> {t('clear')}
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('showing')} <span className="font-semibold text-gray-800 dark:text-gray-200">{filtered.length}</span> {t('packages')}
          {cityFilter !== 'All' && <> {t('inCity')} <span className="font-semibold text-saffron-600 dark:text-saffron-400">{CITIES.find((c) => c.slug === cityFilter)?.label ?? cityFilter}</span></>}
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
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('emptyTitle')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('emptySubtitle')}</p>
            <button onClick={clearFilters} className="btn-primary">
              {t('clearAllFilters')}
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
            background: 'var(--surface-saffron)',
            border: '1px solid var(--surface-saffron-border)',
          }}
        >
          <p className="text-4xl mb-4">✨</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('customTitle')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
            {t('customDescription')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`https://wa.me/919999999999?text=${encodeURIComponent(t('whatsAppGreeting'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t('whatsAppUs')}
            </a>
            <a href="/contact" className="btn-secondary">
              {t('requestCustomPackage')}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}