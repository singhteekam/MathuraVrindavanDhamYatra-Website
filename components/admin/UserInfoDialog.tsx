'use client'

import { useEffect, useState }  from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Mail, Phone, Calendar, Shield, User, CheckCircle,
  XCircle, ShoppingBag, Clock, IndianRupee, Star,
  Hash, Globe, Smartphone,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserDetail {
  _id:            string
  name:           string
  email:          string
  phone?:         string
  role:           string
  isActive:       boolean
  emailVerified:  boolean
  avatar?:        string
  createdAt:      string
  updatedAt:      string
  // Optional enrichment fields
  bookingCount?:  number
  totalSpent?:    number
  lastBooking?:   string
  // Driver-specific
  licenseNumber?: string
  isVerified?:    boolean
  rating?:        number
  totalTrips?:    number
  earnings?:      number
  vehicle?: {
    name:  string
    number: string
    type?:  string
    color?: string
  }
}

interface Props {
  userId:   string | null
  onClose:  () => void
  viewMode?: 'admin' | 'superadmin'
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  customer:   { bg: 'var(--surface-saffron)',  color: '#c74a06',  label: 'Customer'   },
  driver:     { bg: 'var(--surface-green)',    color: '#166534',  label: 'Driver'     },
  admin:      { bg: 'var(--surface-krishna)',  color: '#3730a3',  label: 'Admin'      },
  superadmin: { bg: 'var(--surface-amber)',    color: '#92400e',  label: 'Superadmin' },
}

function InfoRow({ icon, label, value, mono = false, link }: {
  icon: React.ReactNode; label: string; value: string | number | undefined
  mono?: boolean; link?: string
}) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border-muted)' }}>
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        {link ? (
          <a href={link} className="text-sm text-saffron-600 hover:underline font-medium break-all">
            {String(value)}
          </a>
        ) : (
          <p className={`text-sm font-medium text-gray-800 dark:text-gray-200 break-all ${mono ? 'font-mono text-xs' : ''}`}>
            {String(value)}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UserInfoDialog({ userId, onClose, viewMode = 'admin' }: Props) {
  const [user,    setUser]    = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setUser(null); return }
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.data as UserDetail) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  const roleStyle = ROLE_STYLE[user?.role ?? 'customer'] ?? ROLE_STYLE.customer

  return (
    <AnimatePresence>
      {userId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5vh] md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl max-h-[90vh] z-50 flex flex-col"
            style={{ background: 'var(--bg-surface)', borderRadius: '1.25rem', border: '1px solid var(--border-muted)', boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
              style={{ borderColor: 'var(--border-muted)' }}>
              <div className="flex items-center gap-2">
                <User size={16} className="text-saffron-500" />
                <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base">User Details</h2>
              </div>
              <button onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !user ? (
                <div className="text-center py-12 text-gray-400">Failed to load user details.</div>
              ) : (
                <div className="p-5">

                  {/* Profile header */}
                  <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl"
                    style={{ background: 'var(--bg-surface-muted)' }}>
                    {/* Avatar */}
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border-2 border-saffron-200 dark:border-saffron-900" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg truncate">{user.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {/* Role badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ background: roleStyle.bg, color: roleStyle.color }}>
                          {roleStyle.label}
                        </span>
                        {/* Status */}
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={user.isActive
                            ? { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                            : { background: 'var(--surface-red)',   color: 'var(--text-on-red)'   }}>
                          {user.isActive ? <CheckCircle size={9} /> : <XCircle size={9} />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {/* Email verified */}
                        {user.emailVerified && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--surface-blue)', color: 'var(--text-on-blue)' }}>
                            <CheckCircle size={9} />Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats row (customers & drivers) */}
                  {(user.bookingCount != null || user.totalTrips != null) && (
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {user.role === 'customer' && <>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-saffron)' }}>
                          <p className="text-lg font-bold text-saffron-600">{user.bookingCount ?? 0}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Bookings</p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-green)' }}>
                          <p className="text-sm font-bold text-green-700 dark:text-green-400">{formatCurrency(user.totalSpent ?? 0)}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Spent</p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-krishna)' }}>
                          <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                            {user.lastBooking ? formatDate(user.lastBooking) : '—'}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Last Booking</p>
                        </div>
                      </>}
                      {user.role === 'driver' && <>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-saffron)' }}>
                          <p className="text-lg font-bold text-saffron-600">{user.totalTrips ?? 0}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Trips</p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-amber)' }}>
                          <p className="text-lg font-bold text-amber-600">{(user.rating ?? 5).toFixed(1)} ⭐</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Rating</p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-green)' }}>
                          <p className="text-sm font-bold text-green-700 dark:text-green-400">{formatCurrency(user.earnings ?? 0)}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Earnings</p>
                        </div>
                      </>}
                    </div>
                  )}

                  {/* Contact info */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
                    <InfoRow icon={<Mail size={14} />}   label="Email"   value={user.email} link={`mailto:${user.email}`} />
                    <InfoRow icon={<Phone size={14} />}  label="Phone"   value={user.phone} link={`tel:${user.phone}`} />
                  </div>

                  {/* Account info */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                    <InfoRow icon={<Hash size={14} />}      label="User ID"       value={String(user._id)} mono />
                    <InfoRow icon={<Shield size={14} />}    label="Role"          value={user.role} />
                    <InfoRow icon={<Calendar size={14} />}  label="Joined"        value={formatDate(user.createdAt)} />
                    <InfoRow icon={<Clock size={14} />}     label="Last Updated"  value={new Date(user.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
                  </div>

                  {/* Driver-specific info */}
                  {user.role === 'driver' && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Driver Info</p>
                      <InfoRow icon={<Shield size={14} />}     label="License Number"  value={user.licenseNumber} mono />
                      <InfoRow icon={<CheckCircle size={14} />} label="KYC Verified"   value={user.isVerified ? 'Yes — Verified' : 'Pending'} />
                      {user.vehicle && <>
                        <InfoRow icon={<Smartphone size={14} />} label="Vehicle"      value={user.vehicle.name} />
                        <InfoRow icon={<Hash size={14} />}        label="Plate No."   value={user.vehicle.number} mono />
                        {user.vehicle.color && <InfoRow icon={<Globe size={14} />} label="Color" value={user.vehicle.color} />}
                        {user.vehicle.type  && <InfoRow icon={<Globe size={14} />} label="Type"  value={user.vehicle.type} />}
                      </>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            {user && (
              <div className="px-5 py-4 border-t flex flex-wrap gap-2 shrink-0"
                style={{ borderColor: 'var(--border-muted)' }}>
                {user.role === 'customer' && (
                  <Link
                    href={`/${viewMode}/customers/${user._id}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: 'var(--surface-saffron)', color: '#c74a06' }}>
                    <ShoppingBag size={13} />View All Bookings
                  </Link>
                )}
                {user.role === 'driver' && viewMode === 'admin' && (
                  <Link
                    href={`/admin/drivers/${user._id}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                    <User size={13} />View Driver Profile
                  </Link>
                )}
                <button onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ml-auto"
                  style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
