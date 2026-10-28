import { useCallback, useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { AlertsStep } from '@/components/onboarding/AlertsStep'
import { PaceStep } from '@/components/onboarding/PaceStep'
import { TargetStep } from '@/components/onboarding/TargetStep'
import { PrimaryButton } from '@/components/ui/controls'
import { DEFAULT_SETTINGS } from '@/lib/defaults'
import { unlockAudio } from '@/lib/feedback'
import type { Settings } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useSalaryStore } from '@/store/salaryStore'

const STEPS = ['目标', '节奏', '提示']

export function Onboarding() {
  const complete = useSalaryStore((state) => state.completeOnboarding)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Settings>(() => structuredClone(DEFAULT_SETTINGS))

  const update = useCallback((mutate: (draft: Settings) => void) => {
    setDraft((previous) => {
      const next = structuredClone(previous)
      mutate(next)
      return next
    })
  }, [])

  const canNext = draft.monthlyGoal > 0 && draft.pace.dailyCount > 0

  const finish = () => {
    unlockAudio()
    complete(draft)
  }

  return (
    <div className="mx-auto w-full max-w-[520px] px-5 pb-44 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-mint-300 via-mint-400 to-mint-600 text-[15px] font-bold text-ink-950 shadow-[0_10px_24px_-10px_rgba(76,224,168,0.9)]">
            ¥
          </span>
          <div>
            <p className="font-display text-[14px] font-semibold text-white/85">PayDay</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">Salary Notifier</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                index === step ? 'w-6 bg-mint-400' : index < step ? 'w-1.5 bg-mint-400/50' : 'w-1.5 bg-white/12',
              )}
            />
          ))}
        </div>
      </header>

      <div key={step} className="mt-8 animate-fade-in">
        {step === 0 ? <TargetStep draft={draft} update={update} /> : null}
        {step === 1 ? <PaceStep draft={draft} update={update} /> : null}
        {step === 2 ? <AlertsStep draft={draft} update={update} /> : null}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-ink-950 via-ink-950/92 to-transparent px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-12">
        <div className="pointer-events-auto flex w-full max-w-[520px] items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              aria-label="上一步"
              className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
            >
              <ArrowLeft size={17} />
            </button>
          ) : null}
          <PrimaryButton
            className="flex-1"
            disabled={!canNext}
            onClick={() => {
              if (step < 2) setStep((value) => value + 1)
              else finish()
            }}
          >
            {step < 2 ? (
              <>
                下一步
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Sparkles size={16} />
                开始搞钱
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
