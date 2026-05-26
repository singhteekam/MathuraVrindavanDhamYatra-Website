'use client'

export const dynamic = 'force-dynamic'

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import { motion }          from 'framer-motion'
import { Save, ArrowLeft } from 'lucide-react'
import Link                from 'next/link'
import toast               from 'react-hot-toast'
import ImageManager        from '@/components/admin/ImageManager'
import BilingualInput,     { type BLValue } from '@/components/admin/BilingualInput'
import BilingualListEditor from '@/components/admin/BilingualListEditor'
import { cars }            from '@/config/site'

interface ItineraryDay {
  day:         number
  title:       BLValue
  description: BLValue
  places:      BLValue[]
}

interface PackageForm {
  name:             BLValue
  slug:             string
  duration:         number
  nights:           number
  cities:           BLValue[]
  basePrice:        number
  shortDescription: BLValue
  highlights:       BLValue[]
  inclusions:       BLValue[]
  exclusions:       BLValue[]
  itinerary:        ItineraryDay[]
  isActive:         boolean
  isFeatured:       boolean
  isPopular:        boolean
  thumbnail:        string
  images:           string[]
  pricing:          { carType: string; carName: string; price: number }[]
}

function bl(s: string): BLValue { return { en: s, hi: '' } }

const INITIAL: PackageForm = {
  name:             { en: '', hi: '' },
  slug:             '',
  duration:         1,
  nights:           0,
  cities:           [bl('Mathura'), bl('Vrindavan')],
  basePrice:        2000,
  shortDescription: { en: '', hi: '' },
  highlights:       [bl(''), bl(''), bl('')],
  inclusions: [
    'AC vehicle throughout the tour',
    'Experienced local driver',
    'All inter-city transfers',
    'Hotel assistance',
    'Fuel charges included',
  ].map(bl),
  exclusions: [
    'Meals', 'Hotel accommodation cost', 'Entry fees at temples', 'Personal expenses',
  ].map(bl),
  itinerary: [],
  isActive: true, isFeatured: false, isPopular: false,
  thumbnail: '', images: [],
  pricing: cars.map((c) => ({ carType: c.id, carName: c.name, price: 0 })),
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{children}</label>
)

