'use client'

import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import { motion }    from 'framer-motion'
import Link          from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'
import toast         from 'react-hot-toast'
import BilingualInput, { type BLValue } from '@/components/admin/BilingualInput'
import ImageManager from '@/components/admin/ImageManager'

const CITIES    = ['Mathura', 'Vrindavan', 'Gokul', 'Govardhan', 'Barsana', 'Nandgaon']
const CITY_HI: Record<string, string> = {
  Mathura: 'मथुरा', Vrindavan: 'वृंदावन', Gokul: 'गोकुल',
  Govardhan: 'गोवर्धन', Barsana: 'बरसाना', Nandgaon: 'नंदगाँव',
}
const CATEGORIES: BLValue[] = [
  { en: 'budget',    hi: 'किफायती'      },
  { en: 'mid-range', hi: 'मध्यम श्रेणी' },
  { en: 'premium',   hi: 'प्रीमियम'     },
]
const AMENITY_OPTIONS: BLValue[] = [
  { en: 'AC',           hi: 'एसी'            },
  { en: 'WiFi',         hi: 'वाईफाई'         },
  { en: 'Restaurant',   hi: 'रेस्तराँ'       },
  { en: 'Parking',      hi: 'पार्किंग'       },
  { en: 'Pool',         hi: 'स्विमिंग पूल'   },
  { en: 'Gym',          hi: 'जिम'            },
  { en: 'Spa',          hi: 'स्पा'           },
  { en: 'Room Service', hi: 'रूम सर्विस'     },
]

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
)

export interface HotelFormData {
  name:        BLValue
  slug:        string
  city:        BLValue
  address:     BLValue
  description: BLValue
  rating:      number
  priceRange:  { min: number; max: number }
  amenities:   BLValue[]
  category:    BLValue
  isVegOnly:   boolean
  isFeatured:  boolean
  isActive:    boolean
  images:      string[]
}

const EMPTY: HotelFormData = {
  name:        { en: '', hi: '' },
  slug:        '',
  city:        { en: 'Mathura', hi: 'मथुरा' },
  address:     { en: '', hi: '' },
  description: { en: '', hi: '' },
  rating:      4.0,
  priceRange:  { min: 0, max: 0 },
  amenities:   [],
  category:    { en: 'mid-range', hi: 'मध्यम श्रेणी' },
  isVegOnly:   true,
  isFeatured:  false,
  isActive:    true,
  images:      [],
}

interface Props {
  initial?:  Partial<HotelFormData>
  id?:       string
  pageTitle: string
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function HotelForm({ initial, id, pageTitle }: Props) {
  const router          = useRouter()
  const [form, setForm] = useState<HotelFormData>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)

