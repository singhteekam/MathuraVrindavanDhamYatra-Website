'use client'

import { useState }   from 'react'
import { motion }     from 'framer-motion'
import { Link }       from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import SectionHeader  from '@/components/shared/SectionHeader'
import PackageCard    from '@/components/shared/PackageCard'
import type { PackageSummary } from '@/lib/fetchData'

const TABS = [
  { label: 'All',     filter: (p: PackageSummary) => true },
  { label: '1 Day',   filter: (p: PackageSummary) => p.duration === 1 },
  { label: '2-3 Days',filter: (p: PackageSummary) => p.duration >= 2 && p.duration <= 3 },
  { label: '4+ Days', filter: (p: PackageSummary) => p.duration >= 4 },
]

interface Props {
  packages: PackageSummary[]
}

export default function FeaturedPackages({ packages }: Props) {
  const [activeTab, setActiveTab] = useState(0)

  // Filter operates on the `packages` prop — bug-free, no stale closure
  const filtered = packages.filter(TABS[activeTab].filter)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            subtitle="Tour Packages"
            title="Choose Your Perfect Braj Journey"
            description="Handcrafted spiritual tour packages for every devotee — from quick day trips to extended pilgrimage retreats."
            centered={false}
          />
          <Link href="/packages"
            className="inline-flex items-center gap-2 font-semibold text-sm flex-shrink-0"
            style={{ color: '#ff7d0f' }}>
            View All Packages <ArrowRight size={16} />
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
                  : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
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
            <p className="text-gray-400 text-sm">No packages in this category yet.</p>
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
          <p className="text-gray-500 mb-4">
            Can&apos;t find the right package? We create custom itineraries too!
          </p>
          <Link href="/contact" className="btn-secondary">
            Request Custom Package
          </Link>
        </motion.div>
      </div>
    </section>
  )
}