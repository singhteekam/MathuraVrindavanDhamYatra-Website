'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import {
  Save, CheckCircle, AlertCircle, ShieldCheck, Upload,
  Camera, Plus, Trash2, Instagram, Facebook, Youtube, Twitter,
  Phone, Mail, MessageCircle, Eye, EyeOff, Languages, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── types ─────────────────────────────────────────────────────────────────────
interface BL { en: string; hi: string }

interface OwnerForm {
  name:         BL
  title:        BL
  bio:          BL
  photo:        string
  phone:        string
  email:        string
  whatsapp:     string
  experience:   number
  achievements: BL[]
  socialLinks: {
    instagram: string
    facebook:  string
    youtube:   string
    twitter:   string
  }
  isVisible: boolean
}

// ── helpers ───────────────────────────────────────────────────────────────────
function BLInput({
  label, value, onChange, multiline = false, placeholder, onTranslate, translating,
}: {
  label: string
  value: BL
  onChange: (v: BL) => void
  multiline?: boolean
  placeholder?: string
  onTranslate?: () => void
  translating?: boolean
}) {
  const cls = 'input-field text-sm'
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {/* English */}
        <div>
          <p className="text-[10px] text-gray-400 mb-1 font-medium">🇬🇧 English</p>
          {multiline ? (
            <textarea rows={4} value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder={placeholder}
              className={`${cls} resize-none`} />
          ) : (
            <input type="text" value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder={placeholder}
              className={cls} />
          )}
        </div>
        {/* Hindi */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-gray-400 font-medium">🇮🇳 Hindi</p>
            {onTranslate && (
              <button type="button" onClick={onTranslate} disabled={translating}
                className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors"
                style={{ background: translating ? 'var(--bg-surface-muted)' : 'var(--surface-krishna)', color: translating ? 'var(--text-faint)' : '#5b21b6' }}>
                {translating
                  ? <Loader2 size={9} className="animate-spin" />
                  : <Languages size={9} />
                }
                {translating ? 'Translating…' : 'Auto-translate'}
              </button>
            )}
          </div>
          {multiline ? (
            <textarea rows={4} value={value.hi}
              onChange={(e) => onChange({ ...value, hi: e.target.value })}
              placeholder="हिंदी में..."
              className={`${cls} resize-none`} />
          ) : (
            <input type="text" value={value.hi}
              onChange={(e) => onChange({ ...value, hi: e.target.value })}
              placeholder="हिंदी में..."
              className={cls} />
          )}
        </div>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }: {
  checked: boolean; onChange: () => void; label: string; desc: string
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button type="button" onClick={onChange}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: checked ? '#ff7d0f' : '#d1d5db' }}
        role="switch" aria-checked={checked}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )
}

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="card rounded-2xl p-6 mb-5">
      <div className="mb-5 pb-4" style={{ borderBottom: '1px solid var(--border-muted)' }}>
        <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

// ── default form ──────────────────────────────────────────────────────────────
const EMPTY_BL: BL = { en: '', hi: '' }

