import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function IconButton({
  label,
  onClick,
  children,
  active,
  className,
}: {
  label: string
  onClick?: () => void
  children: ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition duration-200 hover:bg-white/[0.09] hover:text-white active:scale-95',
        active && 'border-mint-400/40 bg-mint-400/10 text-mint-300',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[26px] w-[44px] shrink-0 rounded-full border transition duration-300',
        checked
          ? 'border-mint-400/50 bg-mint-400/90 shadow-[0_0_18px_rgba(76,224,168,0.35)]'
          : 'border-white/10 bg-white/10',
        disabled && 'cursor-not-allowed opacity-35',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow transition-all duration-300',
          checked ? 'left-[21px]' : 'left-[2px]',
          disabled && 'bg-white/70',
        )}
      />
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (next: T) => void
  disabled?: boolean
}) {
  return (
    <div className="flex w-full rounded-full border border-white/[0.07] bg-white/[0.04] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 rounded-full px-3 py-[7px] text-[12px] font-medium transition duration-200',
            value === option.value
              ? 'bg-white/[0.12] text-white shadow-insetline'
              : 'text-white/40 hover:text-white/70',
            disabled && 'cursor-not-allowed opacity-40',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-white/[0.06] px-5 py-5 last:border-b-0">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">{title}</h3>
      <div>{children}</div>
    </section>
  )
}

export function Row({
  label,
  hint,
  children,
  stack,
}: {
  label: string
  hint?: string
  children: ReactNode
  stack?: boolean
}) {
  return (
    <div className={cn('py-2.5', stack ? 'space-y-2' : 'flex items-center justify-between gap-3')}>
      <div className={cn(!stack && 'min-w-0')}>
        <p className="text-[13px] text-white/80">{label}</p>
        {hint ? <p className="mt-0.5 text-[10px] leading-relaxed text-white/30">{hint}</p> : null}
      </div>
      <div className={cn(stack ? 'w-full' : 'shrink-0')}>{children}</div>
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[11px] transition duration-200',
        active
          ? 'border-mint-400/45 bg-mint-400/12 text-mint-200'
          : 'border-white/10 bg-white/[0.03] text-white/45 hover:border-white/20 hover:text-white/70',
        className,
      )}
    >
      {children}
    </button>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export function PrimaryButton({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-mint-300 via-mint-400 to-mint-500 px-6 py-[15px] text-[15px] font-bold text-ink-950 shadow-[0_18px_45px_-16px_rgba(76,224,168,0.8)] transition duration-200 hover:shadow-[0_20px_55px_-12px_rgba(76,224,168,0.85)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-white/70 blur-[1px]" />
      <span className="pointer-events-none absolute -inset-y-10 -left-1/3 w-1/3 rotate-12 bg-white/25 blur-xl transition-transform duration-700 group-hover:translate-x-[420%]" />
      <span className="relative flex items-center gap-2.5">{children}</span>
    </button>
  )
}

export function GhostButton({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[13px] text-white/70 transition duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}
