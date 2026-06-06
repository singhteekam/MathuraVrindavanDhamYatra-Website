import { NextRequest }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import Newsletter           from '@/models/Newsletter'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'

// GET /api/newsletters — admin/superadmin: list all newsletters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page  = Number(searchParams.get('page')  ?? 1)
    const limit = Number(searchParams.get('limit') ?? 20)
    const skip  = (page - 1) * limit

    const [newsletters, total] = await Promise.all([
      Newsletter.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Newsletter.countDocuments(),
    ])

    return paginatedResponse(newsletters, page, limit, total)
  } catch (err) {
    console.error('[GET /api/newsletters]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/newsletters — admin/superadmin: create newsletter (as draft or scheduled)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string; id?: string; name?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const body = await req.json()
    const { subject, previewText, htmlContent, targetRoles, scheduledAt } = body

    if (!subject?.trim())     return errorResponse('Subject is required.')
    if (!htmlContent?.trim()) return errorResponse('Content is required.')

    await connectDB()

    const newsletter = await Newsletter.create({
      subject:     subject.trim(),
      previewText: previewText?.trim() ?? '',
      htmlContent: htmlContent.trim(),
      targetRoles: targetRoles?.length ? targetRoles : ['customer'],
      status:      scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdBy:   { id: user.id ?? '', name: user.name ?? 'Admin' },
    })

    return successResponse(newsletter, 201)
  } catch (err) {
    console.error('[POST /api/newsletters]', err)
    return errorResponse('Internal server error.', 500)
  }
}
