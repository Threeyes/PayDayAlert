import { getDayTotal, getLast7Days } from '@/lib/engine'
import { formatAmount } from '@/lib/format'
import type { Receipt, UnitConfig } from '@/lib/types'
import { cn } from '@/lib/utils'

interface WeeklyChartProps {
  history: Receipt[]
  unit: UnitConfig
  now: number
}

export function WeeklyChart({ history, unit, now }: WeeklyChartProps) {
  const ref = new Date(now)
  const bars = getLast7Days(history, ref)
  const max = Math.max(1, ...bars.map((bar) => bar.total))
  const weekTotal = bars.reduce((sum, bar) => sum + bar.total, 0)
  const todayTotal = getDayTotal(history, ref)

  return (
    <section className="animate-card-in glass rounded-[26px] p-5 shadow-card" style={{ animationDelay: '240ms' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">近 7 日进账</p>
          <p className="font-display tnum mt-1 text-[20px] font-semibold text-white/85">
            {formatAmount(weekTotal, unit)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">今日</p>
          <p className="tnum mt-1 text-[12px] text-mint-300">+{formatAmount(todayTotal, unit)}</p>
        </div>
      </div>

      <div className="mt-5 flex items-end gap-2">
        {bars.map((bar) => {
          const height = bar.total > 0 ? Math.max(8, (bar.total / max) * 92) : 5
          return (
            <div key={bar.key} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="flex h-[96px] w-full items-end justify-center"
                title={`${bar.label} · ${formatAmount(bar.total, unit)}`}
              >
                <div
                  className={cn(
                    'w-full max-w-[24px] rounded-full transition-all duration-700 ease-out',
                    bar.isToday
                      ? 'bg-gradient-to-t from-mint-600 via-mint-400 to-mint-300 shadow-[0_0_18px_rgba(76,224,168,0.28)]'
                      : bar.total > 0
                        ? 'bg-white/20'
                        : 'bg-white/[0.06]',
                  )}
                  style={{ height: `${height}px` }}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] transition-colors',
                  bar.isToday ? 'font-semibold text-mint-300' : 'text-white/30',
                )}
              >
                {bar.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
