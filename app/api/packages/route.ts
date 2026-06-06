import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Package from '@/models/Package'
import { revalidateTag }  from 'next/cache'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'

// GET /api/packages — public, supports filters
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page      = Number(searchParams.get('page')     ?? 1)
    const limit     = Number(searchParams.get('limit')    ?? 12)
    const featured  = searchParams.get('featured') === 'true'
    const city      = searchParams.get('city')
    const duration  = searchParams.get('duration')
    const all       = searchParams.get('all') === 'true'
    const skip      = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (!all) {
      filter.isActive = true
    } else {
      const session = await getServerSession(authOptions)
      const user    = session?.user as { role?: string } | undefined
      if (user?.role !== 'superadmin' && user?.role !== 'admin') filter.isActive = true
    }
    if (featured) filter.isFeatured = true
    if (city)     filter.cities     = { $in: [city] }
    if (duration) filter.duration   = Number(duration)

    const [packages, total] = await Promise.all([
      Package.find(filter)
        .sort({ isFeatured: -1, totalBookings: -1 })
        .skip(skip)
        .limit(limit)
        .select('-itinerary -inclusions -exclusions') // lighter for listing
        .lean(),
      Package.countDocuments(filter),
    ])

    return paginatedResponse(packages, page, limit, total)
  } catch (err) {
    console.error('[GET /api/packages]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/packages — admin only, create a package
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const body = await req.json()

    if (!body.name || !body.slug || !body.basePrice) {
      return errorResponse('Name, slug, and basePrice are required.')
    }

    await connectDB()

    const pkg = await Package.create(body)
    revalidateTag('packages', 'default')
    return successResponse(pkg, 201)
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return errorResponse('A package with this slug already exists.', 409)
    }
    console.error('[POST /api/packages]', err)
    return errorResponse('Internal server error.', 500)
  }
}