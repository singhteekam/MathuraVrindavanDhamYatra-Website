import { NextRequest } from 'next/server'
import { connectDB }   from '@/lib/db'
import User            from '@/models/User'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// POST /api/auth/verify-otp — verify OTP and mark email as verified
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return errorResponse('Email and OTP are required.')

    await connectDB()

    // lean() returns a plain JS object — direct property access, no Mongoose Document wrapper issues
    const user = await User
      .findOne({ email: email.toLowerCase().trim() })
      .lean()

    if (!user) return errorResponse('No account found with this email.', 404)

    if (user.emailVerified) {
      return successResponse({ alreadyVerified: true, message: 'Email already verified.' })
    }

    const storedOtp = user.otpCode
    const otpExpiry = user.otpExpiry

    if (!storedOtp || !otpExpiry) {
      return errorResponse('No OTP found. Please request a new one.', 400)
    }

    if (Date.now() > otpExpiry.getTime()) {
      return errorResponse('OTP has expired. Please request a new one.', 410)
    }

    if (storedOtp.trim() !== otp.toString().trim()) {
      return errorResponse('Invalid OTP. Please try again.', 400)
    }

    // Verified — set emailVerified and clear OTP fields atomically
    await User.updateOne(
      { _id: user._id },
      {
        $set:   { emailVerified: new Date() },
        $unset: { otpCode: '', otpExpiry: '' },
      },
    )

    return successResponse({ verified: true })
  } catch (err) {
    console.error('[POST /api/auth/verify-otp]', err)
    return errorResponse('Verification failed.', 500)
  }
}
