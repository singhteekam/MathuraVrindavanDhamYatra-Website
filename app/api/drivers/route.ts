import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Driver from '@/models/Driver'
import User from '@/models/User'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'
import bcrypt from 'bcryptjs'

// GET /api/drivers — admin only, list all drivers
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page      = Number(searchParams.get('page')      ?? 1)
    const limit     = Number(searchParams.get('limit')     ?? 20)
    const available = searchParams.get('available') === 'true'
    const verified  = searchParams.get('verified')  === 'true'
    const carType   = searchParams.get('carType')
    const skip      = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (available)  filter.isAvailable     = true
    if (verified)   filter.isVerified      = true
    if (carType)    filter['vehicle.type'] = carType

    const [drivers, total] = await Promise.all([
      Driver.find(filter)
        .sort({ isAvailable: -1, rating: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Driver.countDocuments(filter),
    ])

    return paginatedResponse(drivers, page, limit, total)
  } catch (err) {
    console.error('[GET /api/drivers]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/drivers — admin only, create a new driver account
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const body = await req.json()
    const {
      name, email, phone, password, licenseNumber, vehicle, gender,
      avatar, aadharNumber, aadharFront, aadharBack, panNumber, panCard,
    } = body

    if (!name || !email || !phone || !password || !licenseNumber || !vehicle) {
      return errorResponse('All fields are required.')
    }

    await connectDB()

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) return errorResponse('A user with this email already exists.', 409)

    // Create user account with driver role
    const hashed  = await bcrypt.hash(password, 12)
    const newUser = await User.create({
      name, email, phone,
      password: hashed,
      role:     'driver',
    })

    // Create driver profile
    const driver = await Driver.create({
      userId:        newUser._id,
      name, email, phone,
      licenseNumber,
      vehicle,
      ...(gender       ? { gender }       : {}),
      ...(avatar       ? { avatar }       : {}),
      ...(aadharNumber ? { aadharNumber } : {}),
      ...(aadharFront  ? { aadharFront }  : {}),
      ...(aadharBack   ? { aadharBack }   : {}),
      ...(panNumber    ? { panNumber }    : {}),
      ...(panCard      ? { panCard }      : {}),
    })

    return successResponse({ user: newUser._id, driver: driver._id }, 201)
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return errorResponse('Driver with this license or email already exists.', 409)
    }
    console.error('[POST /api/drivers]', err)
    return errorResponse('Internal server error.', 500)
  }
}