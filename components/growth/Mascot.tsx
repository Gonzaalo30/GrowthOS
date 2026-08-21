/**
 * Mascota de GrowthOS — primera versión, deliberadamente simple. Es una
 * propuesta de partida, no una decisión de marca cerrada: nombre y diseño
 * final los valida el fundador antes de usarla en más sitios.
 */
export function Mascot({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <circle cx="20" cy="20" r="18" fill="var(--color-brand-100)" />
      <circle cx="20" cy="22" r="11" fill="var(--color-brand-500)" />
      <circle cx="16" cy="21" r="2.2" fill="white" />
      <circle cx="24" cy="21" r="2.2" fill="white" />
      <circle cx="16" cy="21" r="1" fill="black" />
      <circle cx="24" cy="21" r="1" fill="black" />
      <path d="M16 26q4 3 8 0" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="18.5" y="6" width="3" height="7" rx="1.5" fill="var(--color-brand-600)" />
      <circle cx="20" cy="6" r="2.5" fill="var(--color-brand-400)" />
    </svg>
  );
}

export function MascotMessage({ message, className }: { message: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <Mascot size={36} />
      <p className="text-sm text-foreground">{message}</p>
    </div>
  );
}
