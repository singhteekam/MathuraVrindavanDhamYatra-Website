'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'mobile'
}

export default function ThemeSwitcher({ variant = 'default' }: Props) {
  const t                 = useTranslations('ThemeSwitcher')
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen]       = useState(false)
  const ref                   = useRef<HTMLDivElement>(null)

  // Avoid hydration mismatch — theme is unknown server-side
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const options = [
    { value: 'light',  labelKey: 'light',  icon: <Sun     size={14} /> },
    { value: 'dark',   labelKey: 'dark',   icon: <Moon    size={14} /> },
    { value: 'system', labelKey: 'system', icon: <Monitor size={14} /> },
  ] as const

  // Render a stable placeholder during SSR/hydration
  const currentIcon = !mounted
    ? <Sun size={14} className="text-saffron-500" />
    : resolvedTheme === 'dark'
      ? <Moon size={14} className="text-saffron-500" />
      : <Sun size={14} className="text-saffron-500" />

  if (variant === 'mobile') {
    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 py-2">
          {t('label')}
        </p>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              'flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-colors',
              mounted && theme === opt.value
                ? 'bg-saffron-50 dark:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400 font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800',
            )}
          >
            <span className="flex items-center gap-2">
              {opt.icon}
              {t(opt.labelKey)}
            </span>
            {mounted && theme === opt.value && <Check size={14} />}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 hover:border-saffron-300 dark:hover:border-saffron-600 hover:bg-saffron-50 dark:hover:bg-gray-800 transition-all"
        aria-label={t('label')}
        suppressHydrationWarning
      >
        {currentIcon}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setTheme(opt.value); setOpen(false) }}
                className={cn(
                  'flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors',
                  mounted && theme === opt.value
                    ? 'bg-saffron-50 dark:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-saffron-50 dark:hover:bg-gray-800',
                )}
              >
                {opt.icon}
                <span className="flex-1 text-left">{t(opt.labelKey)}</span>
                {mounted && theme === opt.value && <Check size={14} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
