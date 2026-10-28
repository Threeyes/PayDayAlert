let audioContext: AudioContext | null = null

export function unlockAudio() {
  try {
    if (!audioContext) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      audioContext = new Ctor()
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
  } catch {
    /* 浏览器不支持音频时静默失败 */
  }
}

function ringBell(ctx: AudioContext, destination: AudioNode, frequency: number, start: number, duration: number, volume: number) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

/** 合成一段收银「叮咚」音效，无需外部音频资源 */
export function playCoinSound() {
  unlockAudio()
  if (!audioContext) return
  const ctx = audioContext
  if (ctx.state === 'suspended') void ctx.resume()

  const start = ctx.currentTime + 0.01
  const master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)

  ringBell(ctx, master, 1318.51, start, 0.55, 0.22)
  ringBell(ctx, master, 1975.53, start + 0.08, 0.7, 0.15)
  ringBell(ctx, master, 2637.02, start + 0.08, 0.32, 0.05)

  // 收银机按键的短促高频噪声
  const length = Math.floor(ctx.sampleRate * 0.06)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 2400
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.16
  source.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(master)
  source.start(start)
}

export function speakReceipt(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.05
    utterance.pitch = 1.02
    utterance.volume = 1
    const voice = synth.getVoices().find((item) => item.lang.toLowerCase().startsWith('zh'))
    if (voice) utterance.voice = voice
    synth.speak(utterance)
  } catch {
    /* 忽略语音合成异常 */
  }
}

export type NotificationState = NotificationPermission | 'unsupported'

export function getNotificationState(): NotificationState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationState> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export function sendSystemNotification(amountText: string, phrase: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    const iconUrl = `${import.meta.env.BASE_URL}icons/icon-192.png`
    const notification = new Notification('到账提醒', {
      body: `${amountText} · ${phrase}`,
      icon: iconUrl,
      badge: iconUrl,
      tag: `payday-${Date.now()}`,
      silent: true,
    })
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {
    /* 部分浏览器要求通过 Service Worker 展示通知 */
  }
}

export function vibrateReceipt() {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate([18, 40, 24])
  } catch {
    /* 忽略震动异常 */
  }
}

export function supportsVoiceCommand(): boolean {
  if (typeof window === 'undefined') return false
  const scope = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
  return Boolean(scope.SpeechRecognition || scope.webkitSpeechRecognition)
}

export function supportsWakeLock(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

export function supportsDocumentPiP(): boolean {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window
}
