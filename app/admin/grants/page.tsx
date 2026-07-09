'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import { mock, donorName } from '@/lib/mock';

export default function GrantsPage() {
  const { t } = useLang();
  return (
    <div>
      <PageHeader title={t('nav.grants')} />
      <DataTable rows={mock.grants} rowHref={(g) => `/admin/grants/${g.id}`}
        columns={[
          { key: 'projectName', label: 'Project' },
          { key: 'donor', label: t('nav.donors'), render: (g) => donorName(g.donorId) },
          { key: 'stage', label: 'Stage', render: (g) => <Badge tone="brand">{g.stage}</Badge> },
          { key: 'amount', label: t('common.amount'), render: (g) => formatMoney(g.amount, g.currency) },
        ]} />
    </div>
  );
}
