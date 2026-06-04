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
const TAG_HI: Record<string, string> = {
  'Thali': 'थाली', 'Sweets': 'मिठाई', 'Prasadam': 'प्रसाद', 'Dhaba': 'ढाबा',
  'Budget': 'किफायती', 'Sattvic': 'सात्विक', 'Village Food': 'ग्रामीण भोजन',
  'North Indian': 'उत्तर भारतीय', 'Braj Cuisine': 'ब्रज व्यंजन',
  'Temple Town': 'मंदिर नगर', 'Pilgrim Food': 'तीर्थयात्री भोजन',
  'Quick Meals': 'त्वरित भोजन', 'Family': 'परिवार', 'Takeaway': 'टेकअवे',
  'Vegetarian': 'शाकाहारी', 'Lassi': 'लस्सी', 'Snacks': 'नाश्ता',
}
const TAG_OPTIONS: BLValue[] = [
  'Thali', 'Sweets', 'Prasadam', 'Dhaba', 'Budget', 'Sattvic',
  'Village Food', 'North Indian', 'Braj Cuisine', 'Temple Town', 'Pilgrim Food',
  'Quick Meals', 'Family', 'Takeaway', 'Vegetarian', 'Lassi', 'Snacks',
].map((en) => ({ en, hi: TAG_HI[en] ?? en }))

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
)

export interface RestaurantFormData {
  name:        BLValue
  slug:        string
  city:        BLValue
  address:     BLValue
  type:        BLValue
  specialty:   BLValue
  description: BLValue
  tags:        BLValue[]
  emoji:       string
  rating:      number
  priceRange:  BLValue
  timings:     BLValue
  isPopular:   boolean
  isActive:    boolean
  images:      string[]
}

const EMPTY: RestaurantFormData = {
  name:        { en: '', hi: '' },
  slug:        '',
  city:        { en: 'Mathura', hi: 'मथुरा' },
  address:     { en: '', hi: '' },
  type:        { en: '', hi: '' },
  specialty:   { en: '', hi: '' },
  description: { en: '', hi: '' },
  tags:        [],
  emoji:       '🍽️',
  rating:      4.0,
  priceRange:  { en: '', hi: '' },
  timings:     { en: '', hi: '' },
  isPopular:   false,
  isActive:    true,
  images:      [],
}

interface Props {
  initial?:  Partial<RestaurantFormData>
  id?:       string
  pageTitle: string
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function RestaurantForm({ initial, id, pageTitle }: Props) {
  const router          = useRouter()
  const [form, setForm] = useState<RestaurantFormData>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)

