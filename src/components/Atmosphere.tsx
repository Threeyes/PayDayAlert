export function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      <div className="absolute -top-[28%] left-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,224,168,0.20),rgba(76,224,168,0.05)_42%,transparent_68%)] blur-2xl animate-float-slow" />
      <div className="absolute -bottom-[26%] -right-[18%] h-[62vmin] w-[62vmin] rounded-full bg-[radial-gradient(circle,rgba(242,199,119,0.14),transparent_62%)] blur-2xl" />
      <div className="absolute -left-[20%] top-[38%] h-[46vmin] w-[46vmin] rounded-full bg-[radial-gradient(circle,rgba(46,201,143,0.10),transparent_65%)] blur-2xl" />
      <div className="absolute inset-0 grain opacity-[0.045]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,7,0)_0%,rgba(5,8,7,0.35)_55%,rgba(5,8,7,0.85)_100%)]" />
    </div>
  )
}
