export function Logo({ size = 'lg', variant = 'full' }: { size?: 'sm' | 'lg'; variant?: 'full' | 'mark' }) {
  const h = size === 'lg' ? 40 : 28;
  return (
    <span className="inline-flex items-center gap-2" style={{ height: h }}>
      <svg viewBox="0 0 48 48" height={h} width={h} aria-hidden fill="#FF6900">
        {/* сердце с вырезанным крестом (плюс) */}
        <path d="M24 44 L6 26 A11 11 0 0 1 24 10 A11 11 0 0 1 42 26 Z" />
        <path d="M21 20h6v4h4v6h-4v4h-6v-4h-4v-6h4z" fill="#fff" />
      </svg>
      {variant === 'full' && (
        <span className="font-display font-extrabold tracking-tight text-brand"
              style={{ fontSize: h * 0.7 }}>Fortitude</span>
      )}
    </span>
  );
}
