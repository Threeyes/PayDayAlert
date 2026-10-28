import type { Settings, UnitPreset } from './types'

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  monthlyGoal: 20000,
  unit: {
    label: '元',
    symbol: '¥',
    symbolPosition: 'prefix',
    decimals: 2,
  },
  pace: {
    mode: 'scheduled',
    dailyCount: 8,
    workStart: '09:30',
    workEnd: '18:30',
    weekdays: [1, 2, 3, 4, 5],
    dndEnabled: true,
    dndStart: '23:00',
    dndEnd: '07:00',
    split: 'random',
    volatility: 0.45,
  },
  alerts: {
    bubble: true,
    sound: true,
    voice: true,
    systemNotification: false,
    vibration: true,
  },
  triggers: {
    hotkey: true,
    voiceCommand: false,
    wakeLock: false,
  },
}

export const UNIT_PRESETS: UnitPreset[] = [
  {
    id: 'cny',
    name: '人民币',
    hint: '¥ 元',
    unit: { label: '元', symbol: '¥', symbolPosition: 'prefix', decimals: 2 },
  },
  {
    id: 'usd',
    name: '美元',
    hint: '$ 美元',
    unit: { label: '美元', symbol: '$', symbolPosition: 'prefix', decimals: 2 },
  },
  {
    id: 'btc',
    name: '比特币',
    hint: '₿ BTC',
    unit: { label: 'BTC', symbol: '₿', symbolPosition: 'prefix', decimals: 2 },
  },
  {
    id: 'chakra',
    name: '查克拉',
    hint: '火影同款',
    unit: { label: '查克拉', symbol: '', symbolPosition: 'suffix', decimals: 0 },
  },
  {
    id: 'coins',
    name: '游戏金币',
    hint: '打怪掉落',
    unit: { label: '金币', symbol: '', symbolPosition: 'suffix', decimals: 0 },
  },
  {
    id: 'fishing',
    name: '摸鱼时长',
    hint: '带薪发呆',
    unit: { label: '分钟', symbol: '', symbolPosition: 'suffix', decimals: 0 },
  },
  {
    id: 'pie',
    name: '老板画饼',
    hint: '张张管饱',
    unit: { label: '张饼', symbol: '', symbolPosition: 'suffix', decimals: 0 },
  },
  {
    id: 'custom',
    name: '自定义',
    hint: '你说了算',
    unit: { label: '积分', symbol: '', symbolPosition: 'suffix', decimals: 0 },
  },
]

export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']
