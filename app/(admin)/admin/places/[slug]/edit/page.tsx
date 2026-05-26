'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState }  from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion }               from 'framer-motion'
import { Save, Plus, X, ArrowLeft, AlertCircle } from 'lucide-react'
import Link                     from 'next/link'
import toast                    from 'react-hot-toast'
import AdminPageHeader          from '@/components/admin/AdminPageHeader'
import ImageManager             from '@/components/admin/ImageManager'
import BilingualInput,          { type BLValue } from '@/components/admin/BilingualInput'

const CITIES = ['Mathura', 'Vrindavan', 'Gokul', 'Govardhan', 'Barsana', 'Nandgaon']
const TYPES  = ['temple', 'ghat', 'sacred-site', 'hill', 'garden', 'museum', 'village']

interface PlaceForm {
  name:             BLValue
  city:             string
  type:             string
  shortDescription: BLValue
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
    address: string
    lat:     number
    lng:     number
  }
}

function bl(val: unknown): BLValue {
  if (!val) return { en: '', hi: '' }
  if (typeof val === 'string') return { en: val, hi: '' }
  const v = val as Record<string, string>
  return { en: v.en ?? '', hi: v.hi ?? '' }
}

export default function EditPlacePage() {
  const { slug }              = useParams<{ slug: string }>()
  const router                = useRouter()
  const [form,    setForm]    = useState<PlaceForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    fetch(`/api/places/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const p = d.data
          setForm({
            name:             bl(p.name),
            city:             p.city      ?? 'Mathura',
            type:             p.type      ?? 'temple',
            shortDescription: bl(p.shortDescription),
            entryFee:         bl(p.entryFee         ?? 'Free'),
            timeRequired:     bl(p.timeRequired     ?? '30-60 minutes'),
            thumbnail:        p.thumbnail ?? '',
            images:           p.images    ?? [],
            isFeatured:       p.isFeatured ?? false,
            tags:             p.tags      ?? [],
            timings: {
              morning: bl(p.timings?.morning ?? ''),
              evening: bl(p.timings?.evening ?? ''),
              note:    bl(p.timings?.note    ?? ''),
            },
            location: {
              address: p.location?.address ?? '',
              lat:     p.location?.lat     ?? 27.5,
              lng:     p.location?.lng     ?? 77.6,
            },
          })
        } else {
          toast.error('Place not found.')
          router.push('/admin/places')
        }
      })
      .catch(() => toast.error('Failed to load place.'))
      .finally(() => setLoading(false))
  }, [slug, router])

  function addTag() {
    if (!form || !tagInput.trim()) return
    if (form.tags.includes(tagInput.trim())) { setTagInput(''); return }
    setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
    setTagInput('')
  }

  function removeTag(tag: string) {
    if (!form) return
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    try {
      const res  = await fetch(`/api/places/${slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          timings: {
            morning: form.timings.morning.en ? form.timings.morning : undefined,
            evening: form.timings.evening.en ? form.timings.evening : undefined,
            note:    form.timings.note.en    ? form.timings.note    : undefined,
          },
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Place updated successfully!')
        router.push('/admin/places')
      } else {
        toast.error(data.error ?? 'Failed to update place.')
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
      <p className="text-gray-600">Place not found.</p>
      <Link href="/admin/places" className="btn-primary mt-4 inline-flex text-sm">Back to Places</Link>
    </div>
  )

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{children}</label>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title={`Edit: ${form.name.en}`}
        crumbs={[{ label: 'Places', href: '/admin/places' }, { label: 'Edit' }]}
        action={
          <div className="flex gap-2">
            <Link href="/admin/places"
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
                  label="Place Name"
                  required
                />
                <div>
                  <Label>Slug (read-only)</Label>
                  <input type="text" value={slug} disabled
                    className="input-field bg-gray-50 text-gray-400 cursor-not-allowed font-mono text-sm" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-field">
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Type *</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field capitalize">
                    {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <BilingualInput
                value={form.shortDescription}
                onChange={(val) => setForm({ ...form, shortDescription: val })}
                label="Short Description"
                required
                type="textarea"
                rows={3}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <BilingualInput
                  value={form.entryFee}
                  onChange={(val) => setForm({ ...form, entryFee: val })}
                  label="Entry Fee"
                  enPlaceholder="Free / ₹50"
                  hiPlaceholder="मुफ़्त / ₹50"
                />
                <BilingualInput
                  value={form.timeRequired}
                  onChange={(val) => setForm({ ...form, timeRequired: val })}
                  label="Time Required"
                  enPlaceholder="30-60 minutes"
                  hiPlaceholder="30-60 मिनट"
                />
              </div>
            </div>
          </motion.div>

          {/* Timings */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Timings</h3>
            <div className="space-y-4">
              <BilingualInput
                value={form.timings.morning}
                onChange={(val) => setForm({ ...form, timings: { ...form.timings, morning: val } })}
                label="Morning Session"
                enPlaceholder="5:00 AM – 12:00 PM"
                hiPlaceholder="सुबह 5:00 – दोपहर 12:00"
              />
              <BilingualInput
                value={form.timings.evening}
                onChange={(val) => setForm({ ...form, timings: { ...form.timings, evening: val } })}
                label="Evening Session"
                enPlaceholder="4:00 PM – 9:00 PM"
                hiPlaceholder="शाम 4:00 – रात 9:00"
              />
              <BilingualInput
                value={form.timings.note}
                onChange={(val) => setForm({ ...form, timings: { ...form.timings, note: val } })}
                label="Special Note"
                enPlaceholder="Closed on festival days, etc."
                hiPlaceholder="त्योहारों पर बंद..."
              />
            </div>
          </motion.div>

          {/* Location */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Location</h3>
            <div className="space-y-3">
              <div>
                <Label>Address</Label>
                <input type="text" placeholder="Near XYZ, Mathura"
                  value={form.location.address}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })}
                  className="input-field" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <input type="number" step="0.0001"
                    value={form.location.lat}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, lat: Number(e.target.value) } })}
                    className="input-field" />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <input type="number" step="0.0001"
                    value={form.location.lng}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, lng: Number(e.target.value) } })}
                    className="input-field" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-1">Photo Gallery</h3>
            <p className="text-xs text-gray-400 mb-4">First image is used as the main thumbnail on cards.</p>
            <ImageManager
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs, thumbnail: imgs[0] ?? '' })}
              folder="places"
              maxImages={8}
              label="Place Photos"
            />
          </motion.div>

          {/* Tags */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input-field text-sm py-2 flex-1" />
              <button type="button" onClick={addTag}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span key={tag}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: 'var(--bg-surface-muted)', color: '#374151' }}>
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              {form.tags.length === 0 && (
                <p className="text-xs text-gray-400">No tags yet. Tags help with search.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Settings</h3>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Featured</p>
                <p className="text-xs text-gray-400">Show on homepage and listings</p>
              </div>
              <button type="button"
                onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                className="relative w-10 h-5 rounded-full transition-all duration-200 mt-0.5"
                style={{ background: form.isFeatured ? '#ff7d0f' : '#d1d5db' }}>
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                  style={{ left: form.isFeatured ? '20px' : '2px' }} />
              </button>
            </div>
          </motion.div>

          <Link href={`/places/${slug}`} target="_blank"
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
