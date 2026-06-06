'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion }      from 'framer-motion'
import Link            from 'next/link'
import {
  Plus, Search, Package, Edit, Eye,
  ToggleLeft, ToggleRight, Star, ShieldCheck, Trash2,
} from 'lucide-react'
import toast           from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

type BLField = string | { en: string; hi: string }
function str(v: BLField | undefined): string {
  if (!v) return ''
  return typeof v === 'string' ? v : v.en
}

interface Pkg {
  _id:             string
  slug:            string
  name:            BLField
  duration:        number
  basePrice:       number
  isActive:        boolean
  isFeatured:      boolean
  isPopular:       boolean
  rating:          number
  totalReviews:    number
  discountPercent: number
  discountEndsAt:  string | null
}

export default function SuperadminPackagesPage() {
  const [packages,    setPackages]    = useState<Pkg[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null)
  const [deleting,    setDeleting]    = useState(false)

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/packages?limit=100&all=true')
      const data = await res.json()
      if (data.success) setPackages(data.data)
      else toast.error(data.error ?? 'Failed to load packages.')
    } catch {
      toast.error('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPackages() }, [fetchPackages])

  async function toggleField(pkg: Pkg, field: 'isActive' | 'isFeatured' | 'isPopular') {
    setPackages((prev) =>
      prev.map((p) => p._id === pkg._id ? { ...p, [field]: !p[field] } : p),
    )
    try {
      const res = await fetch(`/api/packages/${pkg.slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [field]: !pkg[field] }),
      })
      if (res.ok) {
        toast.success('Updated!')
      } else {
        setPackages((prev) =>
          prev.map((p) => p._id === pkg._id ? { ...p, [field]: pkg[field] } : p),
        )
        const data = await res.json()
        toast.error(data.error ?? 'Update failed.')
      }
    } catch {
      setPackages((prev) =>
        prev.map((p) => p._id === pkg._id ? { ...p, [field]: pkg[field] } : p),
      )
      toast.error('Network error.')
    }
  }

  async function deletePackage(slug: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/packages/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.slug !== slug))
        toast.success('Package permanently deleted.')
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Delete failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setDeleting(false)
      setConfirmSlug(null)
    }
  }

  const filtered = packages.filter((p) =>
    !search || str(p.name).toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={16} className="text-indigo-500" />
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Superadmin</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-serif)' }}>
            Tour Packages
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{packages.length} packages in database</p>
        </div>
        <Link href="/superadmin/packages/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-all"
          style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
          <Plus size={16} />Add Package
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search packages..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-8 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-surface-muted)', borderBottom: '1px solid var(--border-muted)' }}>
                  {['Package', 'Duration', 'Price', 'Rating', 'Active', 'Featured', 'Popular', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg, i) => (
                  <motion.tr key={pkg._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'var(--surface-krishna)' }}>
                          <Package size={14} style={{ color: '#6366f1' }} />
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm max-w-50 truncate">
                          {str(pkg.name)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                      {pkg.duration}D
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-sm" style={{ color: '#6366f1' }}>{formatCurrency(pkg.basePrice)}</p>
                      {(pkg.discountPercent ?? 0) > 0 &&
                        (!pkg.discountEndsAt || new Date(pkg.discountEndsAt) > new Date()) && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--surface-red)', color: '#ef4444' }}>
                          🔥 {pkg.discountPercent}% OFF
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pkg.rating > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#f59e0b' }}>
                          <Star size={11} fill="currentColor" />
                          {pkg.rating} ({pkg.totalReviews})
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">No reviews</span>
                      )}
                    </td>
                    {(['isActive', 'isFeatured', 'isPopular'] as const).map((field) => (
                      <td key={field} className="px-4 py-3">
                        <button type="button" onClick={() => toggleField(pkg, field)}
                          className="transition-colors"
                          style={{ color: pkg[field] ? '#22c55e' : '#d1d5db' }}>
                          {pkg[field] ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {confirmSlug === pkg.slug ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => deletePackage(pkg.slug)}
                            disabled={deleting}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white whitespace-nowrap"
                            style={{ background: '#ef4444' }}>
                            {deleting ? '...' : 'Yes, delete'}
                          </button>
                          <button
                            onClick={() => setConfirmSlug(null)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                            style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Link href={`/packages/${pkg.slug}`} target="_blank"
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}
                            title="View on site">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/superadmin/packages/${pkg.slug}/edit`}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}
                            title="Edit package">
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => setConfirmSlug(pkg.slug)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: 'var(--surface-red)', color: '#ef4444' }}
                            title="Delete package">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((pkg, i) => (
              <motion.div key={pkg._id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug truncate">{str(pkg.name)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {pkg.duration}D · {formatCurrency(pkg.basePrice)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/packages/${pkg.slug}`} target="_blank"
                      className="p-1.5 rounded-lg" style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                      <Eye size={14} />
                    </Link>
                    <Link href={`/superadmin/packages/${pkg.slug}/edit`}
                      className="p-1.5 rounded-lg" style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
                      <Edit size={14} />
                    </Link>
                    {confirmSlug === pkg.slug ? (
                      <>
                        <button onClick={() => deletePackage(pkg.slug)} disabled={deleting}
                          className="text-xs font-semibold px-2 py-1.5 rounded-lg text-white"
                          style={{ background: '#ef4444' }}>
                          {deleting ? '...' : 'Delete?'}
                        </button>
                        <button onClick={() => setConfirmSlug(null)}
                          className="text-xs font-semibold px-2 py-1.5 rounded-lg"
                          style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                          No
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmSlug(pkg.slug)}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'var(--surface-red)', color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  {(['isActive', 'isFeatured', 'isPopular'] as const).map((field) => (
                    <button key={field} type="button"
                      onClick={() => toggleField(pkg, field)}
                      className="flex items-center gap-1 font-medium capitalize"
                      style={{ color: pkg[field] ? '#22c55e' : 'var(--text-faint)' }}>
                      {pkg[field] ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {field.replace('is', '')}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-16">
              <Package size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No packages found.</p>
              <Link href="/superadmin/packages/new"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold"
                style={{ color: '#6366f1' }}>
                <Plus size={14} />Add First Package
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
