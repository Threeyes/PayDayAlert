import { useEffect } from 'react'
import { useSalaryStore } from '@/store/salaryStore'

const KEYWORDS = /到账|到帐|钱来|加钱|收钱|发钱|来钱/

export function useVoiceCommand() {
  const enabled = useSalaryStore((state) => Boolean(state.settings?.triggers.voiceCommand))
  const triggerManual = useSalaryStore((state) => state.triggerManual)

  useEffect(() => {
    if (!enabled) return
    const scope = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const Recognition = scope.SpeechRecognition ?? scope.webkitSpeechRecognition
    if (!Recognition) return

    interface SpeechRecognitionLike {
      lang: string
      continuous: boolean
      interimResults: boolean
      start: () => void
      stop: () => void
      onresult: ((event: SpeechResultEventLike) => void) | null
      onend: (() => void) | null
      onerror: (() => void) | null
    }

    interface SpeechResultEventLike {
      resultIndex: number
      results: ArrayLike<ArrayLike<{ transcript: string }>>
    }

    let stopped = false
    let lastTriggered = 0
    const recognition = new Recognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let text = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        text += event.results[index][0]?.transcript ?? ''
      }
      if (!KEYWORDS.test(text)) return
      const now = Date.now()
      if (now - lastTriggered < 2500) return
      lastTriggered = now
      triggerManual()
    }

    recognition.onend = () => {
      if (stopped) return
      try {
        recognition.start()
      } catch {
        /* 忽略重复启动 */
      }
    }

    recognition.onerror = () => {
      /* 麦克风权限或网络异常时保持静默 */
    }

    try {
      recognition.start()
    } catch {
      /* 忽略启动失败 */
    }

    return () => {
      stopped = true
      try {
        recognition.stop()
      } catch {
        /* 忽略停止失败 */
      }
    }
  }, [enabled, triggerManual])
}
