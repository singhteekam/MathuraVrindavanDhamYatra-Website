'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  Save, CheckCircle, AlertCircle, Lock, ShieldCheck,
} from 'lucide-react'
import Link  from 'next/link'
import toast from 'react-hot-toast'

// â”€â”€ Toggle component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Toggle({
  checked, onChange, label, desc,
}: {
  checked: boolean; onChange: () => void; label: string; desc: string
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl"
      style={{ background: 'var(--bg-surface-muted)' }}>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button type="button" onClick={onChange}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? '#ff7d0f' : '#d1d5db' }}
        role="switch" aria-checked={checked}>
        <span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )
}

// â”€â”€ Locked field â€” read-only, only superadmin can edit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        <Lock size={10} />
        {label}
        <span className="text-indigo-500 font-semibold normal-case tracking-normal text-xs ml-1">
          (Superadmin only)
        </span>
      </label>
      <div className="input-field bg-gray-50 text-gray-400 cursor-not-allowed select-none flex items-center gap-2"
        style={{ opacity: 0.7 }}>
        <Lock size={12} className="text-gray-300 flex-shrink-0" />
        <span className="text-sm truncate">{value}</span>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  // Read-only site info (fetched from DB, not editable by admin)
  const [siteInfo, setSiteInfo] = useState({
    name:     'Mathura Vrindavan Dham Yatra',
    phone:    '+91 8534890870',
    email:    'info@mathuravrindavandhamyatra.com',
    whatsapp: '918534890870',
    address:  'Mathura, Uttar Pradesh â€” 281001',
    tagline:  'Divine Journey. Trusted Hands.',
  })

  // Admin-editable booking config
  const [bookingConfig, setBookingConfig] = useState({
    advanceAmount:     500,
    cancellationHours: 24,
    autoConfirm:       false,
    whatsappNotify:    true,
    emailNotify:       true,
  })

  // Load saved settings
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const s = data.data
          if (s.siteInfo      && Object.keys(s.siteInfo).length      > 0) setSiteInfo((p)      => ({ ...p, ...s.siteInfo }))
          if (s.bookingConfig && Object.keys(s.bookingConfig).length > 0) setBookingConfig((p) => ({ ...p, ...s.bookingConfig }))
        }
      })
      .catch(() => {/* use defaults silently */})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      // Admin only saves bookingConfig â€” siteInfo and emailConfig are NOT included
      // so superadmin-set values are preserved
      const res = await fetch('/api/admin/settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ bookingConfig }),
      })
      if (res.ok) {
        setSaved(true)
        toast.success('Booking settings saved!')
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

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
        <div className="max-w-2xl space-y-5">
          {[1, 2].map((i) => (
            <div key={i} className="card rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-40 bg-gray-100 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-gray-50 rounded-xl" />
                <div className="h-10 bg-gray-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Settings
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage booking configuration and notification preferences.
          </p>
        </div>
        <button type="button" onClick={handleSave} disabled={saving}
          className="btn-primary text-sm py-2.5 px-5"
          style={{ opacity: saving ? 0.7 : 1 }}>
          {saving
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
            : saved
            ? <><CheckCircle size={15} />Saved!</>
            : <><Save size={15} />Save Changes</>
          }
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl mb-5"
          style={{ background: 'var(--surface-red)', border: '1px solid var(--surface-red-border)' }}>
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="max-w-2xl space-y-5">

        {/* â”€â”€ Site Information â€” READ ONLY for admin â”€â”€ */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4"
            style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Site Information</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Business details â€” only Superadmin can edit these
              </p>
            </div>
            <Link href="/superadmin/settings"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
              <ShieldCheck size={12} />Edit in Superadmin
            </Link>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <LockedField label="Business Name"    value={siteInfo.name}    />
              <LockedField label="Tagline"          value={siteInfo.tagline} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LockedField label="Phone"            value={siteInfo.phone}    />
              <LockedField label="WhatsApp Number"  value={siteInfo.whatsapp} />
            </div>
            <LockedField   label="Email"            value={siteInfo.email}   />
            <LockedField   label="Office Address"   value={siteInfo.address} />
          </div>
        </div>

        {/* â”€â”€ Booking Configuration â€” EDITABLE by admin â”€â”€ */}
        <div className="card rounded-2xl p-6">
          <div className="mb-5 pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Booking Configuration</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Control how bookings behave â€” you can edit these
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Advance Payment (â‚¹)
                </label>
                <input type="number" min={0} step={50}
                  value={bookingConfig.advanceAmount}
                  onChange={(e) => setBookingConfig({ ...bookingConfig, advanceAmount: Number(e.target.value) })}
                  className="input-field" />
                <p className="text-xs text-gray-400 mt-1">Fixed â‚¹ amount customers pay online to confirm</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Free Cancellation (hours)
                </label>
                <input type="number" min={0}
                  value={bookingConfig.cancellationHours}
                  onChange={(e) => setBookingConfig({ ...bookingConfig, cancellationHours: Number(e.target.value) })}
                  className="input-field" />
                <p className="text-xs text-gray-400 mt-1">Hours before trip for free cancellation</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <Toggle
                checked={bookingConfig.autoConfirm}
                onChange={() => setBookingConfig((p) => ({ ...p, autoConfirm: !p.autoConfirm }))}
                label="Auto-confirm bookings"
                desc="Bookings are confirmed instantly without manual review"
              />
              <Toggle
                checked={bookingConfig.whatsappNotify}
                onChange={() => setBookingConfig((p) => ({ ...p, whatsappNotify: !p.whatsappNotify }))}
                label="WhatsApp notifications"
                desc="Send booking updates to customers via WhatsApp"
              />
              <Toggle
                checked={bookingConfig.emailNotify}
                onChange={() => setBookingConfig((p) => ({ ...p, emailNotify: !p.emailNotify }))}
                label="Email notifications"
                desc="Send booking confirmation emails to customers"
              />
            </div>
          </div>
        </div>

        {/* â”€â”€ SMTP â€” READ ONLY for admin â”€â”€ */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-4"
            style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Email Configuration</h3>
              <p className="text-xs text-gray-400 mt-0.5">SMTP settings â€” only Superadmin can change these</p>
            </div>
            <Link href="/superadmin/settings"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
              <ShieldCheck size={12} />Edit in Superadmin
            </Link>
          </div>

          {/* Show locked SMTP info */}
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'var(--bg-surface-muted)', border: '1px solid #f3f4f6' }}>
            <Lock size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-700">SMTP credentials are secured</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Email host, port, and app password are managed by the Superadmin
                and stored securely in Vercel environment variables.
                Email notifications will work as long as they are configured.
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button type="button" onClick={handleSave} disabled={saving}
          className="btn-primary w-full py-4 text-base"
          style={{ opacity: saving ? 0.7 : 1 }}>
          {saving
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving booking settings...</>
            : saved
            ? <><CheckCircle size={16} />Booking settings saved!</>
            : <><Save size={16} />Save Booking Settings</>
          }
        </button>
      </div>
    </div>
  )
}