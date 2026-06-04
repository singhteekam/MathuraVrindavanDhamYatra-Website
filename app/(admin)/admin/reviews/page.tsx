'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence }           from 'framer-motion'
import {
  Star, Check, X, Trash2, RefreshCw, Languages, Edit2,
  MessageSquare, ThumbsUp, Clock, Filter,
} from 'lucide-react'
import toast           from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ReviewEditModal, { type ReviewForEdit } from './ReviewEditModal'

type BLField = string | { en: string; hi: string }
function str(v: BLField): string {
  return typeof v === 'string' ? v : v.en
}
function strHi(v: BLField): string | null {
  return typeof v === 'string' ? null : (v.hi || null)
}

interface Review {
  _id:        string
  rating:     number
  title:      BLField
  comment:    BLField
  isApproved: boolean
  createdAt:  string
  customer:   { name: string; email: string }
  package?:   { name: BLField; slug: string }
}

type FilterStatus = 'pending' | 'approved' | 'all'

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13}
          fill={i < count ? '#f59e0b' : 'none'}
          stroke={i < count ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews,      setReviews]      = useState<Review[]>([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState<FilterStatus>('all')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [deletingId,    setDeletingId]    = useState<string | null>(null)
  const [actionId,      setActionId]      = useState<string | null>(null)
  const [translatingId, setTranslatingId] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<ReviewForEdit | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      // ?all=true fetches both approved and pending reviews for admin
      const res  = await fetch('/api/reviews?all=true&limit=100')
      const data = await res.json()
      if (data.success) setReviews(data.data)
      else toast.error('Failed to load reviews.')
    } catch {
      toast.error('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // Apply status + rating filters
  const filtered = reviews.filter((r) => {
    if (filter === 'pending'  && r.isApproved)  return false
    if (filter === 'approved' && !r.isApproved) return false
    if (ratingFilter !== null && r.rating !== ratingFilter) return false
    return true
  })

  // Counts
  const pendingCount  = reviews.filter((r) => !r.isApproved).length
  const approvedCount = reviews.filter((r) =>  r.isApproved).length

  async function toggleApproval(review: Review) {
    setActionId(review._id)
    try {
      const res = await fetch(`/api/reviews/${review._id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isApproved: !review.isApproved }),
      })
      if (res.ok) {
        toast.success(review.isApproved ? 'Review unpublished.' : 'Review published! â­')
        setReviews((prev) =>
          prev.map((r) => r._id === review._id ? { ...r, isApproved: !r.isApproved } : r),
        )
      } else {
        toast.error('Failed to update review.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setActionId(null)
    }
  }

  async function deleteReview(id: string, customerName: string) {
    if (!confirm(`Delete ${customerName}'s review? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Review deleted.')
        setReviews((prev) => prev.filter((r) => r._id !== id))
      } else {
        toast.error('Failed to delete review.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setDeletingId(null)
    }
  }

  function hasHindi(v: BLField): boolean {
    return typeof v !== 'string' && !!v.hi
  }

  async function translateReview(review: Review) {
    setTranslatingId(review._id)
    try {
      const res = await fetch(`/api/reviews/${review._id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'translate' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setReviews((prev) =>
          prev.map((r) => r._id === review._id
            ? { ...r, title: data.data.title, comment: data.data.comment }
            : r,
          ),
        )
        toast.success('Hindi translation saved.')
      } else {
        toast.error(data.error ?? 'Translation failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setTranslatingId(null)
    }
  }

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
      <AdminPageHeader
        title="Reviews"
        crumbs={[{ label: 'Reviews' }]}
        action={
          <button type="button" onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Reviews', value: reviews.length,  icon: <MessageSquare size={18} />, color: '#374151', bg: 'var(--bg-surface-muted)' },
          { label: 'Pending',       value: pendingCount,    icon: <Clock         size={18} />, color: '#d97706', bg: 'var(--surface-amber)' },
          { label: 'Published',     value: approvedCount,   icon: <ThumbsUp      size={18} />, color: '#16a34a', bg: 'var(--surface-green)' },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-4 flex items-center gap-3"
            style={{ background: s.bg }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Status filter */}
        <div className="flex gap-2">
          {([
            { value: 'pending',  label: `Pending (${pendingCount})`    },
            { value: 'approved', label: `Published (${approvedCount})` },
            { value: 'all',      label: `All (${reviews.length})`      },
          ] as { value: FilterStatus; label: string }[]).map((tab) => (
            <button key={tab.value} type="button"
              onClick={() => setFilter(tab.value)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={filter === tab.value
                ? { background: '#ff7d0f', color: '#fff' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
              }>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rating filter */}
        <div className="flex items-center gap-2 ml-auto">
          <Filter size={13} className="text-gray-400" />
          <div className="flex gap-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <button key={star} type="button"
                onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={ratingFilter === star
                  ? { background: 'var(--surface-amber)', color: 'var(--text-on-amber)', border: '1.5px solid var(--surface-amber-border)' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-faint)', border: '1px solid var(--border-default)' }
                }>
                <Star size={11} fill={ratingFilter === star ? '#f59e0b' : 'none'}
                  stroke={ratingFilter === star ? '#f59e0b' : 'currentColor'} />
                {star}
              </button>
            ))}
            {ratingFilter !== null && (
              <button type="button" onClick={() => setRatingFilter(null)}
                className="px-2 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-600 border border-red-100">
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400 mb-4">
        Showing {filtered.length} review{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rounded-2xl p-16 text-center">
          <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews found</p>
          <p className="text-xs text-gray-400 mt-1">
            {filter === 'pending' ? 'All reviews have been actioned.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card rounded-2xl overflow-hidden"
                style={!review.isApproved
                  ? { borderLeft: '4px solid #f59e0b' }
                  : { borderLeft: '4px solid #22c55e' }
                }
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                    {/* Left "” review content */}
                    <div className="flex-1 min-w-0">
                      {/* Customer + rating row */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                          {review.customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">{review.customer.name}</p>
                          <p className="text-xs text-gray-400 truncate">{review.customer.email}</p>
                        </div>
                        <StarDisplay count={review.rating} />
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={review.isApproved
                            ? { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                            : { background: 'var(--surface-amber)', color: '#d97706' }
                          }>
                          {review.isApproved ? 'âœ“ Published' : 'â³ Pending'}
                        </span>
                      </div>

                      {/* Review text "” EN */}
                      <p className="font-semibold text-gray-800 text-sm mb-0.5">{str(review.title)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">{str(review.comment)}</p>

                      {/* Hindi translation (shown when available) */}
                      {strHi(review.title) && (
                        <div className="mb-3 pl-3 border-l-2 border-indigo-100">
                          <p className="font-semibold text-indigo-700 text-xs mb-0.5"
                            style={{ fontFamily: 'var(--font-hindi)' }}>
                            {strHi(review.title)}
                          </p>
                          <p className="text-xs text-indigo-500 leading-relaxed"
                            style={{ fontFamily: 'var(--font-hindi)' }}>
                            {strHi(review.comment)}
                          </p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        {review.package && (
                          <span className="px-2.5 py-1 rounded-full"
                            style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)' }}>
                            ðŸ“¦ {str(review.package.name)}
                          </span>
                        )}
                        <span>
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right "” action buttons */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      {/* Approve / Unpublish */}
                      <button type="button"
                        onClick={() => toggleApproval(review)}
                        disabled={actionId === review._id}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap disabled:opacity-60"
                        style={review.isApproved
                          ? { background: 'var(--surface-red)', color: 'var(--text-on-red)' }
                          : { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                        }>
                        {actionId === review._id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : review.isApproved ? (
                          <><X size={13} /> Unpublish</>
                        ) : (
                          <><Check size={13} /> Publish</>
                        )}
                      </button>

                      {/* Edit */}
                      <button type="button"
                        onClick={() => setEditingReview(review)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                        style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
                        <Edit2 size={13} /> Edit
                      </button>

                      {/* Translate */}
                      <button type="button"
                        onClick={() => translateReview(review)}
                        disabled={translatingId === review._id}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap disabled:opacity-60"
                        style={hasHindi(review.title)
                          ? { background: 'var(--surface-blue)', color: '#0369a1', border: '1px solid var(--surface-blue-border)' }
                          : { background: 'var(--surface-krishna)', color: '#4338ca', border: '1px solid var(--surface-krishna-border)' }
                        }
                        title={hasHindi(review.title) ? 'Re-translate to Hindi' : 'Translate to Hindi'}>
                        {translatingId === review._id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Languages size={13} />{hasHindi(review.title) ? 'Re-translate' : 'Translate'}</>
                        )}
                      </button>

                      {/* Delete */}
                      <button type="button"
                        onClick={() => deleteReview(review._id, review.customer.name)}
                        disabled={deletingId === review._id}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap disabled:opacity-60"
                        style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
                        {deletingId === review._id ? (
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Trash2 size={13} /> Delete</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ReviewEditModal
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onSaved={(id, title, comment) => {
          setReviews((prev) =>
            prev.map((r) => r._id === id ? { ...r, title, comment } : r),
          )
        }}
      />
    </div>
  )
}