export default function SuperadminNewPackagePage() {
  const router              = useRouter()
  const [form, setForm]     = useState<PackageForm>(INITIAL)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!form.name.en || !form.slug || !form.shortDescription.en) {
      toast.error('Please fill English name, slug, and description.'); return
    }
    setSaving(true)
    try {
      const res  = await fetch('/api/packages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          cities:     form.cities.filter((x) => x.en),
          highlights: form.highlights.filter((x) => x.en),
          inclusions: form.inclusions.filter((x) => x.en),
          exclusions: form.exclusions.filter((x) => x.en),
          itinerary:  form.itinerary.map((day) => ({
            ...day,
            places: day.places.filter((x) => x.en),
          })),
          pricing:    form.pricing.filter((p) => p.price > 0),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Package created!')
        router.push('/superadmin/packages')
      } else {
        toast.error(data.error ?? 'Failed to create package.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Add New Package
          </h1>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <Link href="/superadmin" className="hover:text-indigo-600">Superadmin</Link>
            <span>/</span>
            <Link href="/superadmin/packages" className="hover:text-indigo-600">Packages</Link>
            <span>/</span>
            <span className="text-gray-600">New</span>
          </nav>
        </div>
        <div className="flex gap-2">
          <Link href="/superadmin/packages"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={14} />Cancel
          </Link>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
              : <><Save size={15} />Create Package</>
            }
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <BilingualInput
                  value={form.name}
                  onChange={(val) => setForm((prev) => ({
                    ...prev,
                    name: val,
                    slug: val.en !== prev.name.en ? slugify(val.en) : prev.slug,
                  }))}
                  label="Package Name"
                  required
                  enPlaceholder="Same Day Mathura Vrindavan Tour"
                  hiPlaceholder="मथुरा वृन्दावन दर्शन"
                />
                <div>
                  <Label>Slug *</Label>
                  <input type="text" placeholder="same-day-mathura-vrindavan" required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    className="input-field font-mono text-sm" />
                  <p className="text-xs text-gray-400 mt-1">
                    URL: /packages/<span className="text-indigo-500 font-medium">{form.slug || 'your-slug'}</span>
                  </p>
                </div>
                <BilingualInput
                  value={form.shortDescription}
                  onChange={(val) => setForm({ ...form, shortDescription: val })}
                  label="Short Description"
                  required
                  type="textarea"
                  rows={2}
                  enPlaceholder="Brief description shown on listing cards..."
                />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Duration (days)</Label>
                    <input type="number" min={1} max={30} value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value), nights: Math.max(0, Number(e.target.value) - 1) })}
                      className="input-field" />
                  </div>
                  <div>
                    <Label>Nights</Label>
                    <input type="number" min={0} value={form.nights}
                      onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })}
                      className="input-field" />
                  </div>
                  <div>
                    <Label>Base Price (₹)</Label>
                    <input type="number" min={0} value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                      className="input-field" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-1">Photo Gallery</h3>
              <p className="text-xs text-gray-400 mb-4">First image becomes the main thumbnail on cards.</p>
              <ImageManager
                images={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs, thumbnail: imgs[0] ?? '' })}
                folder="packages" maxImages={6} />
            </motion.div>

            {/* Pricing */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Pricing Per Vehicle</h3>
              <div className="space-y-3">
                {form.pricing.map((p, i) => (
                  <div key={p.carType} className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: 'var(--bg-surface-muted)' }}>
                    <p className="text-sm font-semibold text-gray-800 flex-1">{p.carName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">₹</span>
                      <input type="number" min={0} placeholder="0" value={p.price || ''}
                        onChange={(e) => {
                          const updated = [...form.pricing]
                          updated[i] = { ...updated[i], price: Number(e.target.value) }
                          setForm({ ...form, pricing: updated })
                        }}
                        className="input-field py-2 text-sm w-28 text-right" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Leave 0 if this vehicle type is not available</p>
            </motion.div>

            {/* Lists */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="card rounded-2xl p-5 space-y-5">
              <h3 className="font-bold text-gray-900">Package Details</h3>
              <BilingualListEditor
                items={form.cities}
                onChange={(items) => setForm({ ...form, cities: items })}
                label="Cities Covered"
                addColor="#6366f1"
              />
              <BilingualListEditor
                items={form.highlights}
                onChange={(items) => setForm({ ...form, highlights: items })}
                label="Highlights"
                addColor="#6366f1"
              />
              <BilingualListEditor
                items={form.inclusions}
                onChange={(items) => setForm({ ...form, inclusions: items })}
                label="Inclusions"
                addColor="#6366f1"
              />
              <BilingualListEditor
                items={form.exclusions}
                onChange={(items) => setForm({ ...form, exclusions: items })}
                label="Exclusions"
                addColor="#6366f1"
              />
            </motion.div>

            {/* Itinerary */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Itinerary</h3>
                <button type="button"
                  onClick={() => setForm({ ...form, itinerary: [...form.itinerary, {
                    day: form.itinerary.length + 1,
                    title: { en: '', hi: '' },
                    description: { en: '', hi: '' },
                    places: [],
                  }] })}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: '#6366f1', color: '#6366f1' }}>
                  + Add Day
                </button>
              </div>
              {form.itinerary.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No itinerary days added yet.</p>
              )}
              <div className="space-y-4">
                {form.itinerary.map((day, di) => (
                  <div key={di} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6366f1' }}>Day {day.day}</span>
                      <button type="button"
                        onClick={() => setForm({ ...form, itinerary: form.itinerary.filter((_, i) => i !== di) })}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                    </div>
                    <BilingualInput
                      value={day.title}
                      onChange={(val) => {
                        const updated = [...form.itinerary]
                        updated[di] = { ...updated[di], title: val }
                        setForm({ ...form, itinerary: updated })
                      }}
                      label="Day Title"
                    />
                    <BilingualInput
                      value={day.description}
                      onChange={(val) => {
                        const updated = [...form.itinerary]
                        updated[di] = { ...updated[di], description: val }
                        setForm({ ...form, itinerary: updated })
                      }}
                      label="Description"
                      type="textarea"
                      rows={2}
                    />
                    <BilingualListEditor
                      items={day.places}
                      onChange={(places) => {
                        const updated = [...form.itinerary]
                        updated[di] = { ...updated[di], places }
                        setForm({ ...form, itinerary: updated })
                      }}
                      label="Places Visited"
                      addColor="#6366f1"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                {[
                  { key: 'isActive',   label: 'Active',   desc: 'Visible on public site' },
                  { key: 'isFeatured', label: 'Featured', desc: 'Shown on homepage'       },
                  { key: 'isPopular',  label: 'Popular',  desc: 'Shows popular badge'     },
                ].map((toggle) => (
                  <div key={toggle.key} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{toggle.label}</p>
                      <p className="text-xs text-gray-400">{toggle.desc}</p>
                    </div>
                    <button type="button"
                      onClick={() => setForm({ ...form, [toggle.key]: !form[toggle.key as keyof PackageForm] })}
                      className="relative w-10 h-5 rounded-full transition-all duration-200 mt-0.5"
                      style={{ background: form[toggle.key as keyof PackageForm] ? '#6366f1' : '#d1d5db' }}>
                      <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                        style={{ left: form[toggle.key as keyof PackageForm] ? '22px' : '2px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <button type="submit" disabled={saving}
              className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                : <><Save size={16} />Create Package</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
