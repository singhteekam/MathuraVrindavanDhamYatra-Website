'use client'

export const dynamic = 'force-dynamic'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import { motion }            from 'framer-motion'
import { Save, Plus, X, ArrowLeft, MapPin } from 'lucide-react'
import Link                  from 'next/link'
import toast                 from 'react-hot-toast'
import AdminPageHeader       from '@/components/admin/AdminPageHeader'
import ImageManager          from '@/components/admin/ImageManager'
import BilingualInput,       { type BLValue } from '@/components/admin/BilingualInput'

const CITIES = ['Mathura', 'Vrindavan', 'Gokul', 'Govardhan', 'Barsana', 'Nandgaon', 'Agra']
const TYPES  = [
  { value: 'temple',      label: 'ðŸ›• Temple'      },
  { value: 'ghat',        label: 'ðŸŒŠ Ghat'        },
  { value: 'sacred-site', label: 'ðŸ™ Sacred Site'  },
  { value: 'hill',        label: 'â›°ï¸ Hill'         },
  { value: 'garden',      label: 'ðŸŒº Garden'      },
  { value: 'museum',      label: 'ðŸ›ï¸ Museum'      },
  { value: 'village',     label: 'ðŸ¡ Village'     },
]

interface PlaceForm {
  name:             BLValue
  slug:             string
  city:             string
  type:             string
  shortDescription: BLValue
  description:      BLValue
  entryFee:         BLValue
  timeRequired:     BLValue
  thumbnail:        string
  images:           string[]
  isFeatured:       boolean
  tags:             string[]
  timings: {
    morning: BLValue
    evening: BLValue
    note:    BLValue
  }
  location: {
    address:             string
    lat:                 number
    lng:                 number
    distanceFromMathura: string
  }
}

const INITIAL_FORM: PlaceForm = {
  name:             { en: '', hi: '' },
  slug:             '',
  city:             'Mathura',
  type:             'temple',
  shortDescription: { en: '', hi: '' },
  description:      { en: '', hi: '' },
  entryFee:         { en: 'Free', hi: '' },
  timeRequired:     { en: '30-60 minutes', hi: '' },
  thumbnail:        '',
  images:           [],
  isFeatured:       false,
  tags:             [],
  timings: {
    morning: { en: '', hi: '' },
    evening: { en: '', hi: '' },
    note:    { en: '', hi: '' },
  },
  location: { address: '', lat: 27.4924, lng: 77.6737, distanceFromMathura: '' },
}

