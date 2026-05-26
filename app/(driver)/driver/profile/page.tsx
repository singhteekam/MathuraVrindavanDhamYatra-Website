'use client'

export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Phone, Mail, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface DriverProfile {
  _id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  isVerified: boolean
  isAvailable: boolean
  totalTrips: number
  rating: number
  vehicle: { type: string; name: string; number: string; color: string }
}

export default function DriverProfilePage() {
  const { data: session }         = useSession()
  const [profile,  setProfile]    = useState<DriverProfile | null>(null)
  const [loading,  setLoading]    = useState(true)
  const [saving,   setSaving]     = useState(false)
  const [vehicle,  setVehicle]    = useState({ number: '', color: '' })

  useEffect(() => {
    fetch('/api/drivers?limit=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          setProfile(d.data[0])
          setVehicle({ number: d.data[0].vehicle.number, color: d.data[0].vehicle.color })
        }
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch(`/api/drivers/${profile._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle: { ...profile.vehicle, ...vehicle } }),
      })
      if (res.ok) toast.success('Profile updated!')
      else        toast.error('Failed to update.')
    } catch { toast.error('Network error.') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-8 pt-20 lg:pt-8">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="flex-1 p-8 pt-20 lg:pt-8 text-center text-gray-500">
      Profile not found.
    </div>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and update your driver information</p>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="card rounded-2xl p-6 mb-5"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{profile.name}</h2>
              {profile.isVerified && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Driver since account creation</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3">
          {[
            { icon: <Phone size={15} />, label: 'Phone',   value: profile.phone              },
            { icon: <Mail  size={15} />, label: 'Email',   value: profile.email              },
            { icon: <Car   size={15} />, label: 'License', value: profile.licenseNumber      },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--bg-surface-muted)' }}>
              <span className="text-gray-400 flex-shrink-0">{row.icon}</span>
              <div>
                <p className="text-xs text-gray-400">{row.label}</p>
                <p className="font-medium text-gray-800 text-sm">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { label: 'Total Trips',  value: profile.totalTrips },
            { label: 'Rating',       value: `${profile.rating.toFixed(1)} ⭐` },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl text-center"
              style={{ background: 'var(--surface-saffron)' }}>
              <p className="font-bold text-saffron-600 text-lg">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Vehicle details — editable */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card rounded-2xl p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Car size={18} className="text-saffron-500" />
          Vehicle Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Vehicle
            </label>
            <input type="text" value={profile.vehicle.name} disabled
              className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Contact admin to change vehicle type</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Vehicle Number
              </label>
              <input type="text" placeholder="UP85AB1234"
                value={vehicle.number}
                onChange={(e) => setVehicle({ ...vehicle, number: e.target.value.toUpperCase() })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Vehicle Color
              </label>
              <input type="text" placeholder="White"
                value={vehicle.color}
                onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                className="input-field" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3"
            style={{ opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={16} /> Save Changes</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  )
}