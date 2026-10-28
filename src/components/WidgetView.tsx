import { dateKey, getDayTotal, getNextPending, getPlanProgress } from '@/lib/engine'
import { formatAmount, formatDateKeyLabel, formatDuration } from '@/lib/format'
import { useSalaryStore } from '@/store/salaryStore'

export function WidgetView({ pipWindow }: { pipWindow: Window }) {
  const unit = useSalaryStore((state) => state.settings?.unit)
  const plan = useSalaryStore((state) => state.plan)
  const now = useSalaryStore((state) => state.now)
  const history = useSalaryStore((state) => state.history)
  const flash = useSalaryStore((state) => state.flash)
  const triggerManual = useSalaryStore((state) => state.triggerManual)

  if (!unit) return null

  const todayTotal = getDayTotal(history, new Date(now))
  const next = getNextPending(plan)
  const progress = getPlanProgress(plan)
  const remaining = next ? Math.max(0, next.at - now) : 0

  return (
    <div className={`pw-root ${flash ? 'pw-flash' : ''}`} key={flash?.key ?? 0}>
      <div className="pw-head">
        <span className="pw-brand">
          <span className="pw-dot" />
          PayDay
        </span>
        <span className="pw-date">{formatDateKeyLabel(dateKey(new Date(now)))}</span>
      </div>

      <div className="pw-body">
        <p className="pw-label">今日已到账</p>
        <p className="pw-amount">{formatAmount(todayTotal, unit)}</p>
        <p className="pw-meta">
          <span>
            {progress.done}/{progress.total || 0} 笔
          </span>
          <span className="pw-sep" />
          <span>
            {next ? (
              <>
                下笔 <b className="pw-timer">{formatDuration(remaining)}</b>
              </>
            ) : (
              '今日已完成'
            )}
          </span>
        </p>
      </div>

      <button type="button" className="pw-btn" onClick={triggerManual}>
        收一笔
      </button>
      <button
        type="button"
        className="pw-link"
        onClick={() => {
          window.focus()
          pipWindow.close()
        }}
      >
        打开主窗口
      </button>
    </div>
  )
}