function toSlug(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function NewPlacePage() {
  const router                      = useRouter()
  const [form,     setForm]         = useState<PlaceForm>(INITIAL_FORM)
  const [tagInput, setTagInput]     = useState('')
  const [saving,   setSaving]       = useState(false)

  function addTag() {
    const tag = tagInput.trim()
    if (!tag || form.tags.includes(tag)) { setTagInput(''); return }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.en.trim())             { toast.error('Place name (English) is required.');        return }
    if (!form.slug.trim())                { toast.error('Slug is required.');                        return }
    if (!form.shortDescription.en.trim()) { toast.error('Short description (English) is required.'); return }
    if (!form.location.address.trim())    { toast.error('Location address is required.');            return }
    if (!form.location.lat || !form.location.lng) {
      toast.error('Latitude and longitude are required.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        slug:    toSlug(form.slug),
        timings: {
          morning: form.timings.morning.en ? form.timings.morning : undefined,
          evening: form.timings.evening.en ? form.timings.evening : undefined,
          note:    form.timings.note.en    ? form.timings.note    : undefined,
        },
        location: {
          address:             form.location.address,
          lat:                 Number(form.location.lat),
          lng:                 Number(form.location.lng),
          distanceFromMathura: form.location.distanceFromMathura || undefined,
        },
        description: form.description.en ? form.description : undefined,
      }

      const res  = await fetch('/api/places', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(`"${form.name.en}" created successfully! ðŸ™`)
        router.push('/admin/places')
      } else {
        toast.error(data.error ?? 'Failed to create place.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title="Add New Place"
        crumbs={[{ label: 'Places', href: '/admin/places' }, { label: 'Add New' }]}
        action={
          <div className="flex gap-2">
            <Link href="/admin/places"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft size={14} /> Cancel
            </Link>
            <button type="button" onClick={handleSubmit} disabled={saving}
              className="btn-primary text-sm py-2.5 px-5"
              style={{ opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                : <><Save size={15} /> Create Place</>
              }
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
              <div className="space-y-4">

                <BilingualInput
                  value={form.name}
                  onChange={(val) => setForm((prev) => ({
                    ...prev,
                    name: val,
                    slug: val.en !== prev.name.en ? toSlug(val.en) : prev.slug,
                  }))}
                  label="Place Name"
                  required
                  enPlaceholder="e.g. Krishna Janmabhoomi Temple"
                  hiPlaceholder="e.g. à¤¶à¥à¤°à¥€ à¤•à¥ƒà¤·à¥à¤£ à¤œà¤¨à¥à¤®à¤­à¥‚à¤®à¤¿ à¤®à¤‚à¤¦à¤¿à¤°"
                />

                <div>
                  <Label>Slug (URL path) *</Label>
                  <input type="text"
                    placeholder="krishna-janmabhoomi-temple"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                    className="input-field font-mono text-sm" required />
                  <p className="text-xs text-gray-400 mt-1">
                    URL: /places/<span className="text-saffron-600 font-medium">{form.slug || 'your-slug'}</span>
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <select value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="input-field">
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Place Type *</Label>
                    <select value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="input-field">
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <BilingualInput
                  value={form.shortDescription}
                  onChange={(val) => setForm({ ...form, shortDescription: val })}
                  label="Short Description"
                  required
                  type="textarea"
                  rows={2}
                  enPlaceholder="Brief description shown on listing cards and SEO..."
                  hiPlaceholder="à¤¸à¤‚à¤•à¥à¤·à¤¿à¤ªà¥à¤¤ à¤µà¤¿à¤µà¤°à¤£..."
                />

                <BilingualInput
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  label="Full Description (optional)"
                  type="textarea"
                  rows={4}
                  enPlaceholder="Detailed history, significance, and visitor information..."
                  hiPlaceholder="à¤µà¤¿à¤¸à¥à¤¤à¥ƒà¤¤ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€..."
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <BilingualInput
                    value={form.entryFee}
                    onChange={(val) => setForm({ ...form, entryFee: val })}
                    label="Entry Fee"
                    enPlaceholder="Free / ₹50 / ₹100"
                    hiPlaceholder="à¤®à¥à¤«à¤¼à¥à¤¤ / ₹50"
                  />
                  <BilingualInput
                    value={form.timeRequired}
                    onChange={(val) => setForm({ ...form, timeRequired: val })}
                    label="Time Required"
                    enPlaceholder="30-60 minutes / 2-3 hours"
                    hiPlaceholder="30-60 à¤®à¤¿à¤¨à¤Ÿ"
                  />
                </div>
              </div>
            </motion.div>

            {/* Timings */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Temple / Place Timings</h3>
              <div className="space-y-4">
                <BilingualInput
                  value={form.timings.morning}
                  onChange={(val) => setForm({ ...form, timings: { ...form.timings, morning: val } })}
                  label="Morning Session"
                  enPlaceholder="5:00 AM "“ 12:00 PM"
                  hiPlaceholder="à¤¸à¥à¤¬à¤¹ 5:00 "“ à¤¦à¥‹à¤ªà¤¹à¤° 12:00"
                />
                <BilingualInput
                  value={form.timings.evening}
                  onChange={(val) => setForm({ ...form, timings: { ...form.timings, evening: val } })}
                  label="Evening Session"
                  enPlaceholder="4:00 PM "“ 9:00 PM"
                  hiPlaceholder="à¤¶à¤¾à¤® 4:00 "“ à¤°à¤¾à¤¤ 9:00"
                />
                <BilingualInput
                  value={form.timings.note}
                  onChange={(val) => setForm({ ...form, timings: { ...form.timings, note: val } })}
                  label="Special Note"
                  enPlaceholder="e.g. Closed on Holi, Extended hours on Janmashtami..."
                  hiPlaceholder="e.g. à¤¹à¥‹à¤²à¥€ à¤ªà¤° à¤¬à¤‚à¤¦..."
                />
              </div>
            </motion.div>

            {/* Location */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-saffron-500" />Location
              </h3>
              <p className="text-xs text-gray-400 mb-4">Used for Google Maps directions link on the detail page.</p>
              <div className="space-y-3">
                <div>
                  <Label>Address *</Label>
                  <input type="text"
                    placeholder="e.g. Near Mathura Junction, Mathura, UP "” 281001"
                    value={form.location.address}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })}
                    className="input-field" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude *</Label>
                    <input type="number" step="0.0001" placeholder="27.4924"
                      value={form.location.lat || ''}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, lat: Number(e.target.value) } })}
                      className="input-field" required />
                  </div>
                  <div>
                    <Label>Longitude *</Label>
                    <input type="number" step="0.0001" placeholder="77.6737"
                      value={form.location.lng || ''}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, lng: Number(e.target.value) } })}
                      className="input-field" required />
                  </div>
                </div>
                <div>
                  <Label>Distance from Mathura <span className="normal-case font-normal text-gray-400">(optional)</span></Label>
                  <input type="text" placeholder="e.g. 12 km from Mathura city centre"
                    value={form.location.distanceFromMathura}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, distanceFromMathura: e.target.value } })}
                    className="input-field" />
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Quick-fill coordinates</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Mathura',   lat: 27.4924, lng: 77.6737 },
                      { label: 'Vrindavan', lat: 27.5794, lng: 77.7022 },
                      { label: 'Govardhan', lat: 27.4985, lng: 77.4668 },
                      { label: 'Gokul',     lat: 27.4565, lng: 77.7401 },
                      { label: 'Barsana',   lat: 27.6512, lng: 77.3636 },
                    ].map((city) => (
                      <button key={city.label} type="button"
                        onClick={() => setForm({ ...form, location: { ...form.location, lat: city.lat, lng: city.lng } })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                        ðŸ“ {city.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Photo Gallery</h3>
              <p className="text-xs text-gray-400 mb-4">First image becomes the main thumbnail on cards and homepage.</p>
              <ImageManager
                images={form.images}
                onChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs, thumbnail: imgs[0] ?? '' }))}
                folder="places"
                maxImages={8}
                label="Place Photos"
              />
            </motion.div>

            {/* Tags */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Tags</h3>
              <p className="text-xs text-gray-400 mb-3">Tags help visitors find this place through search.</p>
              <div className="flex gap-2 mb-3">
                <input type="text"
                  placeholder="Add a tag and press Enter or Add"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  className="input-field text-sm py-2 flex-1" />
                <button type="button" onClick={addTag}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Krishna', 'Radha', 'Temple', 'Pilgrimage', 'Darshan', 'Aarti', 'Ghat', 'Historic', 'Must Visit', 'Free Entry']
                    .filter((t) => !form.tags.includes(t))
                    .map((tag) => (
                      <button key={tag} type="button"
                        onClick={() => setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }))}
                        className="px-2.5 py-1 rounded-full text-xs transition-colors"
                        style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span key={tag}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {form.tags.length === 0 && <p className="text-xs text-gray-300">No tags added yet.</p>}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Visibility</h3>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Featured</p>
                  <p className="text-xs text-gray-400 mt-0.5">Show on homepage & top of listings</p>
                </div>
                <button type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ background: form.isFeatured ? '#ff7d0f' : '#d1d5db' }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ transform: form.isFeatured ? 'translateX(22px)' : 'translateX(2px)' }} />
                </button>
              </div>
            </motion.div>

            {/* Preview card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Preview</h3>
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-24 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)' }}>
                  <span className="text-4xl">
                    {TYPES.find((t) => t.value === form.type)?.label.split(' ')[0] ?? 'ðŸ“'}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#ff7d0f' }}>
                    {form.city || 'City'} · {form.type.replace('-', ' ')}
                  </p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1">
                    {form.name.en || 'Place Name'}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {form.shortDescription.en || 'Short description will appear here...'}
                  </p>
                  {(form.entryFee.en || form.timeRequired.en) && (
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      {form.timeRequired.en && <span>â± {form.timeRequired.en}</span>}
                      {form.entryFee.en && (
                        <span style={{ color: form.entryFee.en === 'Free' ? '#16a34a' : 'var(--text-muted)' }}>
                          🎉« {form.entryFee.en}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="rounded-2xl p-4 text-xs leading-relaxed"
              style={{ background: 'var(--surface-amber)', border: '1px solid var(--surface-amber-border)', color: '#92400e' }}>
              <p className="font-semibold mb-2">ðŸ’¡ Tips</p>
              <ul className="space-y-1.5 list-none">
                <li>"¢ Slug is auto-generated from English name</li>
                <li>"¢ Use ENâ†’HI button to auto-translate fields</li>
                <li>"¢ Hindi is optional "” English is always shown as fallback</li>
                <li>"¢ Featured places appear on the homepage</li>
              </ul>
            </div>

            <button type="submit" disabled={saving}
              className="btn-primary w-full py-4 text-base"
              style={{ opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating Place...</>
                : <><Save size={18} /> Create Place</>
              }
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
