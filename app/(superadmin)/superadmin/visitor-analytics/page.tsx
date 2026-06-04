'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, Monitor, Smartphone, Tablet, Chrome,
  TrendingUp, Users, Eye, MapPin, Link as LinkIcon,
  RefreshCw, Clock, Calendar, Activity, BarChart2,
} from 'lucide-react'

// ── types ─────────────────────────────────────────────────────────────────────
interface AggEntry { _id: string; count: number }
interface RecentLog {
  _id: string; page: string; device: string; browser: string; os: string
  country: string; city: string; referrer: string; utm: string
  timeOnPage: number; visitorId: string; timestamp: string
}
interface Analytics {
  range:              string
  totalHits:          number
  uniqueVisitors:     number
  topPages:           AggEntry[]
  deviceBreakdown:    AggEntry[]
  browserBreakdown:   AggEntry[]
  osBreakdown:        AggEntry[]
  countryBreakdown:   AggEntry[]
  referrerBreakdown:  AggEntry[]
  recent:             RecentLog[]
}

// ── helpers ───────────────────────────────────────────────────────────────────
const RANGE_TABS = [
  { value: 'today',  label: 'Today'       },
  { value: 'week',   label: 'This Week'   },
  { value: 'month',  label: 'This Month'  },
  { value: 'all',    label: 'All Time'    },
]

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor   size={14} />,
  mobile:  <Smartphone size={14} />,
  tablet:  <Tablet    size={14} />,
}
const DEVICE_COLORS: Record<string, string> = {
  desktop: '#4338ca',
  mobile:  '#ff7d0f',
  tablet:  '#16a34a',
}

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐'
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0)),
  )
}

