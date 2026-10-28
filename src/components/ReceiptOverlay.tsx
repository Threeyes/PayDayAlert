import { useEffect, type CSSProperties } from 'react'
import { useSalaryStore } from '@/store/salaryStore'
import { formatAmount, splitAmount } from '@/lib/format'
import { useCountUp } from '@/hooks/useCountUp'

export function ReceiptOverlay() {
  const flash = useSalaryStore((state) => state.flash)
  const dismiss = useSalaryStore((state) => state.dismissFlash)
  const unit = useSalaryStore((state) => state.settings?.unit)
  const display = useCountUp(flash?.amount ?? 0, 850, 0)

  useEffect(() => {
    if (!flash) return
    const timer = window.setTimeout(dismiss, 2800)
    return () => window.clearTimeout(timer)
  }, [flash, dismiss])

  if (!flash || !unit) return null
  const parts = splitAmount(display, unit)

  return (
    <div
      className="fixed inset-0 z-[70] flex cursor-pointer items-center justify-center overflow-hidden"
      onClick={dismiss}
      role="presentation"
    >
      <div className="absolute inset-0 animate-fade-in bg-ink-950/82 backdrop-blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,224,168,0.24),transparent_62%)]" />

      <div className="relative flex w-full max-w-[420px] flex-col items-center px-8 animate-pop-in">
        <div className="relative mb-7 flex h-24 w-24 items-center justify-center">
          <span className="glow-ring" />
          <span className="glow-ring" style={{ animationDelay: '0.55s' }} />
          <span className="relative grid h-16 w-16 place-items-center rounded-[22px] border border-mint-300/30 bg-gradient-to-br from-mint-300/90 to-mint-600 text-2xl font-bold text-ink-950 shadow-[0_18px_40px_-10px_rgba(76,224,168,0.8)]">
            {unit.symbol || unit.label.slice(0, 1)}
          </span>
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (Math.PI * 2 * index) / 12 + 0.24
            const distance = 88 + (index % 4) * 30
            return (
              <span
                key={index}
                className="spark"
                style={
                  {
                    '--dx': `${Math.cos(angle) * distance}px`,
                    '--dy': `${Math.sin(angle) * distance}px`,
                    aniDelay: `${(index % 5) * 55}ms`,
                  } as React.CSSProperties
                }
              />
            )
          })}
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-mint-300/70">已到账</p>
        <div className="mt-3 flex items-baseline justify-center gap-1.5">
          {parts.lead ? (
            <span className="font-display text-[26px] font-medium text-white/50">{parts.lead}</span>
          ) : null}
          <span className="font-display tnum text-[62px] font-semibold leading-none tracking-[-0.03em] text-white">
            {parts.number}
          </span>
          {parts.tail ? (
            <span className="text-[16px] font-medium text-white/45">{parts.tail}</span>
          ) : null}
        </div>
        <p className="mt-4 max-w-[280px] text-center text-[13px] leading-relaxed text-white/55">
          {flash.phrase}
        </p>
        <p className="mt-8 text-[10px] tracking-[0.18em] text-white/25">点击任意位置关闭</p>
      </div>
    </div>
  )
}

export function NotificationBanner() {
  const banner = useSalaryStore((state) => state.banner)
  const dismiss = useSalaryStore((state) => state.dismissBanner)
  const unit = useSalaryStore((state) => state.settings?.unit)

  useEffect(() => {
    if (!banner) return
    const timer = window.setTimeout(dismiss, 4200)
    return () => window.clearTimeout(timer)
  }, [banner, dismiss])

  if (!banner || !unit) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(12px,env(safe-area-inset-top))] z-[80] flex justify-center px-4">
      <button
        type="button"
        onClick={dismiss}
        className="pointer-events-auto flex w-full max-w-[400px] items-center gap-3 rounded-[22px] border border-white/[0.09] bg-ink-800/90 p-3 pr-4 text-left shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-banner-in"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-gradient-to-br from-mint-300 to-mint-600 text-[16px] font-bold text-ink-950">
          ¥
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between text-[10px] text-white/40">
            <span>PayDay · 到账提醒</span>
            <span>现在</span>
          </span>
          <span className="mt-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-[12px] text-white/70">{banner.phrase}</span>
            <span className="font-display tnum shrink-0 text-[16px] font-semibold text-mint-300">
              {formatAmount(banner.amount, unit)}
            </span>
          </span>
        </span>
      </button>
    </div>
  )
}
