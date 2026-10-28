export type SymbolPosition = 'prefix' | 'suffix'

export interface UnitConfig {
  /** 单位名称，如「元」「查克拉」「张饼」 */
  label: string
  /** 符号，可留空，如「¥」「$」 */
  symbol: string
  symbolPosition: SymbolPosition
  decimals: 0 | 2
}

export type PaceMode = 'scheduled' | 'anytime'
export type SplitMode = 'average' | 'random'

export interface PaceConfig {
  mode: PaceMode
  dailyCount: number
  workStart: string
  workEnd: string
  /** 0 = 周日 ... 6 = 周六 */
  weekdays: number[]
  dndEnabled: boolean
  dndStart: string
  dndEnd: string
  split: SplitMode
  volatility: number
}

export interface AlertConfig {
  bubble: boolean
  sound: boolean
  voice: boolean
  systemNotification: boolean
  vibration: boolean
}

export interface TriggerConfig {
  hotkey: boolean
  voiceCommand: boolean
  wakeLock: boolean
}

export interface Settings {
  version: 1
  monthlyGoal: number
  unit: UnitConfig
  pace: PaceConfig
  alerts: AlertConfig
  triggers: TriggerConfig
}

export type ReceiptSource = 'auto' | 'manual' | 'catchup'

export interface Receipt {
  id: string
  at: number
  amount: number
  source: ReceiptSource
  slotIndex?: number
}

export type SlotStatus = 'pending' | 'done' | 'skipped'

export interface PlanSlot {
  at: number
  amount: number
  status: SlotStatus
  source?: ReceiptSource
}

export interface DayPlan {
  date: string
  dailyTarget: number
  slots: PlanSlot[]
}

export interface UnitPreset {
  id: string
  name: string
  hint: string
  unit: UnitConfig
}
