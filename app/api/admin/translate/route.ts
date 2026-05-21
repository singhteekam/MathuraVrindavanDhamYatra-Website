import { NextRequest }       from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// POST /api/admin/translate — admin/superadmin only
// Translates a single English string to Hindi via MyMemory free API
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user    = session?.user as { role?: string } | undefined
  if (!user?.role || !['admin', 'superadmin'].includes(user.role)) {
    return errorResponse('Unauthorized.', 401)
  }

  let text: string
  try {
    const body = await req.json()
    text = body.text?.toString().trim() ?? ''
  } catch {
    return errorResponse('Invalid request body.')
  }

  if (!text) return errorResponse('text is required.')
  if (text.length > 500) return errorResponse('Text must be 500 characters or fewer.')

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en%7Chi`
    const res  = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) return errorResponse('Translation service unavailable.', 503)

    const data = await res.json()
    if (data.responseStatus !== 200) {
      return errorResponse(data.responseDetails ?? 'Translation failed.', 502)
    }

    return successResponse({ translated: data.responseData.translatedText as string })
  } catch {
    return errorResponse('Translation service unavailable.', 503)
  }
}
