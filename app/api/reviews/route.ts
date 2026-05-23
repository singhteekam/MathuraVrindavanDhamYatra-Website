import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import Booking from '@/models/Booking'
import { recalcPackageRating } from '@/lib/reviewUtils'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'
import { translateToHindi } from '@/lib/translate'

// GET /api/reviews — public, approved only + optional packageId filter
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page      = Number(searchParams.get('page')    ?? 1)
    const limit     = Number(searchParams.get('limit')   ?? 10)
    const packageId = searchParams.get('packageId')
    const all       = searchParams.get('all') === 'true'  // admin: include unapproved
    const skip      = (page - 1) * limit

    const filter: Record<string, unknown> = all ? {} : { isApproved: true }
    if (packageId) filter.package = packageId
    if (all) {
      const session = await getServerSession(authOptions)
      const user    = session?.user as { role?: string } | undefined
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return errorResponse('Forbidden.', 403)
      }
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name avatar')
        .populate('package',  'name slug')
        .lean(),
      Review.countDocuments(filter),
    ])

    return paginatedResponse(reviews, page, limit, total)
  } catch (err) {
    console.error('[GET /api/reviews]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/reviews — logged-in customer submits a review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse('You must be logged in to leave a review.', 401)

    const body = await req.json()
    const { bookingId, packageId, rating, title, comment } = body

    if (!bookingId || !rating || !title || !comment) {
      return errorResponse('Booking, rating, title, and comment are required.')
    }
    if (rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5.')
    }

    await connectDB()

    const user = session.user as { id: string }

    // Verify this booking belongs to this customer and is completed
    const booking = await Booking.findById(bookingId)
    if (!booking) return errorResponse('Booking not found.', 404)
    if (booking.customer?.toString() !== user.id) return errorResponse('Forbidden.', 403)
    if (booking.status !== 'completed') return errorResponse('You can only review completed trips.', 400)

    // Check for duplicate review
    const existing = await Review.findOne({ booking: bookingId })
    if (existing) return errorResponse('You have already reviewed this booking.', 409)

    const [titleHi, commentHi] = await Promise.all([
      translateToHindi(title.trim()),
      translateToHindi(comment.trim()),
    ])

    const review = await Review.create({
      customer:   user.id,
      booking:    bookingId,
      package:    packageId ?? booking.package,
      rating,
      title:      { en: title.trim(),   hi: titleHi   },
      comment:    { en: comment.trim(), hi: commentHi },
      isApproved: false, // admin must approve
    })

    return successResponse(
      { id: review._id.toString(), message: 'Review submitted! It will appear after admin approval.' },
      201,
    )
  } catch (err) {
    console.error('[POST /api/reviews]', err)
    return errorResponse('Internal server error.', 500)
  }
}
