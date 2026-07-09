'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney, formatPct } from '@/lib/format';
import { mock, donorName } from '@/lib/mock';

export function GrantDetail({ id }: { id: number }) {
  const { t } = useLang();
  const g = mock.grants.find((x) => x.id === id);
  if (!g) return <div>—</div>;
  const payments = mock.payments.filter((p) => p.grantId === id);
  const budget = mock.budget.filter((b) => b.grantId === id);
  const reports = mock.reports.filter((r) => r.grantId === id);
  return (
    <div>
      <PageHeader title={g.projectName} subtitle={`${donorName(g.donorId)} · ${formatMoney(g.amount, g.currency)}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display font-bold">{t('sect.tranches')}</h3>
          <ul className="space-y-1 text-sm">{payments.map((p) => (
            <li key={p.id} className="flex justify-between border-b border-surface-muted pb-1">
              <span>#{p.trancheNumber} · {p.date}</span>
              <span>{formatMoney(p.amount, p.currency)} <Badge tone={p.status==='confirmed'?'green':'gray'}>{p.status}</Badge></span></li>))}
          </ul></Card>
        <Card><h3 className="mb-3 font-display font-bold">{t('sect.budgetPlanFact')}</h3>
          <ul className="space-y-1 text-sm">{budget.map((b) => (
            <li key={b.id} className="flex justify-between border-b border-surface-muted pb-1">
              <span>{b.category}</span>
              <span>{formatMoney(b.actual,g.currency)} / {formatMoney(b.planned,g.currency)}
                <span className={b.flag?'text-red-600':'text-ink/50'}> {formatPct(b.variancePct)}</span></span></li>))}
          </ul></Card>
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">{t('nav.reports')}</h3>
        <ul className="space-y-1 text-sm">{reports.map((r) => (
          <li key={r.id} className="flex justify-between border-b border-surface-muted pb-1">
            <span>{r.type} · {r.deadline}</span><Badge tone={r.status==='approved'?'green':'amber'}>{r.status}</Badge></li>))}
        </ul></Card>
    </div>
  );
}
