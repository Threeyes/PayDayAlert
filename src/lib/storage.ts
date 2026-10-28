import { DEFAULT_SETTINGS } from './defaults'
import type { DayPlan, Receipt, Settings } from './types'

const KEYS = {
  settings: 'pda.settings.v1',
  plan: 'pda.plan.v1',
  history: 'pda.history.v1',
} as const

function canUseStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

function readJSON<T>(key: string): T | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJSON(key: string, value: unknown) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 存储空间不足时静默失败 */
  }
}

function normaliseSettings(raw: Partial<Settings> | null): Settings | null {
  if (!raw) return null
  const base = DEFAULT_SETTINGS
  return {
    version: 1,
    monthlyGoal:
      typeof raw.monthlyGoal === 'number' && raw.monthlyGoal > 0 ? raw.monthlyGoal : base.monthlyGoal,
    unit: { ...base.unit, ...(raw.unit ?? {}) },
    pace: {
      ...base.pace,
      ...(raw.pace ?? {}),
      weekdays: Array.isArray(raw.pace?.weekdays) ? raw.pace!.weekdays : base.pace.weekdays,
      dailyCount:
        typeof raw.pace?.dailyCount === 'number' ? raw.pace.dailyCount : base.pace.dailyCount,
      volatility:
        typeof raw.pace?.volatility === 'number' ? raw.pace.volatility : base.pace.volatility,
    },
    alerts: { ...base.alerts, ...(raw.alerts ?? {}) },
    triggers: { ...base.triggers, ...(raw.triggers ?? {}) },
  }
}

export function loadSettings(): Settings | null {
  return normaliseSettings(readJSON<Partial<Settings>>(KEYS.settings))
}

export function saveSettings(settings: Settings) {
  writeJSON(KEYS.settings, settings)
}

export function loadPlan(): DayPlan | null {
  const plan = readJSON<DayPlan>(KEYS.plan)
  if (!plan || typeof plan.date !== 'string' || !Array.isArray(plan.slots)) return null
  return plan
}

export function savePlan(plan: DayPlan) {
  writeJSON(KEYS.plan, plan)
}

export function loadHistory(): Receipt[] {
  const history = readJSON<Receipt[]>(KEYS.history)
  if (!Array.isArray(history)) return []
  return history.filter(
    (item) => item && typeof item.at === 'number' && typeof item.amount === 'number',
  )
}

export function saveHistory(history: Receipt[]) {
  writeJSON(KEYS.history, history)
}

export function clearAllStorage() {
  if (!canUseStorage()) return
  Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key))
}

export function exportAll(settings: Settings | null, plan: DayPlan | null, history: Receipt[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    settings,
    plan,
    history,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `payday-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
