import { NextRequest }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { connectDB }       from '@/lib/db'
import Settings            from '@/models/Settings'
import { successResponse, errorResponse } from '@/lib/apiResponse'

interface SettingsDoc {
  siteInfo?: unknown
  emailConfig?: unknown
}

// GET /api/admin/settings — load current settings
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    await connectDB()
    const settings = await Settings.findOne({ key: 'site' }).lean()
    return successResponse(settings ?? {})
  } catch (err) {
    console.error('[GET /api/admin/settings]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// POST /api/admin/settings — save settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const body = await req.json()
    const { siteInfo, emailConfig, bookingConfig } = body

    await connectDB()
    const existingSettings = await Settings.findOne({ key: 'site' }).lean() as SettingsDoc | null
    const isSuperAdmin = user.role === 'superadmin'

    // Upsert the singleton settings document
    const settings = await Settings.findOneAndUpdate(
      { key: 'site' },
      {
        $set: {
          key: 'site',
          siteInfo:      isSuperAdmin ? (siteInfo ?? {}) : (existingSettings?.siteInfo ?? {}),
          // Never persist raw passwords in DB — only save non-sensitive parts
          emailConfig:   isSuperAdmin
            ? {
                smtpHost: emailConfig?.smtpHost ?? '',
                smtpPort: emailConfig?.smtpPort ?? '587',
                // smtpUser and smtpPass stay in Vercel env vars — not stored in DB
              }
            : (existingSettings?.emailConfig ?? {}),
          bookingConfig: bookingConfig ?? {},
        },
      },
      { upsert: true, new: true },
    )

    return successResponse({ message: 'Settings saved.', settings })
  } catch (err) {
    console.error('[POST /api/admin/settings]', err)
    return errorResponse('Internal server error.', 500)
  }
}
