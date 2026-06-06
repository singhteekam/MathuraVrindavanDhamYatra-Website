'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion }         from 'framer-motion'
import { useSession }     from 'next-auth/react'
import {
  Search, Users, Mail, Phone,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, ShieldCheck, Eye,
  Pencil, Trash2, X, Save,
} from 'lucide-react'
import toast              from 'react-hot-toast'
import { formatDate }     from '@/lib/utils'
import UserInfoDialog     from '@/components/admin/UserInfoDialog'

interface UserRow {
  _id:          string
  name:         string
  email:        string
  phone:        string
  role:         string
  isActive:     boolean
  createdAt:    string
  bookingCount?: number
}

interface EditForm {
  name:  string
  email: string
  phone: string
  role:  string
}

const ROLES = ['All', 'customer', 'driver', 'admin', 'superadmin']
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  superadmin: { bg: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' },
  admin:      { bg: 'var(--surface-krishna)', color: '#4338ca' },
  driver:     { bg: 'var(--surface-green)', color: '#16a34a' },
  customer:   { bg: 'var(--surface-saffron)', color: '#c74a06' },
}

export default function SuperadminUsersPage() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as { id?: string })?.id

  const [users,      setUsers]      = useState<UserRow[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [viewUserId, setViewUserId] = useState<string | null>(null)

  // Edit state
  const [editUserId,  setEditUserId]  = useState<string | null>(null)
  const [editForm,    setEditForm]    = useState<EditForm>({ name: '', email: '', phone: '', role: 'customer' })
  const [editSaving,  setEditSaving]  = useState(false)

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting,        setDeleting]        = useState(false)

  const LIMIT = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (roleFilter !== 'All') params.set('role', roleFilter)
      if (search.trim())        params.set('search', search.trim())

      const res  = await fetch(`/api/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
        setTotal(data.pagination?.total ?? 0)
        setTotalPages(data.pagination?.pages ?? 1)
      } else {
        toast.error(data.error ?? 'Failed to load users.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, search])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  async function toggleActive(user: UserRow) {
    setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: !u.isActive } : u))
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !user.isActive }),
      })
      if (res.ok) {
        toast.success(user.isActive ? 'User deactivated.' : 'User activated!')
      } else {
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: user.isActive } : u))
        toast.error('Failed to update user.')
      }
    } catch {
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: user.isActive } : u))
      toast.error('Network error.')
    }
  }

  async function changeRole(user: UserRow, newRole: string) {
    if (user.role === 'superadmin' && newRole !== 'superadmin') {
      if (!confirm(`Remove superadmin role from ${user.name}? This cannot be undone easily.`)) return
    }
    setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: newRole } : u))
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        toast.success(`Role changed to ${newRole}.`)
      } else {
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: user.role } : u))
        toast.error('Failed to change role.')
      }
    } catch {
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: user.role } : u))
      toast.error('Network error.')
    }
  }

  function openEdit(user: UserRow) {
    setEditUserId(user._id)
    setEditForm({ name: user.name, email: user.email, phone: user.phone, role: user.role })
  }

  async function saveEdit() {
    if (!editUserId) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/users/${editUserId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => u._id === editUserId ? { ...u, ...editForm } : u),
        )
        toast.success('User updated.')
        setEditUserId(null)
      } else {
        toast.error(data.error ?? 'Update failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setEditSaving(false)
    }
  }

  async function deleteUser(userId: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId))
        setTotal((t) => t - 1)
        toast.success('User deleted.')
      } else {
        toast.error(data.error ?? 'Delete failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setDeleting(false)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <ShieldCheck size={16} className="text-indigo-500" />
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Superadmin</p>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-serif)' }}>
          User Management
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{total} total users</p>
      </div>

      {/* Stats by role */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {['customer', 'driver', 'admin', 'superadmin'].map((role) => (
          <button key={role} type="button"
            onClick={() => { setRoleFilter(role); setPage(1) }}
            className="card rounded-xl p-3 text-left transition-all hover:shadow-md"
            style={roleFilter === role
              ? { ...ROLE_COLORS[role], border: `1.5px solid ${ROLE_COLORS[role].color}` }
              : {}
            }>
            <p className="text-xs text-gray-400 capitalize mb-0.5">{role}s</p>
            <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              {users.filter((u) => u.role === role).length}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, email, phone..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-8 py-2 text-sm w-56" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button key={r} type="button" onClick={() => { setRoleFilter(r); setPage(1) }}
              className="px-3 py-2 rounded-full text-xs font-semibold transition-all capitalize"
              style={roleFilter === r
                ? { background: '#4338ca', color: '#fff' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
              }>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-surface-muted)', borderBottom: '1px solid var(--border-muted)' }}>
                  {['User', 'Contact', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rc       = ROLE_COLORS[u.role] ?? ROLE_COLORS.customer
                  const isSelf   = u._id === currentUserId
                  return (
                    <motion.tr key={u._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{u.name}</span>
                            {isSelf && (
                              <span className="ml-1.5 text-xs text-indigo-400">(you)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${u.email}`}
                          className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                          <Mail size={10} />{u.email}
                        </a>
                        <a href={`tel:${u.phone}`}
                          className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={10} />{u.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role}
                          onChange={(e) => changeRole(u, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer capitalize"
                          style={{ background: rc.bg, color: rc.color }}>
                          {['customer', 'driver', 'admin', 'superadmin'].map((r) => (
                            <option key={r} value={r} className="capitalize">{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={u.isActive
                            ? { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                            : { background: 'var(--surface-red)', color: 'var(--text-on-red)' }
                          }>
                          {u.isActive ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {confirmDeleteId === u._id ? (
                          <div className="flex items-center gap-1.5">
                            <button type="button"
                              onClick={() => deleteUser(u._id)}
                              disabled={deleting}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white whitespace-nowrap"
                              style={{ background: '#ef4444' }}>
                              {deleting ? '...' : 'Yes, delete'}
                            </button>
                            <button type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                              style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 flex-wrap">
                            <button type="button" onClick={() => setViewUserId(u._id)}
                              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                              style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                              <Eye size={12} />View
                            </button>
                            <button type="button" onClick={() => openEdit(u)}
                              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                              style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                              <Pencil size={12} />Edit
                            </button>
                            <button type="button" onClick={() => toggleActive(u)}
                              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                              style={u.isActive
                                ? { background: 'var(--surface-red)', color: 'var(--text-on-red)' }
                                : { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                              }>
                              {u.isActive ? <><XCircle size={12} />Deactivate</> : <><CheckCircle size={12} />Activate</>}
                            </button>
                            {!isSelf && (
                              <button type="button"
                                onClick={() => setConfirmDeleteId(u._id)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: 'var(--surface-red)', color: '#ef4444' }}
                                title="Delete user">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-50 dark:divide-gray-800">
            {users.map((u, i) => {
              const rc     = ROLE_COLORS[u.role] ?? ROLE_COLORS.customer
              const isSelf = u._id === currentUserId
              return (
                <motion.div key={u._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {u.name}{isSelf && <span className="ml-1 text-xs text-indigo-400">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(u.createdAt)}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 capitalize"
                      style={{ background: rc.bg, color: rc.color }}>
                      {u.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    <span>{u.email}</span>
                    <span>{u.phone}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <select value={u.role}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 flex-1 capitalize">
                      {['customer', 'driver', 'admin', 'superadmin'].map((r) => (
                        <option key={r} value={r} className="capitalize">{r}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setViewUserId(u._id)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                      <Eye size={12} />View
                    </button>
                    <button type="button" onClick={() => openEdit(u)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                      <Pencil size={12} />Edit
                    </button>
                    <button type="button" onClick={() => toggleActive(u)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                      style={u.isActive
                        ? { background: 'var(--surface-red)', color: 'var(--text-on-red)' }
                        : { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                      }>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {!isSelf && (
                      <button type="button"
                        onClick={() => setConfirmDeleteId(confirmDeleteId === u._id ? null : u._id)}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'var(--surface-red)', color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {confirmDeleteId === u._id && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => deleteUser(u._id)} disabled={deleting}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white"
                        style={{ background: '#ef4444' }}>
                        {deleting ? '...' : 'Yes, permanently delete'}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg"
                        style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {users.length === 0 && (
            <div className="text-center py-16">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No users found.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid var(--border-muted)' }}>
              <p className="text-xs text-gray-400">Page {page} of {totalPages} · {total} total</p>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40">
                  <ChevronLeft size={15} />
                </button>
                <button type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Edit User</h3>
              <button type="button" onClick={() => setEditUserId(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                style={{ background: 'var(--bg-surface-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Name</label>
                <input type="text" value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Phone</label>
                <input type="tel" value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Role</label>
                <select value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  className="input-field capitalize">
                  {['customer', 'driver', 'admin', 'superadmin'].map((r) => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setEditUserId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                Cancel
              </button>
              <button type="button" onClick={saveEdit} disabled={editSaving}
                className="flex-1 btn-primary py-2.5 text-sm"
                style={{ opacity: editSaving ? 0.7 : 1 }}>
                {editSaving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                  : <><Save size={15} />Save Changes</>
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* User info dialog */}
      <UserInfoDialog
        userId={viewUserId}
        onClose={() => setViewUserId(null)}
        viewMode="superadmin"
      />
    </div>
  )
}