  function setBL(field: keyof RestaurantFormData, value: BLValue) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }
  function setField<K extends keyof RestaurantFormData>(field: K, value: RestaurantFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCityChange(enCity: string) {
    setField('city', { en: enCity, hi: CITY_HI[enCity] ?? enCity })
  }

  function toggleTag(tag: BLValue) {
    setField('tags', form.tags.some((t) => t.en === tag.en)
      ? form.tags.filter((t) => t.en !== tag.en)
      : [...form.tags, tag])
  }

  async function handleSave() {
    if (!form.name.en) { toast.error('English name is required.'); return }
    if (!form.slug)     { toast.error('Slug is required.');         return }

    setSaving(true)
    try {
      const url    = id ? `/api/restaurants/${id}` : '/api/restaurants'
      const method = id ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Save failed.'); return }
      toast.success(id ? 'Restaurant updated!' : 'Restaurant created!')
      router.push('/superadmin/restaurants')
    } catch {
      toast.error('Network error.')
    } finally {
      setSaving(false)
    }
  }

  const TOGGLES = [
    { key: 'isPopular' as const, label: 'Popular',   desc: 'Shows popular badge'    },
    { key: 'isActive'  as const, label: 'Active',    desc: 'Visible on public site' },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-serif)' }}>
            {pageTitle}
          </h1>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <Link href="/superadmin" className="hover:text-orange-600">Superadmin</Link>
            <span>/</span>
            <Link href="/superadmin/restaurants" className="hover:text-orange-600">Restaurants</Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300">{id ? 'Edit' : 'New'}</span>
          </nav>
        </div>
        <div className="flex gap-2">
          <Link href="/superadmin/restaurants"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={14} />Cancel
          </Link>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={15} />{id ? 'Update' : 'Create'} Restaurant</>
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
                label="Restaurant Name"
                value={form.name}
                onChange={(val) => setForm((prev) => ({
                  ...prev,
                  name: val,
                  slug: val.en !== prev.name.en ? slugify(val.en) : prev.slug,
                }))}
                required
                enPlaceholder="e.g. Brijwasi Mithai Wala"
                hiPlaceholder="e.g. ब्रजवासी मिठाई वाला"
              />
              <div>
                <Label>Slug *</Label>
                <input type="text" value={form.slug}
                  onChange={(e) => setField('slug', slugify(e.target.value))}
                  placeholder="e.g. brijwasi-mithai-wala" className="input-field font-mono text-sm" />
                <p className="text-xs text-gray-400 mt-1">
                  URL: /restaurants/<span className="text-orange-500 font-medium">{form.slug || 'your-slug'}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <select value={form.city.en} onChange={(e) => handleCityChange(e.target.value)} className="input-field text-sm">
                    {CITIES.map((c) => <option key={c} value={c}>{c} / {CITY_HI[c]}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Emoji</Label>
                  <input type="text" value={form.emoji}
                    onChange={(e) => setField('emoji', e.target.value)}
                    className="input-field text-2xl" maxLength={2} />
                </div>
              </div>
              <BilingualInput label="Address" value={form.address} onChange={(v) => setBL('address', v)}
                enPlaceholder="e.g. Holi Gate, Mathura" hiPlaceholder="e.g. होली गेट, मथुरा" />
            </div>
          </motion.div>

          {/* Food Details */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Food Details</h3>
            <div className="space-y-4">
              <BilingualInput label="Type" value={form.type} onChange={(v) => setBL('type', v)}
                enPlaceholder="e.g. Temple Restaurant" hiPlaceholder="e.g. मंदिर रेस्तराँ" />
              <BilingualInput label="Specialty" value={form.specialty} onChange={(v) => setBL('specialty', v)}
                enPlaceholder="e.g. Peda, Mathura Peda, Kachori" hiPlaceholder="e.g. पेड़ा, मथुरा पेड़ा, कचौरी" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BilingualInput label="Price Range" value={form.priceRange} onChange={(v) => setBL('priceRange', v)}
                  enPlaceholder="e.g. ₹50–200" hiPlaceholder="e.g. ₹50–200" />
                <BilingualInput label="Timings" value={form.timings} onChange={(v) => setBL('timings', v)}
                  enPlaceholder="e.g. 7 AM – 10 PM" hiPlaceholder="e.g. सुबह 7 – रात 10" />
              </div>
              <BilingualInput label="Description" value={form.description} onChange={(v) => setBL('description', v)}
                type="textarea" rows={3}
                enPlaceholder="Describe the restaurant, its atmosphere, and what makes it special..."
              />
            </div>
          </motion.div>

          {/* Images */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Photo Gallery</h3>
            <p className="text-xs text-gray-400 mb-4">First image is used as the main card thumbnail.</p>
            <ImageManager
              images={form.images}
              onChange={(imgs) => setField('images', imgs)}
              folder="restaurants"
              maxImages={6}
            />
          </motion.div>

          {/* Tags */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Tags</h3>
            <p className="text-xs text-gray-400 mb-4">Select all that apply. Used for filtering on the public page.</p>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const active = form.tags.some((t) => t.en === tag.en)
                return (
                  <button key={tag.en} type="button" onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={active
                      ? { background: '#ff7d0f', color: '#fff' }
                      : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                    }>
                    {tag.en} / {tag.hi}
                  </button>
                )
              })}
            </div>
            {form.tags.length > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                Selected: <span className="text-orange-600 font-medium">{form.tags.map((t) => t.en).join(', ')}</span>
              </p>
            )}
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
                    style={{ background: form[toggle.key] ? '#ff7d0f' : '#d1d5db' }}>
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
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={16} />{id ? 'Update' : 'Create'} Restaurant</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
