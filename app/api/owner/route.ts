import { NextRequest }      from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { connectDB }          from '@/lib/db'
import OwnerProfile           from '@/models/OwnerProfile'
import { revalidateTag }      from 'next/cache'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// GET /api/owner — public, returns the owner profile (used on homepage)
export async function GET() {
  try {
    await connectDB()
    const owner = await OwnerProfile.findOne({}).lean()
    return successResponse(owner ?? null)
  } catch (err) {
    console.error('[GET /api/owner]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/owner — superadmin only, upsert owner profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const body = await req.json()
    const {
      name, title, bio, photo, phone, email, whatsapp,
      experience, achievements, socialLinks, isVisible,
    } = body

    await connectDB()

    const update: Record<string, unknown> = {}
    if (name         !== undefined) update.name         = name
    if (title        !== undefined) update.title        = title
    if (bio          !== undefined) update.bio          = bio
    if (photo        !== undefined) update.photo        = photo
    if (phone        !== undefined) update.phone        = phone
    if (email        !== undefined) update.email        = email
    if (whatsapp     !== undefined) update.whatsapp     = whatsapp
    if (experience   !== undefined) update.experience   = Number(experience)
    if (achievements !== undefined) update.achievements = achievements
    if (socialLinks  !== undefined) update.socialLinks  = socialLinks
    if (isVisible    !== undefined) update.isVisible    = isVisible

    const owner = await OwnerProfile.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true },
    )

    revalidateTag('owner', 'default')
    return successResponse(owner)
  } catch (err) {
    console.error('[POST /api/owner]', err)
    return errorResponse('Internal server error.', 500)
  }
}
