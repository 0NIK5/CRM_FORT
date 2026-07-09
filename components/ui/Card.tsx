export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white border border-surface-muted p-5 ${className}`}>{children}</div>;
}
