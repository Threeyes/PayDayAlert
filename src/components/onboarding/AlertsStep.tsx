import { useState } from 'react'
import { Bell, Volume2 } from 'lucide-react'
import { Toggle } from '@/components/ui/controls'
import {
  getNotificationState,
  requestNotificationPermission,
  type NotificationState,
} from '@/lib/feedback'
import { formatAmount } from '@/lib/format'
import type { Settings } from '@/lib/types'

interface AlertsStepProps {
  draft: Settings
  update: (mutate: (draft: Settings) => void) => void
}

export function AlertsStep({ draft, update }: AlertsStepProps) {
  const [permission, setPermission] = useState<NotificationState>(() => getNotificationState())
  const { alerts } = draft

  const setAlert = (key: keyof Settings['alerts'], value: boolean) => {
    update((next) => {
      next.alerts[key] = value
    })
  }

  const toggleNotification = async (next: boolean) => {
    if (!next) {
      setAlert('systemNotification', false)
      return
    }
    const state = await requestNotificationPermission()
    setPermission(state)
    if (state === 'granted') setAlert('systemNotification', true)
  }

  const notificationHint =
    permission === 'granted'
      ? '已授权，可弹出系统通知'
      : permission === 'denied'
        ? '浏览器已拒绝，请到站点设置中开启'
        : permission === 'unsupported'
          ? '当前浏览器不支持系统通知'
          : '开启时会请求浏览器授权'

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-mint-300/60">提示</p>
        <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
          到账时，
          <br />
          怎么提醒你？
        </h1>
        <p className="mt-3 text-[12px] leading-relaxed text-white/35">
          推荐开启音效和语音，收银台的快乐有一半来自那声「叮」。
        </p>
      </div>

      <div className="glass overflow-hidden rounded-[22px] px-4">
        {[
          { key: 'bubble' as const, label: '到账横幅', hint: 'iOS 风格通知卡片' },
          { key: 'sound' as const, label: '收款音效', hint: '合成的收银「叮咚」声' },
          { key: 'voice' as const, label: '语音播报', hint: '「到账 128 元」' },
          { key: 'vibration' as const, label: '震动反馈', hint: '手机端触发时轻微震动' },
        ].map((item, index) => (
          <div
            key={item.key}
            className={`flex items-center justify-between py-3 ${index > 0 ? 'border-t border-white/[0.06]' : ''}`}
          >
            <div>
              <p className="text-[12px] text-white/80">{item.label}</p>
              <p className="mt-0.5 text-[10px] text-white/28">{item.hint}</p>
            </div>
            <Toggle
              label={item.label}
              checked={alerts[item.key]}
              onChange={(value) => setAlert(item.key, value)}
            />
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-white/[0.06] py-3">
          <div className="pr-3">
            <p className="text-[12px] text-white/80">系统通知</p>
            <p className="mt-0.5 text-[10px] text-white/28">{notificationHint}</p>
          </div>
          <Toggle
            label="系统通知"
            checked={alerts.systemNotification}
            disabled={permission === 'unsupported' || permission === 'denied'}
            onChange={toggleNotification}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/25">到账预览</p>
        <div className="flex items-center gap-3 rounded-2xl bg-ink-800/80 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-mint-300 to-mint-600 text-[13px] font-bold text-ink-950">
            ¥
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[9px] text-white/35">
              <span>PayDay · 到账提醒</span>
              <span>现在</span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="truncate text-[11px] text-white/60">今日份快乐已到账</span>
              <span className="font-display tnum text-[15px] font-semibold text-mint-300">
                {formatAmount(draft.monthlyGoal / 30 / Math.max(1, draft.pace.dailyCount), draft.unit)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-white/25">
          <Volume2 size={12} className="text-mint-300/70" />
          音效 + 语音 + 横幅，会在到账瞬间同时触发
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-white/25">
          <Bell size={12} className="text-mint-300/70" />
          电脑端按空格键也能立刻收一笔
        </div>
      </div>
    </div>
  )
}
