import { useCallback, useEffect, useState } from 'react'
import { WIDGET_CSS } from '@/lib/widgetStyles'

/** 将主窗口样式复制到 PiP 文档，保证字体与组件样式一致 */
function copyStyles(target: Document) {
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      const css = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join('\n')
      if (!css) return
      const style = target.createElement('style')
      style.textContent = css
      target.head.appendChild(style)
    } catch {
      const href = (sheet as CSSStyleSheet).href
      if (!href) return
      const link = target.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      target.head.appendChild(link)
    }
  })

  const widgetStyle = target.createElement('style')
  widgetStyle.textContent = WIDGET_CSS
  target.head.appendChild(widgetStyle)
}

export function useDocumentPiP() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null)
  const supported = typeof window !== 'undefined' && Boolean(window.documentPictureInPicture)

  useEffect(() => {
    if (!pipWindow) return
    const handleClose = () => setPipWindow(null)
    pipWindow.addEventListener('pagehide', handleClose)
    return () => pipWindow.removeEventListener('pagehide', handleClose)
  }, [pipWindow])

  const open = useCallback(async () => {
    const api = window.documentPictureInPicture
    if (!api) return
    if (pipWindow && !pipWindow.closed) {
      pipWindow.focus()
      return
    }
    try {
      const pip = await api.requestWindow({ width: 320, height: 250, disallowReturnToOpener: false })
      pip.document.documentElement.lang = 'zh-CN'
      pip.document.title = 'PayDay 悬浮窗'
      copyStyles(pip.document)
      pip.document.body.className = 'pw-body'
      setPipWindow(pip)
    } catch {
      /* 用户拒绝或浏览器限制时静默失败 */
    }
  }, [pipWindow])

  const close = useCallback(() => {
    if (pipWindow && !pipWindow.closed) pipWindow.close()
    setPipWindow(null)
  }, [pipWindow])

  return { supported, pipWindow, open, close }
}
