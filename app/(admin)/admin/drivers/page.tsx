'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Car, Phone, X, Pencil, Upload, Camera, Eye, Mail, CreditCard, Star, IndianRupee, CheckCircle2, XCircle, Download, Maximize2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

interface Driver {
  _id: string
  name: string
  phone: string
  email: string
  gender?: string
  avatar?: string
  licenseNumber: string
  vehicle: { name: string; number: string; type: string; color: string; image?: string }
  isAvailable: boolean
  isVerified: boolean
  totalTrips: number
  rating: number
}

interface DriverFull extends Driver {
  aadharNumber?: string
  aadharFront?: string
  aadharBack?: string
  panNumber?: string
  panCard?: string
  totalRatings: number
  earnings: number
}

const INITIAL_FORM = {
  name: '', email: '', phone: '', password: '', gender: 'male',
  licenseNumber: '',
  avatar: '',
  aadharNumber: '', aadharFront: '', aadharBack: '',
  panNumber: '', panCard: '',
  vehicle: { type: 'swift', name: 'Swift Dzire', number: '', color: '', image: '' },
}

export default function AdminDriversPage() {
  const [drivers,   setDrivers]   = useState<Driver[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(INITIAL_FORM)
  const [saving,    setSaving]    = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [viewDriver,    setViewDriver]    = useState<DriverFull | null>(null)
  const [viewLoading,   setViewLoading]   = useState(false)
  const [lightbox,      setLightbox]      = useState<{ url: string; name: string } | null>(null)

  const avatarRef      = useRef<HTMLInputElement>(null)
  const aadharFrontRef = useRef<HTMLInputElement>(null)
  const aadharBackRef  = useRef<HTMLInputElement>(null)
  const panCardRef     = useRef<HTMLInputElement>(null)
  const vehicleImgRef  = useRef<HTMLInputElement>(null)

  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/drivers?limit=50')
      const data = await res.json()
      if (data.success) setDrivers(data.data)
    } catch {
      toast.error('Failed to load drivers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDrivers() }, [fetchDrivers])

  const filtered = search.trim()
    ? drivers.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.phone.includes(search) ||
        d.vehicle.number.toLowerCase().includes(search.toLowerCase())
      )
    : drivers

  async function toggleAvailability(id: string, current: boolean) {
    try {
      await fetch(`/api/drivers/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isAvailable: !current }),
      })
      toast.success(`Driver marked as ${!current ? 'Available' : 'Unavailable'}.`)
      fetchDrivers()
    } catch {
      toast.error('Failed to update.')
    }
  }

  async function toggleVerified(id: string, current: boolean) {
    try {
      await fetch(`/api/drivers/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isVerified: !current }),
      })
      toast.success(`Driver ${!current ? 'verified' : 'unverified'}.`)
      fetchDrivers()
    } catch {
      toast.error('Failed to update.')
    }
  }

  async function handleAddDriver(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone || !form.email || !form.password || !form.licenseNumber || !form.vehicle.number) {
      toast.error('Please fill all required fields.')
      return
    }
    setSaving(true)
    try {
      const res  = await fetch('/api/drivers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Driver added successfully!')
        setShowModal(false)
        setForm(INITIAL_FORM)
        fetchDrivers()
      } else {
        toast.error(data.error ?? 'Failed to add driver.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadImage(file: File, field: string) {
    setUploadingField(field)
    const folderMap: Record<string, string> = {
      avatar: 'drivers/avatars',
      aadharFront: 'drivers/kyc', aadharBack: 'drivers/kyc', panCard: 'drivers/kyc',
      vehicleImage: 'drivers/vehicles',
    }
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folderMap[field] ?? 'drivers')
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Upload failed')
      const url = data.data.url as string
      if (field === 'vehicleImage') {
        setForm(prev => ({ ...prev, vehicle: { ...prev.vehicle, image: url } }))
      } else if (field === 'avatar')       setForm(prev => ({ ...prev, avatar: url }))
      else if (field === 'aadharFront')    setForm(prev => ({ ...prev, aadharFront: url }))
      else if (field === 'aadharBack')     setForm(prev => ({ ...prev, aadharBack: url }))
      else if (field === 'panCard')        setForm(prev => ({ ...prev, panCard: url }))
      toast.success('Image uploaded.')
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploadingField(null)
    }
  }

  async function downloadImage(url: string, filename: string) {
    try {
      const res  = await fetch(url)
      const blob = await res.blob()
      const obj  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = obj; a.download = filename
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(obj)
    } catch {
      toast.error('Download failed.')
    }
  }

  async function openViewDriver(id: string) {
    setViewLoading(true)
    setViewDriver(null)
    try {
      const res  = await fetch(`/api/drivers/${id}`)
      const data = await res.json()
      if (data.success) setViewDriver(data.data as DriverFull)
      else toast.error('Failed to load driver details.')
    } catch {
      toast.error('Network error.')
    } finally {
      setViewLoading(false)
    }
  }

  const CAR_OPTIONS = [
    { id: 'swift',  name: 'Swift Dzire'  },
    { id: 'eeco',   name: 'Maruti Eeco'  },
    { id: 'ertiga', name: 'Maruti Ertiga'},
    { id: 'innova', name: 'Toyota Innova'},
    { id: 'crysta', name: 'Innova Crysta'},
  ]

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title="Drivers"
        crumbs={[{ label: 'Drivers' }]}
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2.5 px-5">
            <Plus size={16} /> Add Driver
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',     value: drivers.length,                                      color: '#374151', bg: '#f9fafb' },
          { label: 'Available', value: drivers.filter((d) => d.isAvailable).length,          color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Verified',  value: drivers.filter((d) => d.isVerified).length,           color: '#4338ca', bg: '#eef2ff' },
        ].map((s) => (
          <div key={s.label} className="card rounded-xl p-4 text-center"
            style={{ background: s.bg }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search name, phone, vehicle..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Driver cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((driver, i) => (
            <motion.div
              key={driver._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card rounded-2xl p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {driver.avatar ? (
                    <img src={driver.avatar} alt={driver.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                      {driver.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{driver.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone size={10} /> {driver.phone}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={driver.isVerified
                      ? { background: '#f0fdf4', color: '#16a34a' }
                      : { background: '#fff1f2', color: '#dc2626' }}>
                    {driver.isVerified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={driver.isAvailable
                      ? { background: '#f0fdf4', color: '#16a34a' }
                      : { background: '#f3f4f6', color: '#6b7280' }}>
                    {driver.isAvailable ? '● Available' : '○ On Trip'}
                  </span>
                </div>
              </div>

              {/* Vehicle info */}
              <div className="p-3 rounded-xl mb-4"
                style={{ background: '#f9fafb' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Car size={13} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">{driver.vehicle.name}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="font-mono font-bold">{driver.vehicle.number}</span>
                  <span>{driver.vehicle.color}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-center mb-4">
                {[
                  { label: 'Trips',  value: driver.totalTrips },
                  { label: 'Rating', value: driver.rating.toFixed(1) },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-bold text-gray-900 text-base">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAvailability(driver._id, driver.isAvailable)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={driver.isAvailable
                    ? { background: '#fff1f2', color: '#dc2626' }
                    : { background: '#f0fdf4', color: '#16a34a' }}>
                  {driver.isAvailable ? 'Unavailable' : 'Available'}
                </button>
                <button
                  onClick={() => toggleVerified(driver._id, driver.isVerified)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: '#fff8ed', color: '#ff7d0f' }}>
                  {driver.isVerified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  onClick={() => openViewDriver(driver._id)}
                  className="p-2 rounded-xl flex items-center justify-center"
                  style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Eye size={14} />
                </button>
                <Link href={`/admin/drivers/${driver._id}`}
                  className="p-2 rounded-xl flex items-center justify-center"
                  style={{ background: '#f3f4f6', color: '#374151' }}>
                  <Pencil size={14} />
                </Link>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <Car size={40} className="mx-auto mb-3 opacity-30" />
              <p>No drivers found</p>
            </div>
          )}
        </div>
      )}

      {/* View Driver Modal */}
      {(viewLoading || viewDriver) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 text-lg">Driver Details</h3>
              <div className="flex items-center gap-2">
                {viewDriver && (
                  <Link href={`/admin/drivers/${viewDriver._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    <Pencil size={12} />Edit
                  </Link>
                )}
                <button onClick={() => setViewDriver(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {viewLoading && !viewDriver ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : viewDriver && (
              <div className="p-5 space-y-5">

                {/* Hero */}
                <div className="flex items-center gap-5">
                  {viewDriver.avatar ? (
                    <div className="relative group shrink-0 cursor-pointer"
                      onClick={() => setLightbox({ url: viewDriver.avatar!, name: `${viewDriver.name} - Photo` })}>
                      <img src={viewDriver.avatar} alt={viewDriver.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-saffron-100" />
                      <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={16} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                      {viewDriver.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 truncate">{viewDriver.name}</h2>
                    <p className="text-sm text-gray-500 mb-2">{viewDriver.gender ? viewDriver.gender.charAt(0).toUpperCase() + viewDriver.gender.slice(1) : '—'}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
                        style={viewDriver.isVerified
                          ? { background: '#f0fdf4', color: '#16a34a' }
                          : { background: '#fff1f2', color: '#dc2626' }}>
                        {viewDriver.isVerified
                          ? <><CheckCircle2 size={11} />Verified</>
                          : <><XCircle size={11} />Unverified</>}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={viewDriver.isAvailable
                          ? { background: '#f0fdf4', color: '#16a34a' }
                          : { background: '#f3f4f6', color: '#6b7280' }}>
                        {viewDriver.isAvailable ? '● Available' : '○ On Trip'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Trips', value: viewDriver.totalTrips,                     icon: <Car size={14} />,         color: '#4338ca', bg: '#eef2ff' },
                    { label: 'Rating',      value: `${viewDriver.rating.toFixed(1)} ★`,       icon: <Star size={14} />,        color: '#d97706', bg: '#fffbeb' },
                    { label: 'Earnings',    value: `₹${(viewDriver.earnings ?? 0).toLocaleString('en-IN')}`, icon: <IndianRupee size={14} />, color: '#16a34a', bg: '#f0fdf4' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                      <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                      <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Personal Info */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: '#f9fafb' }}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal Information</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: <Phone size={13} />,      label: 'Phone',          value: viewDriver.phone },
                      { icon: <Mail size={13} />,       label: 'Email',          value: viewDriver.email },
                      { icon: <CreditCard size={13} />, label: 'License Number', value: viewDriver.licenseNumber },
                    ].map(row => (
                      <div key={row.label} className="flex items-start gap-2.5">
                        <div className="mt-0.5 text-saffron-500 shrink-0">{row.icon}</div>
                        <div>
                          <p className="text-xs text-gray-400">{row.label}</p>
                          <p className="text-sm font-semibold text-gray-800 font-mono break-all">{row.value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle */}
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {viewDriver.vehicle.image && (
                    <div className="relative group cursor-pointer bg-gray-50"
                      onClick={() => setLightbox({ url: viewDriver.vehicle.image!, name: `${viewDriver.vehicle.name} - ${viewDriver.vehicle.number}` })}>
                      <img src={viewDriver.vehicle.image} alt="Vehicle"
                        className="w-full max-h-52 object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Maximize2 size={18} className="text-white" />
                        <span className="text-white text-xs font-semibold">View Full</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vehicle</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: 'Name',   value: viewDriver.vehicle.name   },
                        { label: 'Number', value: viewDriver.vehicle.number },
                        { label: 'Type',   value: viewDriver.vehicle.type   },
                        { label: 'Color',  value: viewDriver.vehicle.color  },
                      ].map(r => (
                        <div key={r.label}>
                          <p className="text-xs text-gray-400">{r.label}</p>
                          <p className="font-semibold text-gray-800 font-mono">{r.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* KYC */}
                <div className="rounded-xl p-4 space-y-4" style={{ background: '#f9fafb' }}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">KYC Documents</p>

                  {/* Aadhaar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Aadhaar Card</p>
                      {viewDriver.aadharNumber && (
                        <span className="text-xs font-mono text-gray-700 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                          {viewDriver.aadharNumber}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">Front</p>
                        {viewDriver.aadharFront ? (
                          <DocThumb url={viewDriver.aadharFront} alt="Aadhaar Front"
                            onClick={() => setLightbox({ url: viewDriver.aadharFront!, name: `${viewDriver.name} - Aadhaar Front` })} />
                        ) : (
                          <div className="h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">Not uploaded</div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">Back</p>
                        {viewDriver.aadharBack ? (
                          <DocThumb url={viewDriver.aadharBack} alt="Aadhaar Back"
                            onClick={() => setLightbox({ url: viewDriver.aadharBack!, name: `${viewDriver.name} - Aadhaar Back` })} />
                        ) : (
                          <div className="h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">Not uploaded</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PAN */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">PAN Card <span className="text-gray-400 font-normal">(optional)</span></p>
                      {viewDriver.panNumber && (
                        <span className="text-xs font-mono text-gray-700 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                          {viewDriver.panNumber}
                        </span>
                      )}
                    </div>
                    {viewDriver.panCard ? (
                      <DocThumb url={viewDriver.panCard} alt="PAN Card"
                        onClick={() => setLightbox({ url: viewDriver.panCard!, name: `${viewDriver.name} - PAN Card` })} />
                    ) : (
                      <div className="h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">Not uploaded</div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-5 py-4" onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold text-sm truncate max-w-xs">{lightbox.name}</p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => downloadImage(lightbox.url, lightbox.name.replace(/\s+/g, '_') + '.jpg')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                <Download size={13} />Download
              </button>
              <button onClick={() => setLightbox(null)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 min-h-0" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          </div>
          <p className="text-center text-white/30 text-xs pb-4">Tap outside image to close</p>
        </div>
      )}

      {/* Add Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 text-lg">Add New Driver</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="p-5 space-y-5">

              {/* Driver Photo */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Driver Photo</p>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {form.avatar ? (
                      <img src={form.avatar} alt="Avatar" className="w-16 h-16 rounded-xl object-cover border-2 border-saffron-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                        {form.name.charAt(0).toUpperCase() || 'D'}
                      </div>
                    )}
                    {uploadingField === 'avatar' && (
                      <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <button type="button" disabled={!!uploadingField}
                    onClick={() => avatarRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-gray-300 text-gray-600 hover:border-saffron-400 hover:text-saffron-600 transition-colors disabled:opacity-50">
                    {uploadingField === 'avatar'
                      ? <><span className="w-3.5 h-3.5 border-2 border-saffron-400 border-t-transparent rounded-full animate-spin" />Uploading...</>
                      : <><Camera size={13} />Upload Photo</>}
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'avatar') }} />
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Personal Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
                    <input type="text" placeholder="Driver name" required
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone *</label>
                    <input type="tel" placeholder="+91 9999999999" required
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email *</label>
                    <input type="email" placeholder="driver@email.com" required
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Password *</label>
                    <input type="password" placeholder="Min 6 characters" required
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">License Number *</label>
                    <input type="text" placeholder="UP85 20230012345" required
                      value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="input-field">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* KYC Documents */}
              <div className="p-4 rounded-xl space-y-4" style={{ background: '#f9fafb' }}>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">KYC Documents</p>

                {/* Aadhaar */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Aadhaar Card</p>
                  <input type="text" placeholder="XXXX XXXX XXXX"
                    value={form.aadharNumber}
                    onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })}
                    className="input-field text-sm py-2 mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Front Side</p>
                      <ModalUploadSlot
                        url={form.aadharFront}
                        loading={uploadingField === 'aadharFront'}
                        inputRef={aadharFrontRef}
                        onFile={f => uploadImage(f, 'aadharFront')}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Back Side</p>
                      <ModalUploadSlot
                        url={form.aadharBack}
                        loading={uploadingField === 'aadharBack'}
                        inputRef={aadharBackRef}
                        onFile={f => uploadImage(f, 'aadharBack')}
                      />
                    </div>
                  </div>
                </div>

                {/* PAN Card */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    PAN Card <span className="font-normal text-gray-400">(optional)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input type="text" placeholder="ABCDE1234F"
                        value={form.panNumber}
                        onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                        className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <ModalUploadSlot
                        url={form.panCard}
                        loading={uploadingField === 'panCard'}
                        inputRef={panCardRef}
                        onFile={f => uploadImage(f, 'panCard')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="p-4 rounded-xl space-y-3" style={{ background: '#f9fafb' }}>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Vehicle Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Vehicle Type *</label>
                    <select
                      value={form.vehicle.type}
                      onChange={(e) => {
                        const car = CAR_OPTIONS.find((c) => c.id === e.target.value)!
                        setForm({ ...form, vehicle: { ...form.vehicle, type: e.target.value, name: car.name } })
                      }}
                      className="input-field text-sm py-2"
                    >
                      {CAR_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Vehicle Number *</label>
                    <input type="text" placeholder="UP85AB1234" required
                      value={form.vehicle.number}
                      onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, number: e.target.value.toUpperCase() } })}
                      className="input-field text-sm py-2" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                    <input type="text" placeholder="White / Silver / Grey..."
                      value={form.vehicle.color}
                      onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, color: e.target.value } })}
                      className="input-field text-sm py-2" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Vehicle Photo</p>
                  <ModalUploadSlot
                    url={form.vehicle.image}
                    loading={uploadingField === 'vehicleImage'}
                    inputRef={vehicleImgRef}
                    onFile={f => uploadImage(f, 'vehicleImage')}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setForm(INITIAL_FORM) }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !!uploadingField} className="btn-primary flex-1 justify-center py-3"
                  style={{ opacity: (saving || uploadingField) ? 0.7 : 1 }}>
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Adding...</>
                  ) : uploadingField ? 'Uploading...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

const CAR_OPTIONS = [
  { id: 'swift',  name: 'Swift Dzire'  },
  { id: 'eeco',   name: 'Maruti Eeco'  },
  { id: 'ertiga', name: 'Maruti Ertiga'},
  { id: 'innova', name: 'Toyota Innova'},
  { id: 'crysta', name: 'Innova Crysta'},
]

function DocThumb({ url, alt, onClick }: { url: string; alt: string; onClick: () => void }) {
  return (
    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
      onClick={onClick}>
      <img src={url} alt={alt} className="w-full h-28 object-contain" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
        <Maximize2 size={15} className="text-white" />
        <span className="text-white text-xs font-semibold">View Full</span>
      </div>
    </div>
  )
}

function ModalUploadSlot({ url, loading, inputRef, onFile }: {
  url: string; loading: boolean
  inputRef: { current: HTMLInputElement | null }
  onFile: (f: File) => void
}) {
  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      className="relative rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-gray-200 hover:border-saffron-400 transition-colors"
      style={{ minHeight: 80 }}>
      {url ? (
        <img src={url} alt="Upload" className="w-full h-24 object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center h-24 text-gray-400">
          <Upload size={18} className="mb-1" />
          <p className="text-xs">Click to upload</p>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {url && !loading && (
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">Change</div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
    </div>
  )
}