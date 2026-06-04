'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Save, AlertCircle, Upload, Camera, FileText,
  Car, User, Shield, Star,
} from 'lucide-react'
import Link  from 'next/link'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatCurrency } from '@/lib/utils'

interface Driver {
  _id: string
  name: string
  phone: string
  email: string
  gender?: string
  avatar?: string
  licenseNumber: string
  aadharNumber?: string
  aadharFront?: string
  aadharBack?: string
  panNumber?: string
  panCard?: string
  vehicle: { type: string; name: string; number: string; color: string; image?: string }
  isAvailable: boolean
  isVerified: boolean
  totalTrips: number
  rating: number
  totalRatings: number
  earnings: number
}

interface Fields {
  name: string; phone: string; gender: string; licenseNumber: string
  avatar: string; aadharNumber: string; aadharFront: string; aadharBack: string
  panNumber: string; panCard: string; isVerified: boolean; isAvailable: boolean
  vehicleType: string; vehicleName: string; vehicleNumber: string
  vehicleColor: string; vehicleImage: string; rating: number
}

const CAR_OPTIONS = [
  { id: 'swift',  label: 'Swift Dzire'   },
  { id: 'eeco',   label: 'Maruti Eeco'   },
  { id: 'ertiga', label: 'Maruti Ertiga' },
  { id: 'innova', label: 'Toyota Innova' },
  { id: 'crysta', label: 'Innova Crysta' },
]

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const fd = new FormData()
  fd.append('file',   file)
  fd.append('folder', folder)
  const res  = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Upload failed')
  return data.data.url
}

