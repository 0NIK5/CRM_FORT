'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock, grantName } from '@/lib/mock';
import { PORTAL_DONOR_ID } from '@/lib/portal-constants';

export default function PortalReports() {
  const { t } = useLang();
  const grantIds = mock.grants.filter((g) => g.donorId === PORTAL_DONOR_ID).map((g) => g.id);
  const reports = mock.reports.filter((r) => grantIds.includes(r.grantId) && r.status === 'approved');
  return (
    <div><PageHeader title={t('nav.reports')} />
      <div className="grid gap-4 sm:grid-cols-2">{reports.map((r) => (
        <Card key={r.id} className="flex items-center justify-between">
          <div><div className="font-medium">{grantName(r.grantId)}</div>
            <div className="text-sm text-ink/50">{r.type} · {r.deadline}</div></div>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            {t('common.download')}</button>
        </Card>))}
      </div>
      {reports.length === 0 && <p className="text-ink/50">—</p>}
    </div>
  );
}
