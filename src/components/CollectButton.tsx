import { HandCoins } from 'lucide-react'
import { PrimaryButton } from '@/components/ui/controls'
import { formatAmount } from '@/lib/format'
import type { UnitConfig } from '@/lib/types'

interface CollectButtonProps {
  nextAmount?: number
  unit: UnitConfig
  hotkey: boolean
  onCollect: () => void
}

export function CollectButton({ nextAmount, unit, hotkey, onCollect }: CollectButtonProps) {
  const actionHint =
    nextAmount !== undefined
      ? `提前领取 ${formatAmount(nextAmount, unit)}`
      : '今日计划已完成，再收一笔加餐'

  return (
    <div className="animate-card-in pt-1" style={{ animationDelay: '160ms' }}>
      <PrimaryButton onClick={onCollect} aria-label="现在收一笔">
        <HandCoins size={19} />
        现在收一笔
      </PrimaryButton>
      <p className="mt-3 text-center text-[10px] tracking-[0.06em] text-white/30">
        {hotkey ? `按空格键 · ${actionHint}` : actionHint}
      </p>
    </div>
  )
}
