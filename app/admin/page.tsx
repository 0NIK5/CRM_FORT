'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { FunnelBars } from '@/components/charts/FunnelChart';
import { BarChartCard } from '@/components/charts/BarChart';
import { DonutChartCard } from '@/components/charts/DonutChart';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import * as D from '@/lib/dashboard';
import { mock } from '@/lib/mock';

export default function AdminDashboard() {
  const { t } = useLang();
  const totalGrants = mock.grants.reduce((s, g) => s + g.amount, 0);
  const active = mock.grants.filter((g) => g.stage === 'active').length;
  return (
    <div>
      <PageHeader title={t('nav.dashboard')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('nav.grants')} value={String(mock.grants.length)} hint={`${active} ${t('dash.active')}`} />
        <StatCard label={t('nav.donors')} value={String(mock.donors.length)} />
        <StatCard label={t('dash.portfolio')} value={formatMoney(totalGrants, 'UAH')} />
        <StatCard label={t('dash.alerts')} value={String(D.complianceAlerts().length)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.pipeline')}</h3><FunnelBars data={D.pipelineByStage()} /></Card>
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.cashflow')}</h3>
          <BarChartCard data={D.cashflowByQuarter().map((q) => ({ name: q.quarter, value: q.planned }))} /></Card>
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.concentration')}</h3>
          <DonutChartCard data={D.donorConcentration().slice(0, 6).map((d) => ({ name: d.donor, value: d.amount }))} /></Card>
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.calendar')}</h3>
          <ul className="space-y-2 text-sm">
            {D.upcomingReports().map((r, i) => (
              <li key={i} className="flex justify-between border-b border-surface-muted pb-1">
                <span>{r.label}</span><span className="text-ink/50">{r.deadline}</span></li>
            ))}
          </ul></Card>
      </div>
    </div>
  );
}
