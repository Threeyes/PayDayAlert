import { useEffect, useRef, useState } from 'react'

/** 数字滚动动画，默认从 0 增长到目标值 */
export function useCountUp(target: number, duration = 900, startFrom = 0) {
  const [display, setDisplay] = useState(startFrom)
  const fromRef = useRef(startFrom)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) {
      setDisplay(target)
      return
    }
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = target
      setDisplay(target)
      return
    }

    let frame = 0
    const startTime = performance.now()
    const step = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (target - from) * eased)
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return display
}
