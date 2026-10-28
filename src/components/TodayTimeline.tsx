import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatAmount, formatClock, formatDuration } from '@/lib/format'
import { getNextPending, getPlanProgress } from '@/lib/engine'
import type { DayPlan, UnitConfig } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TodayTimelineProps {
  plan: DayPlan | null
  unit: UnitConfig
  now: number
  mode: 'scheduled' | 'anytime'
}

export function TodayTimeline({ plan, unit, now, mode }: TodayTimelineProps) {
  const [expanded, setExpanded] = useState(false)
  const slots = plan?.slots ?? []
  const next = getNextPending(plan)
  const progress = getPlanProgress(plan)
  const remaining = next ? Math.max(0, next.at - now) : 0
  const nextIndex = slots.findIndex((slot) => slot.status === 'pending')

  const empty = slots.length === 0
  const finished = !empty && !next
  const statusText = empty
    ? mode === 'scheduled'
      ? '今天休息，自动到账暂停'
      : '今天暂无自动计划'
    : finished
      ? '今日计划已结束'
      : `${progress.done} / ${progress.total} 笔已完成`

  return (
    <section className="animate-card-in glass rounded-[26px] p-5 shadow-card" style={{ animationDelay: '80ms' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-white/85">今日节奏</span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] tracking-[0.08em] text-white/35">
            {mode === 'scheduled' ? '定时' : '随时'}
          </span>
        </div>
        <span className="text-[10px] text-white/30">{statusText}</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            {empty ? '自动到账' : finished ? '今天的收成' : '下一笔自动到账'}
          </p>
          {next ? (
            <p className="font-display tnum mt-1 text-[34px] leading-none tracking-[-0.02em] text-white">
              {formatDuration(remaining)}
            </p>
          ) : (
            <p className="mt-1 text-[15px] text-white/55">
              {empty ? (mode === 'scheduled' ? '休息日也要好好生活' : '点击下方按钮手动收一笔') : '计划已清空，可以加餐'}
            </p>
          )}
        </div>
        {next ? (
          <div className="shrink-0 text-right">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">本笔金额</p>
            <p className="font-display tnum mt-1 text-[19px] font-semibold text-mint-300">
              +{formatAmount(next.amount, unit)}
            </p>
          </div>
        ) : null}
      </div>

      {slots.length > 0 ? (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {slots.map((slot, index) => {
              const isNext = index === nextIndex
              return (
                <span
                  key={`${slot.at}-${index}`}
                  title={`${formatClock(slot.at)} · ${formatAmount(slot.amount, unit)} · ${
                    slot.status === 'done' ? '已到账' : slot.status === 'skipped' ? '已错过' : '待触发'
                  }`}
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    isNext
                      ? 'w-7 bg-mint-300 shadow-[0_0_14px_rgba(76,224,168,0.75)] animate-pulse-dot'
                      : slot.status === 'done'
                        ? 'w-2 bg-mint-400 shadow-[0_0_10px_rgba(76,224,168,0.45)]'
                        : slot.status === 'skipped'
                          ? 'w-2 bg-white/[0.09]'
                          : 'w-2 border border-white/25 bg-transparent',
                  )}
                />
              )
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/25">
            <span className="tnum">{formatClock(slots[0].at)}</span>
            <span className="tnum">{formatClock(slots[slots.length - 1].at)}</span>
          </div>
        </>
      ) : null}

      {slots.length > 0 ? (
        <div className="mt-3 border-t border-white/[0.06] pt-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex w-full items-center justify-between py-1 text-[11px] text-white/35 transition hover:text-white/60"
          >
            <span>今日明细</span>
            <ChevronDown size={14} className={cn('transition-transform duration-300', expanded && 'rotate-180')} />
          </button>
          {expanded ? (
            <div className="no-scrollbar mt-2 max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
              {slots.map((slot, index) => (
                <div key={`${slot.at}-row-${index}`} className="flex items-center justify-between rounded-xl bg-white/[0.025] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        slot.status === 'done'
                          ? 'bg-mint-400'
                          : slot.status === 'skipped'
                            ? 'bg-white/15'
                            : 'border border-white/30',
                      )}
                    />
                    <span className="tnum text-[12px] text-white/60">{formatClock(slot.at)}</span>
                    <span className="text-[10px] text-white/25">
                      {slot.status === 'done' ? '已到账' : slot.status === 'skipped' ? '已错过' : '待触发'}
                    </span>
                  </div>
                  <span className="tnum text-[12px] text-white/65">{formatAmount(slot.amount, unit)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
