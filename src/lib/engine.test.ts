import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './defaults'
import {
  consumeManual,
  createDayPlan,
  dateKey,
  distributeAmounts,
  getDailyTarget,
  getLast7Days,
  mulberry32,
  replanRemaining,
  roundAmount,
} from './engine'
import type { Receipt, Settings } from './types'

function makeSettings(patch: (settings: Settings) => void = () => {}): Settings {
  const settings = structuredClone(DEFAULT_SETTINGS)
  patch(settings)
  return settings
}

/** 从给定日期向后找到最近的工作日 */
function nextWeekday(start: Date): Date {
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1)
  return date
}

function at(date: Date, hours: number, minutes = 0): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes).getTime()
}

describe('distributeAmounts', () => {
  it('平均分配时合计与目标一致', () => {
    const total = roundAmount(20000 / 21, 2)
    const amounts = distributeAmounts(total, 8, 'average', 0.45, mulberry32(1), 2)
    expect(amounts).toHaveLength(8)
    expect(amounts.reduce((sum, value) => sum + value, 0)).toBeCloseTo(total, 1)
  })

  it('随机分配时保持合计守恒', () => {
    const amounts = distributeAmounts(1000, 8, 'random', 0.45, mulberry32(7), 2)
    expect(amounts).toHaveLength(8)
    expect(amounts.every((value) => value >= 0)).toBe(true)
    expect(amounts.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1000, 1)
  })
})

describe('createDayPlan', () => {
  it('定时模式下每天生成固定数量的槽位，且落在工作时段内', () => {
    const ref = nextWeekday(new Date(2026, 9, 1))
    const settings = makeSettings()
    const now = at(ref, 8)
    const plan = createDayPlan(settings, ref, now)

    expect(plan.date).toBe(dateKey(ref))
    expect(plan.slots).toHaveLength(settings.pace.dailyCount)
    expect(plan.dailyTarget).toBeCloseTo(getDailyTarget(settings, ref), 2)

    const start = at(ref, 9, 30)
    const end = at(ref, 18, 30)
    for (const slot of plan.slots) {
      expect(slot.at).toBeGreaterThanOrEqual(start)
      expect(slot.at).toBeLessThanOrEqual(end)
      expect(slot.status).toBe('pending')
    }
  })

  it('同样的日期与设置生成完全相同的计划', () => {
    const ref = nextWeekday(new Date(2026, 9, 1))
    const settings = makeSettings()
    const now = at(ref, 8)
    const first = createDayPlan(settings, ref, now)
    const second = createDayPlan(settings, ref, now)
    expect(second).toEqual(first)
  })

  it('休息日不生成计划', () => {
    const ref = new Date(2026, 9, 1)
    while (ref.getDay() !== 6) ref.setDate(ref.getDate() + 1)
    const plan = createDayPlan(makeSettings(), ref, at(ref, 10))
    expect(plan.slots).toHaveLength(0)
  })

  it('当天已过去的时间槽位会被标记为跳过', () => {
    const ref = nextWeekday(new Date(2026, 9, 1))
    const plan = createDayPlan(makeSettings(), ref, at(ref, 23))
    expect(plan.slots.every((slot) => slot.status === 'skipped')).toBe(true)
  })
})

describe('consumeManual', () => {
  it('优先提前领取下一笔待触发额度', () => {
    const ref = nextWeekday(new Date(2026, 9, 1))
    const settings = makeSettings()
    const now = at(ref, 8)
    const plan = createDayPlan(settings, ref, now)
    const result = consumeManual(plan, settings, now)

    expect(result.bonus).toBe(false)
    expect(result.slotIndex).toBe(0)
    expect(result.amount).toBe(plan.slots[0].amount)
    expect(result.plan.slots[0].status).toBe('done')
  })

  it('计划完成后可以加餐', () => {
    const ref = nextWeekday(new Date(2026, 9, 1))
    const settings = makeSettings()
    const now = at(ref, 8)
    const plan = createDayPlan(settings, ref, now)
    const finished = {
      ...plan,
      slots: plan.slots.map((slot) => ({ ...slot, status: 'done' as const })),
    }

    const result = consumeManual(finished, settings, now)
    expect(result.bonus).toBe(true)
    expect(result.amount).toBeGreaterThan(0)
    expect(result.plan).toEqual(finished)
  })
})

describe('replanRemaining', () => {
  it('保留已到账记录，仅重建剩余计划', () => {
    const ref = nextWeekday(new Date(2026, 9, 1))
    const now = at(ref, 8)
    const plan = consumeManual(createDayPlan(makeSettings(), ref, now), makeSettings(), now).plan
    const doneBefore = plan.slots.filter((slot) => slot.status === 'done')

    const nextSettings = makeSettings((settings) => {
      settings.pace.dailyCount = 10
    })
    const next = replanRemaining(nextSettings, plan, now)
    const doneAfter = next.slots.filter((slot) => slot.status === 'done')

    expect(doneAfter.map((slot) => slot.at)).toEqual(doneBefore.map((slot) => slot.at))
    expect(doneAfter.map((slot) => slot.amount)).toEqual(doneBefore.map((slot) => slot.amount))
    expect(next.slots).toHaveLength(10)
  })
})

describe('getLast7Days', () => {
  it('返回 7 天数据且今天排在最后', () => {
    const ref = new Date(2026, 9, 26, 12)
    const history: Receipt[] = [
      { id: 'today', at: ref.getTime(), amount: 88, source: 'manual' },
      { id: 'yesterday', at: ref.getTime() - 86_400_000, amount: 12, source: 'auto' },
    ]
    const bars = getLast7Days(history, ref)

    expect(bars).toHaveLength(7)
    expect(bars[6].key).toBe(dateKey(ref))
    expect(bars[6].isToday).toBe(true)
    expect(bars[6].total).toBe(88)
    expect(bars[5].total).toBe(12)
  })
})
