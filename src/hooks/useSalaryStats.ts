import { useMemo } from 'react'
import {
  getDayTotal,
  getMonthTotal,
  getNextPending,
  getPlanProgress,
  getRemainingDaysInMonth,
} from '@/lib/engine'
import { formatMonthTitle } from '@/lib/format'
import { useSalaryStore } from '@/store/salaryStore'

export function useSalaryStats() {
  const settings = useSalaryStore((state) => state.settings)
  const plan = useSalaryStore((state) => state.plan)
  const history = useSalaryStore((state) => state.history)
  const now = useSalaryStore((state) => state.now)

  return useMemo(() => {
    const ref = new Date(now)
    const monthTotal = getMonthTotal(history, ref)
    const todayTotal = getDayTotal(history, ref)
    const goal = settings?.monthlyGoal ?? 0
    const nextSlot = getNextPending(plan)

    return {
      monthTotal,
      todayTotal,
      goal,
      progress: goal > 0 ? monthTotal / goal : 0,
      daysLeft: getRemainingDaysInMonth(ref),
      todayTarget: plan?.dailyTarget ?? 0,
      nextSlot,
      remainingMs: nextSlot ? Math.max(0, nextSlot.at - now) : 0,
      todayProgress: getPlanProgress(plan),
      monthTitle: formatMonthTitle(ref),
      unit: settings?.unit,
    }
  }, [settings, plan, history, now])
}
