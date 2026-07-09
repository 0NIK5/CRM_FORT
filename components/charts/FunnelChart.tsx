'use client';
import { formatMoney } from '@/lib/format';
export function FunnelBars({ data }: { data: { stage: string; count: number; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.stage} className="flex items-center gap-3">
          <div className="w-24 shrink-0 text-xs capitalize text-ink/60">{d.stage}</div>
          <div className="h-7 flex-1 rounded-lg bg-surface-muted">
            <div className="flex h-7 items-center rounded-lg bg-brand px-2 text-xs font-medium text-white"
                 style={{ width: `${Math.max((d.amount / max) * 100, 8)}%` }}>{d.count}</div>
          </div>
          <div className="w-28 shrink-0 text-right text-xs text-ink/60">{formatMoney(d.amount, 'UAH')}</div>
        </div>
      ))}
    </div>
  );
}
