import { NextRequest }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { connectDB }       from '@/lib/db'
import Restaurant          from '@/models/Restaurant'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'

// GET /api/restaurants — public (add ?all=true for superadmin to see inactive)
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page    = Number(searchParams.get('page')  ?? 1)
    const limit   = Number(searchParams.get('limit') ?? 50)
    const city    = searchParams.get('city')
    const popular = searchParams.get('popular') === 'true'
    const all     = searchParams.get('all') === 'true'
    const skip    = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (!all) {
      filter.isActive = true
    } else {
      const session = await getServerSession(authOptions)
      const user    = session?.user as { role?: string } | undefined
      if (user?.role !== 'superadmin') filter.isActive = true
    }
    if (popular) filter.isPopular = true

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).sort({ isPopular: -1, rating: -1 }).skip(skip).limit(limit).lean(),
      Restaurant.countDocuments(filter),
    ])

    // client-side city filter is done on the frontend; skip DB-level city filter
    // because city is a bilingual object now
    const data = city && city !== 'All'
      ? restaurants.filter((r) => {
          const c = r.city as { en?: string; hi?: string } | string
          return typeof c === 'string' ? c === city : c.en === city
        })
      : restaurants

    return paginatedResponse(data, page, limit, total)
  } catch (err) {
    console.error('[GET /api/restaurants]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/restaurants — superadmin only
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const body = await req.json()
    if (!body.name || !body.slug) return errorResponse('Name and slug are required.')

    await connectDB()
    const restaurant = await Restaurant.create(body)
    return successResponse(restaurant, 201)
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return errorResponse('Slug already exists.', 409)
    console.error('[POST /api/restaurants]', err)
    return errorResponse('Internal server error.', 500)
  }
}
