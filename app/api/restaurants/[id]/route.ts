import { NextRequest }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { connectDB }       from '@/lib/db'
import Restaurant          from '@/models/Restaurant'
import { successResponse, errorResponse } from '@/lib/apiResponse'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/restaurants/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    await connectDB()
    const restaurant = await Restaurant.findById(id).lean()
    if (!restaurant) return errorResponse('Not found.', 404)
    return successResponse(restaurant)
  } catch (err) {
    console.error('[GET /api/restaurants/[id]]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// PUT /api/restaurants/[id] — superadmin only
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { id } = await params
    const body   = await req.json()
    await connectDB()
    const updated = await Restaurant.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean()
    if (!updated) return errorResponse('Not found.', 404)
    return successResponse(updated)
  } catch (err) {
    console.error('[PUT /api/restaurants/[id]]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// DELETE /api/restaurants/[id] — superadmin only
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { id } = await params
    await connectDB()
    const deleted = await Restaurant.findByIdAndDelete(id).lean()
    if (!deleted) return errorResponse('Not found.', 404)
    return successResponse(null)
  } catch (err) {
    console.error('[DELETE /api/restaurants/[id]]', err)
    return errorResponse('Internal server error.', 500)
  }
}
