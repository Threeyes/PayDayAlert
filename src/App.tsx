import { Atmosphere } from '@/components/Atmosphere'
import { Onboarding } from '@/components/Onboarding'
import { NotificationBanner, ReceiptOverlay } from '@/components/ReceiptOverlay'
import { SettingsSheet } from '@/components/SettingsSheet'
import { WalletPage } from '@/components/WalletPage'
import { useHotkeyTrigger, useScheduler, useWakeLock } from '@/hooks/useRuntime'
import { useVoiceCommand } from '@/hooks/useVoiceCommand'
import { useSalaryStore } from '@/store/salaryStore'

export default function App() {
  const settings = useSalaryStore((state) => state.settings)
  const settingsOpen = useSalaryStore((state) => state.settingsOpen)

  useScheduler()
  useHotkeyTrigger()
  useWakeLock()
  useVoiceCommand()

  return (
    <>
      <Atmosphere />
      <div className="relative z-10">{settings ? <WalletPage /> : <Onboarding />}</div>
      <NotificationBanner />
      <ReceiptOverlay />
      {settings && settingsOpen ? <SettingsSheet /> : null}
    </>
  )
}
