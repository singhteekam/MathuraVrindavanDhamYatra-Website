'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { signOut, useSession }                       from 'next-auth/react'
import { motion, AnimatePresence }                   from 'framer-motion'
import { Clock, LogOut, RefreshCw }                  from 'lucide-react'

// ─── Configuration ────────────────────────────────────────────────────────────
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000   // 30 minutes until logout
const WARNING_BEFORE_MS     =  2 * 60 * 1000   // Show warning 2 minutes before logout

// Events that count as "activity"
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click',
]

// Only enforce for authenticated users on protected routes
const PROTECTED_PREFIXES = ['/admin', '/superadmin', '/driver', '/customer']

// ─── Countdown display helper ─────────────────────────────────────────────────
function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function InactivityWatcher() {
  const { data: session, status } = useSession()
  const [showWarning, setShowWarning]     = useState(false)
  const [countdown,   setCountdown]       = useState(WARNING_BEFORE_MS)
  const lastActivityRef   = useRef(Date.now())
  const warningTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Only active for authenticated users on protected pages
  const isProtected = typeof window !== 'undefined'
    && PROTECTED_PREFIXES.some((p) => window.location.pathname.startsWith(p))

  const isAuthenticated = status === 'authenticated' && !!session?.user

  // ── Clear all timers ──────────────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current)   clearTimeout(warningTimerRef.current)
    if (logoutTimerRef.current)    clearTimeout(logoutTimerRef.current)
    if (countdownInterval.current) clearInterval(countdownInterval.current)
  }, [])

  // ── Do the actual logout ──────────────────────────────────────────────────
  const doLogout = useCallback(() => {
    clearAllTimers()
    signOut({ callbackUrl: '/login?reason=inactivity' })
  }, [clearAllTimers])

  // ── Start warning + countdown ─────────────────────────────────────────────
  const startWarning = useCallback(() => {
    setShowWarning(true)
    setCountdown(WARNING_BEFORE_MS)

    // Countdown interval (updates every second)
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1000) {
          clearInterval(countdownInterval.current!)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    // Actual logout after warning period
    logoutTimerRef.current = setTimeout(doLogout, WARNING_BEFORE_MS)
  }, [doLogout])

  // ── Reset the inactivity timer on every activity event ───────────────────
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()

    // If warning is showing, hide it and restart the full timer
    if (showWarning) {
      setShowWarning(false)
      if (countdownInterval.current) clearInterval(countdownInterval.current)
    }

    clearAllTimers()

    // Set new warning timer
    const warningIn = INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS
    warningTimerRef.current = setTimeout(startWarning, warningIn)
  }, [showWarning, clearAllTimers, startWarning])

  // ── Attach/detach activity listeners ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !isProtected) return

    // Start the initial timer
    const warningIn = INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS
    warningTimerRef.current = setTimeout(startWarning, warningIn)

    // Listen for activity
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true }),
    )

    return () => {
      clearAllTimers()
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimer),
      )
    }
  }, [isAuthenticated, isProtected, resetTimer, startWarning, clearAllTimers])

  // ── Tab visibility — pause timer when tab is hidden ───────────────────────
  useEffect(() => {
    if (!isAuthenticated || !isProtected) return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Check if they were gone too long
        const gone = Date.now() - lastActivityRef.current
        if (gone >= INACTIVITY_TIMEOUT_MS) {
          doLogout()
        } else {
          resetTimer()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isAuthenticated, isProtected, doLogout, resetTimer])

  // ── Also react to session error (account deactivated) ─────────────────────
  useEffect(() => {
    const sessionWithError = session as typeof session & { error?: string }
    if (sessionWithError?.error === 'AccountDeactivated') {
      doLogout()
    }
  }, [session, doLogout])

  // Don't render anything if not on a protected page / not logged in
  if (!isAuthenticated || !isProtected) return null

  // ── Warning modal ──────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
              <Clock size={30} className="text-white" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'var(--font-serif)' }}>
              Still there?
            </h2>

            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              You&apos;ve been inactive for a while. For your security,
              you&apos;ll be signed out automatically.
            </p>

            {/* Countdown ring */}
            <div className="flex items-center justify-center gap-2 mb-6 px-5 py-3 rounded-2xl"
              style={{ background: 'var(--surface-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
              <Clock size={16} style={{ color: '#ff7d0f' }} />
              <p className="text-lg font-bold" style={{ color: '#ff7d0f' }}>
                {formatCountdown(countdown)}
              </p>
              <p className="text-sm text-gray-500">until logout</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button type="button"
                onClick={resetTimer}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                <RefreshCw size={16} />
                Yes, keep me signed in
              </button>
              <button type="button"
                onClick={doLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-200">
                <LogOut size={15} />
                Sign out now
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-muted)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#ff7d0f' }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: WARNING_BEFORE_MS / 1000, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}