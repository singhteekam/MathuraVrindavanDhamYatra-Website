'use client'

export const dynamic = 'force-dynamic'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import { motion }            from 'framer-motion'
import { Save, Plus, X, ArrowLeft, MapPin, ShieldCheck, Languages } from 'lucide-react'
import Link                  from 'next/link'
import toast                 from 'react-hot-toast'
import ImageManager          from '@/components/admin/ImageManager'
import BilingualInput,       { type BLValue } from '@/components/admin/BilingualInput'

const CITIES = ['Mathura', 'Vrindavan', 'Gokul', 'Govardhan', 'Barsana', 'Nandgaon', 'Agra']
const TYPES  = [
  { value: 'temple',      label: '🛕 Temple'       },
  { value: 'ghat',        label: '🌊 Ghat'         },
  { value: 'sacred-site', label: '🙏 Sacred Site'  },
  { value: 'hill',        label: '⛰️ Hill'          },
  { value: 'garden',      label: '🌺 Garden'       },
  { value: 'museum',      label: '🏛️ Museum'       },
  { value: 'village',     label: '🏡 Village'      },
]

const CITY_HI: Record<string, string> = {
  'Mathura':   'मथुरा',
  'Vrindavan': 'वृंदावन',
  'Gokul':     'गोकुल',
  'Govardhan': 'गोवर्धन',
  'Barsana':   'बरसाना',
  'Nandgaon':  'नंदगाँव',
  'Agra':      'आगरा',
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
  slug:             string
  city:             BLValue
  type:             BLValue
  shortDescription: BLValue
  description:      BLValue
  entryFee:         BLValue
  timeRequired:     BLValue
  isFeatured:       boolean
  thumbnail:        string
  images:           string[]
  tags:             BLValue[]
  sections:         PlaceSection[]
  timings: {
    morning: BLValue
    evening: BLValue
    note:    BLValue
  }
  location: { address: BLValue; lat: number; lng: number; distanceFromMathura: string }
}

const INITIAL: PlaceForm = {
  name:             { en: '', hi: '' },
  slug:             '',
  city:             { en: 'Mathura', hi: 'मथुरा' },
  type:             { en: 'temple', hi: 'मंदिर' },
  shortDescription: { en: '', hi: '' },
  description:      { en: '', hi: '' },
  entryFee:         { en: 'Free', hi: 'नि:शुल्क' },
  timeRequired:     { en: '30-60 minutes', hi: '30-60 मिनट' },
  isFeatured:       false,
  thumbnail:        '',
  images:           [],
  tags:             [],
  sections:         [],
  timings:  { morning: { en: '', hi: '' }, evening: { en: '', hi: '' }, note: { en: '', hi: '' } },
  location: { address: { en: '', hi: '' }, lat: 27.4924, lng: 77.6737, distanceFromMathura: '' },
}

function toSlug(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '')
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">{children}</label>
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

