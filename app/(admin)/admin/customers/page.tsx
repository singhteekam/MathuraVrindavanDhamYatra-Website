'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Phone, Mail, Calendar, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatDate } from '@/lib/utils'

interface Customer {
  _id:          string
  name:         string
  email:        string
  phone:        string
  isActive:     boolean
  createdAt:    string
  bookingCount: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const [totalPages,setTotalPages]= useState(1)
  const LIMIT = 20

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        role:  'customer',
        page:  String(page),
        limit: String(LIMIT),
      })
      if (search.trim()) params.set('search', search.trim())

      const res  = await fetch(`/api/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setCustomers(data.data)
        setTotal(data.pagination?.total ?? 0)
        setTotalPages(data.pagination?.pages ?? 1)
      } else {
        toast.error(data.error ?? 'Failed to load customers.')
      }
    } catch {
      toast.error('Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(), 300)
    return () => clearTimeout(t)
  }, [fetchCustomers])

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader title="Customers" crumbs={[{ label: 'Customers' }]} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: total,                                     color: '#ff7d0f', bg: 'var(--surface-saffron)' },
          { label: 'Active',          value: customers.filter((c) => c.isActive).length, color: '#16a34a', bg: 'var(--surface-green)' },
          { label: 'Showing',         value: customers.length,                           color: '#4338ca', bg: 'var(--surface-krishna)' },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-4 text-center" style={{ background: s.bg }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search name, email or phone..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="input-field pl-9 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          {customers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-muted)', borderBottom: '1px solid #f3f4f6' }}>
                      {['Customer', 'Contact', 'Bookings', 'Joined', 'Status'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <motion.tr key={c._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-gray-500 hover:text-saffron-600 text-xs mb-1">
                            <Mail size={10} />{c.email}
                          </a>
                          <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-gray-500 hover:text-saffron-600 text-xs">
                            <Phone size={10} />{c.phone}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: c.bookingCount > 0 ? '#ff7d0f' : 'var(--text-faint)' }}>
                            <ShoppingBag size={13} />{c.bookingCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={c.isActive
                              ? { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                              : { background: 'var(--surface-red)', color: 'var(--text-on-red)' }
                            }>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {customers.map((c, i) => (
                  <motion.div key={c._id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(c.createdAt)}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={c.isActive ? { background: 'var(--surface-green)', color: 'var(--text-on-green)' } : { background: 'var(--surface-red)', color: 'var(--text-on-red)' }}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1"><Mail size={10} />{c.email}</a>
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1"><Phone size={10} />{c.phone}</a>
                      <span className="flex items-center gap-1" style={{ color: '#ff7d0f' }}>
                        <ShoppingBag size={10} />{c.bookingCount} booking{c.bookingCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Page {page} of {totalPages} Â· {total} total</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                      <ChevronLeft size={15} />
                    </button>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}