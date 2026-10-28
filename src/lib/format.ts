import type { UnitConfig } from './types'

const numberFormatters = new Map<number, Intl.NumberFormat>()

function getFormatter(decimals: number): Intl.NumberFormat {
  const cached = numberFormatters.get(decimals)
  if (cached) return cached
  const formatter = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  numberFormatters.set(decimals, formatter)
  return formatter
}

export function formatNumber(value: number, decimals: 0 | 2 = 0): string {
  const safe = Number.isFinite(value) ? value : 0
  return getFormatter(decimals).format(Number(safe.toFixed(decimals)))
}

export function formatAmount(value: number, unit: UnitConfig): string {
  const number = formatNumber(value, unit.decimals)
  if (!unit.symbol) return `${number} ${unit.label}`
  return unit.symbolPosition === 'prefix' ? `${unit.symbol}${number}` : `${number} ${unit.symbol}`
}

/** 拆分为「小号前缀 / 大号数字 / 小号后缀」，用于钱包主卡排版 */
export function splitAmount(value: number, unit: UnitConfig) {
  const number = formatNumber(value, unit.decimals)
  if (unit.symbol) {
    return unit.symbolPosition === 'prefix'
      ? { lead: unit.symbol, number, tail: '' }
      : { lead: '', number, tail: unit.symbol }
  }
  return { lead: '', number, tail: unit.label }
}

/** 语音播报文案：88.00 元 / 120 查克拉 */
export function formatSpeech(value: number, unit: UnitConfig): string {
  return `${formatNumber(value, unit.decimals)} ${unit.label}`
}

export function formatClock(timestamp: number): string {
  const date = new Date(timestamp)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  return sameDay ? formatClock(timestamp) : `${date.getMonth() + 1}/${date.getDate()} ${formatClock(timestamp)}`
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function formatMonthTitle(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
}

export function formatDateKeyLabel(key: string): string {
  const [, m, d] = key.split('-')
  return `${Number(m)}/${Number(d)}`
}
