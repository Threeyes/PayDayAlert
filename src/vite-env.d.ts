/// <reference types="vite/client" />

interface DocumentPictureInPictureApi {
  requestWindow: (options?: {
    width?: number
    height?: number
    disallowReturnToOpener?: boolean
    preferInitialWindowPlacement?: boolean
  }) => Promise<Window>
  window: Window | null
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPictureApi
}
