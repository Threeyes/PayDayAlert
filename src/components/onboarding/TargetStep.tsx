import { useState } from 'react'
import { UNIT_PRESETS } from '@/lib/defaults'
import type { Settings, UnitPreset } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TargetStepProps {
  draft: Settings
  update: (mutate: (draft: Settings) => void) => void
}

export function TargetStep({ draft, update }: TargetStepProps) {
  const [presetId, setPresetId] = useState<string>(
    () =>
      UNIT_PRESETS.find(
        (preset) =>
          preset.unit.symbol === draft.unit.symbol &&
          preset.unit.label === draft.unit.label &&
          preset.unit.decimals === draft.unit.decimals,
      )?.id ?? 'custom',
  )

  const choosePreset = (preset: UnitPreset) => {
    setPresetId(preset.id)
    update((next) => {
      next.unit = { ...preset.unit }
    })
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-mint-300/60">目标</p>
        <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
          你想每月
          <br />
          进账多少？
        </h1>
        <p className="mt-3 text-[12px] leading-relaxed text-white/35">
          数字只有你知道。可以用真实月薪，也可以换成查克拉、画饼数，纯粹逗自己开心。
        </p>
      </div>

      <div className="glass flex items-center gap-2 rounded-[24px] px-5 py-4">
        {draft.unit.symbol ? (
          <span className="font-display text-[26px] font-medium text-white/35">{draft.unit.symbol}</span>
        ) : null}
        <input
          inputMode="decimal"
          aria-label="每月目标"
          placeholder="20000"
          value={draft.monthlyGoal > 0 ? String(draft.monthlyGoal) : ''}
          onChange={(event) => {
            const value = Number(event.target.value.replace(/[^\d.]/g, ''))
            update((next) => {
              next.monthlyGoal = Number.isFinite(value) ? value : 0
            })
          }}
          className="font-display tnum w-full min-w-0 bg-transparent text-[38px] font-semibold leading-none tracking-[-0.03em] text-white outline-none placeholder:text-white/15"
        />
        <span className="shrink-0 text-[13px] text-white/35">{draft.unit.label}</span>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] text-white/45">选择单位</p>
          <p className="text-[10px] text-white/25">之后可在设置里修改</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {UNIT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => choosePreset(preset)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition duration-200',
                presetId === preset.id
                  ? 'border-mint-400/50 bg-mint-400/10 shadow-[0_0_24px_-12px_rgba(76,224,168,0.8)]'
                  : 'border-white/[0.08] bg-white/[0.025] hover:border-white/20',
              )}
            >
              <span
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-[15px] font-semibold',
                  presetId === preset.id ? 'bg-mint-400/15 text-mint-200' : 'bg-white/[0.05] text-white/45',
                )}
              >
                {preset.unit.symbol || preset.unit.label.slice(0, 1)}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] text-white/80">{preset.name}</span>
                <span className="block truncate text-[10px] text-white/25">{preset.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {presetId === 'custom' ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] text-white/35">单位名称</span>
            <input
              className="text-input"
              value={draft.unit.label}
              placeholder="例如：能量值"
              onChange={(event) =>
                update((next) => {
                  next.unit.label = event.target.value.slice(0, 8)
                })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] text-white/35">符号（可留空）</span>
            <input
              className="text-input"
              value={draft.unit.symbol}
              placeholder="✦"
              onChange={(event) =>
                update((next) => {
                  next.unit.symbol = event.target.value.slice(0, 4)
                })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
