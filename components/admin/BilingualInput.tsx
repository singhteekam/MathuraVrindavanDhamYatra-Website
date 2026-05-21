'use client'

import { useState } from 'react'
import { Languages } from 'lucide-react'
import toast from 'react-hot-toast'

export interface BLValue { en: string; hi: string }

interface Props {
  value:         BLValue
  onChange:      (val: BLValue) => void
  label:         string
  required?:     boolean
  type?:         'input' | 'textarea'
  rows?:         number
  enPlaceholder?: string
  hiPlaceholder?: string
}

export default function BilingualInput({
  value, onChange, label, required = false,
  type = 'input', rows = 2,
  enPlaceholder = '', hiPlaceholder = 'हिन्दी',
}: Props) {
  const [translating, setTranslating] = useState(false)

  async function translate() {
    if (!value.en.trim()) { toast.error('Enter English text first.'); return }
    setTranslating(true)
    try {
      const res  = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value.en }),
      })
      const data = await res.json()
      if (res.ok) {
        onChange({ ...value, hi: data.data.translated })
      } else {
        toast.error(data.error ?? 'Translation failed.')
      }
    } catch {
      toast.error('Translation unavailable.')
    } finally {
      setTranslating(false)
    }
  }

  const inp = 'input-field text-sm'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}{required && ' *'}
        </label>
        <button
          type="button"
          onClick={translate}
          disabled={translating || !value.en.trim()}
          title="Auto-translate English to Hindi"
          className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {translating
            ? <span className="w-3 h-3 border border-violet-600 border-t-transparent rounded-full animate-spin" />
            : <Languages size={12} />
          }
          EN→HI
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-medium text-gray-400 mb-1">English</p>
          {type === 'textarea'
            ? <textarea rows={rows} value={value.en} required={required}
                placeholder={enPlaceholder || 'English'}
                onChange={(e) => onChange({ ...value, en: e.target.value })}
                className={`${inp} resize-none`} />
            : <input type="text" value={value.en} required={required}
                placeholder={enPlaceholder || 'English'}
                onChange={(e) => onChange({ ...value, en: e.target.value })}
                className={inp} />
          }
        </div>
        <div>
          <p className="text-[10px] font-medium text-gray-400 mb-1">हिन्दी</p>
          {type === 'textarea'
            ? <textarea rows={rows} value={value.hi}
                placeholder={hiPlaceholder}
                onChange={(e) => onChange({ ...value, hi: e.target.value })}
                className={`${inp} resize-none`} />
            : <input type="text" value={value.hi}
                placeholder={hiPlaceholder}
                onChange={(e) => onChange({ ...value, hi: e.target.value })}
                className={inp} />
          }
        </div>
      </div>
    </div>
  )
}