export default function DriverDetailPage() {
  const { driverId }           = useParams<{ driverId: string }>()
  const [driver,  setDriver]   = useState<Driver | null>(null)
  const [loading, setLoading]  = useState(true)
  const [saving,  setSaving]   = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  const [fields, setFields] = useState<Fields>({
    name: '', phone: '', gender: 'male', licenseNumber: '',
    avatar: '', aadharNumber: '', aadharFront: '', aadharBack: '',
    panNumber: '', panCard: '', isVerified: false, isAvailable: true,
    vehicleType: 'swift', vehicleName: 'Swift Dzire', vehicleNumber: '',
    vehicleColor: '', vehicleImage: '', rating: 5,
  })

  function setField<K extends keyof Fields>(key: K, val: Fields[K]) {
    setFields(prev => ({ ...prev, [key]: val }))
  }

  useEffect(() => {
    fetch(`/api/drivers/${driverId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const d = data.data as Driver
          setDriver(d)
          setFields({
            name:          d.name,
            phone:         d.phone,
            gender:        d.gender ?? 'male',
            licenseNumber: d.licenseNumber,
            avatar:        d.avatar        ?? '',
            aadharNumber:  d.aadharNumber  ?? '',
            aadharFront:   d.aadharFront   ?? '',
            aadharBack:    d.aadharBack    ?? '',
            panNumber:     d.panNumber     ?? '',
            panCard:       d.panCard       ?? '',
            isVerified:    d.isVerified,
            isAvailable:   d.isAvailable,
            vehicleType:   d.vehicle.type,
            vehicleName:   d.vehicle.name,
            vehicleNumber: d.vehicle.number,
            vehicleColor:  d.vehicle.color,
            vehicleImage:  d.vehicle.image ?? '',
            rating:        d.rating,
          })
        } else {
          toast.error('Driver not found.')
        }
      })
      .catch(() => toast.error('Failed to load driver.'))
      .finally(() => setLoading(false))
  }, [driverId])

  async function handleImageUpload(
    file: File,
    field: keyof Fields,
    folder = 'drivers',
  ) {
    setUploading(p => ({ ...p, [field]: true }))
    try {
      const url = await uploadToCloudinary(file, folder)
      setField(field, url)
      toast.success('Image uploaded.')
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploading(p => ({ ...p, [field]: false }))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:          fields.name,
          phone:         fields.phone,
          gender:        fields.gender,
          licenseNumber: fields.licenseNumber,
          avatar:        fields.avatar     || undefined,
          aadharNumber:  fields.aadharNumber || undefined,
          aadharFront:   fields.aadharFront  || undefined,
          aadharBack:    fields.aadharBack   || undefined,
          panNumber:     fields.panNumber    || undefined,
          panCard:       fields.panCard      || undefined,
          isVerified:    fields.isVerified,
          isAvailable:   fields.isAvailable,
          rating:        fields.rating,
          vehicle: {
            type:   fields.vehicleType,
            name:   fields.vehicleName,
            number: fields.vehicleNumber,
            color:  fields.vehicleColor,
            image:  fields.vehicleImage || undefined,
          },
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Driver updated successfully!')
        setDriver(data.data)
      } else {
        toast.error(data.error ?? 'Failed to save.')
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

  if (!driver) return (
    <div className="flex-1 p-8 pt-20 lg:pt-8 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">Driver not found.</p>
      <Link href="/admin/drivers" className="btn-primary mt-4 inline-flex text-sm">Back to Drivers</Link>
    </div>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title={driver.name}
        crumbs={[{ label: 'Drivers', href: '/admin/drivers' }, { label: driver.name }]}
        action={
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 px-5">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1" />Saving...</>
              : <><Save size={16} />Save Changes</>}
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Trips', value: driver.totalTrips },
          { label: 'Rating',      value: `${driver.rating.toFixed(1)} ⭐` },
          { label: 'Earnings',    value: formatCurrency(driver.earnings) },
        ].map(s => (
          <div key={s.label} className="card rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal Info */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User size={15} className="text-saffron-500" />Personal Information
            </h3>

            {/* Avatar upload */}
            <div className="flex items-center gap-5 mb-5">
              <div className="relative shrink-0">
                {fields.avatar ? (
                  <img src={fields.avatar} alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-saffron-200" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                    {fields.name.charAt(0).toUpperCase() || 'D'}
                  </div>
                )}
                {uploading.avatar && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Driver Photo</p>
                <ImageUploadButton
                  label="Upload Photo"
                  loading={!!uploading.avatar}
                  onFile={(f) => handleImageUpload(f, 'avatar', 'drivers/avatars')}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Full Name *">
                <input type="text" className="input-field text-sm" value={fields.name}
                  onChange={e => setField('name', e.target.value)} />
              </FormField>
              <FormField label="Phone *">
                <input type="tel" className="input-field text-sm" value={fields.phone}
                  onChange={e => setField('phone', e.target.value)} />
              </FormField>
              <FormField label="Gender">
                <select className="input-field text-sm" value={fields.gender}
                  onChange={e => setField('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              <FormField label="License Number *">
                <input type="text" className="input-field text-sm" value={fields.licenseNumber}
                  onChange={e => setField('licenseNumber', e.target.value)} />
              </FormField>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">Email: <span className="font-mono">{driver.email}</span>
                  <span className="ml-2 text-gray-300">(change via Users management)</span>
                </p>
              </div>
            </div>
          </div>

          {/* KYC Documents */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText size={15} className="text-saffron-500" />KYC Documents
            </h3>

            {/* Aadhaar */}
            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-surface-muted)' }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Aadhaar Card</p>
              <FormField label="Aadhaar Number">
                <input type="text" className="input-field text-sm" value={fields.aadharNumber}
                  placeholder="XXXX XXXX XXXX"
                  onChange={e => setField('aadharNumber', e.target.value)} />
              </FormField>
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Front Side</p>
                  <DocImageSlot
                    url={fields.aadharFront}
                    loading={!!uploading.aadharFront}
                    onFile={f => handleImageUpload(f, 'aadharFront', 'drivers/kyc')}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Back Side</p>
                  <DocImageSlot
                    url={fields.aadharBack}
                    loading={!!uploading.aadharBack}
                    onFile={f => handleImageUpload(f, 'aadharBack', 'drivers/kyc')}
                  />
                </div>
              </div>
            </div>

            {/* PAN Card */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">PAN Card
                <span className="ml-1 font-normal text-gray-400">(optional)</span>
              </p>
              <FormField label="PAN Number">
                <input type="text" className="input-field text-sm" value={fields.panNumber}
                  placeholder="ABCDE1234F"
                  onChange={e => setField('panNumber', e.target.value.toUpperCase())} />
              </FormField>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">PAN Card Image</p>
                <DocImageSlot
                  url={fields.panCard}
                  loading={!!uploading.panCard}
                  onFile={f => handleImageUpload(f, 'panCard', 'drivers/kyc')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right (1/3) ── */}
        <div className="space-y-5">

          {/* Status */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield size={15} className="text-saffron-500" />Status
            </h3>
            <div className="space-y-3">
              <Toggle
                label="Verified Driver"
                description="Show verified badge to customers"
                checked={fields.isVerified}
                onChange={v => setField('isVerified', v)}
                activeColor="#16a34a"
              />
              <Toggle
                label="Available for Trips"
                description="Driver can be assigned to new bookings"
                checked={fields.isAvailable}
                onChange={v => setField('isAvailable', v)}
                activeColor="#ff7d0f"
              />
            </div>
          </div>

          {/* Vehicle */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Car size={15} className="text-saffron-500" />Vehicle
            </h3>
            <div className="space-y-3">
              <FormField label="Vehicle Type">
                <select className="input-field text-sm" value={fields.vehicleType}
                  onChange={e => {
                    const opt = CAR_OPTIONS.find(c => c.id === e.target.value)
                    setFields(p => ({ ...p, vehicleType: e.target.value, vehicleName: opt?.label ?? p.vehicleName }))
                  }}>
                  {CAR_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </FormField>
              <FormField label="Vehicle Number">
                <input type="text" className="input-field text-sm" value={fields.vehicleNumber}
                  placeholder="UP85AB1234"
                  onChange={e => setField('vehicleNumber', e.target.value.toUpperCase())} />
              </FormField>
              <FormField label="Color">
                <input type="text" className="input-field text-sm" value={fields.vehicleColor}
                  placeholder="White / Silver..."
                  onChange={e => setField('vehicleColor', e.target.value)} />
              </FormField>
            </div>

            {/* Vehicle image */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vehicle Photo</p>
              <DocImageSlot
                url={fields.vehicleImage}
                loading={!!uploading.vehicleImage}
                onFile={f => handleImageUpload(f, 'vehicleImage', 'drivers/vehicles')}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="card rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Star size={14} className="text-saffron-500" />Driver Rating
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-bold text-saffron-500">{fields.rating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(fields.rating) ? '#ff7d0f' : '#d1d5db', fontSize: 16 }}>★</span>
                ))}
              </div>
            </div>
            <FormField label="Set Rating (0 – 5)">
              <input
                type="number" min="0" max="5" step="0.1"
                className="input-field text-sm"
                value={fields.rating}
                onChange={e => setField('rating', Math.min(5, Math.max(0, Number(e.target.value))))}
              />
            </FormField>
            <p className="text-xs text-gray-400 mt-1">{driver.totalRatings} customer reviews</p>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
            style={{ opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={16} />Save All Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function ImageUploadButton({ label, loading, onFile }: {
  label: string; loading: boolean; onFile: (f: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" disabled={loading}
        onClick={() => ref.current?.click()}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-gray-300 text-gray-600 hover:border-saffron-400 hover:text-saffron-600 transition-colors disabled:opacity-50">
        {loading
          ? <span className="w-3.5 h-3.5 border-2 border-saffron-400 border-t-transparent rounded-full animate-spin" />
          : <Camera size={13} />}
        {loading ? 'Uploading...' : label}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
    </>
  )
}

function DocImageSlot({ url, loading, onFile }: {
  url: string; loading: boolean; onFile: (f: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={() => !loading && ref.current?.click()}
      className="relative rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-gray-200 hover:border-saffron-400 transition-colors"
      style={{ minHeight: 100 }}>
      {url ? (
        <img src={url} alt="Document" className="w-full h-28 object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center h-28 text-gray-400">
          <Upload size={20} className="mb-1" />
          <p className="text-xs">Click to upload</p>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {url && !loading && (
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          Change
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
    </div>
  )
}

function Toggle({ label, description, checked, onChange, activeColor }: {
  label: string; description: string; checked: boolean
  onChange: (v: boolean) => void; activeColor: string
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 shrink-0"
        style={{ background: checked ? activeColor : '#d1d5db' }}>
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  )
}
