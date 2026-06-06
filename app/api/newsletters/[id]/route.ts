import { NextRequest }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import Newsletter           from '@/models/Newsletter'
import { successResponse, errorResponse } from '@/lib/apiResponse'

interface Params { params: Promise<{ id: string }> }

// GET /api/newsletters/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { id } = await params
    await connectDB()

    const newsletter = await Newsletter.findById(id).lean()
    if (!newsletter) return errorResponse('Newsletter not found.', 404)

    return successResponse(newsletter)
  } catch (err) {
    console.error('[GET /api/newsletters/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// PUT /api/newsletters/[id] — admin/superadmin: update draft or scheduled newsletter
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { id }   = await params
    const body     = await req.json()
    await connectDB()

    const existing = await Newsletter.findById(id)
    if (!existing) return errorResponse('Newsletter not found.', 404)

    if (existing.status === 'sent' || existing.status === 'sending') {
      return errorResponse('Cannot edit a newsletter that has already been sent or is currently sending.')
    }

    const { subject, previewText, htmlContent, targetRoles, scheduledAt } = body

    if (subject?.trim())     existing.subject     = subject.trim()
    if (previewText !== undefined) existing.previewText = previewText.trim()
    if (htmlContent?.trim()) existing.htmlContent = htmlContent.trim()
    if (targetRoles?.length) existing.targetRoles = targetRoles
    if (scheduledAt !== undefined) {
      existing.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
      existing.status      = scheduledAt ? 'scheduled' : 'draft'
    }

    await existing.save()
    return successResponse(existing)
  } catch (err) {
    console.error('[PUT /api/newsletters/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// DELETE /api/newsletters/[id] — superadmin only: delete draft/scheduled newsletters
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden. Superadmin access required.', 403)

    const { id } = await params
    await connectDB()

    const newsletter = await Newsletter.findById(id)
    if (!newsletter) return errorResponse('Newsletter not found.', 404)

    if (newsletter.status === 'sending') {
      return errorResponse('Cannot delete a newsletter that is currently sending.')
    }

    await newsletter.deleteOne()
    return successResponse({ message: 'Newsletter deleted.' })
  } catch (err) {
    console.error('[DELETE /api/newsletters/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}
