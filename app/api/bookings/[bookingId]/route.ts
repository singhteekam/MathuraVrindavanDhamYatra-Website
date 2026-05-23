import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Booking from '@/models/Booking'
import Driver  from '@/models/Driver'
import { sendBookingUpdateEmail, sendDriverAssignedEmail } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/apiResponse'

interface Params {
  params: Promise<{ bookingId: string }>
}

// GET /api/bookings/[bookingId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse('Unauthorized.', 401)

    const { bookingId } = await params
    await connectDB()

    const booking = await Booking.findOne({ bookingId })
      .populate('customer', 'name email phone')
      .populate('package',  'name slug duration cities')
      .populate('driver',   'name phone vehicle rating avatar gender isVerified')
      .lean()

    if (!booking) return errorResponse('Booking not found.', 404)

    const user = session.user as { id: string; role: string }

    // Customers can only view their own bookings; guest bookings are admin-only
    if (
      user.role !== 'admin' &&
      user.role !== 'superadmin' &&
      user.role !== 'driver' &&
      (booking.customer as any)?._id?.toString() !== user.id
    ) {
      return errorResponse('Forbidden.', 403)
    }

    return successResponse(booking)
  } catch (err) {
    console.error('[GET /api/bookings/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// PATCH /api/bookings/[bookingId] — update status, assign driver, add notes
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse('Unauthorized.', 401)

    const { bookingId } = await params
    const body = await req.json()
    const user = session.user as { id: string; role: string }

    await connectDB()

    const booking = await Booking.findOne({ bookingId })
    if (!booking) return errorResponse('Booking not found.', 404)

    let notifyCustomer = false

    // Admin and superadmin can update any booking field
    if (user.role === 'admin' || user.role === 'superadmin') {
      const adminFields = [
        'status', 'driver', 'adminNotes', 'paymentStatus', 'cancelReason',
        'paidAmount', 'paymentMethod', 'totalAmount', 'advanceAmount',
        'carType', 'carName', 'startDate', 'endDate', 'pickupLocation',
        'dropLocation', 'totalPassengers', 'customerName', 'customerEmail',
        'customerPhone', 'specialRequests',
      ]
      for (const field of adminFields) {
        if (body[field] !== undefined) booking.set(field, body[field])
      }
      notifyCustomer = true
    }
    // Driver can only update trip status to ongoing or completed
    else if (user.role === 'driver') {
      const driverStatuses = ['ongoing', 'completed']
      if (body.status && driverStatuses.includes(body.status)) {
        booking.set('status', body.status)
        notifyCustomer = true
      }
    }
    // Customer can cancel or switch unpaid online booking to cash
    else if (booking.customer?.toString() === user.id) {
      if (body.status === 'cancelled') {
        booking.set('status',       'cancelled')
        booking.set('cancelReason', body.cancelReason ?? 'Cancelled by customer')
        notifyCustomer = true
      }
      if (
        body.paymentMethod === 'cash' &&
        ['online_full', 'online_advance'].includes((booking.get('paymentMethod') as string) ?? '') &&
        ((booking.get('paidAmount') as number) ?? 0) === 0 &&
        booking.status === 'pending'
      ) {
        booking.set('paymentMethod', 'cash')
        notifyCustomer = true
      }
    } else {
      return errorResponse('Forbidden.', 403)
    }

    await booking.save()

    // Send emails to customer (fire-and-forget)
    if (notifyCustomer) {
      try {
        const populated = await Booking.findById(booking._id)
          .populate<{ customer: { name: string; email: string } | null }>('customer', 'name email')
          .populate<{ driver: { name: string; phone: string } | null }>('driver', 'name phone')
          .lean()

        const toEmail = populated?.customer?.email ?? (populated?.customerEmail as string | undefined)
        const toName  = populated?.customer?.name  ?? (populated?.customerName  as string | undefined) ?? 'Customer'
        const driverBasic = populated?.driver
        const startRaw  = booking.get('startDate') as Date | string | undefined
        const startStr  = startRaw ? new Date(startRaw).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : ''

        if (toEmail) {
          // General update email (always)
          sendBookingUpdateEmail({
            bookingId:      booking.get('bookingId')     as string,
            customerName:   toName,
            customerEmail:  toEmail,
            status:         booking.get('status')        as string,
            paymentStatus:  booking.get('paymentStatus') as string,
            totalAmount:    (booking.get('totalAmount')  as number) ?? 0,
            paidAmount:     (booking.get('paidAmount')   as number) ?? 0,
            startDate:      startStr,
            carName:        booking.get('carName')        as string,
            pickupLocation: booking.get('pickupLocation') as string,
            adminNotes:     booking.get('adminNotes')     as string | undefined,
            cancelReason:   booking.get('cancelReason')   as string | undefined,
            driverName:     driverBasic?.name,
            driverPhone:    driverBasic?.phone,
          }).catch(console.error)

          // Driver-assigned email — only when driver is explicitly set/changed in this request
          if (body.driver) {
            const fullDriver = await Driver.findById(body.driver as string).lean()
            if (fullDriver) {
              sendDriverAssignedEmail({
                bookingId:      booking.get('bookingId')      as string,
                customerName:   toName,
                customerEmail:  toEmail,
                startDate:      startStr,
                pickupLocation: booking.get('pickupLocation') as string,
                driver: {
                  name:       fullDriver.name,
                  phone:      fullDriver.phone,
                  gender:     (fullDriver as any).gender as string | undefined,
                  avatar:     fullDriver.avatar,
                  rating:     fullDriver.rating,
                  isVerified: fullDriver.isVerified,
                  vehicle: {
                    name:   fullDriver.vehicle.name,
                    number: fullDriver.vehicle.number,
                    color:  fullDriver.vehicle.color,
                    type:   fullDriver.vehicle.type,
                    image:  fullDriver.vehicle.image,
                  },
                },
              }).catch(console.error)
            }
          }
        }
      } catch (emailErr) {
        console.error('[PATCH /api/bookings/:id] email error:', emailErr)
      }
    }

    return successResponse(booking)
  } catch (err) {
    console.error('[PATCH /api/bookings/:id]', err)
    return errorResponse('Internal server error.', 500)
  }
}
