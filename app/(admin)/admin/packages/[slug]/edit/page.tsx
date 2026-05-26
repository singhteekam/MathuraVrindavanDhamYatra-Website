'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState }  from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion }               from 'framer-motion'
import { Save, ArrowLeft, AlertCircle } from 'lucide-react'
import Link                     from 'next/link'
import toast                    from 'react-hot-toast'
import AdminPageHeader          from '@/components/admin/AdminPageHeader'
import ImageManager             from '@/components/admin/ImageManager'
import BilingualInput,          { type BLValue } from '@/components/admin/BilingualInput'
import BilingualListEditor      from '@/components/admin/BilingualListEditor'
import { cars }                 from '@/config/site'

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
  thumbnail:        string
  images:           string[]
  isActive:         boolean
  isFeatured:       boolean
  isPopular:        boolean
  pricing:          { carType: string; carName: string; price: number }[]
}

function bl(val: unknown): BLValue {
  if (!val) return { en: '', hi: '' }
  if (typeof val === 'string') return { en: val, hi: '' }
  const v = val as Record<string, string>
  return { en: v.en ?? '', hi: v.hi ?? '' }
}

export default function EditPackagePage() {
  const { slug }              = useParams<{ slug: string }>()
  const router                = useRouter()
  const [form,    setForm]    = useState<PackageForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    fetch(`/api/packages/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const p = d.data
          setForm({
            name:             bl(p.name),
            slug:             p.slug             ?? '',
            duration:         p.duration         ?? 1,
            nights:           p.nights           ?? 0,
            cities:           ((p.cities?.length ? p.cities : ['Mathura', 'Vrindavan']) as unknown[]).map(bl),
            basePrice:        p.basePrice        ?? 0,
            shortDescription: bl(p.shortDescription),
            highlights:       (p.highlights?.length ? p.highlights : ['']).map(bl),
            inclusions:       (p.inclusions?.length ? p.inclusions : ['']).map(bl),
            exclusions:       (p.exclusions?.length ? p.exclusions : ['']).map(bl),
            itinerary: (p.itinerary ?? []).map((day: Record<string, unknown>) => ({
              day:         Number(day.day),
              title:       bl(day.title),
              description: bl(day.description),
              places:      ((day.places ?? []) as unknown[]).map(bl),
            })),
            thumbnail:        p.thumbnail  ?? '',
            images:           p.images     ?? [],
            isActive:         p.isActive   ?? true,
            isFeatured:       p.isFeatured ?? false,
            isPopular:        p.isPopular  ?? false,
            pricing: cars.map((c) => {
              const existing = p.pricing?.find((pr: { carType: string }) => pr.carType === c.id)
              return { carType: c.id, carName: c.name, price: existing?.price ?? 0 }
            }),
          })
        } else {
          toast.error('Package not found.')
          router.push('/admin/packages')
        }
      })
      .catch(() => toast.error('Failed to load package.'))
      .finally(() => setLoading(false))
  }, [slug, router])

  async function handleSave() {
    if (!form) return
    setSaving(true)
    try {
      const payload = {
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
      }
      const res  = await fetch(`/api/packages/${slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Package updated successfully!')
        router.push('/admin/packages')
      } else {
        toast.error(data.error ?? 'Failed to update package.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-8 pt-20 lg:pt-8">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!form) return (
    <div className="flex-1 p-8 pt-20 lg:pt-8 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
      <p className="text-gray-600">Package not found.</p>
      <Link href="/admin/packages" className="btn-primary mt-4 inline-flex text-sm">
        Back to Packages
      </Link>
    </div>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title={`Edit: ${form.name.en}`}
        crumbs={[{ label: 'Packages', href: '/admin/packages' }, { label: 'Edit' }]}
        action={
          <div className="flex gap-2">
            <Link href="/admin/packages"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={14} />Cancel
            </Link>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 px-5">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                : <><Save size={15} />Save Changes</>
              }
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Basic info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <BilingualInput
                  value={form.name}
                  onChange={(val) => setForm({ ...form, name: val })}
                  label="Package Name"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Slug (read-only)</label>
                  <input type="text" value={form.slug} disabled
                    className="input-field bg-gray-50 text-gray-400 cursor-not-allowed font-mono text-sm" />
                </div>
              </div>

              <BilingualInput
                value={form.shortDescription}
                onChange={(val) => setForm({ ...form, shortDescription: val })}
                label="Short Description"
                required
                type="textarea"
                rows={2}
              />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Duration (days)</label>
                  <input type="number" min={1} value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nights</label>
                  <input type="number" min={0} value={form.nights}
                    onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Base Price (₹)</label>
                  <input type="number" min={0} value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    className="input-field" />
                </div>
              </div>
            </div>
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
                    <input type="number" min={0} value={p.price || ''} placeholder="0"
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
          </motion.div>

          {/* Images */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-1">Photo Gallery</h3>
            <p className="text-xs text-gray-400 mb-4">Upload package/tour photos via Cloudinary. First image is the main thumbnail.</p>
            <ImageManager
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs, thumbnail: imgs[0] ?? '' })}
              folder="packages"
              maxImages={6}
              label="Package Photos"
            />
          </motion.div>

          {/* Lists */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card rounded-2xl p-5 space-y-5">
            <h3 className="font-bold text-gray-900">Package Details</h3>
            <BilingualListEditor
              items={form.cities}
              onChange={(items) => setForm({ ...form, cities: items })}
              label="Cities Covered"
            />
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

          {/* Itinerary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
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
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-saffron-400 text-saffron-600 hover:bg-saffron-50 transition-colors">
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
                    <span className="text-xs font-bold text-saffron-600 uppercase tracking-wide">Day {day.day}</span>
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
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Visibility Settings</h3>
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
                    className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 mt-0.5"
                    style={{ background: form[toggle.key as keyof PackageForm] ? '#ff7d0f' : '#d1d5db' }}>
                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                      style={{ left: form[toggle.key as keyof PackageForm] ? '20px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <Link href={`/packages/${slug}`} target="_blank"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            View on Site ↗
          </Link>

          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={16} />Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
