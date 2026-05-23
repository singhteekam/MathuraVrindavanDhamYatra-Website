'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion }   from 'framer-motion'
import Link         from 'next/link'
import {
  Plus, Search, MapPin, Edit, Trash2, Star,
  ToggleLeft, ToggleRight, ShieldCheck, Hotel as HotelIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

type BLField = string | { en: string; hi: string }
function str(v: BLField | undefined): string {
  if (!v) return ''
  return typeof v === 'string' ? v : v.en
}

interface Hotel {
  _id:        string
  slug:       string
  name:       BLField
  city:       BLField
  category:   BLField
  rating:     number
  priceRange: { min: number; max: number }
  isFeatured: boolean
  isActive:   boolean
}

const CITIES     = ['All', 'Mathura', 'Vrindavan', 'Govardhan', 'Gokul', 'Barsana']
const CATEGORIES = ['All', 'budget', 'mid-range', 'premium']

export default function SuperadminHotelsPage() {
  const [hotels,    setHotels]    = useState<Hotel[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [city,      setCity]      = useState('All')
  const [category,  setCategory]  = useState('All')

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/hotels?limit=100&all=true')
      const data = await res.json()
      if (data.success) setHotels(data.data)
    } catch {
      toast.error('Failed to load hotels.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHotels() }, [fetchHotels])

  async function toggleField(h: Hotel, field: 'isActive' | 'isFeatured') {
    try {
      const res = await fetch(`/api/hotels/${h._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [field]: !h[field] }),
      })
      if (res.ok) {
        setHotels((prev) => prev.map((x) => x._id === h._id ? { ...x, [field]: !h[field] } : x))
        toast.success('Updated!')
      }
    } catch { toast.error('Update failed.') }
  }

  async function handleDelete(h: Hotel) {
    if (!confirm(`Delete "${str(h.name)}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/hotels/${h._id}`, { method: 'DELETE' })
      if (res.ok) {
        setHotels((prev) => prev.filter((x) => x._id !== h._id))
        toast.success('Deleted.')
      }
    } catch { toast.error('Delete failed.') }
  }

  const filtered = hotels.filter((h) => {
    if (city     !== 'All' && str(h.city)     !== city)     return false
    if (category !== 'All' && str(h.category) !== category) return false
    if (search && !str(h.name).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={16} className="text-indigo-500" />
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Superadmin</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Hotels
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{hotels.length} hotels in database</p>
        </div>
        <Link href="/superadmin/hotels/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-all"
          style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
          <Plus size={16} />Add Hotel
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search hotels..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-8 py-2 text-sm w-52" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CITIES.map((c) => (
            <button key={c} type="button" onClick={() => setCity(c)}
              className="px-3 py-2 rounded-full text-xs font-semibold transition-all"
              style={city === c
                ? { background: '#4338ca', color: '#fff' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
              }>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setCategory(cat)}
              className="px-3 py-2 rounded-full text-xs font-semibold transition-all capitalize"
              style={category === cat
                ? { background: '#1e1b4b', color: '#fff' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
              }>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((h, i) => (
            <motion.div key={h._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card rounded-2xl overflow-hidden flex flex-col"
              style={{ opacity: h.isActive ? 1 : 0.55 }}>

              {/* Image area */}
              <div className="relative h-32 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
                <span className="text-4xl">🏨</span>
                <div className="absolute top-2 left-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#6b7280' }}>
                    <MapPin size={9} />{str(h.city)}
                  </span>
                </div>
                {!h.isActive && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: '#fee2e2', color: '#991b1b' }}>Hidden</span>
                  </div>
                )}
                {h.isFeatured && h.isActive && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: '#fef3c7', color: '#92400e' }}>⭐ Featured</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-gray-400 mb-0.5 capitalize">{str(h.category)}</p>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1 line-clamp-2">
                  {str(h.name)}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <p className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#f59e0b' }}>
                    <Star size={10} fill="currentColor" />{h.rating}
                  </p>
                  {h.priceRange?.min > 0 && (
                    <p className="text-xs font-medium" style={{ color: '#4338ca' }}>
                      ₹{h.priceRange.min.toLocaleString('en-IN')}+
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5 mt-auto">
                  <button type="button" onClick={() => toggleField(h, 'isActive')}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg flex-1 justify-center font-medium transition-all"
                    style={h.isActive
                      ? { background: '#f0fdf4', color: '#16a34a' }
                      : { background: '#f3f4f6', color: '#6b7280' }
                    }
                    title={h.isActive ? 'Hide' : 'Publish'}>
                    {h.isActive ? <><ToggleRight size={13} />Active</> : <><ToggleLeft size={13} />Hidden</>}
                  </button>
                  <button type="button" onClick={() => toggleField(h, 'isFeatured')}
                    className="p-1.5 rounded-lg transition-all"
                    style={h.isFeatured
                      ? { background: '#fef3c7', color: '#92400e' }
                      : { background: '#f3f4f6', color: '#9ca3af' }
                    }
                    title={h.isFeatured ? 'Remove featured' : 'Mark featured'}>
                    <Star size={13} fill={h.isFeatured ? 'currentColor' : 'none'} />
                  </button>
                  <Link href={`/superadmin/hotels/${h._id}/edit`}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ background: '#eef2ff', color: '#4338ca' }}
                    title="Edit">
                    <Edit size={13} />
                  </Link>
                  <button type="button" onClick={() => handleDelete(h)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ background: '#fef2f2', color: '#ef4444' }}
                    title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <HotelIcon size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No hotels found</p>
              <Link href="/superadmin/hotels/new"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold"
                style={{ color: '#4338ca' }}>
                <Plus size={14} />Add First Hotel
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