function formatPageLabel(page: string): string {
  if (!page || page === '/') return '🏠 Home'
  return page.replace('/en/', '/').replace('/hi/', '/').slice(0, 50)
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Bar chart component ───────────────────────────────────────────────────────
function BarList({ items, color = '#ff7d0f', label = 'Visits' }: {
  items: AggEntry[]; color?: string; label?: string
}) {
  const max = items[0]?.count || 1
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={item._id || i}>
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[65%]">
              {item._id || '(unknown)'}
            </span>
            <span className="font-bold text-gray-900 dark:text-gray-100 shrink-0 ml-2">
              {item.count.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-muted)' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="h-full rounded-full" style={{ background: color }} />
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No data for this period</p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VisitorAnalyticsPage() {
  const [data,     setData]     = useState<Analytics | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [range,    setRange]    = useState('today')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetch_data = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/visitor-logs?range=${range}&limit=50`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setLastRefresh(new Date())
      }
    } catch {}
    finally { setLoading(false) }
  }, [range])

  useEffect(() => { fetch_data() }, [fetch_data])

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(fetch_data, 60_000)
    return () => clearInterval(t)
  }, [fetch_data])

  const totalDeviceHits = data?.deviceBreakdown.reduce((s, d) => s + d.count, 0) || 1

  return (
    <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Activity size={16} className="text-saffron-500" />
            <p className="text-xs font-semibold text-saffron-600 uppercase tracking-wide">Superadmin</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Visitor Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Last refreshed: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · auto-updates every 60s
          </p>
        </div>
        <button onClick={fetch_data} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 shrink-0"
          style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Range tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {RANGE_TABS.map(tab => (
          <button key={tab.value} onClick={() => setRange(tab.value)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={range === tab.value
              ? { background: '#ff7d0f', color: '#fff' }
              : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Page Views',       value: (data?.totalHits      ?? 0).toLocaleString(), icon: <Eye       size={20} />, color: '#ff7d0f', bg: 'var(--surface-saffron)'  },
              { label: 'Unique Visitors',  value: (data?.uniqueVisitors ?? 0).toLocaleString(), icon: <Users     size={20} />, color: '#4338ca', bg: 'var(--surface-krishna)'  },
              { label: 'Top Page',         value: data?.topPages[0]     ? formatPageLabel(data.topPages[0]._id).slice(0, 20) : '—',
                                                                                                 icon: <TrendingUp size={20}/>, color: '#16a34a', bg: 'var(--surface-green)'    },
              { label: 'Countries',        value: (data?.countryBreakdown.length ?? 0).toString(), icon: <Globe  size={20} />, color: '#db2777', bg: 'var(--surface-red)'       },
            ].map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: stat.bg, color: stat.color }}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Middle row */}
          <div className="grid lg:grid-cols-3 gap-5 mb-5">

            {/* Top pages */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card rounded-2xl p-5 lg:col-span-2">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <BarChart2 size={15} className="text-saffron-500" />Top Pages
              </h3>
              {(data?.topPages ?? []).map((p, i) => {
                const max = data?.topPages[0]?.count || 1
                return (
                  <div key={p._id || i} className="mb-3">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[75%]">
                        {formatPageLabel(p._id)}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-100 shrink-0">{p.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-muted)' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(p.count / max) * 100}%` }}
                        transition={{ delay: i * 0.04, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: `hsl(${25 + i * 15}, 80%, 55%)` }} />
                    </div>
                  </div>
                )
              })}
              {(data?.topPages?.length ?? 0) === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No page views yet</p>
              )}
            </motion.div>

            {/* Devices */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <Monitor size={15} className="text-saffron-500" />Devices
              </h3>
              <div className="space-y-3">
                {(data?.deviceBreakdown ?? []).map(d => (
                  <div key={d._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--bg-surface-muted)', color: DEVICE_COLORS[d._id] ?? '#6b7280' }}>
                      {DEVICE_ICONS[d._id] ?? <Monitor size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{d._id || 'Unknown'}</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{((d.count / totalDeviceHits) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-muted)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.count / totalDeviceHits) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: DEVICE_COLORS[d._id] ?? '#6b7280' }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{d.count}</span>
                  </div>
                ))}
                {(data?.deviceBreakdown?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No data</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Lower row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <div className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-sm">
                <Chrome size={14} className="text-saffron-500" />Browsers
              </h3>
              <BarList items={data?.browserBreakdown ?? []} color="#4338ca" />
            </div>
            <div className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-sm">
                <Monitor size={14} className="text-saffron-500" />Operating Systems
              </h3>
              <BarList items={data?.osBreakdown ?? []} color="#16a34a" />
            </div>
            <div className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-sm">
                <Globe size={14} className="text-saffron-500" />Countries
              </h3>
              <div className="space-y-2">
                {(data?.countryBreakdown ?? []).map((c, i) => (
                  <div key={c._id || i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-base">{countryFlag(c._id)}</span>
                      {c._id || 'Unknown'}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{c.count}</span>
                  </div>
                ))}
                {(data?.countryBreakdown?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No data</p>
                )}
              </div>
            </div>
            <div className="card rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-sm">
                <LinkIcon size={14} className="text-saffron-500" />Referrers
              </h3>
              <div className="space-y-2">
                {(data?.referrerBreakdown ?? []).map((r, i) => {
                  let label = r._id || 'Direct'
                  try { label = new URL(r._id).hostname } catch {}
                  return (
                    <div key={r._id || i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300 truncate max-w-[75%]">{label}</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100 shrink-0">{r.count}</span>
                    </div>
                  )
                })}
                {(data?.referrerBreakdown?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No referrers</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent visits table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock size={15} className="text-saffron-500" />Recent Visits
              </h3>
              <span className="text-xs text-gray-400">{data?.recent.length ?? 0} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr style={{ background: 'var(--bg-surface-muted)', borderBottom: '1px solid var(--border-muted)' }}>
                    {['Time', 'Page', 'Device', 'Browser / OS', 'Country', 'Referrer', 'Time on Page'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent ?? []).map((log, i) => {
                    let ref = ''
                    try { ref = log.referrer ? new URL(log.referrer).hostname : '' } catch { ref = log.referrer }
                    return (
                      <tr key={log._id || i}
                        className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {timeAgo(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate block" title={log.page}>
                            {formatPageLabel(log.page)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 capitalize">
                            {DEVICE_ICONS[log.device] ?? <Monitor size={11} />}
                            {log.device}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {log.browser} / {log.os}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <span className="text-sm">{countryFlag(log.country)}</span>
                            {log.city ? `${log.city}, ` : ''}{log.country || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                          {ref || <span className="text-gray-300">Direct</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {log.timeOnPage > 0 ? `${log.timeOnPage}s` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                  {(data?.recent?.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        No visits recorded for this period yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
