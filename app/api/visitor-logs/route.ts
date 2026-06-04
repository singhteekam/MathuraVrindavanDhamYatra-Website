import { NextRequest }       from 'next/server'
import { createHmac }        from 'crypto'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { connectDB }         from '@/lib/db'
import VisitorLog            from '@/models/VisitorLog'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// ── IST period keys ───────────────────────────────────────────────────────────
function getPeriodKeysIST() {
  const now   = new Date()
  const ist   = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const y     = ist.getFullYear()
  const m     = String(ist.getMonth() + 1).padStart(2, '0')
  const d     = String(ist.getDate()).padStart(2, '0')
  const dayKey   = `${y}-${m}-${d}`
  const monthKey = `${y}-${m}`
  // ISO week (Monday start)
  const temp  = new Date(Date.UTC(y, ist.getMonth(), ist.getDate()))
  const dow   = (temp.getUTCDay() + 6) % 7
  temp.setUTCDate(temp.getUTCDate() - dow + 3)
  const week1 = new Date(Date.UTC(temp.getUTCFullYear(), 0, 4))
  const weekNum = 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getUTCDay() + 6) % 7) / 7)
  const weekKey = `${y}-W${String(weekNum).padStart(2, '0')}`
  return { dayKey, weekKey, monthKey }
}

// ── IP hash (privacy-safe) ────────────────────────────────────────────────────
function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? 'mvdhamyatra_salt_2024'
  return createHmac('sha256', salt).update(ip).digest('hex').slice(0, 16)
}

// ── POST /api/visitor-logs — log a page visit ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    const {
      page, visitorId, sessionId, device, browser,
      os, referrer, utm, timeOnPage,
    } = body as Record<string, string | number>

    if (!page) return errorResponse('page is required.', 400)

    // Get IP (Vercel/Cloudflare headers)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0'

    // Country/city from hosting headers (Vercel / Cloudflare)
    const country = (
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-country-code') ||
      ''
    ).toUpperCase()

    const city = (
      req.headers.get('x-vercel-ip-city') ||
      req.headers.get('cf-ipcity') ||
      ''
    )

    const { dayKey, weekKey, monthKey } = getPeriodKeysIST()

    await connectDB()

    await VisitorLog.create({
      page:       String(page).slice(0, 500),
      visitorId:  String(visitorId ?? '').slice(0, 64),
      sessionId:  String(sessionId ?? '').slice(0, 64),
      device:     String(device  ?? 'desktop').slice(0, 20),
      browser:    String(browser ?? '').slice(0, 50),
      os:         String(os      ?? '').slice(0, 50),
      country:    country.slice(0, 4),
      city:       city.slice(0, 100),
      ipHash:     hashIP(ip),
      referrer:   String(referrer ?? '').slice(0, 500),
      utm:        String(utm      ?? '').slice(0, 200),
      timeOnPage: Number(timeOnPage ?? 0),
      dayKey, weekKey, monthKey,
    })

    return successResponse({ logged: true })
  } catch (err) {
    console.error('[POST /api/visitor-logs]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// ── GET /api/visitor-logs — analytics (superadmin only) ──────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'superadmin' && user?.role !== 'admin') {
      return errorResponse('Forbidden.', 403)
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const range   = searchParams.get('range') ?? 'today'     // today | week | month | all
    const limit   = Math.min(Number(searchParams.get('limit') ?? 100), 500)

    // Build date filter
    const { dayKey, weekKey, monthKey } = getPeriodKeysIST()
    const filter: Record<string, string> = {}
    if (range === 'today')  filter.dayKey   = dayKey
    if (range === 'week')   filter.weekKey  = weekKey
    if (range === 'month')  filter.monthKey = monthKey
    // 'all' = no filter (last 90 days)

    // Run aggregations in parallel
    const [
      totalHits,
      uniqueVisitors,
      topPages,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      countryBreakdown,
      referrerBreakdown,
      recent,
    ] = await Promise.all([
      VisitorLog.countDocuments(filter),
      VisitorLog.distinct('visitorId', { ...filter, visitorId: { $ne: '' } }).then(r => r.length),
      VisitorLog.aggregate([
        { $match: filter },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 15 },
      ]),
      VisitorLog.aggregate([
        { $match: filter },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]),
      VisitorLog.aggregate([
        { $match: filter },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 8 },
      ]),
      VisitorLog.aggregate([
        { $match: filter },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 8 },
      ]),
      VisitorLog.aggregate([
        { $match: filter },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 12 },
      ]),
      VisitorLog.aggregate([
        { $match: { ...filter, referrer: { $ne: '' } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 10 },
      ]),
      VisitorLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('page device browser os country city referrer utm timeOnPage visitorId timestamp')
        .lean(),
    ])

    return successResponse({
      range,
      totalHits,
      uniqueVisitors,
      topPages,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      countryBreakdown,
      referrerBreakdown,
      recent,
    })
  } catch (err) {
    console.error('[GET /api/visitor-logs]', err)
    return errorResponse('Internal server error.', 500)
  }
}
