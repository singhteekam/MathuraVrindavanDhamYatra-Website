'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { signIn }             from 'next-auth/react'
import { useSearchParams }    from 'next/navigation'
import { Link, useRouter }    from '@/i18n/navigation'
import { useTranslations }    from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, AlertCircle, Key } from 'lucide-react'
import toast                  from 'react-hot-toast'

type LoginTab = 'portal' | 'superadmin'

function LoginForm() {
  const t            = useTranslations('Login')
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') ?? ''
  const errorParam   = searchParams.get('error')
  const reasonParam  = searchParams.get('reason')

  const verifiedParam = searchParams.get('verified')
  const emailParam    = searchParams.get('email') ?? ''

  const [tab,       setTab]       = useState<LoginTab>('portal')
  const [email,     setEmail]     = useState(emailParam)
  const [password,  setPassword]  = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [showKey,   setShowKey]   = useState(false)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error(t('toast.emailRequired')); return }
    if (tab === 'superadmin' && !secretKey) {
      toast.error(t('toast.secretKeyRequired'))
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email:     email.trim().toLowerCase(),
        password,
        secretKey: tab === 'superadmin' ? secretKey : '',
        redirect:  false,
      })

      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        // Unverified account — send a fresh OTP and redirect to verify-email
        toast(t('toast.notVerified'), { icon: '📧' })
        await fetch('/api/auth/send-otp', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: email.trim().toLowerCase() }),
        }).catch(() => {})
        router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`)
        return
      }
      if (result?.error) {
        toast.error(
          tab === 'superadmin'
            ? t('toast.invalidSuperadmin')
            : t('toast.invalidCredentials'),
        )
      } else {
        toast.success(t('toast.welcome'))
        if (callbackUrl) {
          router.push(callbackUrl)
        } else {
          const res     = await fetch('/api/auth/session')
          const session = await res.json()
          const role    = session?.user?.role ?? 'customer'
          if      (role === 'superadmin') { window.location.href = '/superadmin'; return }
          else if (role === 'admin')      { window.location.href = '/admin';      return }
          else if (role === 'driver')     { window.location.href = '/driver';     return }
          else                            router.push('/')
        }
        router.refresh()
      }
    } catch {
      toast.error(t('toast.genericError'))
    } finally {
      setLoading(false)
    }
  }

  const ROLE_BADGES = [
    { role: t('roleCustomer'), desc: t('roleCustomerDesc'), emoji: '🙏', color: '#ff7d0f', bg: 'var(--surface-saffron)' },
    { role: t('roleDriver'),   desc: t('roleDriverDesc'),   emoji: '🚗', color: '#16a34a', bg: 'var(--surface-green)'   },
    { role: t('roleAdmin'),    desc: t('roleAdminDesc'),    emoji: '⚙️', color: '#4338ca', bg: 'var(--surface-krishna)' },
  ]

  const TABS = [
    { key: 'portal'     as LoginTab, label: t('tabPortal')     },
    { key: 'superadmin' as LoginTab, label: t('tabSuperadmin') },
  ]

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            <span className="text-white text-3xl font-bold"
              style={{ fontFamily: 'var(--font-hindi)' }}>
              {String.fromCodePoint(0x0913, 0x0902)}
            </span>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-xl"
              style={{ fontFamily: 'var(--font-serif)' }}>
              Mathura Vrindavan Dham Yatra
            </p>
            <p className="text-saffron-500 text-xs font-semibold tracking-widest uppercase mt-0.5">
              {t('signInSubtitle')}
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Tab selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 mb-4 p-1 rounded-2xl"
        style={{ background: 'var(--bg-surface-muted)' }}>
        {TABS.map((tabItem) => (
          <button key={tabItem.key} type="button"
            onClick={() => { setTab(tabItem.key); setSecretKey('') }}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center"
            style={tab === tabItem.key
              ? { background: 'var(--bg-body)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
            }>
            {tabItem.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card rounded-3xl p-7 sm:p-8"
      >
        {/* Heading */}
        {tab === 'portal' ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
              style={{ fontFamily: 'var(--font-serif)' }}>{t('welcomeBack')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {t('portalSubtitle')}
            </p>
            {/* Role badges */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {ROLE_BADGES.map((item) => (
                <div key={item.role} className="text-center p-3 rounded-xl"
                  style={{ background: item.bg }}>
                  <p className="text-xl mb-1">{item.emoji}</p>
                  <p className="font-semibold text-xs" style={{ color: item.color }}>{item.role}</p>
                  <p className="text-gray-400 mt-0.5 leading-tight" style={{ fontSize: '10px' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#1e1b4b' }}>
                <Key size={16} className="text-indigo-300" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: 'var(--font-serif)' }}>{t('superadminTitle')}</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 ml-12">
              {t('superadminSubtitle')}
            </p>
            <div className="flex items-start gap-2 p-3 rounded-xl mb-5"
              style={{ background: 'var(--surface-krishna)', border: '1px solid var(--surface-krishna-border)' }}>
              <Key size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-on-krishna)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-on-krishna)' }}>
                {t('superadminInfo')}
              </p>
            </div>
          </>
        )}

        {/* Success: email verified */}
        {verifiedParam === 'true' && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
            style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)', border: '1px solid var(--surface-green-border)' }}>
            <span className="text-lg flex-shrink-0">✅</span>
            {t('emailVerifiedSuccess')}
          </div>
        )}

        {/* Error messages */}
        {reasonParam === 'inactivity' && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
            style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
            <span className="text-lg flex-shrink-0">⏱️</span>
            {t('inactivityNotice')}
          </div>
        )}
        {errorParam === 'unauthorized' && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
            style={{ background: 'var(--surface-red)', color: 'var(--text-on-red)', border: '1px solid var(--surface-red-border)' }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            {t('unauthorizedError')}
          </div>
        )}
        {errorParam === 'account_disabled' && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
            style={{ background: 'var(--surface-red)', color: 'var(--text-on-red)', border: '1px solid var(--surface-red-border)' }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            {t('accountDisabledError')}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              {t('emailLabel')}
            </label>
            <input type="email" placeholder="your@email.com" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field" autoComplete="email" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')} required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Secret key — only for superadmin tab */}
          <AnimatePresence>
            {tab === 'superadmin' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  <Key size={10} className="inline mr-1" />{t('secretKeyLabel')} *
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={t('secretKeyPlaceholder')} required
                    value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
                    className="input-field pr-10"
                    autoComplete="off" />
                  <button type="button" onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t('secretKeyHint')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-4 text-base"
            style={{
              opacity: loading ? 0.7 : 1,
              background: tab === 'superadmin'
                ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
                : undefined,
            }}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('buttonSigningIn')}</>
              : <><LogIn size={18} />{tab === 'superadmin' ? t('buttonSuperadminSignIn') : t('buttonSignIn')}</>
            }
          </button>
        </form>

        {tab === 'portal' && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t('newCustomer')}{' '}
            <Link href="/register" className="font-semibold hover:underline"
              style={{ color: '#ff7d0f' }}>
              {t('createFreeAccount')}
            </Link>
          </p>
        )}
      </motion.div>

      {/* Note */}
      {tab === 'portal' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-5 p-4 rounded-2xl text-center"
          style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-muted)' }}>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('driverAdminBold')}</span>{' '}
            {t('driverAdminNote')}{' '}
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
              className="font-semibold hover:underline" style={{ color: '#16a34a' }}>
              {t('whatsapp')}
            </a>.
          </p>
        </motion.div>
      )}

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
        <Link href="/" className="hover:underline">{t('backToMainSite')}</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    }>
      <LoginForm />
    </Suspense>
  )
}
