'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

const OPTIONS = [
  { value: 'light',  icon: <Sun     size={14} />, label: 'Light'  },
  { value: 'dark',   icon: <Moon    size={14} />, label: 'Dark'   },
  { value: 'system', icon: <Monitor size={14} />, label: 'System' },
] as const

export default function SimpleThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          suppressHydrationWarning
          className="flex items-center justify-center w-8 h-7 rounded-lg transition-all duration-150 text-xs"
          style={mounted && theme === opt.value
            ? { background: 'rgba(255,125,15,0.28)', color: '#fb923c' }
            : { color: 'rgba(255,255,255,0.4)' }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  )
}