  function setBL(field: keyof HotelFormData, value: BLValue) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }
  function setField<K extends keyof HotelFormData>(field: K, value: HotelFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCityChange(enCity: string) {
    setField('city', { en: enCity, hi: CITY_HI[enCity] ?? enCity })
  }

  function handleCategoryChange(enCat: string) {
    const found = CATEGORIES.find((c) => c.en === enCat)
    setField('category', found ?? { en: enCat, hi: enCat })
  }

  function toggleAmenity(am: BLValue) {
    const exists = form.amenities.some((a) => a.en === am.en)
    setField('amenities', exists
      ? form.amenities.filter((a) => a.en !== am.en)
      : [...form.amenities, am])
  }

  async function handleSave() {
    if (!form.name.en) { toast.error('English name is required.'); return }
    if (!form.slug)     { toast.error('Slug is required.');         return }

    setSaving(true)
    try {
      const url    = id ? `/api/hotels/${id}` : '/api/hotels'
      const method = id ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Save failed.'); return }
      toast.success(id ? 'Hotel updated!' : 'Hotel created!')
      router.push('/superadmin/hotels')
    } catch {
      toast.error('Network error.')
    } finally {
      setSaving(false)
    }
  }

  const TOGGLES = [
    { key: 'isVegOnly'  as const, label: 'Pure Veg Only', desc: 'Show veg-only badge'     },
    { key: 'isFeatured' as const, label: 'Featured',      desc: 'Shown on homepage'       },
    { key: 'isActive'   as const, label: 'Active',        desc: 'Visible on public site'  },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-serif)' }}>
            {pageTitle}
          </h1>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <Link href="/superadmin" className="hover:text-indigo-600">Superadmin</Link>
            <span>/</span>
            <Link href="/superadmin/hotels" className="hover:text-indigo-600">Hotels</Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300">{id ? 'Edit' : 'New'}</span>
          </nav>
        </div>
        <div className="flex gap-2">
          <Link href="/superadmin/hotels"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={14} />Cancel
          </Link>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={15} />{id ? 'Update' : 'Create'} Hotel</>
            }
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <BilingualInput
                label="Hotel Name"
                value={form.name}
                onChange={(val) => setForm((prev) => ({
                  ...prev,
                  name: val,
                  slug: val.en !== prev.name.en ? slugify(val.en) : prev.slug,
                }))}
                required
                enPlaceholder="e.g. Nidhivan Sarovar Portico"
                hiPlaceholder="e.g. निधिवन सरोवर पोर्टिको"
              />
              <div>
                <Label>Slug *</Label>
                <input type="text" value={form.slug}
                  onChange={(e) => setField('slug', slugify(e.target.value))}
                  placeholder="e.g. nidhivan-sarovar-portico" className="input-field font-mono text-sm" />
                <p className="text-xs text-gray-400 mt-1">
                  URL: /hotels/<span className="text-indigo-500 font-medium">{form.slug || 'your-slug'}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <select value={form.city.en} onChange={(e) => handleCityChange(e.target.value)} className="input-field text-sm">
                    {CITIES.map((c) => <option key={c} value={c}>{c} / {CITY_HI[c]}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Category</Label>
                  <select value={form.category.en} onChange={(e) => handleCategoryChange(e.target.value)} className="input-field text-sm">
                    {CATEGORIES.map((c) => <option key={c.en} value={c.en}>{c.en} / {c.hi}</option>)}
                  </select>
                </div>
              </div>
              <BilingualInput label="Address" value={form.address} onChange={(v) => setBL('address', v)}
                enPlaceholder="e.g. Raman Reti Road, Vrindavan" hiPlaceholder="e.g. रमण रेती मार्ग, वृंदावन" />
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Pricing (₹ per night)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Price (₹)</Label>
                <input type="number" min={0} value={form.priceRange.min}
                  onChange={(e) => setField('priceRange', { ...form.priceRange, min: Number(e.target.value) })}
                  className="input-field text-sm" placeholder="e.g. 1200" />
              </div>
              <div>
                <Label>Max Price (₹)</Label>
                <input type="number" min={0} value={form.priceRange.max}
                  onChange={(e) => setField('priceRange', { ...form.priceRange, max: Number(e.target.value) })}
                  className="input-field text-sm" placeholder="e.g. 3500" />
              </div>
            </div>
            {form.priceRange.min > 0 && form.priceRange.max > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Display: <span className="text-indigo-600 font-medium">
                  ₹{form.priceRange.min.toLocaleString('en-IN')} – ₹{form.priceRange.max.toLocaleString('en-IN')} / night
                </span>
              </p>
            )}
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Description</h3>
            <BilingualInput label="Description" value={form.description} onChange={(v) => setBL('description', v)}
              type="textarea" rows={4}
              enPlaceholder="Describe the hotel, its location, and what makes it special for pilgrims..."
            />
          </motion.div>

          {/* Amenities */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Amenities</h3>
            <p className="text-xs text-gray-400 mb-4">Select all facilities available at this hotel.</p>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((am) => {
                const selected = form.amenities.some((a) => a.en === am.en)
                return (
                  <button key={am.en} type="button" onClick={() => toggleAmenity(am)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={selected
                      ? { background: '#4338ca', color: '#fff' }
                      : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                    }>
                    {am.en} / {am.hi}
                  </button>
                )
              })}
            </div>
            {form.amenities.length > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                Selected: <span className="text-indigo-600 font-medium">{form.amenities.map((a) => a.en).join(', ')}</span>
              </p>
            )}
          </motion.div>

          {/* Images */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Photo Gallery</h3>
            <p className="text-xs text-gray-400 mb-4">First image is used as the main card thumbnail.</p>
            <ImageManager
              images={form.images}
              onChange={(imgs) => setField('images', imgs)}
              folder="hotels"
              maxImages={8}
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Settings */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h3>
            <div className="space-y-4">
              {TOGGLES.map((toggle) => (
                <div key={toggle.key} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{toggle.label}</p>
                    <p className="text-xs text-gray-400">{toggle.desc}</p>
                  </div>
                  <button type="button"
                    onClick={() => setField(toggle.key, !form[toggle.key])}
                    className="relative w-10 h-5 rounded-full transition-all duration-200 mt-0.5 shrink-0"
                    style={{ background: form[toggle.key] ? '#4338ca' : '#d1d5db' }}>
                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                      style={{ left: form[toggle.key] ? '22px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rating */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Rating</h3>
            <div>
              <Label>Rating (0 – 5)</Label>
              <input type="number" min={0} max={5} step={0.1} value={form.rating}
                onChange={(e) => setField('rating', Number(e.target.value))}
                className="input-field text-sm" />
              <p className="text-xs text-gray-400 mt-1">Shown as star rating on cards</p>
            </div>
          </motion.div>

          {/* Save */}
          <button type="button" onClick={handleSave} disabled={saving}
            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={16} />{id ? 'Update' : 'Create'} Hotel</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
