import { useCallback, useEffect, useState } from 'react'
import { Download, Keyboard, Mic, RotateCcw, Trash2, X } from 'lucide-react'
import {
  Chip,
  GhostButton,
  PrimaryButton,
  Row,
  Section,
  Segmented,
  Toggle,
} from '@/components/ui/controls'
import { DEFAULT_SETTINGS, UNIT_PRESETS, WEEKDAY_LABELS } from '@/lib/defaults'
import { getDailyTarget } from '@/lib/engine'
import {
  getNotificationState,
  requestNotificationPermission,
  supportsVoiceCommand,
  supportsWakeLock,
  unlockAudio,
  type NotificationState,
} from '@/lib/feedback'
import { formatAmount } from '@/lib/format'
import { exportAll } from '@/lib/storage'
import type { Settings } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useSalaryStore } from '@/store/salaryStore'

export function SettingsSheet() {
  const settings = useSalaryStore((state) => state.settings)
  const plan = useSalaryStore((state) => state.plan)
  const history = useSalaryStore((state) => state.history)
  const closeSettings = useSalaryStore((state) => state.closeSettings)
  const updateSettings = useSalaryStore((state) => state.updateSettings)
  const clearHistory = useSalaryStore((state) => state.clearHistory)
  const resetAll = useSalaryStore((state) => state.resetAll)

  const [draft, setDraft] = useState<Settings>(() =>
    structuredClone(settings ?? DEFAULT_SETTINGS),
  )
  const [permission, setPermission] = useState<NotificationState>(() => getNotificationState())

  const update = useCallback((mutate: (draft: Settings) => void) => {
    setDraft((previous) => {
      const next = structuredClone(previous)
      mutate(next)
      return next
    })
  }, [])

  const commit = useCallback(() => {
    unlockAudio()
    updateSettings(draft)
    closeSettings()
  }, [closeSettings, draft, updateSettings])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') commit()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commit])

  if (!settings) return null

  const { unit, pace, alerts, triggers } = draft
  const invalidGoal = !(draft.monthlyGoal > 0)
  const invalidWorkTime = pace.mode === 'scheduled' && pace.workStart >= pace.workEnd
  const dailyTarget = getDailyTarget(draft, new Date())
  const perAmount = dailyTarget / Math.max(1, pace.dailyCount)

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

  const toggleWeekday = (weekday: number) => {
    update((next) => {
      const set = new Set(next.pace.weekdays)
      if (set.has(weekday)) set.delete(weekday)
      else set.add(weekday)
      next.pace.weekdays = Array.from(set).sort((a, b) => a - b)
      if (next.pace.weekdays.length === 0) next.pace.weekdays = [weekday]
    })
  }

  const notificationHint =
    permission === 'granted'
      ? '已授权，后台也能弹出系统通知'
      : permission === 'denied'
        ? '浏览器已拒绝，请到站点设置中开启'
        : permission === 'unsupported'
          ? '当前浏览器不支持系统通知'
          : '开启时会请求浏览器授权'

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="关闭设置"
        onClick={commit}
        className="absolute inset-0 h-full w-full animate-fade-in bg-ink-950/70 backdrop-blur-sm"
      />

      <aside className="animate-sheet-in absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col border-l border-white/[0.08] bg-ink-900/95 shadow-[-30px_0_80px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
        <header className="flex items-center justify-between border-b border-white/[0.07] px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))]">
          <div>
            <p className="font-display text-[16px] font-semibold text-white/90">设置</p>
            <p className="mt-0.5 text-[10px] text-white/30">调整后关闭即自动保存</p>
          </div>
          <button
            type="button"
            onClick={commit}
            aria-label="关闭"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
          >
            <X size={16} />
          </button>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto">
          <Section title="目标与单位">
            <Row label="每月目标" hint={`每天约 ${formatAmount(dailyTarget, unit)}`} stack>
              <div className="flex items-center gap-2">
                <input
                  inputMode="decimal"
                  aria-label="每月目标"
                  value={draft.monthlyGoal > 0 ? String(draft.monthlyGoal) : ''}
                  placeholder="20000"
                  onChange={(event) => {
                    const value = Number(event.target.value.replace(/[^\d.]/g, ''))
                    update((next) => {
                      next.monthlyGoal = Number.isFinite(value) ? value : 0
                    })
                  }}
                  className="text-input tnum font-display text-[18px] font-semibold"
                />
                <span className="shrink-0 text-[12px] text-white/35">{unit.label}</span>
              </div>
            </Row>

            <Row label="快速切换单位" stack>
              <div className="flex flex-wrap gap-1.5">
                {UNIT_PRESETS.map((preset) => {
                  const active =
                    preset.unit.label === unit.label &&
                    preset.unit.symbol === unit.symbol &&
                    preset.unit.decimals === unit.decimals
                  return (
                    <Chip
                      key={preset.id}
                      active={active}
                      onClick={() =>
                        update((next) => {
                          next.unit = { ...preset.unit }
                        })
                      }
                    >
                      {preset.name}
                    </Chip>
                  )
                })}
              </div>
            </Row>

            <Row label="单位名称 / 符号" stack>
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="单位名称"
                  className="text-input"
                  placeholder="元"
                  value={unit.label}
                  onChange={(event) =>
                    update((next) => {
                      next.unit.label = event.target.value.slice(0, 8) || '元'
                    })
                  }
                />
                <input
                  aria-label="货币符号"
                  className="text-input"
                  placeholder="¥（可留空）"
                  value={unit.symbol}
                  onChange={(event) =>
                    update((next) => {
                      next.unit.symbol = event.target.value.slice(0, 4)
                    })
                  }
                />
              </div>
            </Row>

            <Row label="符号位置">
              <div className="w-[188px]">
                <Segmented
                  value={unit.symbolPosition}
                  onChange={(next) =>
                    update((draftSettings) => {
                      draftSettings.unit.symbolPosition = next
                    })
                  }
                  options={[
                    { value: 'prefix', label: '¥100' },
                    { value: 'suffix', label: '100 ¥' },
                  ]}
                />
              </div>
            </Row>

            <Row label="小数位">
              <div className="w-[160px]">
                <Segmented
                  value={String(unit.decimals) as '0' | '2'}
                  onChange={(next) =>
                    update((draftSettings) => {
                      draftSettings.unit.decimals = next === '2' ? 2 : 0
                    })
                  }
                  options={[
                    { value: '0', label: '整数' },
                    { value: '2', label: '两位小数' },
                  ]}
                />
              </div>
            </Row>
          </Section>

          <Section title="触发节奏">
            <Row label="到账模式" hint={pace.mode === 'scheduled' ? '仅在工作日的工作时段内触发' : '全天随机触发，像商店收款'} stack>
              <Segmented
                value={pace.mode}
                onChange={(next) =>
                  update((draftSettings) => {
                    draftSettings.pace.mode = next
                  })
                }
                options={[
                  { value: 'scheduled', label: '定时' },
                  { value: 'anytime', label: '随时' },
                ]}
              />
            </Row>

            <Row
              label="每天次数"
              hint={`每笔约 ${formatAmount(perAmount, unit)}，可随时手动加餐`}
              stack
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] text-white/25">1 次克制 · 20 次收钱收到手软</span>
                  <span className="font-display tnum text-[16px] font-semibold text-mint-300">
                    {pace.dailyCount} 次
                  </span>
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
              </div>
            </Row>

            {pace.mode === 'scheduled' ? (
              <>
                <Row label="工作时段" hint={invalidWorkTime ? '下班时间需要晚于上班时间' : undefined} stack>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      aria-label="上班时间"
                      className="text-input tnum w-[124px]"
                      value={pace.workStart}
                      onChange={(event) =>
                        update((next) => {
                          next.pace.workStart = event.target.value || '09:30'
                        })
                      }
                    />
                    <span className="text-white/25">—</span>
                    <input
                      type="time"
                      aria-label="下班时间"
                      className="text-input tnum w-[124px]"
                      value={pace.workEnd}
                      onChange={(event) =>
                        update((next) => {
                          next.pace.workEnd = event.target.value || '18:30'
                        })
                      }
                    />
                  </div>
                </Row>

                <Row label="工作日" stack>
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
                </Row>
              </>
            ) : (
              <>
                <Row label="夜间免打扰" hint="睡着的钱，明天再收">
                  <Toggle
                    label="夜间免打扰"
                    checked={pace.dndEnabled}
                    onChange={(next) =>
                      update((draftSettings) => {
                        draftSettings.pace.dndEnabled = next
                      })
                    }
                  />
                </Row>
                {pace.dndEnabled ? (
                  <Row label="免打扰时段" stack>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        aria-label="免打扰开始"
                        className="text-input tnum w-[124px]"
                        value={pace.dndStart}
                        onChange={(event) =>
                          update((next) => {
                            next.pace.dndStart = event.target.value || '23:00'
                          })
                        }
                      />
                      <span className="text-white/25">—</span>
                      <input
                        type="time"
                        aria-label="免打扰结束"
                        className="text-input tnum w-[124px]"
                        value={pace.dndEnd}
                        onChange={(event) =>
                          update((next) => {
                            next.pace.dndEnd = event.target.value || '07:00'
                          })
                        }
                      />
                    </div>
                  </Row>
                ) : null}
              </>
            )}

            <Row label="每次金额" hint={pace.split === 'average' ? '每笔相同，稳稳平摊' : '像拆红包一样每笔都不同'} stack>
              <div className="space-y-2">
                <Segmented
                  value={pace.split}
                  onChange={(next) =>
                    update((draftSettings) => {
                      draftSettings.pace.split = next
                    })
                  }
                  options={[
                    { value: 'average', label: '平均分配' },
                    { value: 'random', label: '随机波动' },
                  ]}
                />
                {pace.split === 'random' ? (
                  <div>
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
                    <p className="mt-1.5 text-[10px] text-white/25">
                      波动 ±{Math.round(pace.volatility * 100)}%
                    </p>
                  </div>
                ) : null}
              </div>
            </Row>
          </Section>

          <Section title="提示方式">
            {[
              { key: 'bubble' as const, label: '到账横幅', hint: 'iOS 风格通知卡片' },
              { key: 'sound' as const, label: '收款音效', hint: '合成的收银「叮咚」声' },
              { key: 'voice' as const, label: '语音播报', hint: '「到账 128 元」' },
              { key: 'vibration' as const, label: '震动反馈', hint: '手机端触发时轻微震动' },
            ].map((item) => (
              <Row key={item.key} label={item.label} hint={item.hint}>
                <Toggle
                  label={item.label}
                  checked={alerts[item.key]}
                  onChange={(value) => setAlert(item.key, value)}
                />
              </Row>
            ))}
            <Row label="系统通知" hint={notificationHint}>
              <Toggle
                label="系统通知"
                checked={alerts.systemNotification}
                disabled={permission === 'unsupported' || permission === 'denied'}
                onChange={toggleNotification}
              />
            </Row>
          </Section>

          <Section title="主动触发">
            <Row label="空格键 / 回车键" hint="在电脑上按一下立刻收一笔">
              <Toggle
                label="快捷键触发"
                checked={triggers.hotkey}
                onChange={(next) =>
                  update((draftSettings) => {
                    draftSettings.triggers.hotkey = next
                  })
                }
              />
            </Row>
            <Row
              label="语音指令"
              hint={supportsVoiceCommand() ? '说「到账」即可触发' : '当前浏览器不支持语音识别'}
            >
              <Toggle
                label="语音指令"
                checked={triggers.voiceCommand}
                disabled={!supportsVoiceCommand()}
                onChange={(next) =>
                  update((draftSettings) => {
                    draftSettings.triggers.voiceCommand = next
                  })
                }
              />
            </Row>
            <Row
              label="保持屏幕常亮"
              hint={supportsWakeLock() ? '看板模式下不让屏幕熄灭' : '当前浏览器不支持屏幕常亮'}
            >
              <Toggle
                label="保持屏幕常亮"
                checked={triggers.wakeLock}
                disabled={!supportsWakeLock()}
                onChange={(next) =>
                  update((draftSettings) => {
                    draftSettings.triggers.wakeLock = next
                  })
                }
              />
            </Row>
          </Section>

          <Section title="数据与关于">
            <div className="space-y-2 py-1">
              <GhostButton onClick={() => exportAll(settings, plan, history)}>
                <Download size={15} />
                导出数据（JSON）
              </GhostButton>
              <GhostButton
                onClick={() => {
                  if (window.confirm('清空所有到账流水？设置会保留。')) clearHistory()
                }}
              >
                <Trash2 size={15} />
                清空到账流水
              </GhostButton>
              <GhostButton
                className="border-red-400/25 text-red-200/70 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
                onClick={() => {
                  if (window.confirm('将删除所有设置、计划与流水，回到首次引导，确定继续？')) {
                    resetAll()
                  }
                }}
              >
                <RotateCcw size={15} />
                重置全部数据
              </GhostButton>
            </div>

            <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-[10px] leading-relaxed text-white/30">
              <p className="mb-1.5 flex items-center gap-1.5 text-white/45">
                <Keyboard size={12} className="text-mint-300/70" />
                桌面端按空格键即可收一笔
              </p>
              <p className="mb-1.5 flex items-center gap-1.5 text-white/45">
                <Mic size={12} className="text-mint-300/70" />
                开启语音指令后，说「到账」也行
              </p>
              <p>所有数据只保存在本机浏览器，不会上传。手机浏览器可通过「添加到主屏幕」安装。</p>
            </div>
          </Section>
        </div>

        <footer className="border-t border-white/[0.07] bg-ink-900/95 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
          {invalidGoal || invalidWorkTime ? (
            <p className="mb-2 text-center text-[10px] text-gold-400/80">
              {invalidGoal ? '请填写大于 0 的每月目标' : '下班时间需要晚于上班时间'}
            </p>
          ) : null}
          <PrimaryButton disabled={invalidGoal || invalidWorkTime} onClick={commit}>
            保存设置
          </PrimaryButton>
        </footer>
      </aside>
    </div>
  )
}
