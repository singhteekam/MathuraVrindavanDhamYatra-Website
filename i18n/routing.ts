import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'hi'],
  defaultLocale: 'en',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
}
