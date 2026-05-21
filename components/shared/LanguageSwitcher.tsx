'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { ChevronDown, Globe, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { routing, localeNames, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'mobile'
}

export default function LanguageSwitcher({ variant = 'default' }: Props) {
  const locale            = useLocale() as Locale
  const router            = useRouter()
  const pathname          = usePathname()
  const params            = useParams()
  const [open, setOpen]   = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref               = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) {
      setOpen(false)
      return
    }
    // Persist preference in cookie so middleware can restore it on unprefixed navigation
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    startTransition(() => {
      // Strip 'locale' from params — it's a [locale] segment, NOT a regular route param.
      // Passing it causes router to double-apply the locale prefix (/hi/hi/).
      const { locale: _loc, ...routeParams } = params as Record<string, string | string[]>
      // @ts-expect-error -- pathname is dynamic
      router.replace({ pathname, params: routeParams }, { locale: newLocale })
      setOpen(false)
    })
  }

  if (variant === 'mobile') {
    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
          {localeNames[locale]}
        </p>
        {routing.locales.map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc as Locale)}
            disabled={isPending}
            className={cn(
              'flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-colors',
              loc === locale
                ? 'bg-saffron-50 text-saffron-600 font-semibold'
                : 'text-gray-700 hover:bg-saffron-50 hover:text-saffron-600',
            )}
          >
            <span className="flex items-center gap-2">
              <Globe size={14} />
              {localeNames[loc as Locale]}
            </span>
            {loc === locale && <Check size={14} />}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 hover:border-saffron-300 hover:bg-saffron-50 transition-all text-sm font-medium text-gray-700"
        aria-label="Change language"
      >
        <Globe size={14} className="text-saffron-500" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="sm:hidden uppercase">{locale}</span>
        <ChevronDown size={12} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
          >
            {routing.locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc as Locale)}
                disabled={isPending}
                className={cn(
                  'flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors',
                  loc === locale
                    ? 'bg-saffron-50 text-saffron-600 font-semibold'
                    : 'text-gray-700 hover:bg-saffron-50',
                )}
              >
                <span>{localeNames[loc as Locale]}</span>
                {loc === locale && <Check size={14} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
