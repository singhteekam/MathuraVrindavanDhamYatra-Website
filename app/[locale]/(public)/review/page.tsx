'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams }    from 'next/navigation'
import { useSession }         from 'next-auth/react'
import { motion }             from 'framer-motion'
import { Star, Send, ArrowLeft } from 'lucide-react'
import Link                   from 'next/link'
import toast                  from 'react-hot-toast'

// ─── Inner component that uses useSearchParams ────────────────────────────────
function ReviewFormContent() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // booking = MongoDB _id string (passed from /customer page)
  const bookingId = searchParams.get('booking') ?? ''
  const packageId = searchParams.get('package') ?? ''
  const pkgName   = decodeURIComponent(searchParams.get('name') ?? 'Your Trip')

  const [rating,    setRating]    = useState(0)
  const [hovered,   setHovered]   = useState(0)
  const [title,     setTitle]     = useState('')
  const [comment,   setComment]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent! 🙏']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a star rating.')
      return
    }
    if (!title.trim()) {
      toast.error('Please enter a review title.')
      return
    }
    if (comment.trim().length < 20) {
      toast.error('Please write at least 20 characters in your review.')
      return
    }
    if (!bookingId) {
      toast.error('Booking reference is missing. Please go back and try again.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,                           // MongoDB _id of booking
          packageId: packageId || undefined,   // MongoDB _id of package (optional)
          rating,
          title:   title.trim(),
          comment: comment.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        toast.success('Review submitted! It will appear after admin approval 🙏')
      } else {
        toast.error(data.error ?? 'Could not submit review. Please try again.')
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card rounded-2xl p-8 text-center max-w-sm w-full">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="font-bold text-gray-900 text-lg mb-2">Sign in to leave a review</h2>
          <p className="text-gray-500 text-sm mb-5">
            Only customers who completed a trip can leave reviews.
          </p>
          <Link href={`/login?callbackUrl=${encodeURIComponent('/customer')}`}
            className="btn-primary w-full justify-center">
            Sign In
          </Link>
          <Link href="/customer"
            className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500 hover:text-saffron-600 transition-colors">
            <ArrowLeft size={14} /> Back to My Bookings
          </Link>
        </div>
      </div>
    )
  }

  // ── Submitted success ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="card rounded-2xl p-8 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            <Star size={28} className="text-white" fill="white" />
          </div>
          <h2 className="font-bold text-gray-900 text-xl mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Thank You! 🙏
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your review has been submitted and will appear on the site after our team approves it.
            Jai Shri Krishna!
          </p>
          <div className="space-y-3">
            <Link href="/customer" className="btn-primary w-full justify-center">
              Back to My Bookings
            </Link>
            <Link href="/packages"
              className="flex items-center justify-center py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Browse More Packages
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Missing booking ID guard ───────────────────────────────────────────────
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card rounded-2xl p-8 text-center max-w-sm w-full">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="font-bold text-gray-900 text-lg mb-2">Invalid review link</h2>
          <p className="text-gray-500 text-sm mb-5">
            The booking reference is missing. Please go back to your bookings and click Leave Review again.
          </p>
          <Link href="/customer" className="btn-primary w-full justify-center">
            Back to My Bookings
          </Link>
        </div>
      </div>
    )
  }

  // ── Review form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            <Star size={24} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Leave a Review
          </h1>
          <p className="text-saffron-500 font-semibold text-sm mt-1">{pkgName}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card rounded-2xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Star rating */}
            <div className="text-center">
              <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Your Rating *
              </label>
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    <Star
                      size={40}
                      fill={(hovered || rating) >= star ? '#f59e0b' : 'none'}
                      stroke={(hovered || rating) >= star ? '#f59e0b' : '#d1d5db'}
                    />
                  </button>
                ))}
              </div>
              {(hovered || rating) > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-semibold"
                  style={{ color: '#f59e0b' }}
                >
                  {RATING_LABELS[hovered || rating]}
                </motion.p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Review Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Amazing spiritual experience!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="input-field"
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/80</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Your Review *
              </label>
              <textarea
                rows={5}
                placeholder="Tell other pilgrims about your experience — the driver, temples visited, hotel, what you loved most..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                minLength={20}
                maxLength={1000}
                className="input-field resize-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1 flex justify-between">
                <span className={comment.length < 20 ? 'text-red-400' : 'text-green-500'}>
                  {comment.length < 20 ? `${20 - comment.length} more characters needed` : '✓ Good length'}
                </span>
                <span>{comment.length}/1000</span>
              </p>
            </div>

            {/* Guidelines */}
            <div className="p-4 rounded-xl text-xs text-gray-500 leading-relaxed"
              style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
              <p className="font-semibold text-gray-700 mb-1">📋 Review Guidelines</p>
              Reviews are published after admin approval (usually within 24 hours).
              Please share your honest experience to help other devotees plan their pilgrimage.
            </div>

            <button
              type="submit"
              disabled={loading || rating === 0 || comment.length < 20}
              className="btn-primary w-full py-4"
              style={{ opacity: (loading || rating === 0 || comment.length < 20) ? 0.6 : 1 }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </motion.div>

        <div className="text-center mt-5">
          <Link href="/customer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-saffron-600 transition-colors">
            <ArrowLeft size={14} /> Back to My Bookings
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Page export with Suspense boundary ───────────────────────────────────────
// useSearchParams() MUST be inside Suspense or Next.js will error
export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading review form...</p>
        </div>
      </div>
    }>
      <ReviewFormContent />
    </Suspense>
  )
}