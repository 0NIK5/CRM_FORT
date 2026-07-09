const tones: Record<string, string> = {
  brand: 'bg-brand-light text-brand-dark', green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700', gray: 'bg-surface-muted text-ink',
};
export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
