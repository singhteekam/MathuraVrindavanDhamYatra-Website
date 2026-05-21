import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Place from '@/models/Place'
import { revalidateTag }  from 'next/cache'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'

// GET /api/places — public
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page     = Number(searchParams.get('page')     ?? 1)
    const limit    = Number(searchParams.get('limit')    ?? 20)
    const city     = searchParams.get('city')
    const type     = searchParams.get('type')
    const featured = searchParams.get('featured') === 'true'
    const search   = searchParams.get('search')
    const skip     = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (city) {
      const re = { $regex: city, $options: 'i' }
      filter.$and = [{ $or: [{ 'city.en': re }, { city: re }] }]
    }
    if (type) {
      const typeClause = { $or: [{ 'type.en': type }, { type }] }
      filter.$and = filter.$and
        ? [...(filter.$and as unknown[]), typeClause]
        : [typeClause]
    }
    if (featured) filter.isFeatured = true
    if (search) {
      const re = { $regex: search, $options: 'i' }
      filter.$or = [
        { 'name.en':             re },
        { 'name.hi':             re },
        { 'shortDescription.en': re },
        { 'shortDescription.hi': re },
        { name:             re },
        { shortDescription: re },
        { 'tags.en': re },
        { 'tags.hi': re },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
    }

    const [places, total] = await Promise.all([
      Place.find(filter)
        .sort({ isFeatured: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .select('-sections')  // omit heavy sections for listing
        .lean(),
      Place.countDocuments(filter),
    ])

    return paginatedResponse(places, page, limit, total)
  } catch (err) {
    console.error('[GET /api/places]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/places — superadmin only
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden. Superadmin access required.', 403)

    const body = await req.json()
    if (!body.name || !body.slug || !body.city) {
      return errorResponse('Name, slug, and city are required.')
    }

    await connectDB()

    const place = await Place.create(body)
    revalidateTag('places', 'default')
    return successResponse(place, 201)
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return errorResponse('A place with this slug already exists.', 409)
    }
    console.error('[POST /api/places]', err)
    return errorResponse('Internal server error.', 500)
  }
}
