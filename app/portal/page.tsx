'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import { mock } from '@/lib/mock';
import { PORTAL_DONOR_ID } from '@/lib/portal-constants';

export default function PortalDashboard() {
  const { t } = useLang();
  const grants = mock.grants.filter((g) => g.donorId === PORTAL_DONOR_ID);
  const grantIds = grants.map((g) => g.id);
  const allocated = grants.reduce((s, g) => s + g.amount, 0);
  const spent = mock.budget.filter((b) => grantIds.includes(b.grantId)).reduce((s, b) => s + b.actual, 0);
  const payments = mock.payments.filter((p) => grantIds.includes(p.grantId));
  return (
    <div>
      <PageHeader title={t('landing.donor')} subtitle="USAID Ukraine" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t('portal.allocated')} value={formatMoney(allocated, 'USD')} />
        <StatCard label={t('portal.spent')} value={formatMoney(spent, 'USD')} />
        <StatCard label={t('portal.balance')} value={formatMoney(Math.max(allocated - spent, 0), 'USD')} />
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">{t('sect.paymentTimeline')}</h3>
        <ul className="space-y-2 text-sm">{payments.map((p) => (
          <li key={p.id} className="flex justify-between border-b border-surface-muted pb-1">
            <span>#{p.trancheNumber} · {p.date}</span>
            <span>{formatMoney(p.amount, p.currency)} <Badge tone={p.status==='confirmed'?'green':'gray'}>{p.status}</Badge></span></li>))}
        </ul></Card>
    </div>
  );
}
