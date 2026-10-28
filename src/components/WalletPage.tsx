import { createPortal } from 'react-dom'
import { PictureInPicture2, Settings2 } from 'lucide-react'
import { BalanceCard } from '@/components/BalanceCard'
import { CollectButton } from '@/components/CollectButton'
import { ReceiptList } from '@/components/ReceiptList'
import { TodayTimeline } from '@/components/TodayTimeline'
import { WeeklyChart } from '@/components/WeeklyChart'
import { WidgetView } from '@/components/WidgetView'
import { IconButton } from '@/components/ui/controls'
import { useDocumentPiP } from '@/hooks/useDocumentPiP'
import { useSalaryStats } from '@/hooks/useSalaryStats'
import { useSalaryStore } from '@/store/salaryStore'

export function WalletPage() {
  const settings = useSalaryStore((state) => state.settings)
  const plan = useSalaryStore((state) => state.plan)
  const history = useSalaryStore((state) => state.history)
  const now = useSalaryStore((state) => state.now)
  const openSettings = useSalaryStore((state) => state.openSettings)
  const triggerManual = useSalaryStore((state) => state.triggerManual)
  const stats = useSalaryStats()
  const pip = useDocumentPiP()

  if (!settings) return null

  const hasSlots = (plan?.slots.length ?? 0) > 0
  let statusLabel = settings.pace.mode === 'scheduled' ? '定时到账中' : '全天随机到账'
  if (!hasSlots) statusLabel = '今日休息'
  else if (!stats.nextSlot) statusLabel = '今日已完成'

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-gradient-to-br from-mint-300 via-mint-400 to-mint-600 text-[17px] font-bold text-ink-950 shadow-[0_12px_26px_-10px_rgba(76,224,168,0.9)]">
            ¥
          </span>
          <div>
            <p className="font-display text-[16px] font-semibold tracking-[0.01em] text-white/90">PayDay</p>
            <p className="flex items-center gap-1.5 text-[10px] text-white/35">
              <span className="h-1 w-1 rounded-full bg-mint-400 animate-pulse-dot" />
              {statusLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pip.supported ? (
            <IconButton
              label="悬浮窗模式"
              onClick={pip.open}
              active={Boolean(pip.pipWindow)}
            >
              <PictureInPicture2 size={16} />
            </IconButton>
          ) : null}
          <IconButton label="设置" onClick={openSettings}>
            <Settings2 size={17} />
          </IconButton>
        </div>
      </header>

      <main className="mt-6 space-y-4">
        <BalanceCard
          monthTotal={stats.monthTotal}
          goal={stats.goal}
          progress={stats.progress}
          todayTotal={stats.todayTotal}
          todayTarget={stats.todayTarget}
          daysLeft={stats.daysLeft}
          unit={settings.unit}
          monthTitle={stats.monthTitle}
        />

        <TodayTimeline plan={plan} unit={settings.unit} now={now} mode={settings.pace.mode} />

        <CollectButton
          nextAmount={stats.nextSlot?.amount}
          unit={settings.unit}
          hotkey={settings.triggers.hotkey}
          onCollect={triggerManual}
        />

        <WeeklyChart history={history} unit={settings.unit} now={now} />

        <ReceiptList history={history} unit={settings.unit} now={now} />

        <footer className="pb-2 pt-3 text-center text-[10px] leading-relaxed text-white/20">
          数据仅保存在本机 · 不上传任何信息
          <br />
          添加到主屏幕，可获得更沉浸的到账体验
        </footer>
      </main>

      {pip.pipWindow
        ? createPortal(<WidgetView pipWindow={pip.pipWindow} />, pip.pipWindow.document.body)
        : null}
    </div>
  )
}
