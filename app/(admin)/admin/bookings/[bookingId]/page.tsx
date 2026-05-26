'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Car, MapPin, Users, Phone, Mail, Clock, Info, Star,
  CheckCircle, XCircle, User, Save, AlertCircle, IndianRupee,
} from 'lucide-react'
import Link  from 'next/link'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatCurrency } from '@/lib/utils'

type BLField = string | { en: string; hi: string }
function bl(v: BLField | undefined): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  return v.en || v.hi || ''
}

interface Driver {
  _id: string
  name: string
  phone: string
  vehicle: { name: string; number: string }
  isAvailable: boolean
}

interface Booking {
  _id: string
  bookingId: string
  status: string
  paymentStatus: string
  paymentMethod?: string
  carName: string
  carType: string
  startDate: string
  endDate: string
  duration: number
  pickupLocation: string
  dropLocation?: string
  totalPassengers: number
  totalAmount: number
  advanceAmount: number
  paidAmount?: number
  paymentId?: string
  razorpayOrderId?: string
  addons: string[]
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  specialRequests?: string
  adminNotes?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
  customer?: { _id: string; name: string; email: string; phone: string }
  package?:  { name: BLField; slug: string; duration: number }
  driver?:   { _id: string; name: string; phone: string; vehicle: { name: string; number: string } }
}

interface EditFields {
  status: string
  driver: string
  paymentStatus: string
  paymentMethod: string
  paidAmount: number
  totalAmount: number
  advanceAmount: number
  carType: string
  carName: string
  startDate: string
  endDate: string
  pickupLocation: string
  dropLocation: string
  totalPassengers: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests: string
  adminNotes: string
  cancelReason: string
}

const STATUS_STEPS = ['pending', 'confirmed', 'driver_assigned', 'ongoing', 'completed']
const STATUS_LABELS: Record<string, string> = {
  pending:         'Pending',
  confirmed:       'Confirmed',
  driver_assigned: 'Driver Assigned',
  ongoing:         'Ongoing',
  completed:       'Completed',
  cancelled:       'Cancelled',
}
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash:           'Cash on Arrival',
  online_full:    'Online — Full Payment',
  online_advance: 'Online — Advance',
  whatsapp:       'WhatsApp Booking',
}

