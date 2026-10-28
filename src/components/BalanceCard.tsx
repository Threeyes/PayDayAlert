import { Sparkles, TrendingUp } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import { formatAmount, splitAmount } from '@/lib/format'
import type { UnitConfig } from '@/lib/types'

interface BalanceCardProps {
  monthTotal: number
  goal: number
  progress: number
  todayTotal: number
  todayTarget: number
  daysLeft: number
  unit: UnitConfig
  monthTitle: string
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">{label}</p>
      <p className={`tnum mt-1 truncate text-[13px] font-semibold ${accent ? 'text-mint-300' : 'text-white/80'}`}>
        {value}
      </p>
    </div>
  )
}

export function BalanceCard({
  monthTotal,
  goal,
  progress,
  todayTotal,
  todayTarget,
  daysLeft,
  unit,
  monthTitle,
}: BalanceCardProps) {
  const display = useCountUp(monthTotal, 1100)
  const parts = splitAmount(display, unit)
  const percent = Math.max(0, Math.round(progress * 100))
  const done = progress >= 1

  return (
    <section className="animate-card-in glass relative overflow-hidden rounded-[28px] p-5 shadow-card">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(76,224,168,0.20),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/35">本月已到账</p>
            <p className="mt-1.5 text-[11px] text-white/30">{monthTitle}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/45">
            <TrendingUp size={11} className="text-mint-300" />
            目标 {formatAmount(goal, unit)}
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-1.5">
          {parts.lead ? (
            <span className="font-display text-[24px] font-medium text-white/45">{parts.lead}</span>
          ) : null}
          <span className="font-display tnum text-[46px] font-semibold leading-none tracking-[-0.035em] text-white sm:text-[54px]">
            {parts.number}
          </span>
          {parts.tail ? <span className="text-[14px] font-medium text-white/40">{parts.tail}</span> : null}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/40">目标进度</span>
            <span className={done ? 'flex items-center gap-1 text-gold-300' : 'tnum text-mint-300'}>
              {done ? <Sparkles size={11} /> : null}
              {percent}%
            </span>
          </div>
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={`relative h-full rounded-full transition-[width] duration-700 ease-out ${
                done
                  ? 'bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300'
                  : 'bg-gradient-to-r from-mint-600 via-mint-400 to-mint-300'
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            >
              <span className="absolute inset-y-0 left-0 w-1/3 animate-[pda-shimmer_3.2s_ease-in-out_infinite] bg-white/25 blur-md" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-white/[0.07]">
          <Stat label="今日到账" value={formatAmount(todayTotal, unit)} accent />
          <Stat
            label="今日目标"
            value={todayTarget > 0 ? formatAmount(todayTarget, unit) : '休息'}
          />
          <Stat label="本月剩余" value={`${daysLeft} 天`} />
        </div>
      </div>
    </section>
  )
}
