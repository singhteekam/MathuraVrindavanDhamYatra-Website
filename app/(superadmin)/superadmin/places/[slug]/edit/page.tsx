'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState }      from 'react'
import { useParams, useRouter }      from 'next/navigation'
import { motion }                    from 'framer-motion'
import { Save, Plus, X, ArrowLeft, AlertCircle, ShieldCheck, Languages } from 'lucide-react'
import Link                          from 'next/link'
import toast                         from 'react-hot-toast'
import ImageManager                  from '@/components/admin/ImageManager'
import BilingualInput,               { type BLValue } from '@/components/admin/BilingualInput'

const CITIES = ['Mathura', 'Vrindavan', 'Gokul', 'Govardhan', 'Barsana', 'Nandgaon']
const TYPES  = ['temple', 'ghat', 'sacred-site', 'hill', 'garden', 'museum', 'village']

const CITY_HI: Record<string, string> = {
  'Mathura':   'मथुरा',
  'Vrindavan': 'वृंदावन',
  'Gokul':     'गोकुल',
  'Govardhan': 'गोवर्धन',
  'Barsana':   'बरसाना',
  'Nandgaon':  'नंदगाँव',
}

const TYPE_HI: Record<string, string> = {
  'temple':      'मंदिर',
  'ghat':        'घाट',
  'sacred-site': 'पवित्र स्थल',
  'hill':        'पहाड़ी',
  'garden':      'बाग़',
  'museum':      'संग्रहालय',
  'village':     'गाँव',
}

const SECTION_PRESETS = [
  { value: 'highlights',  en: 'Highlights',               hi: 'विशेषताएँ'              },
  { value: 'travel_tips', en: 'Visitor Tips',             hi: 'दर्शक सुझाव'            },
  { value: 'distances',   en: 'Distance from Key Points', hi: 'प्रमुख स्थानों से दूरी' },
  { value: 'custom',      en: '',                         hi: ''                        },
]

interface DistanceItem { from: BLValue; distance: BLValue; time: BLValue }
type SectionItem = BLValue | DistanceItem

interface PlaceSection {
  type:  string
  title: BLValue
  items: SectionItem[]
}

