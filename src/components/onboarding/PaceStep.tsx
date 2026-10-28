import { Clock3, Zap } from 'lucide-react'
import { WEEKDAY_LABELS } from '@/lib/defaults'
import type { Settings } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PaceStepProps {
  draft: Settings
  update: (mutate: (draft: Settings) => void) => void
}

export function PaceStep({ draft, update }: PaceStepProps) {
  const { pace } = draft
  const toggleWeekday = (weekday: number) => {
    update((next) => {
      const set = new Set(next.pace.weekdays)
      if (set.has(weekday)) set.delete(weekday)
      else set.add(weekday)
      next.pace.weekdays = Array.from(set).sort((a, b) => a - b)
      if (next.pace.weekdays.length === 0) next.pace.weekdays = [weekday]
    })
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-mint-300/60">节奏</p>
        <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
          想怎么收？
        </h1>
        <p className="mt-3 text-[12px] leading-relaxed text-white/35">
          选一个你喜欢的节奏，之后随时可以调整。
        </p>
      </div>

      <div className="space-y-2">
        {[
          {
            value: 'scheduled' as const,
            icon: Clock3,
            title: '定时到账',
            desc: '只在工作日的上班时段随机触发，鼓励自己好好上班',
          },
          {
            value: 'anytime' as const,
            icon: Zap,
            title: '随时到账',
            desc: '像商店收款一样全天随机，夜里可以自动免打扰',
          },
        ].map((option) => {
          const Icon = option.icon
          const active = pace.mode === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                update((next) => {
                  next.pace.mode = option.value
                })
              }
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition duration-200',
                active
                  ? 'border-mint-400/50 bg-mint-400/[0.08]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                  active ? 'bg-mint-400/15 text-mint-200' : 'bg-white/[0.05] text-white/40',
                )}
              >
                <Icon size={16} />
              </span>
              <span>
                <span className={cn('block text-[13px] font-medium', active ? 'text-white' : 'text-white/70')}>
                  {option.title}
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-white/30">{option.desc}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[11px] text-white/45">每天触发次数</p>
          <p className="font-display tnum text-[18px] font-semibold text-mint-300">{pace.dailyCount} 次</p>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          value={pace.dailyCount}
          aria-label="每天触发次数"
          onChange={(event) =>
            update((next) => {
              next.pace.dailyCount = Number(event.target.value)
            })
          }
          className="range-mint"
        />
        <div className="mt-2 flex justify-between text-[9px] text-white/20">
          <span>克制一点</span>
          <span>收钱收到手软</span>
        </div>
      </div>

      {pace.mode === 'scheduled' ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] text-white/45">工作时段</p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                className="text-input tnum w-[118px]"
                value={pace.workStart}
                aria-label="上班时间"
                onChange={(event) =>
                  update((next) => {
                    next.pace.workStart = event.target.value || '09:30'
                  })
                }
              />
              <span className="text-white/25">—</span>
              <input
                type="time"
                className="text-input tnum w-[118px]"
                value={pace.workEnd}
                aria-label="下班时间"
                onChange={(event) =>
                  update((next) => {
                    next.pace.workEnd = event.target.value || '18:30'
                  })
                }
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] text-white/45">工作日</p>
            <div className="flex gap-1.5">
              {WEEKDAY_LABELS.map((label, index) => {
                const active = pace.weekdays.includes(index)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleWeekday(index)}
                    className={cn(
                      'h-9 flex-1 rounded-xl border text-[11px] transition duration-200',
                      active
                        ? 'border-mint-400/45 bg-mint-400/12 text-mint-200'
                        : 'border-white/[0.08] bg-white/[0.02] text-white/35',
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/75">夜间免打扰</p>
              <p className="mt-1 text-[10px] text-white/28">睡着的钱，明天再收</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pace.dndEnabled}
              onClick={() =>
                update((next) => {
                  next.pace.dndEnabled = !next.pace.dndEnabled
                })
              }
              className={cn(
                'relative h-[26px] w-[44px] rounded-full border transition duration-300',
                pace.dndEnabled
                  ? 'border-mint-400/50 bg-mint-400/90'
                  : 'border-white/10 bg-white/10',
              )}
            >
              <span
                className={cn(
                  'absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white transition-all duration-300',
                  pace.dndEnabled ? 'left-[21px]' : 'left-[2px]',
                )}
              />
            </button>
          </div>
          {pace.dndEnabled ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="time"
                className="text-input tnum w-[118px]"
                value={pace.dndStart}
                aria-label="免打扰开始时间"
                onChange={(event) =>
                  update((next) => {
                    next.pace.dndStart = event.target.value || '23:00'
                  })
                }
              />
              <span className="text-white/25">—</span>
              <input
                type="time"
                className="text-input tnum w-[118px]"
                value={pace.dndEnd}
                aria-label="免打扰结束时间"
                onChange={(event) =>
                  update((next) => {
                    next.pace.dndEnd = event.target.value || '07:00'
                  })
                }
              />
            </div>
          ) : null}
        </div>
      )}

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[11px] text-white/45">每次金额</p>
          <div className="flex gap-1">
            {[
              { value: 'average' as const, label: '平均' },
              { value: 'random' as const, label: '随机' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  update((next) => {
                    next.pace.split = option.value
                  })
                }
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] transition',
                  pace.split === option.value
                    ? 'bg-white/[0.12] text-white'
                    : 'text-white/35 hover:text-white/60',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {pace.split === 'random' ? (
          <>
            <input
              type="range"
              min={0.15}
              max={0.8}
              step={0.05}
              value={pace.volatility}
              aria-label="随机波动强度"
              onChange={(event) =>
                update((next) => {
                  next.pace.volatility = Number(event.target.value)
                })
              }
              className="range-mint"
            />
            <p className="mt-2 text-[10px] text-white/25">
              波动 ±{Math.round(pace.volatility * 100)}%，像拆红包一样每笔都不同
            </p>
          </>
        ) : (
          <p className="text-[10px] text-white/25">每次金额相同，稳稳地把月薪平摊完</p>
        )}
      </div>
    </div>
  )
}
