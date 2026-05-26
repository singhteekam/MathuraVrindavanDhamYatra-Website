'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Calendar, Users, CheckCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatDate } from '@/lib/utils'

interface Enquiry {
  _id: string
  name: string
  phone: string
  email?: string
  message: string
  tourDate?: string
  passengers?: string
  isRead: boolean
  createdAt: string
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<'all' | 'unread'>('all')

  const fetchEnquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter === 'unread' ? '?unread=true' : ''
      const res    = await fetch(`/api/contact${params}`)
      const data   = await res.json()
      if (data.success) setEnquiries(data.data.contacts ?? [])
    } catch {
      toast.error('Failed to load enquiries.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchEnquiries() }, [fetchEnquiries])

  const unreadCount = enquiries.filter((e) => !e.isRead).length

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title="Enquiries"
        crumbs={[{ label: 'Enquiries' }]}
        action={
          <button onClick={fetchEnquiries}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all',    label: 'All Enquiries'                           },
          { value: 'unread', label: `Unread (${unreadCount})` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as 'all' | 'unread')}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={filter === tab.value
              ? { background: '#ff7d0f', color: '#fff' }
              : { background: '#fff', color: '#6b7280', border: '1px solid var(--border-default)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : enquiries.length === 0 ? (
        <div className="card rounded-2xl p-16 text-center">
          <Mail size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No enquiries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq, i) => (
            <motion.div
              key={enq._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card rounded-2xl p-5"
              style={!enq.isRead ? { borderLeft: '3px solid #ff7d0f' } : {}}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Customer info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
                    >
                      {enq.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{enq.name}</p>
                        {!enq.isRead && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone size={10} />{enq.phone}
                        </span>
                        {enq.email && <span>{enq.email}</span>}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{enq.message}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {enq.tourDate && (
                      <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                        style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                        <Calendar size={10} /> {formatDate(enq.tourDate)}
                      </span>
                    )}
                    {enq.passengers && (
                      <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                        style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                        <Users size={10} /> {enq.passengers} people
                      </span>
                    )}
                    <span className="text-gray-400">
                      Received: {formatDate(enq.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <a
                    href={`https://wa.me/${enq.phone.replace(/\D/g, '')}?text=Namaste ${enq.name}! Thank you for enquiring with Mathura Vrindavan Dham Yatra. ðŸ™`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
                    style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${enq.phone}`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                    style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}
                  >
                    <Phone size={12} /> Call
                  </a>
                  {!enq.isRead && (
                    <button
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
                      style={{ background: 'var(--bg-surface-muted)', color: '#6b7280' }}
                      onClick={() => {
                        // TODO: PATCH /api/contact/:id to mark as read
                        toast.success('Marked as read.')
                        setEnquiries((prev) => prev.map((e) => e._id === enq._id ? { ...e, isRead: true } : e))
                      }}
                    >
                      <CheckCircle size={12} /> Mark Read
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}