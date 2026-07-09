'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { BarChartCard } from '@/components/charts/BarChart';
import { useLang } from '@/lib/i18n-context';
import { formatMoney, formatPct } from '@/lib/format';
import { mock } from '@/lib/mock';
import { PORTAL_DONOR_ID } from '@/lib/portal-constants';

export default function PortalBudget() {
  const { t } = useLang();
  const grantIds = mock.grants.filter((g) => g.donorId === PORTAL_DONOR_ID).map((g) => g.id);
  const lines = mock.budget.filter((b) => grantIds.includes(b.grantId));
  const byCat: Record<string, { planned: number; actual: number }> = {};
  lines.forEach((l) => { (byCat[l.category] ??= { planned: 0, actual: 0 });
    byCat[l.category].planned += l.planned; byCat[l.category].actual += l.actual; });
  const rows = Object.entries(byCat).map(([category, v]) => ({ category, ...v,
    pct: ((v.actual - v.planned) / v.planned) * 100 }));
  return (
    <div><PageHeader title={t('nav.budget')} />
      <Card className="mb-6"><BarChartCard data={rows.map((r) => ({ name: r.category, value: r.actual }))} /></Card>
      <Card><ul className="space-y-1 text-sm">{rows.map((r) => (
        <li key={r.category} className="flex justify-between border-b border-surface-muted pb-1">
          <span>{r.category}</span>
          <span>{formatMoney(r.actual,'UAH')} / {formatMoney(r.planned,'UAH')}
            <span className="text-ink/50"> {formatPct(r.pct)}</span></span></li>))}
      </ul></Card>
    </div>
  );
}
