'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  Save, Phone, Mail, Globe, Eye, EyeOff,
  CheckCircle, AlertCircle, ShieldCheck,
} from 'lucide-react'
import toast          from 'react-hot-toast'
import { siteConfig } from '@/config/site'

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

function Toggle({ checked, onChange, label, desc }: {
  checked: boolean; onChange: () => void; label: string; desc: string
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button type="button" onClick={onChange}
        className="relative w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? '#ff7d0f' : '#d1d5db' }}
        role="switch" aria-checked={checked}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )
}

export default function SuperadminSettingsPage() {
  const [saving,          setSaving]          = useState(false)
  const [saved,           setSaved]           = useState(false)
  const [showPass,        setShowPass]        = useState(false)
  const [error,           setError]           = useState('')
  const [loadingSettings, setLoadingSettings] = useState(true)

  const [siteInfo, setSiteInfo] = useState({
    name:     siteConfig.name,
    phone:    siteConfig.phone,
    email:    siteConfig.email,
    whatsapp: siteConfig.whatsapp,
    address:  'Mathura, Uttar Pradesh — 281001',
    tagline:  siteConfig.tagline,
  })
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
  })
  const [bookingConfig, setBookingConfig] = useState({
    advanceAmount:     500,
    cancellationHours: 24,
    autoConfirm:       false,
    whatsappNotify:    true,
    emailNotify:       true,
  })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const s = data.data
          if (s.siteInfo      && Object.keys(s.siteInfo).length      > 0) setSiteInfo((p)      => ({ ...p, ...s.siteInfo }))
          if (s.emailConfig   && Object.keys(s.emailConfig).length   > 0) setEmailConfig((p)   => ({ ...p, ...s.emailConfig }))
          if (s.bookingConfig && Object.keys(s.bookingConfig).length > 0) setBookingConfig((p) => ({ ...p, ...s.bookingConfig }))
        }
      })
      .catch(() => {/* use defaults silently */})
      .finally(() => setLoadingSettings(false))
  }, [])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/admin/settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ siteInfo, emailConfig, bookingConfig }),
      })
      if (res.ok) {
        setSaved(true)
        toast.success('Settings saved!')
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await res.json()
        const msg  = data.error ?? 'Failed to save.'
        setError(msg); toast.error(msg)
      }
    } catch {
      setError('Network error.'); toast.error('Network error.')
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
        : <><Save size={16} />Save Changes</>
      }
    </button>
  )

  if (loadingSettings) {
    return (
      <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
        <div className="max-w-2xl space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-40 bg-gray-100 rounded mb-4" />
              <div className="h-10 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3" />
              <div className="h-10 bg-gray-50 dark:bg-gray-800 rounded-xl" />
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
            Site Settings
          </h1>
        </div>
        <SaveBtn />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl mb-5"
          style={{ background: 'var(--surface-red)', border: '1px solid var(--surface-red-border)' }}>
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="max-w-2xl">
        <Section title="Site Information" description="Business details shown across the website">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Business Name</label>
                <input type="text" value={siteInfo.name}
                  onChange={(e) => setSiteInfo({ ...siteInfo, name: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Tagline</label>
                <input type="text" value={siteInfo.tagline}
                  onChange={(e) => setSiteInfo({ ...siteInfo, tagline: e.target.value })}
                  className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  <Phone size={11} className="inline mr-1" />Phone
                </label>
                <input type="tel" value={siteInfo.phone}
                  onChange={(e) => setSiteInfo({ ...siteInfo, phone: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">WhatsApp Number</label>
                <input type="tel" placeholder="919XXXXXXXXX" value={siteInfo.whatsapp}
                  onChange={(e) => setSiteInfo({ ...siteInfo, whatsapp: e.target.value })}
                  className="input-field" />
                <p className="text-xs text-gray-400 mt-1">No + or spaces — e.g. 919876543210</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                <Mail size={11} className="inline mr-1" />Email
              </label>
              <input type="email" value={siteInfo.email}
                onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Office Address</label>
              <input type="text" value={siteInfo.address}
                onChange={(e) => setSiteInfo({ ...siteInfo, address: e.target.value })}
                className="input-field" />
            </div>
          </div>
        </Section>

        <Section title="Booking Configuration" description="Controls how bookings behave on the platform">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Advance Payment (₹)</label>
                <input type="number" min={0} step={50} value={bookingConfig.advanceAmount}
                  onChange={(e) => setBookingConfig({ ...bookingConfig, advanceAmount: Number(e.target.value) })}
                  className="input-field" />
                <p className="text-xs text-gray-400 mt-1">Fixed advance customers pay online to confirm booking</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Free Cancel (hours)</label>
                <input type="number" min={0} value={bookingConfig.cancellationHours}
                  onChange={(e) => setBookingConfig({ ...bookingConfig, cancellationHours: Number(e.target.value) })}
                  className="input-field" />
              </div>
            </div>
            <div className="space-y-3">
              <Toggle checked={bookingConfig.autoConfirm}
                onChange={() => setBookingConfig((p) => ({ ...p, autoConfirm: !p.autoConfirm }))}
                label="Auto-confirm bookings" desc="Skip manual confirmation — confirm instantly" />
              <Toggle checked={bookingConfig.whatsappNotify}
                onChange={() => setBookingConfig((p) => ({ ...p, whatsappNotify: !p.whatsappNotify }))}
                label="WhatsApp notifications" desc="Send booking updates via WhatsApp" />
              <Toggle checked={bookingConfig.emailNotify}
                onChange={() => setBookingConfig((p) => ({ ...p, emailNotify: !p.emailNotify }))}
                label="Email notifications" desc="Send confirmation emails to customers" />
            </div>
          </div>
        </Section>

        <Section title="Email / SMTP" description="Configure outgoing email for booking confirmations">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">SMTP Host</label>
                <input type="text" placeholder="smtp.gmail.com" value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">SMTP Port</label>
                <input type="text" placeholder="587" value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                  className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">SMTP Email</label>
              <input type="email" placeholder="yourgmail@gmail.com" value={emailConfig.smtpUser}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">App Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Gmail App Password (16 characters)"
                  value={emailConfig.smtpPass}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                  className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Env vars note */}
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: 'var(--surface-amber)', border: '1px solid var(--surface-amber-border)' }}>
          <div className="flex items-start gap-3">
            <Globe size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Sensitive keys stay in Vercel</p>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">
                MongoDB URI, Razorpay, Cloudinary, and <code className="bg-amber-100 px-1 rounded font-mono">SUPERADMIN_SECRET_KEY</code> must be set in
                Vercel → Project → Settings → Environment Variables. They are never stored in the database.
              </p>
            </div>
          </div>
        </div>

        <SaveBtn fullWidth />
      </div>
    </div>
  )
}