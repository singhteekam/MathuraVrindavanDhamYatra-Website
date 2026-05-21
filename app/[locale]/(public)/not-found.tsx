'use client'

import { useTranslations } from 'next-intl'
import { Link }            from '@/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('NotFound')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <p className="text-8xl mb-6">🙏</p>
        <h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {t('notFoundLabel')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2 text-base">
          {t('notExist')}
        </p>
        <p className="text-saffron-500 font-semibold text-sm mb-8">
          Jai Shri Krishna 🌸
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-primary">
            {t('backHome')}
          </Link>
          <Link href="/packages" className="btn-secondary">
            {t('navPackages')}
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 justify-center text-sm">
          {[
            { label: t('navPlaces'),  href: '/places' },
            { label: t('navHotels'),  href: '/hotels' },
            { label: t('navContact'), href: '/contact' },
            { label: t('navBooking'), href: '/booking' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 dark:text-gray-500 hover:text-saffron-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