interface PlaceForm {
  name:             BLValue
  city:             BLValue
  type:             BLValue
  shortDescription: BLValue
  description:      BLValue
  entryFee:         BLValue
  timeRequired:     BLValue
  thumbnail:        string
  images:           string[]
  isFeatured:       boolean
  tags:             BLValue[]
  sections:         PlaceSection[]
  timings: {
    morning: BLValue
    evening: BLValue
    note:    BLValue
  }
  location: {
    address: BLValue
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

function normalizeItem(item: unknown): SectionItem {
  if (typeof item === 'string') return { en: item, hi: '' }
  if (typeof item === 'object' && item !== null) {
    const i = item as Record<string, unknown>
    if ('from' in i) {
      const toB = (v: unknown): BLValue =>
        typeof v === 'object' && v !== null && 'en' in (v as object)
          ? (v as BLValue) : { en: String(v ?? ''), hi: '' }
      return { from: toB(i.from), distance: toB(i.distance), time: toB(i.time) }
    }
    return { en: String(i.en ?? ''), hi: String(i.hi ?? '') }
  }
  return { en: String(item ?? ''), hi: '' }
}

function normalizeSection(s: unknown): PlaceSection {
  const sec = s as Record<string, unknown>
  return {
    type:  String(sec.type ?? 'highlights'),
    title: bl(sec.title),
    items: Array.isArray(sec.items) ? sec.items.map(normalizeItem) : [],
  }
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
)

async function callTranslate(text: string): Promise<string | null> {
  if (!text.trim()) return null
  try {
    const res  = await fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const data = await res.json()
    if (res.ok) return data.data.translated as string
    toast.error(data.error ?? 'Translation failed.')
    return null
  } catch {
    toast.error('Translation unavailable.')
    return null
  }
}

export default function SuperadminEditPlacePage() {
  const { slug }                = useParams<{ slug: string }>()
  const router                  = useRouter()
  const [form,     setForm]     = useState<PlaceForm | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [tagInputEn, setTagInputEn] = useState('')
  const [tagInputHi, setTagInputHi] = useState('')
  const [translatingTagInput,  setTranslatingTagInput]  = useState(false)
  const [translatingItem, setTranslatingItem] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/places/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const p = d.data
          const rawCity = bl(p.city ?? 'Mathura')
          const rawType = bl(p.type ?? 'temple')
          setForm({
            name:             bl(p.name),
            city:             { en: rawCity.en, hi: rawCity.hi || CITY_HI[rawCity.en] || '' },
            type:             { en: rawType.en, hi: rawType.hi || TYPE_HI[rawType.en] || '' },
            shortDescription: bl(p.shortDescription),
            description:      bl(p.description ?? ''),
            entryFee:         bl(p.entryFee         ?? 'Free'),
            timeRequired:     bl(p.timeRequired     ?? '30-60 minutes'),
            thumbnail:        p.thumbnail ?? '',
            images:           p.images    ?? [],
            isFeatured:       p.isFeatured ?? false,
            tags:             (p.tags ?? []).map((t: unknown) => {
              if (typeof t === 'string') return { en: t, hi: '' }
              const tv = t as Record<string, string>
              return { en: tv.en ?? '', hi: tv.hi ?? '' }
            }),
            sections:  (p.sections ?? []).map(normalizeSection),
            timings: {
              morning: bl(p.timings?.morning ?? ''),
              evening: bl(p.timings?.evening ?? ''),
              note:    bl(p.timings?.note    ?? ''),
            },
            location: {
              address: bl(p.location?.address ?? ''),
              lat:     p.location?.lat     ?? 27.5,
              lng:     p.location?.lng     ?? 77.6,
            },
          })
        } else {
          toast.error('Place not found.')
          router.push('/superadmin/places')
        }
      })
      .catch(() => toast.error('Failed to load place.'))
      .finally(() => setLoading(false))
  }, [slug, router])

  // ── Tag helpers ───────────────────────────────────────────────────────────
  function addTag() {
    if (!form || !tagInputEn.trim()) return
    if (form.tags.some((t) => t.en === tagInputEn.trim())) { setTagInputEn(''); setTagInputHi(''); return }
    setForm({ ...form, tags: [...form.tags, { en: tagInputEn.trim(), hi: tagInputHi.trim() }] })
    setTagInputEn('')
    setTagInputHi('')
  }
  function removeTag(i: number) {
    if (!form) return
    setForm({ ...form, tags: form.tags.filter((_, idx) => idx !== i) })
  }
  async function translateTagInput() {
    if (!tagInputEn.trim()) { toast.error('Enter English tag first.'); return }
    setTranslatingTagInput(true)
    const hi = await callTranslate(tagInputEn)
    if (hi) setTagInputHi(hi)
    setTranslatingTagInput(false)
  }

  // ── Section helpers ───────────────────────────────────────────────────────
  function addSection() {
    if (!form) return
    const preset = SECTION_PRESETS[0]
    setForm({
      ...form,
      sections: [...form.sections, { type: preset.value, title: { en: preset.en, hi: preset.hi }, items: [] }],
    })
  }

  function removeSection(i: number) {
    if (!form) return
    setForm({ ...form, sections: form.sections.filter((_, idx) => idx !== i) })
  }

  function updateSectionType(i: number, type: string) {
    if (!form) return
    const sections = form.sections.map((s, idx) => {
      if (idx !== i) return s
      const preset = SECTION_PRESETS.find((p) => p.value === type)
      const title  = preset && preset.en && !s.title.en ? { en: preset.en, hi: preset.hi } : s.title
      const items  = (type === 'distances') !== (s.type === 'distances') ? [] : s.items
      return { ...s, type, title, items }
    })
    setForm({ ...form, sections })
  }

  function updateSectionTitle(i: number, title: BLValue) {
    if (!form) return
    setForm({ ...form, sections: form.sections.map((s, idx) => idx === i ? { ...s, title } : s) })
  }

  function addItem(si: number) {
    if (!form) return
    const isDistance = form.sections[si].type === 'distances'
    const newItem: SectionItem = isDistance ? { from: { en: '', hi: '' }, distance: { en: '', hi: '' }, time: { en: '', hi: '' } } : { en: '', hi: '' }
    setForm({
      ...form,
      sections: form.sections.map((s, idx) =>
        idx === si ? { ...s, items: [...s.items, newItem] } : s,
      ),
    })
  }

  function removeItem(si: number, ii: number) {
    if (!form) return
    setForm({
      ...form,
      sections: form.sections.map((s, idx) =>
        idx === si ? { ...s, items: s.items.filter((_, jj) => jj !== ii) } : s,
      ),
    })
  }

  function updateItem(si: number, ii: number, value: SectionItem) {
    if (!form) return
    setForm({
      ...form,
      sections: form.sections.map((s, idx) => {
        if (idx !== si) return s
        return { ...s, items: s.items.map((it, jj) => jj === ii ? value : it) }
      }),
    })
  }

  async function translateItem(si: number, ii: number, en: string) {
    const key = `${si}-${ii}`
    setTranslatingItem(key)
    const hi = await callTranslate(en)
    if (hi) updateItem(si, ii, { en, hi })
    setTranslatingItem(null)
  }

  async function translateDistanceRow(si: number, ii: number, di: DistanceItem) {
    const key = `${si}-${ii}`
    setTranslatingItem(key)
    const [fromHi, distHi, timeHi] = await Promise.all([
      di.from.en     ? callTranslate(di.from.en)     : Promise.resolve(null),
      di.distance.en ? callTranslate(di.distance.en) : Promise.resolve(null),
      di.time.en     ? callTranslate(di.time.en)     : Promise.resolve(null),
    ])
    updateItem(si, ii, {
      ...di,
      from:     { en: di.from.en,     hi: fromHi ?? di.from.hi },
      distance: { en: di.distance.en, hi: distHi ?? di.distance.hi },
      time:     { en: di.time.en,     hi: timeHi ?? di.time.hi },
    })
    setTranslatingItem(null)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form) return
    setSaving(true)
    try {
      const res = await fetch(`/api/places/${slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          description: form.description.en ? form.description : undefined,
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
        router.push('/superadmin/places')
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
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!form) return (
    <div className="flex-1 p-8 pt-20 lg:pt-8 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
      <p className="text-gray-600">Place not found.</p>
      <Link href="/superadmin/places" className="btn-primary mt-4 inline-flex text-sm">
        Back to Places
      </Link>
    </div>
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
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Edit: {form.name.en}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/superadmin/places"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={14} /> Cancel
          </Link>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={15} />Save Changes</>}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <BilingualInput value={form.name}
                  onChange={(val) => setForm({ ...form, name: val })}
                  label="Place Name" required />
                <div>
                  <Label>Slug (read-only)</Label>
                  <input type="text" value={slug} disabled
                    className="input-field bg-gray-50 text-gray-400 cursor-not-allowed font-mono text-sm" />
                </div>
              </div>

              {/* City — dropdown EN + editable HI */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-bold pointer-events-none">EN</span>
                      <select value={form.city.en}
                        onChange={(e) => setForm({ ...form, city: { en: e.target.value, hi: CITY_HI[e.target.value] ?? form.city.hi } })}
                        className="input-field pl-7 text-sm">
                        {CITIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-bold pointer-events-none">HI</span>
                      <input type="text" value={form.city.hi}
                        onChange={(e) => setForm({ ...form, city: { ...form.city, hi: e.target.value } })}
                        placeholder="मथुरा..."
                        className="input-field pl-7 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Type — dropdown EN + editable HI */}
                <div>
                  <Label>Type *</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-bold pointer-events-none">EN</span>
                      <select value={form.type.en}
                        onChange={(e) => setForm({ ...form, type: { en: e.target.value, hi: TYPE_HI[e.target.value] ?? form.type.hi } })}
                        className="input-field pl-7 text-sm capitalize">
                        {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-bold pointer-events-none">HI</span>
                      <input type="text" value={form.type.hi}
                        onChange={(e) => setForm({ ...form, type: { ...form.type, hi: e.target.value } })}
                        placeholder="मंदिर..."
                        className="input-field pl-7 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <BilingualInput value={form.shortDescription}
                onChange={(val) => setForm({ ...form, shortDescription: val })}
                label="Short Description" required type="textarea" rows={3} />

              <BilingualInput value={form.description}
                onChange={(val) => setForm({ ...form, description: val })}
                label="Full Description (optional)" type="textarea" rows={5}
                enPlaceholder="Detailed information shown on the place detail page..."
                hiPlaceholder="विस्तृत जानकारी..." />

              <div className="grid sm:grid-cols-2 gap-4">
                <BilingualInput value={form.entryFee}
                  onChange={(val) => setForm({ ...form, entryFee: val })}
                  label="Entry Fee" enPlaceholder="Free / ₹50" hiPlaceholder="मुफ़्त / ₹50" />
                <BilingualInput value={form.timeRequired}
                  onChange={(val) => setForm({ ...form, timeRequired: val })}
                  label="Time Required" enPlaceholder="30-60 minutes" hiPlaceholder="30-60 मिनट" />
              </div>
            </div>
          </motion.div>

          {/* Timings */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }} className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Timings</h3>
            <div className="space-y-4">
              <BilingualInput value={form.timings.morning}
                onChange={(val) => setForm({ ...form, timings: { ...form.timings, morning: val } })}
                label="Morning Session" enPlaceholder="5:00 AM – 12:00 PM"
                hiPlaceholder="सुबह 5:00 – दोपहर 12:00" />
              <BilingualInput value={form.timings.evening}
                onChange={(val) => setForm({ ...form, timings: { ...form.timings, evening: val } })}
                label="Evening Session" enPlaceholder="4:00 PM – 9:00 PM"
                hiPlaceholder="शाम 4:00 – रात 9:00" />
              <BilingualInput value={form.timings.note}
                onChange={(val) => setForm({ ...form, timings: { ...form.timings, note: val } })}
                label="Special Note" enPlaceholder="e.g. Closed on Ekadashi..."
                hiPlaceholder="e.g. एकादशी पर बंद..." />
            </div>
          </motion.div>

          {/* Sections */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Sections</h3>
                <p className="text-xs text-gray-400 mt-0.5">Highlights, visitor tips, and distances shown on the detail page.</p>
              </div>
              <button type="button" onClick={addSection}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
                <Plus size={13} /> Add Section
              </button>
            </div>

            {form.sections.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                No sections yet. Add highlights, visitor tips, or distance tables.
              </p>
            )}

            <div className="space-y-4">
              {form.sections.map((section, si) => (
                <div key={si} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <select value={section.type}
                      onChange={(e) => updateSectionType(si, e.target.value)}
                      className="input-field py-1.5 text-xs font-semibold flex-1">
                      <option value="highlights">Highlights</option>
                      <option value="travel_tips">Visitor Tips</option>
                      <option value="distances">Distances</option>
                      <option value="custom">Custom</option>
                    </select>
                    <button type="button" onClick={() => removeSection(si)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                      <X size={15} />
                    </button>
                  </div>

                  <BilingualInput value={section.title}
                    onChange={(val) => updateSectionTitle(si, val)}
                    label="Section Title" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>
                        {section.type === 'distances' ? 'Distance Rows' : 'Items'}
                      </Label>
                      {section.type === 'distances' && (
                        <p className="text-xs text-gray-400">From (EN/HI) · Distance · Time</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item, ii) => (
                        <div key={ii} className="flex gap-1.5 items-center">
                          {section.type === 'distances' && 'from' in (item as object) ? (
                            <div className="flex-1 space-y-1.5">
                              <div className="grid grid-cols-3 gap-1.5">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-bold pointer-events-none">EN</span>
                                  <input type="text" placeholder="From…"
                                    value={(item as DistanceItem).from.en}
                                    onChange={(e) => updateItem(si, ii, { ...(item as DistanceItem), from: { ...(item as DistanceItem).from, en: e.target.value } })}
                                    className="input-field pl-7 text-xs py-1.5" />
                                </div>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-bold pointer-events-none">EN</span>
                                  <input type="text" placeholder="Distance…"
                                    value={(item as DistanceItem).distance.en}
                                    onChange={(e) => updateItem(si, ii, { ...(item as DistanceItem), distance: { ...(item as DistanceItem).distance, en: e.target.value } })}
                                    className="input-field pl-7 text-xs py-1.5" />
                                </div>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-bold pointer-events-none">EN</span>
                                  <input type="text" placeholder="Time…"
                                    value={(item as DistanceItem).time.en}
                                    onChange={(e) => updateItem(si, ii, { ...(item as DistanceItem), time: { ...(item as DistanceItem).time, en: e.target.value } })}
                                    className="input-field pl-7 text-xs py-1.5" />
                                </div>
                              </div>
                              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1.5 items-center">
                                <button type="button"
                                  onClick={() => translateDistanceRow(si, ii, item as DistanceItem)}
                                  disabled={translatingItem === `${si}-${ii}` || !(item as DistanceItem).from.en.trim()}
                                  title="Auto-translate all fields EN→HI"
                                  className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-violet-50 shrink-0">
                                  {translatingItem === `${si}-${ii}`
                                    ? <span className="w-3 h-3 border border-violet-600 border-t-transparent rounded-full animate-spin" />
                                    : <Languages size={11} />
                                  }
                                  EN→HI
                                </button>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-bold pointer-events-none">HI</span>
                                  <input type="text" placeholder="हिन्दी से…"
                                    value={(item as DistanceItem).from.hi}
                                    onChange={(e) => updateItem(si, ii, { ...(item as DistanceItem), from: { ...(item as DistanceItem).from, hi: e.target.value } })}
                                    className="input-field pl-7 text-xs py-1.5" />
                                </div>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-bold pointer-events-none">HI</span>
                                  <input type="text" placeholder="दूरी…"
                                    value={(item as DistanceItem).distance.hi}
                                    onChange={(e) => updateItem(si, ii, { ...(item as DistanceItem), distance: { ...(item as DistanceItem).distance, hi: e.target.value } })}
                                    className="input-field pl-7 text-xs py-1.5" />
                                </div>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-bold pointer-events-none">HI</span>
                                  <input type="text" placeholder="समय…"
                                    value={(item as DistanceItem).time.hi}
                                    onChange={(e) => updateItem(si, ii, { ...(item as DistanceItem), time: { ...(item as DistanceItem).time, hi: e.target.value } })}
                                    className="input-field pl-7 text-xs py-1.5" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-bold pointer-events-none">EN</span>
                                <input type="text" placeholder="English…"
                                  value={(item as BLValue).en}
                                  onChange={(e) => updateItem(si, ii, { ...(item as BLValue), en: e.target.value })}
                                  className="input-field pl-7 text-sm py-2 w-full" />
                              </div>
                              <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-bold pointer-events-none">HI</span>
                                <input type="text" placeholder="हिन्दी…"
                                  value={(item as BLValue).hi}
                                  onChange={(e) => updateItem(si, ii, { ...(item as BLValue), hi: e.target.value })}
                                  className="input-field pl-7 text-sm py-2 w-full" />
                              </div>
                              <button type="button"
                                onClick={() => translateItem(si, ii, (item as BLValue).en)}
                                disabled={translatingItem === `${si}-${ii}` || !(item as BLValue).en.trim()}
                                title="Auto-translate EN→HI"
                                className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-violet-50 shrink-0">
                                {translatingItem === `${si}-${ii}`
                                  ? <span className="w-3 h-3 border border-violet-600 border-t-transparent rounded-full animate-spin" />
                                  : <Languages size={12} />
                                }
                              </button>
                            </>
                          )}
                          <button type="button" onClick={() => removeItem(si, ii)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addItem(si)}
                      className="mt-2 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ color: '#5b21b6', background: 'var(--surface-krishna)' }}>
                      <Plus size={11} />
                      {section.type === 'distances' ? 'Add Row' : 'Add Item'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }} className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Location</h3>
            <div className="space-y-3">
              <BilingualInput value={form.location.address}
                onChange={(val) => setForm({ ...form, location: { ...form.location, address: val } })}
                label="Address"
                enPlaceholder="Near XYZ, Mathura"
                hiPlaceholder="XYZ के पास, मथुरा" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <input type="number" step="0.0001" value={form.location.lat}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, lat: Number(e.target.value) } })}
                    className="input-field" />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <input type="number" step="0.0001" value={form.location.lng}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, lng: Number(e.target.value) } })}
                    className="input-field" />
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--surface-krishna)' }}>
                <p className="text-xs font-semibold text-indigo-600 mb-2">Quick-fill coordinates</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Mathura',   lat: 27.4924, lng: 77.6737 },
                    { label: 'Vrindavan', lat: 27.5794, lng: 77.7022 },
                    { label: 'Govardhan', lat: 27.4985, lng: 77.4668 },
                    { label: 'Gokul',     lat: 27.4565, lng: 77.7401 },
                    { label: 'Barsana',   lat: 27.6512, lng: 77.3636 },
                  ].map((c) => (
                    <button key={c.label} type="button"
                      onClick={() => setForm({ ...form, location: { ...form.location, lat: c.lat, lng: c.lng } })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
                      📍 {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Photo Gallery */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }} className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-1">Photo Gallery</h3>
            <p className="text-xs text-gray-400 mb-4">First image = main thumbnail on cards.</p>
            <ImageManager
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs, thumbnail: imgs[0] ?? '' })}
              folder="places" maxImages={8} label="Place Photos"
            />
          </motion.div>

          {/* Tags */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }} className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
            <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 mb-3">
              <input type="text" placeholder="English tag…"
                value={tagInputEn} onChange={(e) => setTagInputEn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input-field text-sm py-2" />
              <button type="button"
                onClick={translateTagInput}
                disabled={translatingTagInput || !tagInputEn.trim()}
                title="Auto-translate EN→HI"
                className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-violet-50">
                {translatingTagInput
                  ? <span className="w-3 h-3 border border-violet-600 border-t-transparent rounded-full animate-spin" />
                  : <Languages size={12} />
                }
                EN→HI
              </button>
              <input type="text" placeholder="हिंदी टैग…"
                value={tagInputHi} onChange={(e) => setTagInputHi(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input-field text-sm py-2" />
              <button type="button" onClick={addTag}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, i) => (
                <span key={i}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
                  {tag.en}{tag.hi ? ` / ${tag.hi}` : ''}
                  <button type="button" onClick={() => removeTag(i)}
                    className="text-indigo-300 hover:text-red-500 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              {form.tags.length === 0 && <p className="text-xs text-gray-400">No tags yet.</p>}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }} className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Settings</h3>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Featured</p>
                <p className="text-xs text-gray-400">Show on homepage</p>
              </div>
              <button type="button"
                onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                className="relative w-11 h-6 rounded-full transition-colors duration-200 mt-0.5"
                style={{ background: form.isFeatured ? '#6366f1' : '#d1d5db' }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ transform: form.isFeatured ? 'translateX(22px)' : 'translateX(2px)' }} />
              </button>
            </div>
          </motion.div>

          <Link href={`/places/${slug}`} target="_blank"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            View on Site ↗
          </Link>

          <button type="button" onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={16} />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}
