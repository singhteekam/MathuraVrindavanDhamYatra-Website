import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { connectDB }         from '@/lib/db'
import Booking              from '@/models/Booking'
import User                 from '@/models/User'
import { sendBookingConfirmation } from '@/lib/email'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/apiResponse'
import { generateBookingId } from '@/lib/utils'
import bcrypt from 'bcryptjs'

// POST /api/bookings — create a new booking (auth required for online payment; guests allowed for cash/whatsapp)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body    = await req.json()
    const {
      packageId,
      carType,
      carName,
      startDate,
      endDate,
      duration,
      pickupLocation,
      dropLocation,
      totalPassengers,
      totalAmount,
      advanceAmount,
      addons,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
    } = body

    if (!carType || !startDate || !pickupLocation || !totalAmount) {
      return errorResponse('Missing required booking fields.')
    }

    const resolvedMethodEarly = (body.paymentMethod ?? 'cash') as string
    const isOnlinePaymentEarly = resolvedMethodEarly === 'online_full' || resolvedMethodEarly === 'online_advance'

    // Online payment requires auth; cash/whatsapp allowed as guest
    if (!session?.user && isOnlinePaymentEarly) {
      return errorResponse('You must be signed in to pay online.', 401)
    }

    // Guest booking requires contact details
    if (!session?.user && (!customerName || !customerPhone || !customerEmail)) {
      return errorResponse('Name, phone, and email are required for guest booking.')
    }

    await connectDB()

    const customerId  = session?.user ? (session.user as { id: string }).id : null
    const bookingId   = generateBookingId()
    const calcAdvance = advanceAmount ?? 500   // frontend always sends the admin-set amount; 500 is a safe fallback

    const resolvedMethod = paymentMethod ?? 'cash'
    const booking = await Booking.create({
      bookingId,
      ...(customerId ? { customer: customerId } : {}),
      package:        packageId  ?? undefined,
      carType,
      carName:        carName    ?? carType,
      startDate:      new Date(startDate),
      endDate:        endDate ? new Date(endDate) : new Date(startDate),
      duration:       duration   ?? 1,
      pickupLocation: pickupLocation.trim(),
      dropLocation:   dropLocation ?? undefined,
      totalPassengers:totalPassengers ?? 1,
      totalAmount,
      advanceAmount:  calcAdvance,
      paidAmount:     0,          // nothing paid yet — updated by /payment/verify
      addons:         addons     ?? [],
      specialRequests:specialRequests ?? undefined,
      customerName:   customerName   ?? undefined,
      customerPhone:  customerPhone  ?? undefined,
      customerEmail:  customerEmail  ?? undefined,  // form-entered email (may differ from account email)
      paymentMethod:  resolvedMethod,
      status:         'pending',
      paymentStatus:  'pending',
    })

    // Send confirmation email only for non-online methods (cash / whatsapp).
    // Online payment bookings get their email after /api/payment/verify succeeds.
    const isOnlinePayment = resolvedMethod === 'online_full' || resolvedMethod === 'online_advance'
    if (!isOnlinePayment) {
      // Collect both account email and form-entered email, deduplicated
      const emailList = [session?.user?.email, customerEmail]
        .filter((e): e is string => Boolean(e?.trim()))
      if (emailList.length > 0) {
        sendBookingConfirmation({
          bookingId,
          customerName:   customerName ?? session?.user?.name ?? 'Valued Customer',
          customerEmail:  emailList,
          carName:        carName ?? carType,
          startDate:      new Date(startDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
          }),
          pickupLocation: pickupLocation.trim(),
          totalAmount,
        }).catch(console.error)
      }
    }

    return successResponse(
      {
        bookingId,
        id:            booking._id.toString(),
        status:        'pending',
        totalAmount,
        advanceAmount: calcAdvance,
      },
      201,
    )
  } catch (err) {
    console.error('[POST /api/bookings]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// GET /api/bookings — list (admin: all, customer/driver: own)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse('Unauthorized.', 401)

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page       = Number(searchParams.get('page')       ?? 1)
    const limit      = Number(searchParams.get('limit')      ?? 10)
    const status     = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const skip       = (page - 1) * limit

    const user   = session.user as { id: string; role: string }
    const filter: Record<string, unknown> = {}

    if (user.role === 'driver') {
      // Drivers see bookings assigned to their driver profile
      // We look up their driver doc first
      const Driver = (await import('@/models/Driver')).default
      const driverDoc = await Driver.findOne({ userId: user.id }).select('_id').lean()
      if (!driverDoc) return successResponse({ data: [], pagination: { page: 1, limit, total: 0, pages: 0 } })
      filter.driver = driverDoc._id
    } else if (user.role !== 'admin' && user.role !== 'superadmin') {
      // Customers see only their own
      filter.customer = user.id
    }

    if (status) filter.status = status
    // Admin can filter by specific customer
    if (customerId && (user.role === 'admin' || user.role === 'superadmin')) {
      filter.customer = customerId
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email phone')
        .populate('package',  'name slug duration')
        .populate('driver',   'name phone vehicle')
        .lean(),
      Booking.countDocuments(filter),
    ])

    return paginatedResponse(bookings, page, limit, total)
  } catch (err) {
    console.error('[GET /api/bookings]', err)
    return errorResponse('Internal server error.', 500)
  }
}