'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, Suspense, KeyboardEvent, ClipboardEvent } from 'react'
import { useSearchParams }   from 'next/navigation'
import { Link, useRouter }   from '@/i18n/navigation'
import { useTranslations }   from 'next-intl'
import { motion }            from 'framer-motion'
import { MailCheck, RefreshCw, CheckCircle } from 'lucide-react'
import toast                 from 'react-hot-toast'

function VerifyEmailForm() {
  const t            = useTranslations('VerifyEmail')
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') ?? ''

  const [digits,    setDigits]    = useState(['', '', '', '', '', ''])
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [verified,  setVerified]  = useState(false)
  const inputRefs   = useRef<(HTMLInputElement | null)[]>([])

  const otp = digits.join('')

  function handleDigit(index: number, value: string) {
    const v = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = v
    setDigits(next)
    if (v && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKey(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleVerify() {
    if (otp.length !== 6) { toast.error(t('toast.enterFullOtp')); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (res.ok && (data.data?.verified || data.data?.alreadyVerified)) {
        setVerified(true)
        toast.success(t('toast.verified'))
        setTimeout(() => router.push(`/login?verified=true&email=${encodeURIComponent(email)}`), 1800)
      } else {
        toast.error(data.error ?? t('toast.invalidOtp'))
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch {
      toast.error(t('toast.networkError'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email) { toast.error(t('toast.noEmail')); return }
    setResending(true)
    try {
      const res  = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(t('toast.resent'))
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        toast.error(data.error ?? t('toast.resendFailed'))
      }
    } catch {
      toast.error(t('toast.networkError'))
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card rounded-3xl p-8 text-center"
        >
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('successTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('successBody')}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-hindi)' }}>ॐ</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
            Mathura Vrindavan Dham Yatra
          </p>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card rounded-3xl p-7 sm:p-8">

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: '#fff8ed' }}>
            <MailCheck size={20} style={{ color: '#ff7d0f' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </div>

        {email && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm"
            style={{ background: '#fff8ed', border: '1px solid #ffdba8' }}>
            <span>📧</span>
            <span className="text-gray-600 dark:text-gray-300">{t('sentTo')}</span>
            <span className="font-semibold text-saffron-700 dark:text-saffron-400 truncate">{email}</span>
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('instruction')}</p>

        {/* 6-digit OTP input */}
        <div className="flex gap-2 justify-center mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-11 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all"
              style={{
                borderColor: d ? '#ff7d0f' : 'var(--border-default)',
                background:  d ? '#fff8ed' : 'var(--bg-surface)',
                color:       'var(--text-primary)',
              }}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-60 mb-4"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('verifying')}</>
            : t('verifyBtn')
          }
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('noCode')}</p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 text-sm font-semibold mx-auto disabled:opacity-60"
            style={{ color: '#ff7d0f' }}
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            {resending ? t('resending') : t('resendBtn')}
          </button>
        </div>
      </motion.div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
        <Link href="/login" className="hover:underline">{t('backToLogin')}</Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
