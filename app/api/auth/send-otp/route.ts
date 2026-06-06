import { NextRequest } from 'next/server'
import crypto          from 'crypto'
import { connectDB }   from '@/lib/db'
import User            from '@/models/User'
import { sendOTPEmail } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// POST /api/auth/send-otp — generate + store OTP and email it
// Used for: new registration resend, login-flow resend
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return errorResponse('Email is required.')

    await connectDB()

    // lean() — just need the plain fields to check status
    const user = await User
      .findOne({ email: email.toLowerCase().trim() })
      .lean()

    if (!user) return errorResponse('No account found with this email.', 404)

    if (user.emailVerified) {
      return errorResponse('This email is already verified.', 409)
    }

    // Rate-limit: don't resend if last OTP was issued less than 60 seconds ago
    if (user.otpExpiry && user.otpExpiry.getTime() - Date.now() > 9 * 60 * 1000) {
      return errorResponse('OTP already sent. Please wait a moment before requesting again.', 429)
    }

    const otp = crypto.randomInt(100000, 1000000).toString()

    // updateOne bypasses any Document-level issues — writes directly to MongoDB
    await User.updateOne(
      { _id: user._id },
      { $set: { otpCode: otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) } },
    )

    await sendOTPEmail(email, user.name, otp)

    return successResponse({ sent: true })
  } catch (err) {
    console.error('[POST /api/auth/send-otp]', err)
    return errorResponse('Failed to send OTP.', 500)
  }
}
