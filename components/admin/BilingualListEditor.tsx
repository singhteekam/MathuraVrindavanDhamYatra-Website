'use client'

import { useState } from 'react'
import { Plus, X, Languages } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BLValue } from './BilingualInput'

interface Props {
  items:       BLValue[]
  onChange:    (items: BLValue[]) => void
  label:       string
  placeholder?: string
  addColor?:   string
}

export default function BilingualListEditor({
  items, onChange, label, placeholder = '', addColor = '#ff7d0f',
}: Props) {
  const [translating, setTranslating] = useState<number | null>(null)

  async function translateItem(i: number) {
    const item = items[i]
    if (!item.en.trim()) { toast.error('Enter English text first.'); return }
    setTranslating(i)
    try {
      const res  = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item.en }),
      })
      const data = await res.json()
      if (res.ok) {
        const updated = [...items]
        updated[i] = { ...item, hi: data.data.translated }
        onChange(updated)
      } else {
        toast.error(data.error ?? 'Translation failed.')
      }
    } catch {
      toast.error('Translation unavailable.')
    } finally {
      setTranslating(null)
    }
  }

  function updateItem(i: number, field: 'en' | 'hi', val: string) {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: val }
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
        <button type="button" onClick={() => onChange([...items, { en: '', hi: '' }])}
          className="flex items-center gap-1 text-xs font-semibold transition-colors"
          style={{ color: addColor }}>
          <Plus size={12} />Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i}>
            {i === 0 && (
              <div className="grid grid-cols-2 gap-2 mb-1 pr-16">
                <p className="text-[10px] font-medium text-gray-400">English</p>
                <p className="text-[10px] font-medium text-gray-400">हिन्दी</p>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input type="text" value={item.en}
                  placeholder={`${placeholder || label} ${i + 1} (EN)`}
                  onChange={(e) => updateItem(i, 'en', e.target.value)}
                  className="input-field text-sm py-2" />
                <input type="text" value={item.hi}
                  placeholder="हिन्दी"
                  onChange={(e) => updateItem(i, 'hi', e.target.value)}
                  className="input-field text-sm py-2" />
              </div>
              <button type="button" onClick={() => translateItem(i)}
                disabled={translating === i || !item.en.trim()}
                title="EN→HI"
                className="p-2 rounded-lg hover:bg-violet-50 text-violet-400 hover:text-violet-600 transition-colors disabled:opacity-40 flex-shrink-0">
                {translating === i
                  ? <span className="w-3.5 h-3.5 border border-violet-500 border-t-transparent rounded-full animate-spin block" />
                  : <Languages size={14} />
                }
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
