import { Card } from './Card';
export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <div className="text-sm text-ink/60">{label}</div>
      <div className="mt-1 font-display text-3xl font-extrabold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-brand-dark">{hint}</div>}
    </Card>
  );
}