export default function SuperadminNewPlacePage() {
  const router                  = useRouter()
  const [form,     setForm]     = useState<PlaceForm>(INITIAL)
  const [tagInputEn, setTagInputEn] = useState('')
  const [tagInputHi, setTagInputHi] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [translatingTagInput,  setTranslatingTagInput]  = useState(false)
  const [translatingItem, setTranslatingItem] = useState<string | null>(null)

  // ── Tag helpers ───────────────────────────────────────────────────────────
  function addTag() {
    const en = tagInputEn.trim()
    const hi = tagInputHi.trim()
    if (!en || form.tags.some((t) => t.en === en)) { setTagInputEn(''); setTagInputHi(''); return }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, { en, hi }] }))
    setTagInputEn('')
    setTagInputHi('')
  }
  function removeTag(i: number) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, idx) => idx !== i) }))
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
    const preset = SECTION_PRESETS[0]
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { type: preset.value, title: { en: preset.en, hi: preset.hi }, items: [] }],
    }))
  }
  function removeSection(i: number) {
    setForm((prev) => ({ ...prev, sections: prev.sections.filter((_, idx) => idx !== i) }))
  }
  function updateSectionType(i: number, type: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => {
        if (idx !== i) return s
        const preset = SECTION_PRESETS.find((p) => p.value === type)
        const title  = preset && preset.en && !s.title.en ? { en: preset.en, hi: preset.hi } : s.title
        const items  = (type === 'distances') !== (s.type === 'distances') ? [] : s.items
        return { ...s, type, title, items }
      }),
    }))
  }
  function updateSectionTitle(i: number, title: BLValue) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => idx === i ? { ...s, title } : s),
    }))
  }
  function addItem(si: number) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => {
        if (idx !== si) return s
        const isDistance = s.type === 'distances'
        const newItem: SectionItem = isDistance ? { from: { en: '', hi: '' }, distance: { en: '', hi: '' }, time: { en: '', hi: '' } } : { en: '', hi: '' }
        return { ...s, items: [...s.items, newItem] }
      }),
    }))
  }
  function removeItem(si: number, ii: number) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) =>
        idx === si ? { ...s, items: s.items.filter((_, jj) => jj !== ii) } : s,
      ),
    }))
  }
  function updateItem(si: number, ii: number, value: SectionItem) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => {
        if (idx !== si) return s
        return { ...s, items: s.items.map((it, jj) => jj === ii ? value : it) }
      }),
    }))
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

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!form.name.en.trim())             { toast.error('Place name (English) is required.');        return }
    if (!form.slug.trim())                { toast.error('Slug is required.');                        return }
    if (!form.shortDescription.en.trim()) { toast.error('Short description (English) is required.'); return }
    if (!form.location.address.en.trim()) { toast.error('Location address is required.');            return }

    setSaving(true)
    try {
      const res = await fetch('/api/places', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
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
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`"${form.name.en}" created! 🙏`)
        router.push('/superadmin/places')
      } else {
        toast.error(data.error ?? 'Failed to create place.')
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
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={16} className="text-indigo-500" />
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Superadmin</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-serif)' }}>
            Add New Place
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/superadmin/places"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={14} /> Cancel
          </Link>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="btn-primary text-sm py-2.5 px-5"
            style={{ opacity: saving ? 0.7 : 1, background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
              : <><Save size={15} /> Create Place</>
            }
          </button>
        </div>
      </div>

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
                  label="Place Name" required
                  enPlaceholder="e.g. Krishna Janmabhoomi Temple"
                  hiPlaceholder="e.g. श्री कृष्ण जन्मभूमि मंदिर"
                />
                <div>
                  <Label>Slug *</Label>
                  <input type="text" value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                    className="input-field font-mono text-sm" required />
                  <p className="text-xs text-gray-400 mt-1">URL: /places/<span className="text-indigo-500 font-medium">{form.slug || 'your-slug'}</span></p>
                </div>

                {/* City — dropdown EN + editable HI */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-bold pointer-events-none">EN</span>
                        <select value={form.city.en}
                          onChange={(e) => setForm({ ...form, city: { en: e.target.value, hi: CITY_HI[e.target.value] ?? '' } })}
                          className="input-field pl-7 text-sm">
                          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
                          onChange={(e) => setForm({ ...form, type: { en: e.target.value, hi: TYPE_HI[e.target.value] ?? '' } })}
                          className="input-field pl-7 text-sm">
                          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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

                <BilingualInput
                  value={form.shortDescription}
                  onChange={(val) => setForm({ ...form, shortDescription: val })}
                  label="Short Description" required type="textarea" rows={2}
                  enPlaceholder="Brief description shown on listing cards..."
                />
                <BilingualInput
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  label="Full Description (optional)" type="textarea" rows={4}
                  enPlaceholder="Detailed information for the detail page..."
                  hiPlaceholder="विस्तृत जानकारी..."
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <BilingualInput
                    value={form.entryFee}
                    onChange={(val) => setForm({ ...form, entryFee: val })}
                    label="Entry Fee" enPlaceholder="Free / ₹50" hiPlaceholder="नि:शुल्क / ₹50"
                  />
                  <BilingualInput
                    value={form.timeRequired}
                    onChange={(val) => setForm({ ...form, timeRequired: val })}
                    label="Time Required" enPlaceholder="30-60 minutes" hiPlaceholder="30-60 मिनट"
                  />
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }} className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Photo Gallery</h3>
              <p className="text-xs text-gray-400 mb-4">First image = main thumbnail on cards and homepage.</p>
              <ImageManager
                images={form.images}
                onChange={(imgs) => setForm((p) => ({ ...p, images: imgs, thumbnail: imgs[0] ?? '' }))}
                folder="places" maxImages={8} />
            </motion.div>

            {/* Timings */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }} className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Timings</h3>
              <div className="space-y-4">
                <BilingualInput
                  value={form.timings.morning}
                  onChange={(val) => setForm({ ...form, timings: { ...form.timings, morning: val } })}
                  label="Morning Session" enPlaceholder="5:00 AM – 12:00 PM" hiPlaceholder="सुबह 5:00 – दोपहर 12:00"
                />
                <BilingualInput
                  value={form.timings.evening}
                  onChange={(val) => setForm({ ...form, timings: { ...form.timings, evening: val } })}
                  label="Evening Session" enPlaceholder="4:00 PM – 9:00 PM" hiPlaceholder="शाम 4:00 – रात 9:00"
                />
                <BilingualInput
                  value={form.timings.note}
                  onChange={(val) => setForm({ ...form, timings: { ...form.timings, note: val } })}
                  label="Special Note" enPlaceholder="e.g. Extended hours on Janmashtami..."
                  hiPlaceholder="e.g. जन्माष्टमी पर विशेष समय..."
                />
              </div>
            </motion.div>

            {/* Sections */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }} className="card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Sections</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Highlights, visitor tips, and distances shown on the detail page.</p>
                </div>
                <button type="button" onClick={addSection}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
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
                        <Label>{section.type === 'distances' ? 'Distance Rows' : 'Items'}</Label>
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
              transition={{ delay: 0.12 }} className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-500" />Location
              </h3>
              <p className="text-xs text-gray-400 mb-4">Used for Google Maps directions link.</p>
              <div className="space-y-3">
                <BilingualInput
                  value={form.location.address}
                  onChange={(val) => setForm({ ...form, location: { ...form.location, address: val } })}
                  label="Address *"
                  enPlaceholder="e.g. Near Mathura Junction, Mathura, UP 281001"
                  hiPlaceholder="e.g. मथुरा जंक्शन के पास, मथुरा, UP 281001"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude</Label>
                    <input type="number" step="0.0001" value={form.location.lat || ''}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, lat: Number(e.target.value) } })}
                      className="input-field" />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <input type="number" step="0.0001" value={form.location.lng || ''}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, lng: Number(e.target.value) } })}
                      className="input-field" />
                  </div>
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
                    ].map((c) => (
                      <button key={c.label} type="button"
                        onClick={() => setForm({ ...form, location: { ...form.location, lat: c.lat, lng: c.lng } })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                        📍 {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }} className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Tags</h3>
              <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 mb-3">
                <input type="text" placeholder="English tag…"
                  value={tagInputEn} onChange={(e) => setTagInputEn(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
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
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  className="input-field text-sm py-2" />
                <button type="button" onClick={addTag}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
                  <Plus size={14} /> Add
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
              </div>
            </motion.div>
          </div>

          {/* Settings sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h3>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Featured</p>
                  <p className="text-xs text-gray-400 mt-0.5">Show on homepage</p>
                </div>
                <button type="button"
                  onClick={() => setForm((p) => ({ ...p, isFeatured: !p.isFeatured }))}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ background: form.isFeatured ? '#6366f1' : '#d1d5db' }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ transform: form.isFeatured ? 'translateX(22px)' : 'translateX(2px)' }} />
                </button>
              </div>
            </motion.div>

            <div className="rounded-2xl p-4 text-xs leading-relaxed"
              style={{ background: 'var(--surface-krishna)', border: '1px solid var(--surface-krishna-border)', color: 'var(--text-on-krishna)' }}>
              <p className="font-semibold mb-2">💡 Tips</p>
              <ul className="space-y-1.5 list-none">
                <li>• Slug is auto-generated from English name</li>
                <li>• City &amp; Type auto-fill Hindi from a lookup</li>
                <li>• Use EN→HI button to auto-translate fields</li>
                <li>• Hindi is optional — English shown as fallback</li>
              </ul>
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                : <><Save size={18} /> Create Place</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
