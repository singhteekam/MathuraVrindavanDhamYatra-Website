import { NextRequest }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import User                 from '@/models/User'
import { successResponse, errorResponse } from '@/lib/apiResponse'

interface Params {
  params: Promise<{ userId: string }>
}

// PATCH /api/users/[userId] — superadmin only: change role or isActive
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string; id?: string } | undefined

    // Only superadmin can change user roles / status
    if (user?.role !== 'superadmin') {
      return errorResponse('Forbidden. Superadmin access required.', 403)
    }

    const { userId } = await params
    const body        = await req.json()
    const { role, isActive } = body

    // Validate role if provided
    const VALID_ROLES = ['customer', 'driver', 'admin', 'superadmin']
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return errorResponse(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}.`)
    }

    // Cannot remove your own superadmin role
    if (user.id === userId && role && role !== 'superadmin') {
      return errorResponse('You cannot remove your own superadmin role.')
    }

    await connectDB()

    const updateFields: Record<string, unknown> = {}
    if (role      !== undefined) updateFields.role     = role
    if (isActive  !== undefined) updateFields.isActive = isActive

    if (Object.keys(updateFields).length === 0) {
      return errorResponse('No valid fields to update.')
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true },
    ).select('-password')

    if (!updated) return errorResponse('User not found.', 404)

    return successResponse({
      user:    updated,
      message: 'User updated successfully.',
    })
  } catch (err) {
    console.error('[PATCH /api/users/:userId]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// GET /api/users/[userId] — admin/superadmin: get single user with enriched stats
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin' && user?.role !== 'admin') {
      return errorResponse('Forbidden.', 403)
    }

    const { userId } = await params
    await connectDB()

    const found = await User.findById(userId).select('-password').lean()
    if (!found) return errorResponse('User not found.', 404)

    // Admins can only view customers
    if (user?.role === 'admin' && found.role !== 'customer') {
      return errorResponse('Forbidden.', 403)
    }

    const enriched: Record<string, unknown> = { ...found }

    // ── Enrich customer with booking stats ───────────────────────────────────
    if (found.role === 'customer') {
      const Booking = (await import('@/models/Booking')).default
      const [bookingStats] = await Booking.aggregate([
        { $match: { customer: found._id } },
        {
          $group: {
            _id:         null,
            bookingCount: { $sum: 1 },
            totalSpent:   { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0] } },
            lastBooking:  { $max: '$startDate' },
          },
        },
      ])
      if (bookingStats) {
        enriched.bookingCount = bookingStats.bookingCount
        enriched.totalSpent   = bookingStats.totalSpent
        enriched.lastBooking  = bookingStats.lastBooking
      }
    }

    // ── Enrich driver with vehicle & earnings info ────────────────────────────
    if (found.role === 'driver') {
      const Driver = (await import('@/models/Driver')).default
      const driver = await Driver.findOne({ userId: found._id })
        .select('licenseNumber isVerified rating totalTrips earnings vehicle')
        .lean()
      if (driver) {
        enriched.licenseNumber = driver.licenseNumber
        enriched.isVerified    = driver.isVerified
        enriched.rating        = driver.rating
        enriched.totalTrips    = driver.totalTrips
        enriched.earnings      = driver.earnings
        enriched.vehicle       = driver.vehicle
      }
    }

    return successResponse(enriched)
  } catch (err) {
    console.error('[GET /api/users/:userId]', err)
    return errorResponse('Internal server error.', 500)
  }
}
