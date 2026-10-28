import { useEffect } from 'react'
import { useSalaryStore } from '@/store/salaryStore'

export function useScheduler() {
  const hasSettings = useSalaryStore((state) => Boolean(state.settings))
  const tick = useSalaryStore((state) => state.tick)

  useEffect(() => {
    if (!hasSettings) return
    tick()
    const timer = window.setInterval(tick, 1000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [hasSettings, tick])
}

export function useHotkeyTrigger() {
  const enabled = useSalaryStore((state) => Boolean(state.settings?.triggers.hotkey))
  const triggerManual = useSalaryStore((state) => state.triggerManual)

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== 'Enter') return
      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return
      }
      if (useSalaryStore.getState().settingsOpen) return
      event.preventDefault()
      triggerManual()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, triggerManual])
}

export function useWakeLock() {
  const enabled = useSalaryStore((state) => Boolean(state.settings?.triggers.wakeLock))

  useEffect(() => {
    if (!enabled) return
    const wakeLockApi = (navigator as unknown as { wakeLock?: { request: (type: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock
    if (!wakeLockApi) return

    let sentinel: { release: () => Promise<void> } | null = null
    let cancelled = false

    const request = async () => {
      if (cancelled) return
      try {
        sentinel = await wakeLockApi.request('screen')
      } catch {
        /* 用户未授权或系统限制 */
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release?.()
    }
  }, [enabled])
}
