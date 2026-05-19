'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'

/**
 * Syncs `<html lang>` attribute to the active locale on the client.
 * The root layout sets `<html lang="en">` by default; this updates it for /hi/* routes.
 * Improves accessibility tooling and screen reader pronunciation.
 */
export default function LocaleHtmlLang() {
  const locale = useLocale()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
