'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Star, Clock, ToggleLeft, ToggleRight, Eye } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatCurrency } from '@/lib/utils'

type BLField = string | { en: string; hi: string }
function str(v: BLField | undefined): string {
  if (!v) return ''
  return typeof v === 'string' ? v : v.en
}

interface Package {
  _id: string
  slug: string
  name: BLField
  duration: number
  cities: string[]
  basePrice: number
  rating: number
  totalReviews: number
  totalBookings: number
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/packages?limit=50')
      const data = await res.json()
      if (data.success) setPackages(data.data)
    } catch {
      toast.error('Failed to load packages.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPackages() }, [fetchPackages])

  const filtered = search.trim()
    ? packages.filter((p) =>
        str(p.name).toLowerCase().includes(search.toLowerCase()) ||
        p.cities.join(' ').toLowerCase().includes(search.toLowerCase())
      )
    : packages

  async function toggleActive(slug: string, current: boolean) {
    try {
      const res = await fetch(`/api/packages/${slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !current }),
      })
      if (res.ok) {
        toast.success(`Package ${!current ? 'activated' : 'deactivated'}.`)
        fetchPackages()
      }
    } catch {
      toast.error('Failed to update.')
    }
  }

  async function toggleFeatured(slug: string, current: boolean) {
    try {
      await fetch(`/api/packages/${slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isFeatured: !current }),
      })
      toast.success(`Package ${!current ? 'featured' : 'unfeatured'}.`)
      fetchPackages()
    } catch {
      toast.error('Failed to update.')
    }
  }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title="Tour Packages"
        crumbs={[{ label: 'Packages' }]}
        action={
          <Link href="/admin/packages/new" className="btn-primary text-sm py-2.5 px-5">
            <Plus size={16} /> Add Package
          </Link>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search packages..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-surface-muted)', borderBottom: '1px solid var(--border-muted)' }}>
                {['Package', 'Duration', 'Price', 'Bookings', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg, i) => (
                <motion.tr
                  key={pkg._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{str(pkg.name)}</p>
                      <p className="text-xs text-gray-400">{pkg.cities.join(' Â· ')}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      <Clock size={11} />{pkg.duration} Day{pkg.duration > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-saffron-600 whitespace-nowrap">
                    {formatCurrency(pkg.basePrice)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pkg.totalBookings}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Star size={11} fill="currentColor" />{pkg.rating.toFixed(1)}
                      <span className="text-gray-400 font-normal">({pkg.totalReviews})</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleActive(pkg.slug, pkg.isActive)}
                        className="flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: pkg.isActive ? '#16a34a' : 'var(--text-muted)' }}
                      >
                        {pkg.isActive
                          ? <><ToggleRight size={15} /> Active</>
                          : <><ToggleLeft  size={15} /> Inactive</>
                        }
                      </button>
                      <button
                        onClick={() => toggleFeatured(pkg.slug, pkg.isFeatured)}
                        className="flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: pkg.isFeatured ? '#d97706' : 'var(--text-faint)' }}
                      >
                        <Star size={12} fill={pkg.isFeatured ? 'currentColor' : 'none'} />
                        {pkg.isFeatured ? 'Featured' : 'Not Featured'}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/packages/${pkg.slug}`} target="_blank"
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                        <Eye size={11} /> View
                      </Link>
                      <Link href={`/admin/packages/${pkg.slug}/edit`}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                        Edit
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                    No packages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}