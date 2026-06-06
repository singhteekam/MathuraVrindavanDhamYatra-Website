import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Package from '@/models/Package'
import { revalidateTag }  from 'next/cache'
import { successResponse, errorResponse } from '@/lib/apiResponse'

interface Params {
  params: Promise<{ slug: string }>
}

// GET /api/packages/[slug] — full detail, public
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    await connectDB()

    const pkg = await Package.findOne({ slug, isActive: true }).lean()
    if (!pkg) return errorResponse('Package not found.', 404)

    return successResponse(pkg)
  } catch (err) {
    console.error('[GET /api/packages/:slug]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// PUT /api/packages/[slug] — admin only, full update
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { slug } = await params
    const body     = await req.json()

    await connectDB()

    const pkg = await Package.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true },
    )

    if (!pkg) return errorResponse('Package not found.', 404)
    revalidateTag('packages', 'default')
    return successResponse(pkg)
  } catch (err) {
    console.error('[PUT /api/packages/:slug]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// DELETE /api/packages/[slug] — superadmin only: hard delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden. Superadmin access required.', 403)

    const { slug } = await params
    await connectDB()

    const pkg = await Package.findOneAndDelete({ slug })
    if (!pkg) return errorResponse('Package not found.', 404)
    revalidateTag('packages', 'default')
    return successResponse({ message: 'Package deleted.' })
  } catch (err) {
    console.error('[DELETE /api/packages/:slug]', err)
    return errorResponse('Internal server error.', 500)
  }
}