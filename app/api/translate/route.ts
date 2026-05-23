import { NextRequest }      from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { translateToHindi }  from '@/lib/translate'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// POST /api/translate — admin/superadmin only, translates a single text to Hindi
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { text } = await req.json()
    if (!text || typeof text !== 'string') return errorResponse('text is required.')

    const translated = await translateToHindi(text.trim())
    return successResponse({ translated })
  } catch (err) {
    console.error('[POST /api/translate]', err)
    return errorResponse('Internal server error.', 500)
  }
}
