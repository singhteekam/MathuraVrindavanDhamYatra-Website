'use client'

import { useState, useEffect } from 'react'
import { X, Languages, Save } from 'lucide-react'
import toast from 'react-hot-toast'

type BLField = string | { en: string; hi: string }

function toEn(v: BLField): string {
  return typeof v === 'string' ? v : v.en
}
function toHi(v: BLField): string {
  return typeof v === 'string' ? '' : (v.hi ?? '')
}

export interface ReviewForEdit {
  _id:      string
  title:    BLField
  comment:  BLField
  customer: { name: string }
}

interface Props {
  review:  ReviewForEdit | null
  onClose: () => void
  onSaved: (id: string, title: BLField, comment: BLField) => void
}

export default function ReviewEditModal({ review, onClose, onSaved }: Props) {
  const [enTitle,    setEnTitle]    = useState('')
  const [hiTitle,    setHiTitle]    = useState('')
  const [enComment,  setEnComment]  = useState('')
  const [hiComment,  setHiComment]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [transField, setTransField] = useState<'title' | 'comment' | null>(null)

  useEffect(() => {
    if (review) {
      setEnTitle(toEn(review.title))
      setHiTitle(toHi(review.title))
      setEnComment(toEn(review.comment))
      setHiComment(toHi(review.comment))
    }
  }, [review])

  if (!review) return null

  async function translateField(field: 'title' | 'comment') {
    const text = field === 'title' ? enTitle : enComment
    if (!text.trim()) { toast.error('Enter English text first.'); return }
    setTransField(field)
    try {
      const res  = await fetch('/api/translate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        if (field === 'title')   setHiTitle(data.data.translated)
        if (field === 'comment') setHiComment(data.data.translated)
        toast.success('Translated!')
      } else {
        toast.error(data.error ?? 'Translation failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setTransField(null)
    }
  }

  async function handleSave() {
    if (!review) return
    if (!enTitle.trim() || !enComment.trim()) {
      toast.error('English title and comment are required.')
      return
    }
    setSaving(true)
    try {
      const title   = { en: enTitle.trim(),   hi: hiTitle.trim()   }
      const comment = { en: enComment.trim(), hi: hiComment.trim() }

      const res  = await fetch(`/api/reviews/${review._id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'update', title, comment }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Review updated.')
        onSaved(review._id, data.data.title, data.data.comment)
        onClose()
      } else {
        toast.error(data.error ?? 'Save failed.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base">Edit Review</h2>
            <p className="text-xs text-gray-400 mt-0.5">{review.customer.name}</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Title row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EN title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Title (English)
              </label>
              <input
                type="text"
                value={enTitle}
                onChange={(e) => setEnTitle(e.target.value)}
                className="input-field text-sm"
                maxLength={80}
              />
            </div>

            {/* HI title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Title (Hindi)
                </label>
                <button
                  type="button"
                  onClick={() => translateField('title')}
                  disabled={transField === 'title'}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-all disabled:opacity-60"
                  style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                  {transField === 'title'
                    ? <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    : <Languages size={11} />
                  }
                  Translate
                </button>
              </div>
              <input
                type="text"
                value={hiTitle}
                onChange={(e) => setHiTitle(e.target.value)}
                className="input-field text-sm"
                style={{ fontFamily: 'var(--font-hindi)' }}
                maxLength={80}
              />
            </div>
          </div>

          {/* Comment row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EN comment */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Comment (English)
              </label>
              <textarea
                rows={5}
                value={enComment}
                onChange={(e) => setEnComment(e.target.value)}
                className="input-field text-sm resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{enComment.length}/1000</p>
            </div>

            {/* HI comment */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Comment (Hindi)
                </label>
                <button
                  type="button"
                  onClick={() => translateField('comment')}
                  disabled={transField === 'comment'}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-all disabled:opacity-60"
                  style={{ background: 'var(--surface-krishna)', color: '#4338ca' }}>
                  {transField === 'comment'
                    ? <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    : <Languages size={11} />
                  }
                  Translate
                </button>
              </div>
              <textarea
                rows={5}
                value={hiComment}
                onChange={(e) => setHiComment(e.target.value)}
                className="input-field text-sm resize-none"
                style={{ fontFamily: 'var(--font-hindi)' }}
                maxLength={1000}
              />
              <p className="text-xs text-indigo-400 text-right mt-0.5">{hiComment.length}/1000</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={14} />
            }
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
