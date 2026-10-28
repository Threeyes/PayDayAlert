import { create } from 'zustand'
import { consumeManual, createDayPlan, dateKey, getNextPending, replanRemaining } from '@/lib/engine'
import {
  playCoinSound,
  sendSystemNotification,
  speakReceipt,
  vibrateReceipt,
} from '@/lib/feedback'
import { formatAmount, formatSpeech } from '@/lib/format'
import { pickPhrase } from '@/lib/phrases'
import {
  clearAllStorage,
  loadHistory,
  loadPlan,
  loadSettings,
  saveHistory,
  savePlan,
  saveSettings,
} from '@/lib/storage'
import type { DayPlan, Receipt, ReceiptSource, Settings } from '@/lib/types'

export interface ReceiptFlash {
  key: number
  amount: number
  phrase: string
  source: ReceiptSource
}

export interface BannerData {
  key: number
  amount: number
  phrase: string
  at: number
}

interface SalaryStore {
  settings: Settings | null
  plan: DayPlan | null
  history: Receipt[]
  settingsOpen: boolean
  flash: ReceiptFlash | null
  banner: BannerData | null
  now: number
  completeOnboarding: (settings: Settings) => void
  updateSettings: (settings: Settings) => void
  tick: () => void
  triggerManual: () => void
  openSettings: () => void
  closeSettings: () => void
  dismissFlash: () => void
  dismissBanner: () => void
  clearHistory: () => void
  resetAll: () => void
}

function makeId(now: number): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${now}-${Math.random().toString(36).slice(2, 10)}`
}

function bootPlan(settings: Settings): DayPlan {
  const stored = loadPlan()
  if (stored && stored.date === dateKey(new Date())) return stored
  return createDayPlan(settings)
}

const initialSettings = loadSettings()
const initialHistory = loadHistory()
const initialPlan = initialSettings ? bootPlan(initialSettings) : null

export const useSalaryStore = create<SalaryStore>((set, get) => {
  const present = (receipt: Receipt) => {
    const settings = get().settings
    if (!settings) return
    const { alerts } = settings
    const phrase = pickPhrase()
    const amountText = formatAmount(receipt.amount, settings.unit)

    if (alerts.sound) playCoinSound()
    if (alerts.voice) speakReceipt(`到账 ${formatSpeech(receipt.amount, settings.unit)}`)
    if (alerts.vibration) vibrateReceipt()
    if (alerts.systemNotification) sendSystemNotification(amountText, phrase)

    const key = Date.now()
    if (alerts.bubble) {
      set({ banner: { key, amount: receipt.amount, phrase, at: receipt.at } })
    }
    set({ flash: { key, amount: receipt.amount, phrase, source: receipt.source } })
  }

  const commit = (plan: DayPlan, receipt: Receipt) => {
    const history = [receipt, ...get().history].slice(0, 200)
    savePlan(plan)
    saveHistory(history)
    set({ plan, history })
    present(receipt)
  }

  return {
    settings: initialSettings,
    plan: initialPlan,
    history: initialHistory,
    settingsOpen: false,
    flash: null,
    banner: null,
    now: Date.now(),

    completeOnboarding: (settings) => {
      const now = Date.now()
      const plan = createDayPlan(settings, new Date(now), now)
      saveSettings(settings)
      savePlan(plan)
      set({ settings, plan, settingsOpen: false, now })
    },

    updateSettings: (settings) => {
      const now = Date.now()
      const plan = replanRemaining(settings, get().plan, now)
      saveSettings(settings)
      savePlan(plan)
      set({ settings, plan })
    },

    tick: () => {
      const now = Date.now()
      const state = get()
      set({ now })
      if (!state.settings) return

      const today = dateKey(new Date(now))
      if (!state.plan || state.plan.date !== today) {
        const plan = createDayPlan(state.settings, new Date(now), now)
        savePlan(plan)
        set({ plan })
        return
      }

      const dueIndex = state.plan.slots.findIndex(
        (slot) => slot.status === 'pending' && slot.at <= now,
      )
      if (dueIndex < 0) return

      const slots = state.plan.slots.map((slot, index) => {
        if (index === dueIndex) {
          return { ...slot, status: 'done' as const, source: 'auto' as const }
        }
        if (slot.status === 'pending' && slot.at <= now) {
          return { ...slot, status: 'skipped' as const }
        }
        return slot
      })
      const due = state.plan.slots[dueIndex]
      commit(
        { ...state.plan, slots },
        {
          id: makeId(now),
          at: now,
          amount: due.amount,
          source: 'auto',
          slotIndex: dueIndex,
        },
      )
    },

    triggerManual: () => {
      const state = get()
      if (!state.settings) return
      const now = Date.now()
      const result = consumeManual(state.plan, state.settings, now)
      commit(result.plan, {
        id: makeId(now),
        at: now,
        amount: result.amount,
        source: 'manual',
        slotIndex: result.slotIndex,
      })
    },

    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),
    dismissFlash: () => set({ flash: null }),
    dismissBanner: () => set({ banner: null }),

    clearHistory: () => {
      const state = get()
      saveHistory([])
      const plan = state.settings
        ? createDayPlan(state.settings, new Date(), Date.now())
        : null
      if (plan) savePlan(plan)
      set({ history: [], plan })
    },

    resetAll: () => {
      clearAllStorage()
      set({
        settings: null,
        plan: null,
        history: [],
        settingsOpen: false,
        flash: null,
        banner: null,
      })
    },
  }
})

export function getNextSlotInfo(plan: DayPlan | null) {
  const slot = getNextPending(plan)
  return slot
}
