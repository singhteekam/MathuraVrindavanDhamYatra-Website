'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Phone, Users, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Trip {
  _id: string
  bookingId: string
  status: string
  carName: string
  startDate: string
  endDate: string
  pickupLocation: string
  dropLocation?: string
  totalPassengers: number
  totalAmount: number
  customer: { name: string; phone: string }
  package?: { name: string; cities: string[] }
}

const STATUS_TABS = [
  { value: '',                label: 'All Trips'    },
  { value: 'driver_assigned', label: 'Assigned'     },
  { value: 'ongoing',         label: 'Ongoing'      },
  { value: 'completed',       label: 'Completed'    },
  { value: 'cancelled',       label: 'Cancelled'    },
]

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:       { label: 'Confirmed',  color: '#2563eb', bg: 'var(--surface-blue)' },
  driver_assigned: { label: 'Assigned',   color: '#7c3aed', bg: 'var(--surface-krishna)' },
  ongoing:         { label: 'Ongoing',    color: '#ff7d0f', bg: 'var(--surface-saffron)' },
  completed:       { label: 'Completed',  color: '#16a34a', bg: 'var(--surface-green)' },
  cancelled:       { label: 'Cancelled',  color: '#dc2626', bg: 'var(--surface-red)' },
}

export default function DriverTripsPage() {
  const [trips,    setTrips]    = useState<Trip[]>([])
  const [loading,  setLoading]  = useState(true)
  const [activeTab,setActiveTab]= useState('')

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (activeTab) params.set('status', activeTab)
      const res  = await fetch(`/api/bookings?${params}`)
      const data = await res.json()
      if (data.success) setTrips(data.data)
    } catch {
      toast.error('Failed to load trips.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  async function updateStatus(bookingId: string, status: string) {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Trip ${status === 'ongoing' ? 'started' : 'completed'}!`)
        fetchTrips()
      }
    } catch { toast.error('Update failed.') }
  }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Trips</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">All your assigned and completed trips</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
            style={activeTab === tab.value
              ? { background: '#ff7d0f', color: '#fff' }
              : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="card rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">🚗</p>
          <p className="text-gray-500 font-medium">No trips found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip, i) => {
            const st = STATUS_STYLE[trip.status] ?? STATUS_STYLE.confirmed
            return (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card rounded-2xl p-5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-saffron-600">{trip.bookingId}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{trip.customer.name}</h3>
                    {trip.package && (
                      <p className="text-xs text-gray-400 mt-0.5">{trip.package.name}</p>
                    )}
                  </div>
                  <p className="font-bold text-xl text-saffron-600 flex-shrink-0">
                    {formatCurrency(trip.totalAmount)}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid sm:grid-cols-2 gap-2.5 mb-4">
                  {[
                    { icon: <Clock  size={13} />, label: 'Date',       value: formatDate(trip.startDate) },
                    { icon: <Users  size={13} />, label: 'Passengers', value: `${trip.totalPassengers} people` },
                    { icon: <MapPin size={13} />, label: 'Pickup',     value: trip.pickupLocation },
                    { icon: <Phone  size={13} />, label: 'Customer',   value: trip.customer.phone, href: `tel:${trip.customer.phone}` },
                  ].map((d) => (
                    <div key={d.label} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 mt-0.5 flex-shrink-0">{d.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">{d.label}</p>
                        {d.href ? (
                          <a href={d.href} className="font-medium text-saffron-600 hover:underline truncate block">
                            {d.value}
                          </a>
                        ) : (
                          <p className="font-medium text-gray-700 dark:text-gray-300 truncate">{d.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  {trip.status === 'driver_assigned' && (
                    <button onClick={() => updateStatus(trip.bookingId, 'ongoing')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
                      <RefreshCw size={12} /> Start Trip
                    </button>
                  )}
                  {trip.status === 'ongoing' && (
                    <button onClick={() => updateStatus(trip.bookingId, 'completed')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)', border: '1px solid var(--surface-green-border)' }}>
                      <CheckCircle size={12} /> Mark Completed
                    </button>
                  )}
                  <a href={`https://wa.me/${trip.customer.phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                    WhatsApp Customer
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}