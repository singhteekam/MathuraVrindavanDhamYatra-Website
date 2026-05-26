'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  CalendarCheck, IndianRupee, Star, ToggleLeft, ToggleRight,
  Phone, MapPin, Clock, CheckCircle, RefreshCw, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Trip {
  _id: string
  bookingId: string
  status: string
  carName: string
  startDate: string
  pickupLocation: string
  totalPassengers: number
  totalAmount: number
  customer: { name: string; phone: string }
  package?: { name: string }
}

interface DriverProfile {
  _id: string
  name: string
  phone: string
  isAvailable: boolean
  totalTrips: number
  rating: number
  earnings: number
  vehicle: { name: string; number: string }
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:       { label: 'Confirmed',  color: '#2563eb', bg: 'var(--surface-blue)' },
  driver_assigned: { label: 'Assigned',   color: '#7c3aed', bg: 'var(--surface-krishna)' },
  ongoing:         { label: 'Ongoing',    color: '#16a34a', bg: 'var(--surface-green)' },
  completed:       { label: 'Completed',  color: '#16a34a', bg: 'var(--surface-green)' },
  cancelled:       { label: 'Cancelled',  color: '#dc2626', bg: 'var(--surface-red)' },
}

export default function DriverDashboard() {
  const { data: session }           = useSession()
  const [profile,   setProfile]     = useState<DriverProfile | null>(null)
  const [trips,     setTrips]       = useState<Trip[]>([])
  const [loading,   setLoading]     = useState(true)
  const [toggling,  setToggling]    = useState(false)

  const user = session?.user as { id?: string } | undefined

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      fetch(`/api/drivers?limit=1`).then((r) => r.json()),
      fetch(`/api/bookings?status=driver_assigned&limit=5`).then((r) => r.json()),
    ]).then(([driverData, tripData]) => {
      // Find driver profile for current user
      if (driverData.success && driverData.data.length > 0) {
        setProfile(driverData.data[0])
      }
      if (tripData.success) setTrips(tripData.data)
    }).catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [user?.id])

  async function toggleAvailability() {
    if (!profile) return
    setToggling(true)
    try {
      const res = await fetch(`/api/drivers/${profile._id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isAvailable: !profile.isAvailable }),
      })
      if (res.ok) {
        setProfile((p) => p ? { ...p, isAvailable: !p.isAvailable } : p)
        toast.success(profile.isAvailable ? 'Marked as unavailable.' : 'You are now available for trips!')
      }
    } catch {
      toast.error('Failed to update.')
    } finally {
      setToggling(false)
    }
  }

  async function updateTripStatus(bookingId: string, status: string) {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Trip marked as ${status}.`)
        setTrips((prev) => prev.map((t) =>
          t.bookingId === bookingId ? { ...t, status } : t
        ))
      }
    } catch {
      toast.error('Failed to update trip.')
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-8 pt-20 lg:pt-8">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-saffron-500 font-semibold text-sm mb-1">
            Jai Shri Krishna 🙏
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile?.name ?? session?.user?.name ?? 'Driver'}
          </h1>
          {profile && (
            <p className="text-gray-500 text-sm mt-0.5">
              {profile.vehicle.name} · {profile.vehicle.number}
            </p>
          )}
        </div>

        {/* Availability toggle */}
        {profile && (
          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200"
            style={profile.isAvailable
              ? { background: 'var(--surface-green)', border: '2px solid var(--surface-green-border)' }
              : { background: 'var(--bg-surface-muted)', border: '2px solid var(--border-default)' }
            }
          >
            {toggling ? (
              <RefreshCw size={20} className="animate-spin text-gray-400" />
            ) : profile.isAvailable ? (
              <ToggleRight size={24} className="text-green-500" />
            ) : (
              <ToggleLeft size={24} className="text-gray-400" />
            )}
            <div className="text-left">
              <p className="font-bold text-sm" style={{ color: profile.isAvailable ? '#16a34a' : '#6b7280' }}>
                {profile.isAvailable ? 'Available' : 'Unavailable'}
              </p>
              <p className="text-xs text-gray-400">Tap to toggle</p>
            </div>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Total Trips',
            value: profile?.totalTrips ?? 0,
            icon:  <CalendarCheck size={20} />,
            color: '#ff7d0f', bg: 'var(--surface-saffron)',
          },
          {
            label: 'Total Earnings',
            value: formatCurrency(profile?.earnings ?? 0),
            icon:  <IndianRupee size={20} />,
            color: '#16a34a', bg: 'var(--surface-green)',
            isString: true,
          },
          {
            label: 'Your Rating',
            value: `${profile?.rating?.toFixed(1) ?? '5.0'} ⭐`,
            icon:  <Star size={20} />,
            color: '#d97706', bg: 'var(--surface-amber)',
            isString: true,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card rounded-2xl p-5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stat.isString ? stat.value : stat.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Assigned trips */}
      <div className="card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 text-lg">Your Assigned Trips</h2>
          <Link href="/driver/trips"
            className="text-xs font-semibold"
            style={{ color: '#ff7d0f' }}>
            View all →
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12">
            <CalendarCheck size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No trips assigned yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Make sure you are marked as available to receive trips
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, i) => {
              const st = STATUS_STYLE[trip.status] ?? STATUS_STYLE.confirmed
              return (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-4 border border-gray-100"
                  style={{ background: 'var(--bg-surface-muted)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-saffron-600">{trip.bookingId}</span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900">{trip.customer.name}</p>
                    </div>
                    <p className="font-bold text-saffron-600 flex-shrink-0">
                      {formatCurrency(trip.totalAmount)}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Clock   size={11} className="flex-shrink-0" />
                      {formatDate(trip.startDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin  size={11} className="flex-shrink-0" />
                      <span className="truncate">{trip.pickupLocation}</span>
                    </span>
                    <a href={`tel:${trip.customer.phone}`}
                      className="flex items-center gap-1.5 hover:text-saffron-600 transition-colors">
                      <Phone size={11} className="flex-shrink-0" />
                      {trip.customer.phone}
                    </a>
                  </div>

                  {/* Status actions */}
                  <div className="flex gap-2">
                    {trip.status === 'driver_assigned' && (
                      <button
                        onClick={() => updateTripStatus(trip.bookingId, 'ongoing')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                        style={{ background: '#fff8ed', color: '#ff7d0f', border: '1px solid #ffdba8' }}
                      >
                        <RefreshCw size={12} /> Start Trip
                      </button>
                    )}
                    {trip.status === 'ongoing' && (
                      <button
                        onClick={() => updateTripStatus(trip.bookingId, 'completed')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                        style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)', border: '1px solid var(--surface-green-border)' }}
                      >
                        <CheckCircle size={12} /> Mark Completed
                      </button>
                    )}
                    <a
                      href={`https://wa.me/${trip.customer.phone.replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}
                    >
                      WhatsApp
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}