'use client'

import { useState }   from 'react'
import { motion }     from 'framer-motion'
import { Link }       from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import SectionHeader  from '@/components/shared/SectionHeader'
import PackageCard    from '@/components/shared/PackageCard'
import type { PackageSummary } from '@/lib/fetchData'

const TAB_KEYS = [
  { key: 'tabAll',         filter: (_p: PackageSummary) => true },
  { key: 'tabOneDay',      filter: (p: PackageSummary) => p.duration === 1 },
  { key: 'tab23Days',      filter: (p: PackageSummary) => p.duration >= 2 && p.duration <= 3 },
  { key: 'tab4PlusDays',   filter: (p: PackageSummary) => p.duration >= 4 },
]

interface Props {
  packages: PackageSummary[]
}

export default function FeaturedPackages({ packages }: Props) {
  const t                         = useTranslations('FeaturedPackages')
  const [activeTab, setActiveTab] = useState(0)
  const TABS                      = TAB_KEYS.map((tab) => ({ ...tab, label: t(tab.key) }))

  // Filter operates on the `packages` prop — bug-free, no stale closure
  const filtered = packages.filter(TABS[activeTab].filter)

  return (
    <section className="py-20 section-divine">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            subtitle={t('subtitle')}
            title={t('title')}
            description={t('description')}
            centered={false}
          />
          <Link href="/packages"
            className="inline-flex items-center gap-2 font-semibold text-sm flex-shrink-0"
            style={{ color: '#ff7d0f' }}>
            {t('viewAllPackages')} <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter tabs with live counts from DB data */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {TABS.map((tab, i) => {
            const count = packages.filter(tab.filter).length
            return (
              <button key={tab.label} onClick={() => setActiveTab(i)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200"
                style={activeTab === i
                  ? { background: '#ff7d0f', color: '#fff', boxShadow: '0 4px 15px rgba(255,125,15,0.35)' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                }>
                {tab.label}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Package grid — data from MongoDB via fetchData.ts */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🙏</p>
            <p className="text-gray-400 text-sm">{t('emptyTitle')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pkg, i) => (
              <motion.div key={pkg.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}>
                <PackageCard {...pkg} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('customPrompt')}
          </p>
          <Link href="/contact" className="btn-secondary">
            {t('requestCustom')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}