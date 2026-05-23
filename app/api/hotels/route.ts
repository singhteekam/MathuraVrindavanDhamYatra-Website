import { NextRequest }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { connectDB }       from '@/lib/db'
import Hotel               from '@/models/Hotel'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'

// GET /api/hotels — public (add ?all=true for superadmin to see inactive)
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page     = Number(searchParams.get('page')  ?? 1)
    const limit    = Number(searchParams.get('limit') ?? 50)
    const featured = searchParams.get('featured') === 'true'
    const all      = searchParams.get('all') === 'true'
    const skip     = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (!all) {
      filter.isActive = true
    } else {
      const session = await getServerSession(authOptions)
      const user    = session?.user as { role?: string } | undefined
      if (user?.role !== 'superadmin') filter.isActive = true
    }
    if (featured) filter.isFeatured = true

    const [hotels, total] = await Promise.all([
      Hotel.find(filter).sort({ isFeatured: -1, rating: -1 }).skip(skip).limit(limit).lean(),
      Hotel.countDocuments(filter),
    ])

    return paginatedResponse(hotels, page, limit, total)
  } catch (err) {
    console.error('[GET /api/hotels]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/hotels — superadmin only
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const body = await req.json()
    if (!body.name || !body.slug) return errorResponse('Name and slug are required.')

    await connectDB()
    const hotel = await Hotel.create(body)
    return successResponse(hotel, 201)
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return errorResponse('Slug already exists.', 409)
    console.error('[POST /api/hotels]', err)
    return errorResponse('Internal server error.', 500)
  }
}
