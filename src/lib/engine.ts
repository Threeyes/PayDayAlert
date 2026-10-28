import type { DayPlan, PlanSlot, Receipt, Settings } from './types'

export const MINUTE = 60_000
export const DAY_MS = 86_400_000

export interface ManualResult {
  plan: DayPlan
  amount: number
  slotIndex?: number
  bonus: boolean
}

export function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function parseTimeToMs(value: string, fallbackMinutes = 0): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? '')
  if (!match) return fallbackMinutes * MINUTE
  const hours = Math.min(23, Number(match[1]))
  const minutes = Math.min(59, Number(match[2]))
  return (hours * 60 + minutes) * MINUTE
}

export function getDaysInMonth(ref: Date): number {
  return new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
}

export function getWorkdaysInMonth(ref: Date, weekdays: number[]): number {
  const days = weekdays.length > 0 ? weekdays : [0, 1, 2, 3, 4, 5, 6]
  const total = getDaysInMonth(ref)
  let count = 0
  for (let day = 1; day <= total; day += 1) {
    const weekday = new Date(ref.getFullYear(), ref.getMonth(), day).getDay()
    if (days.includes(weekday)) count += 1
  }
  return Math.max(1, count)
}

export function getRemainingDaysInMonth(ref: Date): number {
  return getDaysInMonth(ref) - ref.getDate() + 1
}

/** 每日目标：定时模式按工作日平摊，随时模式按自然日平摊 */
export function getDailyTarget(settings: Settings, ref: Date): number {
  const divisor =
    settings.pace.mode === 'scheduled'
      ? getWorkdaysInMonth(ref, settings.pace.weekdays)
      : getDaysInMonth(ref)
  return settings.monthlyGoal / Math.max(1, divisor)
}

export function roundAmount(value: number, decimals: 0 | 2): number {
  const unit = decimals === 2 ? 0.01 : 1
  const rounded = Math.round((value + Number.EPSILON) / unit) * unit
  return Number(rounded.toFixed(decimals))
}

export function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 当天允许触发的时间窗（毫秒时间戳），已裁剪到 [from, to] */
export function getAllowedWindows(
  settings: Settings,
  ref: Date,
  from: number = startOfDay(ref),
  to: number = startOfDay(ref) + DAY_MS,
): Array<[number, number]> {
  const dayStart = startOfDay(ref)
  const raw: Array<[number, number]> = []
  const { pace } = settings

  if (pace.mode === 'scheduled') {
    if (pace.weekdays.includes(ref.getDay())) {
      const start = dayStart + parseTimeToMs(pace.workStart, 9 * 60)
      const end = dayStart + parseTimeToMs(pace.workEnd, 18 * 60)
      if (end > start) raw.push([start, end])
    }
  } else if (!pace.dndEnabled) {
    raw.push([dayStart, dayStart + DAY_MS])
  } else {
    const dndStart = dayStart + parseTimeToMs(pace.dndStart, 23 * 60)
    const dndEnd = dayStart + parseTimeToMs(pace.dndEnd, 7 * 60)
    if (dndStart === dndEnd) {
      raw.push([dayStart, dayStart + DAY_MS])
    } else if (dndStart > dndEnd) {
      raw.push([dndEnd, dndStart])
    } else {
      raw.push([dayStart, dndStart])
      raw.push([dndEnd, dayStart + DAY_MS])
    }
  }

  return raw
    .map(([start, end]) => [Math.max(start, from), Math.min(end, to)] as [number, number])
    .filter(([start, end]) => end - start > 1000)
}

export function distributeAmounts(
  total: number,
  count: number,
  split: 'average' | 'random',
  volatility: number,
  rand: () => number,
  decimals: 0 | 2,
): number[] {
  if (count <= 0) return []
  const safeTotal = Math.max(0, total)

  if (split === 'average') {
    const base = roundAmount(safeTotal / count, decimals)
    const amounts = Array.from({ length: count }, () => base)
    amounts[count - 1] = Math.max(0, roundAmount(safeTotal - base * (count - 1), decimals))
    return amounts
  }

  const weights = Array.from({ length: count }, () => 1 - volatility + rand() * volatility * 2)
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || 1
  const amounts = weights.map((weight) => roundAmount((safeTotal * weight) / weightSum, decimals))
  const diff = roundAmount(safeTotal - amounts.reduce((sum, amount) => sum + amount, 0), decimals)
  amounts[count - 1] = Math.max(0, roundAmount(amounts[count - 1] + diff, decimals))
  return amounts
}

function generateSlotTimes(windows: Array<[number, number]>, count: number, rand: () => number): number[] {
  if (count <= 0 || windows.length === 0) return []
  const totalLength = windows.reduce((sum, [start, end]) => sum + (end - start), 0)
  if (totalLength <= 0) return []

  const gap = totalLength / count
  const times: number[] = []

  const offsetToTime = (offset: number): number => {
    let remaining = Math.max(0, Math.min(totalLength, offset))
    for (const [start, end] of windows) {
      const length = end - start
      if (remaining <= length) return start + remaining
      remaining -= length
    }
    return windows[windows.length - 1][1]
  }

  for (let index = 0; index < count; index += 1) {
    const inner = 0.15 + rand() * 0.7
    times.push(offsetToTime((index + inner) * gap))
  }
  return times
}

