'use client'

export const dynamic = 'force-dynamic'

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import { motion }         from 'framer-motion'
import { Save }           from 'lucide-react'
import toast              from 'react-hot-toast'
import AdminPageHeader    from '@/components/admin/AdminPageHeader'
import ImageManager       from '@/components/admin/ImageManager'
import BilingualInput,    { type BLValue } from '@/components/admin/BilingualInput'
import BilingualListEditor from '@/components/admin/BilingualListEditor'
import { cars }           from '@/config/site'

interface PackageForm {
  name:             BLValue
  slug:             string
  duration:         number
  nights:           number
  cities:           string[]
  basePrice:        number
  shortDescription: BLValue
  highlights:       BLValue[]
  inclusions:       BLValue[]
  exclusions:       BLValue[]
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
  cities:           ['Mathura', 'Vrindavan'],
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
    'Meals',
    'Hotel accommodation cost',
    'Entry fees at temples',
    'Personal expenses',
  ].map(bl),
  thumbnail:  '',
  images:     [],
  isActive:   true,
  isFeatured: false,
  isPopular:  false,
  pricing: cars.map((c) => ({ carType: c.id, carName: c.name, price: 0 })),
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function updatePricingItem(
  pricing: PackageForm['pricing'],
  index: number,
  price: number,
): PackageForm['pricing'] {
  const updated = [...pricing]
  updated[index] = { ...updated[index], price }
  return updated
}

export default function NewPackagePage() {
  const router              = useRouter()
  const [form, setForm]     = useState<PackageForm>(INITIAL)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.en || !form.slug || !form.shortDescription.en) {
      toast.error('Please fill English name, slug, and description.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        highlights: form.highlights.filter((x) => x.en),
        inclusions: form.inclusions.filter((x) => x.en),
        exclusions: form.exclusions.filter((x) => x.en),
        pricing:    form.pricing.filter((p) => p.price > 0),
      }
      const res  = await fetch('/api/packages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Package created successfully!')
        router.push('/admin/packages')
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
      <AdminPageHeader
        title="Add New Package"
        crumbs={[{ label: 'Packages', href: '/admin/packages' }, { label: 'New' }]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
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
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Slug (URL) *</label>
                  <input type="text" placeholder="same-day-mathura-vrindavan" required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    className="input-field font-mono text-sm" />
                  <p className="text-xs text-gray-400 mt-1">URL: /packages/{form.slug || 'your-slug-here'}</p>
                </div>

                <BilingualInput
                  value={form.shortDescription}
                  onChange={(val) => setForm({ ...form, shortDescription: val })}
                  label="Short Description"
                  required
                  type="textarea"
                  rows={2}
                  enPlaceholder="Brief description shown on listing pages..."
                  hiPlaceholder="संक्षिप्त विवरण..."
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Duration (days)</label>
                    <input type="number" min={1} max={30}
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value), nights: Math.max(0, Number(e.target.value) - 1) })}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Nights</label>
                    <input type="number" min={0}
                      value={form.nights}
                      onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Base Price (₹)</label>
                    <input type="number" min={0}
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                      className="input-field" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Photo Gallery</h3>
              <p className="text-xs text-gray-400 mb-4">Upload package photos. First image becomes the main thumbnail.</p>
              <ImageManager
                images={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs, thumbnail: imgs[0] ?? '' })}
                folder="packages"
                maxImages={6}
                label="Package Photos"
              />
            </motion.div>

            {/* Pricing per vehicle */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Pricing Per Vehicle</h3>
              <div className="space-y-3">
                {form.pricing.map((p, i) => (
                  <div key={p.carType} className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: 'var(--bg-surface-muted)' }}>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1">{p.carName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">₹</span>
                      <input type="number" min={0} placeholder="0"
                        value={p.price || ''}
                        onChange={(e) => setForm({ ...form, pricing: updatePricingItem(form.pricing, i, Number(e.target.value)) })}
                        className="input-field py-2 text-sm w-28 text-right" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Leave 0 if this vehicle type is not available for this package</p>
            </motion.div>

            {/* Highlights, inclusions, exclusions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card rounded-2xl p-5 space-y-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Package Details</h3>
              <BilingualListEditor
                items={form.highlights}
                onChange={(items) => setForm({ ...form, highlights: items })}
                label="Highlights"
              />
              <BilingualListEditor
                items={form.inclusions}
                onChange={(items) => setForm({ ...form, inclusions: items })}
                label="Inclusions"
              />
              <BilingualListEditor
                items={form.exclusions}
                onChange={(items) => setForm({ ...form, exclusions: items })}
                label="Exclusions"
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h3>
              <div className="space-y-3">
                {[
                  { key: 'isActive',   label: 'Active (visible on site)'    },
                  { key: 'isFeatured', label: 'Featured (homepage display)' },
                  { key: 'isPopular',  label: 'Popular (badge on card)'     },
                ].map((toggle) => (
                  <div key={toggle.key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{toggle.label}</span>
                    <button type="button"
                      onClick={() => setForm({ ...form, [toggle.key]: !form[toggle.key as keyof typeof form] })}
                      className="relative w-10 h-5 rounded-full overflow-hidden transition-all duration-200"
                      style={{ background: form[toggle.key as keyof typeof form] ? '#ff7d0f' : '#d1d5db' }}>
                      <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                        style={{ left: form[toggle.key as keyof typeof form] ? '20px' : '2px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <button type="submit" disabled={saving}
              className="btn-primary w-full py-3.5" style={{ opacity: saving ? 0.7 : 1 }}>
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
