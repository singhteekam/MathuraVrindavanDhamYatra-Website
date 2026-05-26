import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatCardProps {
  label:    string
  value:    number | string
  icon:     ReactNode
  color:    string
  bg:       string
  prefix?:  string
  suffix?:  string
  isCurrency?: boolean
  growth?:  number  // % change, positive = up, negative = down
  sub?:     string
}

export default function StatCard({
  label, value, icon, color, bg,
  prefix, suffix, isCurrency, growth, sub,
}: StatCardProps) {
  const displayValue = isCurrency
    ? formatCurrency(Number(value))
    : `${prefix ?? ''}${Number(value).toLocaleString('en-IN')}${suffix ?? ''}`

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
        {growth !== undefined && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
            style={
              growth > 0
                ? { background: 'var(--surface-green)', color: 'var(--text-on-green)' }
                : growth < 0
                ? { background: 'var(--surface-red)',   color: 'var(--text-on-red)'   }
                : { background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }
            }
          >
            {growth > 0 ? <TrendingUp size={11} /> : growth < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-0.5">{displayValue}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}