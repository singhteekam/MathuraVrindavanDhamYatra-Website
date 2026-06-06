'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence }           from 'framer-motion'
import { useSession }                        from 'next-auth/react'
import {
  Mail, Plus, Send, Clock, CheckCircle, XCircle, FileText,
  Users, Trash2, Edit, X, Eye, RotateCcw, AlertTriangle,
  Calendar, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface Newsletter {
  _id:         string
  subject:     string
  previewText: string
  htmlContent: string
  status:      'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  targetRoles: string[]
  scheduledAt: string | null
  sentAt:      string | null
  stats: { totalRecipients: number; sentCount: number; failedCount: number }
  createdBy:   { name: string }
  createdAt:   string
}

interface DraftForm {
  subject:     string
  previewText: string
  htmlContent: string
  targetRoles: string[]
  scheduledAt: string
}

const BLANK_FORM: DraftForm = {
  subject:     '',
  previewText: '',
  htmlContent: '',
  targetRoles: ['customer'],
  scheduledAt: '',
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  draft:     { label: 'Draft',     icon: <FileText size={11} />,    bg: 'var(--bg-surface-muted)', color: 'var(--text-muted)' },
  scheduled: { label: 'Scheduled', icon: <Clock size={11} />,       bg: 'var(--surface-amber)',    color: 'var(--text-on-amber)' },
  sending:   { label: 'Sending…',  icon: <RotateCcw size={11} />,   bg: 'var(--surface-krishna)',  color: 'var(--text-on-krishna)' },
  sent:      { label: 'Sent',      icon: <CheckCircle size={11} />, bg: 'var(--surface-green)',    color: 'var(--text-on-green)' },
  failed:    { label: 'Failed',    icon: <XCircle size={11} />,     bg: 'var(--surface-red)',      color: 'var(--text-on-red)' },
}

const ALL_ROLES = ['customer', 'driver', 'admin', 'superadmin']

// ── Compose Modal ──────────────────────────────────────────────────────────

function ComposeModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Newsletter
  onClose: () => void
  onSaved: (n: Newsletter) => void
}) {
  const [form,    setForm]    = useState<DraftForm>(
    initial
      ? {
          subject:     initial.subject,
          previewText: initial.previewText,
          htmlContent: initial.htmlContent,
          targetRoles: initial.targetRoles,
          scheduledAt: initial.scheduledAt
            ? new Date(initial.scheduledAt).toISOString().slice(0, 16)
            : '',
        }
      : BLANK_FORM,
  )
  const [saving,   setSaving]   = useState(false)
  const [preview,  setPreview]  = useState(false)

  const isEdit = !!initial

  function toggle(role: string) {
    setForm((f) => ({
      ...f,
      targetRoles: f.targetRoles.includes(role)
        ? f.targetRoles.filter((r) => r !== role)
        : [...f.targetRoles, role],
    }))
  }

  async function save(asDraft: boolean) {
    if (!form.subject.trim())     { toast.error('Subject is required.'); return }
    if (!form.htmlContent.trim()) { toast.error('Content is required.'); return }
    if (form.targetRoles.length === 0) { toast.error('Select at least one audience.'); return }

    setSaving(true)
    try {
      const payload = {
        subject:     form.subject,
        previewText: form.previewText,
        htmlContent: form.htmlContent,
        targetRoles: form.targetRoles,
        scheduledAt: (!asDraft && form.scheduledAt) ? form.scheduledAt : null,
      }
      const url    = isEdit ? `/api/newsletters/${initial._id}` : '/api/newsletters'
      const method = isEdit ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Save failed.'); return }
      toast.success(isEdit ? 'Newsletter updated.' : 'Newsletter created.')
      onSaved(data.data)
      onClose()
    } catch {
      toast.error('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.55)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card rounded-2xl w-full max-w-3xl shadow-2xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border-muted)' }}>
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-saffron-500" style={{ color: '#ff7d0f' }} />
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              {isEdit ? 'Edit Newsletter' : 'Compose Newsletter'}
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
            style={{ background: 'var(--bg-surface-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              Subject *
            </label>
            <input type="text" value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Your newsletter subject line"
              className="input-field" />
          </div>

          {/* Preview text */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              Preview Text
              <span className="ml-1 font-normal text-gray-400 normal-case tracking-normal">(shown in inbox before opening)</span>
            </label>
            <input type="text" value={form.previewText}
              onChange={(e) => setForm((f) => ({ ...f, previewText: e.target.value }))}
              placeholder="Short teaser text for the inbox preview…"
              className="input-field" />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Content (HTML) *
              </label>
              <button type="button" onClick={() => setPreview((p) => !p)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                <Eye size={11} />{preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div
                className="min-h-40 p-4 rounded-xl border text-sm"
                style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-muted)' }}
                dangerouslySetInnerHTML={{ __html: form.htmlContent }} />
            ) : (
              <textarea
                rows={10}
                value={form.htmlContent}
                onChange={(e) => setForm((f) => ({ ...f, htmlContent: e.target.value }))}
                placeholder={`<p>Dear subscriber,</p>\n<p>Your newsletter content here…</p>`}
                className="input-field font-mono text-xs resize-y" />
            )}
            <p className="text-xs text-gray-400 mt-1">
              Write HTML directly. Use inline styles for best email client compatibility.
            </p>
          </div>

          {/* Audience */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              Audience *
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => (
                <button key={role} type="button" onClick={() => toggle(role)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                  style={form.targetRoles.includes(role)
                    ? { background: '#ff7d0f', color: '#fff' }
                    : { background: 'var(--bg-surface-muted)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                  }>
                  {role}s
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              <Calendar size={10} className="inline mr-1" />
              Schedule (optional — leave blank to save as draft)
            </label>
            <input type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="input-field" />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap gap-3 p-6 border-t"
          style={{ borderColor: 'var(--border-muted)' }}>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
            Cancel
          </button>
          <button type="button" onClick={() => save(true)} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)', opacity: saving ? 0.7 : 1 }}>
            <FileText size={14} />Save as Draft
          </button>
          {form.scheduledAt && (
            <button type="button" onClick={() => save(false)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--surface-amber)', color: 'var(--text-on-amber)', opacity: saving ? 0.7 : 1 }}>
              <Clock size={14} />Schedule
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Newsletter Page ───────────────────────────────────────────────────

export default function NewsletterPage({ role }: { role: 'admin' | 'superadmin' }) {
  const { data: session } = useSession()
  const isSuperadmin      = (session?.user as { role?: string })?.role === 'superadmin'

  const [newsletters,  setNewsletters]  = useState<Newsletter[]>([])
  const [loading,      setLoading]      = useState(true)
  const [composing,    setComposing]    = useState(false)
  const [editTarget,   setEditTarget]   = useState<Newsletter | null>(null)
  const [sending,      setSending]      = useState<string | null>(null)
  const [confirmId,    setConfirmId]    = useState<string | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [expanded,     setExpanded]     = useState<string | null>(null)

  const fetchNewsletters = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/newsletters?limit=50')
      const data = await res.json()
      if (data.success) setNewsletters(data.data)
    } catch {
      toast.error('Failed to load newsletters.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNewsletters() }, [fetchNewsletters])

  function onSaved(newsletter: Newsletter) {
    setNewsletters((prev) => {
      const exists = prev.find((n) => n._id === newsletter._id)
      return exists
        ? prev.map((n) => n._id === newsletter._id ? newsletter : n)
        : [newsletter, ...prev]
    })
  }

  async function sendNow(id: string) {
    setSending(id)
    try {
      const res  = await fetch(`/api/newsletters/${id}/send`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Sent to ${data.data.sentCount} recipients!`)
        fetchNewsletters()
      } else {
        toast.error(data.error ?? 'Send failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setSending(null)
    }
  }

  async function deleteNewsletter(id: string) {
    setDeleting(true)
    try {
      const res  = await fetch(`/api/newsletters/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setNewsletters((prev) => prev.filter((n) => n._id !== id))
        toast.success('Newsletter deleted.')
      } else {
        toast.error(data.error ?? 'Delete failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setDeleting(false)
      setConfirmId(null)
    }
  }

  const accentStyle = role === 'superadmin'
    ? { background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }
    : { background: 'linear-gradient(135deg, #ff7d0f, #ff9a40)' }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-serif)' }}>
            Newsletter
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Compose, schedule and send email newsletters to registered users.
          </p>
        </div>
        <button type="button" onClick={() => setComposing(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
          style={accentStyle}>
          <Plus size={16} />Compose
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(['sent', 'scheduled', 'draft', 'failed'] as const).map((s) => {
          const cfg   = STATUS_CONFIG[s]
          const count = newsletters.filter((n) => n.status === s).length
          return (
            <div key={s} className="card rounded-xl p-3">
              <p className="text-xs capitalize" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{count}</p>
            </div>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: role === 'superadmin' ? '#6366f1' : '#ff7d0f', borderTopColor: 'transparent' }} />
        </div>
      ) : newsletters.length === 0 ? (
        <div className="card rounded-2xl text-center py-20">
          <Mail size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No newsletters yet.</p>
          <button type="button" onClick={() => setComposing(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
            style={accentStyle}>
            <Plus size={14} />Compose your first newsletter
          </button>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <div className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
            {newsletters.map((n, i) => {
              const cfg    = STATUS_CONFIG[n.status] ?? STATUS_CONFIG.draft
              const isOpen = expanded === n._id
              const canEdit   = n.status === 'draft' || n.status === 'scheduled' || n.status === 'failed'
              const canSend   = n.status === 'draft' || n.status === 'failed' || n.status === 'scheduled'
              const canDelete = isSuperadmin && n.status !== 'sending'

              return (
                <motion.div key={n._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}>

                  {/* Row */}
                  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {/* Status icon */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {n.subject}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        <p className="text-xs text-gray-400">
                          <Users size={9} className="inline mr-0.5" />
                          {n.targetRoles.join(', ')}
                        </p>
                        {n.status === 'sent' && (
                          <p className="text-xs text-gray-400">
                            <Send size={9} className="inline mr-0.5" />
                            {n.stats.sentCount}/{n.stats.totalRecipients} delivered
                            {n.stats.failedCount > 0 && ` · ${n.stats.failedCount} failed`}
                          </p>
                        )}
                        {n.status === 'scheduled' && n.scheduledAt && (
                          <p className="text-xs text-gray-400">
                            <Clock size={9} className="inline mr-0.5" />
                            {new Date(n.scheduledAt).toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {n.sentAt
                            ? `Sent ${formatDate(n.sentAt)}`
                            : `Created ${formatDate(n.createdAt)}`
                          } by {n.createdBy.name}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Preview toggle */}
                      <button type="button" onClick={() => setExpanded(isOpen ? null : n._id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}
                        title="Preview content">
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {canEdit && (
                        <button type="button" onClick={() => setEditTarget(n)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}
                          title="Edit">
                          <Edit size={14} />
                        </button>
                      )}

                      {canSend && (
                        confirmId === `send-${n._id}` ? (
                          <div className="flex gap-1">
                            <button type="button"
                              onClick={() => { setConfirmId(null); sendNow(n._id) }}
                              disabled={sending === n._id}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white"
                              style={{ background: '#16a34a' }}>
                              {sending === n._id ? '…' : 'Send'}
                            </button>
                            <button type="button" onClick={() => setConfirmId(null)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                              style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                              No
                            </button>
                          </div>
                        ) : (
                          <button type="button"
                            onClick={() => setConfirmId(`send-${n._id}`)}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                            style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}
                            title="Send now">
                            <Send size={12} />Send
                          </button>
                        )
                      )}

                      {canDelete && (
                        confirmId === `del-${n._id}` ? (
                          <div className="flex gap-1">
                            <button type="button"
                              onClick={() => deleteNewsletter(n._id)}
                              disabled={deleting}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white"
                              style={{ background: '#ef4444' }}>
                              {deleting ? '…' : 'Delete'}
                            </button>
                            <button type="button" onClick={() => setConfirmId(null)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                              style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
                              No
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setConfirmId(`del-${n._id}`)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: 'var(--surface-red)', color: '#ef4444' }}
                            title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Content preview */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4">
                          <div
                            className="p-4 rounded-xl text-sm border prose prose-sm max-w-none"
                            style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-muted)' }}
                            dangerouslySetInnerHTML={{ __html: n.htmlContent }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Compose / Edit Modal */}
      <AnimatePresence>
        {(composing || editTarget) && (
          <ComposeModal
            initial={editTarget ?? undefined}
            onClose={() => { setComposing(false); setEditTarget(null) }}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>

      {/* Info note about unsubscribe */}
      {newsletters.length > 0 && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl"
          style={{ background: 'var(--surface-amber)', border: '1px solid var(--surface-amber-border)' }}>
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Each newsletter email includes an unsubscribe link. Users who unsubscribe will not receive future emails.
            The Vercel cron job runs daily at 09:00 UTC to send any scheduled newsletters automatically.
            Ensure <code className="bg-amber-100 px-1 rounded font-mono">CRON_SECRET</code> is set in Vercel env vars.
          </p>
        </div>
      )}
    </div>
  )
}
