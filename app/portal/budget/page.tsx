'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
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
    <div>
      <PageHeader title={t('nav.budget')} subtitle={t('budget.subtitle')} />
      <Card className="mb-6">
        <h3 className="mb-3 font-display font-bold">{t('budget.chartTitle')}</h3>
        <BarChartCard data={rows.map((r) => ({ name: r.category, value: r.actual }))} />
      </Card>
      <DataTable rows={rows} columns={[
        { key: 'category', label: t('col.category') },
        { key: 'actual', label: t('portal.spent'), render: (r) => formatMoney(r.actual, 'UAH') },
        { key: 'planned', label: t('col.plan'), render: (r) => formatMoney(r.planned, 'UAH') },
        { key: 'pct', label: t('col.variance'), render: (r) => (
          <span className={r.pct > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
            {formatPct(r.pct)}</span>) },
      ]} />
    </div>
  );
}
