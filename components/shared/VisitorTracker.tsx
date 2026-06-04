'use client'

import { useEffect, useRef } from 'react'
import { usePathname }       from 'next/navigation'

// ── Device detection ──────────────────────────────────────────────────────────
function getDevice(): string {
  const ua = navigator.userAgent
  if (/iPad|tablet/i.test(ua)) return 'tablet'
  if (/Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (/SamsungBrowser/i.test(ua))          return 'Samsung'
  if (/OPR|Opera/i.test(ua))               return 'Opera'
  if (/Edg/i.test(ua))                     return 'Edge'
  if (/Chrome/i.test(ua))                  return 'Chrome'
  if (/Firefox/i.test(ua))                 return 'Firefox'
  if (/Safari/i.test(ua))                  return 'Safari'
  if (/MSIE|Trident/i.test(ua))            return 'IE'
  return 'Other'
}

function getOS(): string {
  const ua  = navigator.userAgent
  const pf  = navigator.platform ?? ''
  if (/Android/i.test(ua))                 return 'Android'
  if (/iPad|iPhone|iPod/i.test(ua))        return 'iOS'
  if (/Windows NT/i.test(ua))              return 'Windows'
  if (/Mac OS X/i.test(ua))               return 'macOS'
  if (/Linux/i.test(ua))                   return 'Linux'
  if (/CrOS/i.test(ua))                    return 'ChromeOS'
  if (/Win/.test(pf))                      return 'Windows'
  if (/Mac/.test(pf))                      return 'macOS'
  return 'Other'
}

// ── UUID helpers ──────────────────────────────────────────────────────────────
function getOrCreateUUID(key: string): string {
  try {
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const uuid = crypto.randomUUID()
    localStorage.setItem(key, uuid)
    return uuid
  } catch {
    return ''
  }
}

function getOrCreateSession(): string {
  try {
    const existing = sessionStorage.getItem('mvdy_session')
    if (existing) return existing
    const uuid = crypto.randomUUID()
    sessionStorage.setItem('mvdy_session', uuid)
    return uuid
  } catch {
    return ''
  }
}

// ── Pages to skip tracking on ─────────────────────────────────────────────────
const SKIP_PATHS = ['/admin', '/superadmin', '/driver', '/api', '/_next']

export default function VisitorTracker() {
  const pathname    = usePathname()
  const startRef    = useRef(Date.now())
  const trackedRef  = useRef<string>('')  // last tracked path

  useEffect(() => {
    // Skip internal/admin pages
    if (SKIP_PATHS.some(p => pathname.startsWith(p))) return
    // Don't double-track the same path
    if (trackedRef.current === pathname) return
    trackedRef.current = pathname
    startRef.current   = Date.now()

    const visitorId = getOrCreateUUID('mvdy_vid')
    const sessionId = getOrCreateSession()

    const utm = (() => {
      try {
        const q = new URL(window.location.href).searchParams
        const src = q.get('utm_source')
        return src ? `utm_source=${src}` + (q.get('utm_medium') ? `&utm_medium=${q.get('utm_medium')}` : '') : ''
      } catch { return '' }
    })()

    const payload = {
      page:      pathname,
      visitorId,
      sessionId,
      device:    getDevice(),
      browser:   getBrowser(),
      os:        getOS(),
      referrer:  document.referrer ?? '',
      utm,
      timeOnPage: 0,
    }

    // Fire and forget — log this page view
    fetch('/api/visitor-logs', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    }).catch(() => {})

    // On page unload, send time spent (best-effort via beacon)
    const handleUnload = () => {
      const timeOnPage = Math.round((Date.now() - startRef.current) / 1000)
      if (timeOnPage < 1) return
      const beaconPayload = JSON.stringify({ ...payload, timeOnPage })
      navigator.sendBeacon?.(
        '/api/visitor-logs',
        new Blob([beaconPayload], { type: 'application/json' }),
      )
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [pathname])

  return null
}
