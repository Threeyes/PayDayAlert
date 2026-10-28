import { ArrowDownLeft, Wallet } from 'lucide-react'
import { getDayTotal } from '@/lib/engine'
import { formatAmount, formatDateTime } from '@/lib/format'
import type { Receipt, UnitConfig } from '@/lib/types'

interface ReceiptListProps {
  history: Receipt[]
  unit: UnitConfig
  now: number
}

const SOURCE_LABEL: Record<Receipt['source'], string> = {
  auto: '自动到账',
  manual: '主动领取',
  catchup: '补发',
}

export function ReceiptList({ history, unit, now }: ReceiptListProps) {
  const recent = history.slice(0, 12)
  const todayTotal = getDayTotal(history, new Date(now))
  const todayCount = history.filter((receipt) => {
    const date = new Date(receipt.at)
    const current = new Date(now)
    return (
      date.getFullYear() === current.getFullYear() &&
      date.getMonth() === current.getMonth() &&
      date.getDate() === current.getDate()
    )
  }).length

  return (
    <section className="animate-card-in glass rounded-[26px] p-5 shadow-card" style={{ animationDelay: '320ms' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">到账流水</p>
          <p className="mt-1 text-[11px] text-white/35">
            今日 {todayCount} 笔 · 合计 <span className="tnum text-white/65">{formatAmount(todayTotal, unit)}</span>
          </p>
        </div>
        <span className="text-[10px] text-white/25">最近 {recent.length} 条</span>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-white/15 text-white/25">
            <Wallet size={20} />
          </span>
          <div>
            <p className="text-[13px] text-white/55">还没有到账记录</p>
            <p className="mt-1 text-[11px] text-white/25">点击上方按钮，先收一笔试试</p>
          </div>
        </div>
      ) : (
        <div className="no-scrollbar mt-3 max-h-[336px] space-y-1 overflow-y-auto pr-1">
          {recent.map((receipt) => (
            <div
              key={receipt.id}
              className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-white/[0.03]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-mint-400/20 bg-mint-400/10 text-mint-300">
                <ArrowDownLeft size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-white/70">{SOURCE_LABEL[receipt.source]}</p>
                <p className="tnum mt-0.5 text-[10px] text-white/25">{formatDateTime(receipt.at)}</p>
              </div>
              <span className="font-display tnum shrink-0 text-[15px] font-semibold text-mint-300">
                +{formatAmount(receipt.amount, unit)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
