'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock } from '@/lib/mock';

export default function DonorsPage() {
  const { t } = useLang();
  return (
    <div>
      <PageHeader title={t('nav.donors')} />
      <DataTable rows={mock.donors} rowHref={(d) => `/admin/donors/${d.id}`}
        columns={[
          { key: 'legalName', label: t('col.name') },
          { key: 'type', label: t('col.type') },
          { key: 'country', label: t('col.country') },
          { key: 'status', label: t('common.status'), render: (d) => (
            <Badge tone={d.status === 'active' ? 'green' : d.status === 'declined' ? 'red' : 'gray'}>{d.status}</Badge>) },
        ]} />
    </div>
  );
}
