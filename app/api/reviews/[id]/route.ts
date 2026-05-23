import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import { revalidateTag }       from 'next/cache'
import { recalcPackageRating } from '@/lib/reviewUtils'
import { successResponse, errorResponse } from '@/lib/apiResponse'
import { translateToHindi } from '@/lib/translate'

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/reviews/[id] — admin approve/unpublish OR translate
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { id } = await params
    const body   = await req.json()

    await connectDB()

    // ── Translate action: generate / refresh Hindi for this review ────────────
    if (body.action === 'translate') {
      const review = await Review.findById(id)
      if (!review) return errorResponse('Review not found.', 404)

      const enTitle   = typeof review.title   === 'string' ? review.title   : (review.title   as { en: string }).en
      const enComment = typeof review.comment === 'string' ? review.comment : (review.comment as { en: string }).en

      const [titleHi, commentHi] = await Promise.all([
        translateToHindi(enTitle),
        translateToHindi(enComment),
      ])

      review.title   = { en: enTitle,   hi: titleHi   }
      review.comment = { en: enComment, hi: commentHi }
      review.markModified('title')
      review.markModified('comment')
      await review.save()

      revalidateTag('reviews', 'default')
      return successResponse({ title: review.title, comment: review.comment })
    }

    // ── Update action: manually set title / comment (bilingual edit) ─────────
    if (body.action === 'update') {
      const update: Record<string, unknown> = {}
      if (body.title   !== undefined) update.title   = body.title
      if (body.comment !== undefined) update.comment = body.comment

      const review = await Review.findByIdAndUpdate(id, update, { new: true })
      if (!review) return errorResponse('Review not found.', 404)

      revalidateTag('reviews', 'default')
      return successResponse({ title: review.title, comment: review.comment })
    }

    // ── Default: toggle isApproved ────────────────────────────────────────────
    const { isApproved } = body
    const review = await Review.findByIdAndUpdate(id, { isApproved }, { new: true })

    if (!review) return errorResponse('Review not found.', 404)

    if (review.package) await recalcPackageRating(review.package)

    revalidateTag('reviews', 'default')
    revalidateTag('packages', 'default')
    return successResponse({
      review,
      message: isApproved ? 'Review approved and published.' : 'Review unpublished.',
    })
  } catch (err) {
    console.error('[PATCH /api/reviews/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// DELETE /api/reviews/[id] — admin delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { id } = await params
    await connectDB()

    const review = await Review.findByIdAndDelete(id)
    if (!review) return errorResponse('Review not found.', 404)

    // Recalculate rating after deletion
    if (review.package) {
      await recalcPackageRating(review.package)
    }

    revalidateTag('reviews', 'default')
    revalidateTag('packages', 'default')
    return successResponse({ message: 'Review deleted.' })
  } catch (err) {
    console.error('[DELETE /api/reviews/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}