const DEFAULT: OwnerForm = {
  name:         { ...EMPTY_BL },
  title:        { ...EMPTY_BL },
  bio:          { ...EMPTY_BL },
  photo:        '',
  phone:        '',
  email:        '',
  whatsapp:     '',
  experience:   0,
  achievements: [],
  socialLinks:  { instagram: '', facebook: '', youtube: '', twitter: '' },
  isVisible:    true,
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function SuperadminOwnerPage() {
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [error,         setError]         = useState('')
  const [uploadingPhoto,setUploadingPhoto] = useState(false)
  const [previewPhoto,  setPreviewPhoto]  = useState('')
  const [showSocials,   setShowSocials]   = useState(false)
  // translating: key = field name ('name'|'title'|'bio'|`ach-${i}`|'all')
  const [translating,   setTranslating]   = useState<Record<string, boolean>>({})

  const [form, setForm] = useState<OwnerForm>(DEFAULT)
  const photoRef = useRef<HTMLInputElement>(null)

  // ── load existing ──
  useEffect(() => {
    fetch('/api/owner')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data
          setForm({
            name:         d.name         ?? DEFAULT.name,
            title:        d.title        ?? DEFAULT.title,
            bio:          d.bio          ?? DEFAULT.bio,
            photo:        d.photo        ?? '',
            phone:        d.phone        ?? '',
            email:        d.email        ?? '',
            whatsapp:     d.whatsapp     ?? '',
            experience:   d.experience   ?? 0,
            achievements: d.achievements ?? [],
            socialLinks:  d.socialLinks  ?? DEFAULT.socialLinks,
            isVisible:    d.isVisible    ?? true,
          })
          if (d.photo) setPreviewPhoto(d.photo)
          if (d.socialLinks?.instagram || d.socialLinks?.facebook ||
              d.socialLinks?.youtube   || d.socialLinks?.twitter) {
            setShowSocials(true)
          }
        }
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false))
  }, [])

  // ── upload photo ──
  async function uploadPhoto(file: File) {
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success && data.data?.url) {
        setForm((p) => ({ ...p, photo: data.data.url }))
        setPreviewPhoto(data.data.url)
        toast.success('Photo uploaded!')
      } else {
        toast.error('Upload failed.')
      }
    } catch {
      toast.error('Upload error.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // ── achievements helpers ──
  function addAchievement() {
    setForm((p) => ({ ...p, achievements: [...p.achievements, { en: '', hi: '' }] }))
  }
  function removeAchievement(i: number) {
    setForm((p) => ({ ...p, achievements: p.achievements.filter((_, idx) => idx !== i) }))
  }
  function updateAchievement(i: number, v: BL) {
    setForm((p) => {
      const arr = [...p.achievements]; arr[i] = v; return { ...p, achievements: arr }
    })
  }

  // ── translate helpers ──
  async function callTranslate(text: string): Promise<string | null> {
    if (!text.trim()) { toast.error('Enter English text first.'); return null }
    const res  = await fetch('/api/translate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text }),
    })
    const data = await res.json()
    if (res.ok && data.success) return data.data.translated as string
    toast.error(data.error ?? 'Translation failed.')
    return null
  }

  async function translateField(key: 'name' | 'title' | 'bio') {
    setTranslating((p) => ({ ...p, [key]: true }))
    try {
      const translated = await callTranslate(form[key].en)
      if (translated) {
        setForm((p) => ({ ...p, [key]: { ...p[key], hi: translated } }))
        toast.success('Translated!')
      }
    } catch { toast.error('Translation error.') }
    finally  { setTranslating((p) => ({ ...p, [key]: false })) }
  }

  async function translateAchievement(i: number) {
    const k = `ach-${i}`
    setTranslating((p) => ({ ...p, [k]: true }))
    try {
      const translated = await callTranslate(form.achievements[i].en)
      if (translated) {
        updateAchievement(i, { ...form.achievements[i], hi: translated })
        toast.success('Translated!')
      }
    } catch { toast.error('Translation error.') }
    finally  { setTranslating((p) => ({ ...p, [k]: false })) }
  }

  async function translateAll() {
    setTranslating((p) => ({ ...p, all: true }))
    const fields: ('name' | 'title' | 'bio')[] = ['name', 'title', 'bio']
    const updates: Partial<OwnerForm> = {}

    await Promise.allSettled(
      fields.map(async (key) => {
        if (!form[key].en.trim()) return
        const translated = await callTranslate(form[key].en)
        if (translated) updates[key] = { ...form[key], hi: translated }
      }),
    )

    const achUpdates = await Promise.allSettled(
      form.achievements.map((ach) => ach.en.trim() ? callTranslate(ach.en) : Promise.resolve(null))
    )

    const newAchs = form.achievements.map((ach, i) => {
      const r = achUpdates[i]
      const translated = r.status === 'fulfilled' ? r.value : null
      return translated ? { ...ach, hi: translated } : ach
    })

    setForm((p) => ({
      ...p,
      ...updates,
      achievements: newAchs,
    }))
    setTranslating((p) => ({ ...p, all: false }))
    toast.success('All fields translated!')
  }

  // ── save ──
  async function handleSave() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/owner', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true); toast.success('Owner profile saved!')
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await res.json()
        const msg  = data.error ?? 'Failed to save.'
        setError(msg); toast.error(msg)
      }
    } catch {
      const msg = 'Network error.'
      setError(msg); toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const SaveBtn = ({ fullWidth }: { fullWidth?: boolean }) => (
    <button type="button" onClick={handleSave} disabled={saving}
      className={`btn-primary text-sm py-2.5 px-5 ${fullWidth ? 'w-full py-4 text-base' : ''}`}
      style={{ opacity: saving ? 0.7 : 1, background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
      {saving
        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
        : saved
        ? <><CheckCircle size={16} />Saved!</>
        : <><Save size={16} />Save Profile</>
      }
    </button>
  )

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
        <div className="max-w-2xl space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-40 bg-gray-100 rounded mb-4" />
              <div className="h-10 bg-gray-50 rounded-xl mb-3" />
              <div className="h-10 bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={16} className="text-indigo-500" />
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Superadmin</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-serif)' }}>
            Owner / Business Profile
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Shown on homepage. All text fields support English + Hindi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={translateAll} disabled={translating.all}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            style={{ background: translating.all ? 'var(--bg-surface-muted)' : 'var(--surface-krishna)', color: translating.all ? 'var(--text-muted)' : 'var(--text-on-krishna)' }}>
            {translating.all
              ? <><Loader2 size={14} className="animate-spin" />Translating…</>
              : <><Languages size={14} />Translate All</>
            }
          </button>
          <SaveBtn />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl mb-5"
          style={{ background: 'var(--surface-red)', border: '1px solid var(--surface-red-border)' }}>
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="max-w-2xl">

        {/* ── Visibility + Photo ── */}
        <Section title="Display Settings">
          <div className="space-y-4">
            <Toggle
              checked={form.isVisible}
              onChange={() => setForm((p) => ({ ...p, isVisible: !p.isVisible }))}
              label="Show on Homepage"
              desc="Display the owner section on the public homepage"
            />
          </div>
        </Section>

        {/* ── Photo ── */}
        <Section title="Profile Photo" description="Shown as a circular portrait on the homepage">
          <div className="flex items-center gap-6">
            {/* Preview */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-orange-200"
                style={{ background: 'var(--bg-surface-muted)' }}>
                {previewPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewPhoto} alt="owner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={28} className="text-gray-300" />
                  </div>
                )}
              </div>
              <button type="button"
                onClick={() => photoRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ background: '#ff7d0f' }}>
                {uploadingPhoto
                  ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Upload size={13} className="text-white" />
                }
              </button>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]) }}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Upload owner photo</p>
              <p className="text-xs text-gray-400 mt-1">JPG or PNG · min 400×400 px recommended</p>
              <button type="button" onClick={() => photoRef.current?.click()}
                className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: '#fff7ed', color: '#ff7d0f', border: '1px solid rgba(255,125,15,0.3)' }}>
                Choose Photo
              </button>
            </div>
          </div>
        </Section>

        {/* ── Identity ── */}
        <Section title="Identity" description="Name, designation, and years of experience">
          <div className="space-y-5">
            <BLInput
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="e.g. Teekam Singh"
              onTranslate={() => translateField('name')}
              translating={translating.name}
            />
            <BLInput
              label="Title / Designation"
              value={form.title}
              onChange={(v) => setForm((p) => ({ ...p, title: v }))}
              placeholder="e.g. Founder & CEO"
              onTranslate={() => translateField('title')}
              translating={translating.title}
            />
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Years of Experience
              </label>
              <input type="number" min={0} max={99}
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: Number(e.target.value) }))}
                className="input-field w-32"
              />
              <p className="text-xs text-gray-400 mt-1">Shown as a badge on the photo</p>
            </div>
          </div>
        </Section>

        {/* ── Bio ── */}
        <Section title="About / Bio" description="A short paragraph about the owner — displayed with a saffron accent">
          <BLInput
            label="Bio"
            value={form.bio}
            onChange={(v) => setForm((p) => ({ ...p, bio: v }))}
            multiline
            placeholder="Write a short introduction..."
            onTranslate={() => translateField('bio')}
            translating={translating.bio}
          />
        </Section>

        {/* ── Achievements ── */}
        <Section title="Achievements & Highlights" description="Key milestones shown as bullet cards — supports English + Hindi">
          <div className="space-y-3">
            {form.achievements.map((ach, i) => (
              <div key={i} className="relative p-4 rounded-xl" style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-muted)' }}>
                <button type="button" onClick={() => removeAchievement(i)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50"
                  style={{ color: '#ef4444' }}>
                  <Trash2 size={13} />
                </button>
                <BLInput
                  label={`Achievement ${i + 1}`}
                  value={ach}
                  onChange={(v) => updateAchievement(i, v)}
                  placeholder="e.g. 5000+ happy pilgrims"
                  onTranslate={() => translateAchievement(i)}
                  translating={translating[`ach-${i}`]}
                />
              </div>
            ))}
            <button type="button" onClick={addAchievement}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl w-full justify-center transition-colors"
              style={{ background: '#fff7ed', color: '#ff7d0f', border: '1px dashed rgba(255,125,15,0.4)' }}>
              <Plus size={15} />Add Achievement
            </button>
          </div>
        </Section>

        {/* ── Contact ── */}
        <Section title="Contact Information" description="Shown as quick-action links on the homepage">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                <Phone size={11} />Phone
              </label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                <MessageCircle size={11} />WhatsApp Number
              </label>
              <input type="tel" value={form.whatsapp}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                className="input-field" placeholder="919876543210 (no + or spaces)" />
              <p className="text-xs text-gray-400 mt-1">Format: country code + number, e.g. 919876543210</p>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                <Mail size={11} />Email
              </label>
              <input type="email" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-field" placeholder="owner@example.com" />
            </div>
          </div>
        </Section>

        {/* ── Social Links ── */}
        <Section title="Social Media Links" description="Leave blank to hide. Icons auto-appear on homepage.">
          <button type="button"
            onClick={() => setShowSocials((p) => !p)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 mb-4">
            {showSocials ? <EyeOff size={15} /> : <Eye size={15} />}
            {showSocials ? 'Hide social fields' : 'Show social fields'}
          </button>

          {showSocials && (
            <div className="space-y-3">
              {[
                { key: 'instagram', icon: <Instagram size={15} />, label: 'Instagram URL', color: '#e1306c' },
                { key: 'facebook',  icon: <Facebook  size={15} />, label: 'Facebook URL',  color: '#1877f2' },
                { key: 'youtube',   icon: <Youtube   size={15} />, label: 'YouTube URL',   color: '#ff0000' },
                { key: 'twitter',   icon: <Twitter   size={15} />, label: 'Twitter / X URL', color: '#1da1f2' },
              ].map((s) => (
                <div key={s.key}>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide"
                    style={{ color: s.color }}>
                    {s.icon}{s.label}
                  </label>
                  <input type="url"
                    value={form.socialLinks[s.key as keyof typeof form.socialLinks]}
                    onChange={(e) => setForm((p) => ({
                      ...p,
                      socialLinks: { ...p.socialLinks, [s.key]: e.target.value },
                    }))}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
              ))}
            </div>
          )}
        </Section>

        <SaveBtn fullWidth />
      </div>
    </div>
  )
}
