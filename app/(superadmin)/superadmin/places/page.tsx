'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion }     from 'framer-motion'
import Link           from 'next/link'
import Image          from 'next/image'
import {
  Plus, Search, MapPin, Edit, Eye, Star,
  ToggleLeft, ToggleRight, ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

type BLField = string | { en: string; hi: string }
function str(v: BLField | undefined): string {
  if (!v) return ''
  return typeof v === 'string' ? v : v.en
}

interface Place {
  _id:        string
  slug:       string
  name:       BLField
  city:       BLField
  type:       BLField
  thumbnail?: string
  isFeatured: boolean
  entryFee?:  BLField
  tags:       BLField[]
}

const CITIES = ['All', 'Mathura', 'Vrindavan', 'Govardhan', 'Gokul', 'Barsana', 'Nandgaon']
const TYPE_EMOJI: Record<string, string> = {
  temple: '🛕', ghat: '🌊', 'sacred-site': '🙏', hill: '⛰️',
  garden: '🌺', museum: '🏛️', village: '🏡',
}

export default function SuperadminPlacesPage() {
  const [places,  setPlaces]  = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [city,    setCity]    = useState('All')

  const fetchPlaces = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/places?limit=100')
      const data = await res.json()
      if (data.success) setPlaces(data.data)
    } catch {
      toast.error('Failed to load places.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlaces() }, [fetchPlaces])

  async function toggleFeatured(place: Place) {
    try {
      const res = await fetch(`/api/places/${place.slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...place, isFeatured: !place.isFeatured }),
      })
      if (res.ok) {
        toast.success(place.isFeatured ? 'Removed from featured.' : 'Marked as featured!')
        setPlaces((prev) =>
          prev.map((p) => p._id === place._id ? { ...p, isFeatured: !p.isFeatured } : p),
        )
      }
    } catch {
      toast.error('Failed to update.')
    }
  }

  const filtered = places.filter((p) => {
    if (city !== 'All' && str(p.city) !== city) return false
    if (search && !str(p.name).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={16} className="text-indigo-500" />
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              Superadmin
            </p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Sacred Places
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{places.length} places in the database</p>
        </div>
        <Link href="/superadmin/places/new"
          className="btn-primary text-sm py-2.5 px-5 flex-shrink-0">
          <Plus size={16} /> Add Place
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search places..."
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
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((place, i) => (
            <motion.div key={place._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card rounded-2xl overflow-hidden flex flex-col">

              {/* Image */}
              <div className="relative h-32 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                {place.thumbnail ? (
                  <Image src={place.thumbnail} alt={str(place.name)} fill
                    sizes="300px" className="object-cover" />
                ) : (
                  <span className="text-4xl">{TYPE_EMOJI[str(place.type)] ?? '📍'}</span>
                )}
                {place.isFeatured && (
                  <div className="absolute top-2 left-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'var(--surface-amber)', color: 'var(--text-on-amber)' }}>⭐ Featured</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                  <MapPin size={9} />{str(place.city)}
                </p>
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
                  {str(place.name)}
                </h3>

                <div className="flex gap-2 mt-auto">
                  <button type="button" onClick={() => toggleFeatured(place)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg flex-1 justify-center"
                    style={place.isFeatured
                      ? { background: 'var(--surface-amber)', color: 'var(--text-on-amber)' }
                      : { background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }
                    }
                    title={place.isFeatured ? 'Remove from featured' : 'Mark as featured'}>
                    {place.isFeatured
                      ? <><ToggleRight size={13} />Featured</>
                      : <><ToggleLeft  size={13} />Feature</>
                    }
                  </button>
                  <Link href={`/places/${place.slug}`} target="_blank"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                    <Eye size={14} />
                  </Link>
                  <Link href={`/superadmin/places/${place.slug}/edit`}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                    <Edit size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-gray-400">No places found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}