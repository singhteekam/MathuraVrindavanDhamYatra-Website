import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Driver from '@/models/Driver'
import { successResponse, errorResponse } from '@/lib/apiResponse'

interface Params {
  params: Promise<{ driverId: string }>
}

// GET /api/drivers/[driverId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { id?: string; role?: string } | undefined
    if (!user) return errorResponse('Unauthorized.', 401)

    const { driverId } = await params
    await connectDB()

    const driver = await Driver.findById(driverId).lean()
    if (!driver) return errorResponse('Driver not found.', 404)

    // Driver can only see their own profile; admin and superadmin can see all
    if (user.role !== 'admin' && user.role !== 'superadmin' && driver.userId.toString() !== user.id) {
      return errorResponse('Forbidden.', 403)
    }

    return successResponse(driver)
  } catch (err) {
    console.error('[GET /api/drivers/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// PATCH /api/drivers/[driverId] — driver updates availability; admin/superadmin can verify
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { id?: string; role?: string } | undefined
    if (!user) return errorResponse('Unauthorized.', 401)

    const { driverId } = await params
    const body         = await req.json()

    await connectDB()

    const driver = await Driver.findById(driverId)
    if (!driver) return errorResponse('Driver not found.', 404)

    const isOwnProfile = driver.userId.toString() === user.id
    const isAdmin      = user.role === 'admin' || user.role === 'superadmin'

    if (!isOwnProfile && !isAdmin) return errorResponse('Forbidden.', 403)

    // Driver can toggle availability
    if (isOwnProfile || isAdmin) {
      if (body.isAvailable !== undefined) driver.isAvailable = body.isAvailable
    }

    // Admin can update all profile fields
    if (isAdmin) {
      if (body.isVerified   !== undefined) driver.isVerified   = body.isVerified
      if (body.name)                       driver.name         = body.name
      if (body.phone)                      driver.phone        = body.phone
      if (body.gender)                     driver.set('gender', body.gender)
      if (body.avatar       !== undefined) driver.set('avatar',       body.avatar)
      if (body.licenseNumber)              driver.licenseNumber = body.licenseNumber
      if (body.aadharNumber !== undefined) driver.set('aadharNumber', body.aadharNumber)
      if (body.aadharFront  !== undefined) driver.set('aadharFront',  body.aadharFront)
      if (body.aadharBack   !== undefined) driver.set('aadharBack',   body.aadharBack)
      if (body.panNumber    !== undefined) driver.set('panNumber',    body.panNumber)
      if (body.panCard      !== undefined) driver.set('panCard',      body.panCard)
      if (body.rating       !== undefined) driver.set('rating',       Number(body.rating))
      if (body.vehicle)                    driver.vehicle = { ...driver.vehicle, ...body.vehicle }
    }

    await driver.save()
    return successResponse(driver)
  } catch (err) {
    console.error('[PATCH /api/drivers/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// DELETE /api/drivers/[driverId] — admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { driverId } = await params
    await connectDB()

    await Driver.findByIdAndDelete(driverId)
    return successResponse({ message: 'Driver removed successfully.' })
  } catch (err) {
    console.error('[DELETE /api/drivers/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}