export function createDayPlan(settings: Settings, ref: Date = new Date(), now: number = Date.now()): DayPlan {
  const today = dateKey(ref)
  const decimals = settings.unit.decimals
  const dailyTarget = roundAmount(getDailyTarget(settings, ref), decimals)
  const count = Math.max(0, Math.round(settings.pace.dailyCount))
  const windows = getAllowedWindows(settings, ref)
  const seed = hashString(
    [
      today,
      settings.pace.mode,
      settings.pace.workStart,
      settings.pace.workEnd,
      settings.pace.weekdays.join(','),
      settings.pace.dndEnabled ? 'dnd' : 'nodnd',
      settings.pace.dndStart,
      settings.pace.dndEnd,
      settings.pace.split,
      String(count),
      String(settings.monthlyGoal),
      String(decimals),
    ].join('|'),
  )
  const rand = mulberry32(seed)
  const times = generateSlotTimes(windows, count, rand)
  const amounts = distributeAmounts(
    dailyTarget,
    times.length,
    settings.pace.split,
    settings.pace.volatility,
    rand,
    decimals,
  )

  const slots: PlanSlot[] = times.map((at, index) => ({
    at,
    amount: amounts[index] ?? 0,
    status: at < now - 10_000 ? 'skipped' : 'pending',
  }))

  return { date: today, dailyTarget, slots }
}

/** 设置变更后重算：保留已完成记录，仅重建剩余计划 */
export function replanRemaining(settings: Settings, plan: DayPlan | null, now: number): DayPlan {
  const ref = new Date(now)
  if (!plan || plan.date !== dateKey(ref)) return createDayPlan(settings, ref, now)

  const done = plan.slots.filter((slot) => slot.status === 'done')
  const dailyTarget = roundAmount(getDailyTarget(settings, ref), settings.unit.decimals)
  const remainingCount = Math.max(0, Math.round(settings.pace.dailyCount) - done.length)
  const remainingTarget = Math.max(
    0,
    dailyTarget - done.reduce((sum, slot) => sum + slot.amount, 0),
  )

  const windows = getAllowedWindows(settings, ref, Math.max(now, startOfDay(ref)))
  const seed = hashString(
    [dateKey(ref), String(now), String(remainingCount), settings.pace.split, String(remainingTarget)].join('|'),
  )
  const rand = mulberry32(seed)
  const times = generateSlotTimes(windows, remainingCount, rand)
  const amounts = distributeAmounts(
    remainingTarget,
    times.length,
    settings.pace.split,
    settings.pace.volatility,
    rand,
    settings.unit.decimals,
  )

  const slots: PlanSlot[] = [
    ...done,
    ...times.map((at, index) => ({
      at,
      amount: amounts[index] ?? 0,
      status: 'pending' as const,
    })),
  ].sort((a, b) => a.at - b.at)

  return { date: plan.date, dailyTarget, slots }
}

export function getNextPending(plan: DayPlan | null): PlanSlot | null {
  if (!plan) return null
  const slot = plan.slots.find((item) => item.status === 'pending')
  return slot ?? null
}

export function consumeManual(plan: DayPlan | null, settings: Settings, now: number): ManualResult {
  const current =
    plan && plan.date === dateKey(new Date(now)) ? plan : createDayPlan(settings, new Date(now), now)
  const index = current.slots.findIndex((slot) => slot.status === 'pending')

  if (index >= 0) {
    const slots = current.slots.map((slot, slotIndex) =>
      slotIndex === index ? { ...slot, status: 'done' as const, source: 'manual' as const } : slot,
    )
    return {
      plan: { ...current, slots },
      amount: current.slots[index].amount,
      slotIndex: index,
      bonus: false,
    }
  }

  const base = getDailyTarget(settings, new Date(now)) / Math.max(1, settings.pace.dailyCount)
  const jitter = settings.pace.split === 'random' ? 0.7 + Math.random() * 0.8 : 1
  return {
    plan: current,
    amount: roundAmount(base * jitter, settings.unit.decimals),
    bonus: true,
  }
}

export function getMonthTotal(history: Receipt[], ref: Date): number {
  const key = monthKey(ref)
  return history.reduce((sum, receipt) => {
    return monthKey(new Date(receipt.at)) === key ? sum + receipt.amount : sum
  }, 0)
}

export function getDayTotal(history: Receipt[], ref: Date): number {
  const key = dateKey(ref)
  return history.reduce((sum, receipt) => {
    return dateKey(new Date(receipt.at)) === key ? sum + receipt.amount : sum
  }, 0)
}

export function getTodayReceipts(history: Receipt[], ref: Date): Receipt[] {
  const key = dateKey(ref)
  return history.filter((receipt) => dateKey(new Date(receipt.at)) === key)
}

export interface DayBar {
  key: string
  label: string
  total: number
  isToday: boolean
}

export function getLast7Days(history: Receipt[], ref: Date): DayBar[] {
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  const bars: DayBar[] = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - offset)
    bars.push({
      key: dateKey(date),
      label: offset === 0 ? '今天' : labels[date.getDay()],
      total: getDayTotal(history, date),
      isToday: offset === 0,
    })
  }
  return bars
}

export function getPlanProgress(plan: DayPlan | null) {
  const slots = plan?.slots ?? []
  const done = slots.filter((slot) => slot.status === 'done').length
  const pending = slots.filter((slot) => slot.status === 'pending').length
  const skipped = slots.filter((slot) => slot.status === 'skipped').length
  return { total: slots.length, done, pending, skipped }
}