export default function AdminBookingDetailPage() {
  const { bookingId }         = useParams<{ bookingId: string }>()
  const [booking,  setBooking] = useState<Booking | null>(null)
  const [drivers,  setDrivers] = useState<Driver[]>([])
  const [loading,  setLoading] = useState(true)
  const [saving,   setSaving]  = useState(false)

  const [fields, setFields] = useState<EditFields>({
    status: '', driver: '', paymentStatus: '', paymentMethod: '',
    paidAmount: 0, totalAmount: 0, advanceAmount: 0,
    carType: '', carName: '', startDate: '', endDate: '',
    pickupLocation: '', dropLocation: '', totalPassengers: 1,
    customerName: '', customerEmail: '', customerPhone: '',
    specialRequests: '', adminNotes: '', cancelReason: '',
  })

  function setField<K extends keyof EditFields>(key: K, value: EditFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/bookings/${bookingId}`).then((r) => r.json()),
      fetch('/api/drivers?available=true&limit=50').then((r) => r.json()),
    ]).then(([bData, dData]) => {
      if (bData.success) {
        const b = bData.data as Booking
        setBooking(b)
        setFields({
          status:          b.status,
          driver:          b.driver?._id ?? '',
          paymentStatus:   b.paymentStatus,
          paymentMethod:   b.paymentMethod ?? '',
          paidAmount:      b.paidAmount ?? 0,
          totalAmount:     b.totalAmount,
          advanceAmount:   b.advanceAmount,
          carType:         b.carType,
          carName:         b.carName,
          startDate:       b.startDate ? b.startDate.slice(0, 10) : '',
          endDate:         b.endDate   ? b.endDate.slice(0, 10)   : '',
          pickupLocation:  b.pickupLocation,
          dropLocation:    b.dropLocation ?? '',
          totalPassengers: b.totalPassengers,
          customerName:    b.customerName  ?? b.customer?.name  ?? '',
          customerEmail:   b.customerEmail ?? b.customer?.email ?? '',
          customerPhone:   b.customerPhone ?? b.customer?.phone ?? '',
          specialRequests: b.specialRequests ?? '',
          adminNotes:      b.adminNotes      ?? '',
          cancelReason:    b.cancelReason    ?? '',
        })
      }
      if (dData.success) setDrivers(dData.data)
    }).catch(() => toast.error('Failed to load booking details.'))
      .finally(() => setLoading(false))
  }, [bookingId])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status:          fields.status,
          driver:          fields.driver       || undefined,
          paymentStatus:   fields.paymentStatus,
          paymentMethod:   fields.paymentMethod || undefined,
          paidAmount:      fields.paidAmount,
          totalAmount:     fields.totalAmount,
          advanceAmount:   fields.advanceAmount,
          carType:         fields.carType,
          carName:         fields.carName,
          startDate:       fields.startDate    || undefined,
          endDate:         fields.endDate      || undefined,
          pickupLocation:  fields.pickupLocation,
          dropLocation:    fields.dropLocation  || undefined,
          totalPassengers: fields.totalPassengers,
          customerName:    fields.customerName  || undefined,
          customerEmail:   fields.customerEmail || undefined,
          customerPhone:   fields.customerPhone || undefined,
          specialRequests: fields.specialRequests || undefined,
          adminNotes:      fields.adminNotes    || undefined,
          cancelReason:    fields.cancelReason  || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Booking updated — update email sent to customer.')
        setBooking(data.data)
      } else {
        toast.error(data.message ?? 'Failed to update booking.')
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

  if (!booking) return (
    <div className="flex-1 p-8 pt-20 lg:pt-8 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
      <p className="text-gray-600">Booking not found.</p>
      <Link href="/admin/bookings" className="btn-primary mt-4 inline-flex text-sm">
        Back to Bookings
      </Link>
    </div>
  )

  const currentStepIndex = STATUS_STEPS.indexOf(booking.status)
  const isCancelled       = booking.status === 'cancelled'
  const balance           = fields.totalAmount - fields.paidAmount

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title={`Booking — ${booking.bookingId}`}
        crumbs={[
          { label: 'Bookings', href: '/admin/bookings' },
          { label: booking.bookingId },
        ]}
        action={
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 px-5">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1" />Saving...</>
              : <><Save size={16} />Save Changes</>
            }
          </button>
        }
      />

      {/* Status progress */}
      {!isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="card rounded-2xl p-5 mb-6"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-4">Trip Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={i <= currentStepIndex
                      ? { background: '#ff7d0f', color: '#fff' }
                      : { background: 'var(--bg-surface-muted)', color: 'var(--text-faint)' }
                    }
                  >
                    {i < currentStepIndex ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <p className="text-center font-medium whitespace-nowrap mt-1.5"
                    style={{ color: i <= currentStepIndex ? '#ff7d0f' : 'var(--text-faint)', fontSize: '10px' }}>
                    {STATUS_LABELS[step]}
                  </p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 mb-4"
                    style={{ background: i < currentStepIndex ? '#ff7d0f' : 'var(--bg-surface-muted)' }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {isCancelled && (
        <div className="flex items-center gap-2 p-4 rounded-2xl mb-6"
          style={{ background: 'var(--surface-red)', border: '1px solid var(--surface-red-border)' }}>
          <XCircle size={18} className="text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 text-sm">This booking was cancelled</p>
            {booking.cancelReason && <p className="text-xs text-red-500 mt-0.5">Reason: {booking.cancelReason}</p>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left (2/3) ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Trip Details */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Car size={16} className="text-saffron-500" />Trip Details
            </h3>

            {booking.package && (
              <div className="p-3 rounded-xl mb-4"
                style={{ background: 'var(--surface-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
                <p className="text-xs text-saffron-600 font-semibold">Package</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{bl(booking.package?.name)}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Car Type">
                <input type="text" className="input-field text-sm" value={fields.carType}
                  onChange={(e) => setField('carType', e.target.value)} />
              </Field>
              <Field label="Car Name">
                <input type="text" className="input-field text-sm" value={fields.carName}
                  onChange={(e) => setField('carName', e.target.value)} />
              </Field>
              <Field label="Start Date">
                <input type="date" className="input-field text-sm" value={fields.startDate}
                  onChange={(e) => setField('startDate', e.target.value)} />
              </Field>
              <Field label="End Date">
                <input type="date" className="input-field text-sm" value={fields.endDate}
                  onChange={(e) => setField('endDate', e.target.value)} />
              </Field>
              <Field label="Pickup Location">
                <input type="text" className="input-field text-sm" value={fields.pickupLocation}
                  onChange={(e) => setField('pickupLocation', e.target.value)} />
              </Field>
              <Field label="Drop Location">
                <input type="text" className="input-field text-sm" value={fields.dropLocation}
                  placeholder="Same as pickup"
                  onChange={(e) => setField('dropLocation', e.target.value)} />
              </Field>
              <Field label="Passengers">
                <input type="number" min={1} className="input-field text-sm" value={fields.totalPassengers}
                  onChange={(e) => setField('totalPassengers', Number(e.target.value))} />
              </Field>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</span>
                <p className="text-sm font-semibold text-gray-800 py-2.5">
                  {booking.duration} day{booking.duration > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {booking.addons?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {booking.addons.map((a) => (
                    <span key={a} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User size={16} className="text-saffron-500" />Customer Details
            </h3>

            {/* Registered customer badge */}
            {booking.customer && (
              <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-muted)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                  {booking.customer.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{booking.customer.name ?? '—'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{booking.customer.email ?? '—'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{booking.customer.phone ?? '—'}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${booking.customer.phone}`}
                    className="p-2 rounded-lg" style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                    <Phone size={13} />
                  </a>
                  <a href={`mailto:${booking.customer.email}`}
                    className="p-2 rounded-lg" style={{ background: 'var(--surface-blue)', color: '#2563eb' }}>
                    <Mail size={13} />
                  </a>
                </div>
              </div>
            )}

            {/* Editable contact overrides / guest fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={booking.customer ? 'Contact Name Override' : 'Customer Name'}>
                <input type="text" className="input-field text-sm" value={fields.customerName}
                  placeholder={booking.customer?.name}
                  onChange={(e) => setField('customerName', e.target.value)} />
              </Field>
              <Field label={booking.customer ? 'Contact Email Override' : 'Customer Email'}>
                <input type="email" className="input-field text-sm" value={fields.customerEmail}
                  placeholder={booking.customer?.email}
                  onChange={(e) => setField('customerEmail', e.target.value)} />
              </Field>
              <Field label={booking.customer ? 'Contact Phone Override' : 'Customer Phone'}>
                <input type="text" className="input-field text-sm" value={fields.customerPhone}
                  placeholder={booking.customer?.phone}
                  onChange={(e) => setField('customerPhone', e.target.value)} />
              </Field>
            </div>

            <div className="flex gap-2 mt-4">
              <a
                href={`https://wa.me/${(booking.customer?.phone || booking.customerPhone || '').replace(/\D/g, '')}?text=Namaste! Regarding your booking ${booking.bookingId} — `}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                WhatsApp Customer
              </a>
              <a
                href={`tel:${booking.customer?.phone || booking.customerPhone || ''}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                <Phone size={12} />Call Customer
              </a>
            </div>
          </div>

          {/* Special Requests */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Star size={15} className="text-saffron-500" />Special Requests
            </h3>
            <textarea rows={3} className="input-field resize-none text-sm"
              placeholder="Customer's special requests..."
              value={fields.specialRequests}
              onChange={(e) => setField('specialRequests', e.target.value)} />
          </div>

          {/* Admin Notes + Cancel Reason */}
          <div className="card rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Admin Notes</h3>
              <textarea rows={3} className="input-field resize-none text-sm"
                placeholder="Internal notes (visible to customer in portal)..."
                value={fields.adminNotes}
                onChange={(e) => setField('adminNotes', e.target.value)} />
            </div>
            {(isCancelled || fields.status === 'cancelled') && (
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Cancel Reason</h3>
                <input type="text" className="input-field text-sm"
                  placeholder="Reason for cancellation..."
                  value={fields.cancelReason}
                  onChange={(e) => setField('cancelReason', e.target.value)} />
              </div>
            )}
          </div>

          {/* Booking Meta */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Info size={15} className="text-saffron-500" />Booking Info
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <InfoRow label="Booking ID"   value={booking.bookingId} mono />
              <InfoRow label="Created"
                value={new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
              <InfoRow label="Last Updated"
                value={new Date(booking.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
              {booking.paymentId       && <InfoRow label="Payment ID"     value={booking.paymentId}       mono />}
              {booking.razorpayOrderId && <InfoRow label="Razorpay Order" value={booking.razorpayOrderId} mono />}
            </div>
          </div>
        </div>

        {/* ── Right (1/3) ─────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Payment */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <IndianRupee size={15} className="text-saffron-500" />Payment Details
            </h3>
            <div className="space-y-3">
              <Field label="Payment Method">
                <select className="input-field text-sm" value={fields.paymentMethod}
                  onChange={(e) => setField('paymentMethod', e.target.value)}>
                  <option value="">— Select —</option>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Payment Status">
                <select className="input-field text-sm" value={fields.paymentStatus}
                  onChange={(e) => setField('paymentStatus', e.target.value)}>
                  {['pending', 'partial', 'paid', 'refunded'].map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Total Amount (₹)">
                <input type="number" min={0} className="input-field text-sm" value={fields.totalAmount}
                  onChange={(e) => setField('totalAmount', Number(e.target.value))} />
              </Field>
              <Field label="Advance Amount (₹)">
                <input type="number" min={0} className="input-field text-sm" value={fields.advanceAmount}
                  onChange={(e) => setField('advanceAmount', Number(e.target.value))} />
              </Field>
              <Field label="Paid Amount (₹)">
                <input type="number" min={0} className="input-field text-sm" value={fields.paidAmount}
                  onChange={(e) => setField('paidAmount', Number(e.target.value))} />
              </Field>
            </div>
            {balance > 0 && (
              <div className="mt-3 p-3 rounded-xl flex justify-between text-sm"
                style={{ background: 'var(--surface-amber)', border: '1px solid var(--surface-amber-border)' }}>
                <span className="text-amber-700 dark:text-amber-300 font-medium">Balance Due</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">{formatCurrency(balance)}</span>
              </div>
            )}
          </div>

          {/* Trip Status */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Clock size={15} className="text-saffron-500" />Trip Status
            </h3>
            <select className="input-field text-sm" value={fields.status}
              onChange={(e) => setField('status', e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(booking.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </p>
          </div>

          {/* Assign Driver */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <MapPin size={15} className="text-saffron-500" />Assign Driver
            </h3>
            {booking.driver && (
              <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
                style={{ background: 'var(--surface-green)', border: '1px solid var(--surface-green-border)' }}>
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-green-700 dark:text-green-400 text-sm shrink-0">
                  {booking.driver.name?.charAt(0) ?? 'D'}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{booking.driver.name ?? '—'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {booking.driver.vehicle?.name ?? ''} · {booking.driver.vehicle?.number ?? ''}
                  </p>
                  <a href={`tel:${booking.driver.phone}`}
                    className="text-xs text-green-700 font-medium">{booking.driver.phone}</a>
                </div>
              </div>
            )}
            <select className="input-field text-sm" value={fields.driver}
              onChange={(e) => setField('driver', e.target.value)}>
              <option value="">— Select a driver —</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} · {d.vehicle?.name ?? ''} ({d.vehicle?.number ?? ''})
                </option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                No available drivers. Mark a driver as available first.
              </p>
            )}
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
            style={{ opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save size={16} />Save All Changes</>
            }
          </button>

          <p className="text-xs text-gray-400 text-center">
            Saving sends an update email to the customer.
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ background: 'var(--bg-surface-muted)' }}>
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span className={`text-sm font-semibold text-gray-800 dark:text-gray-200 break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}
