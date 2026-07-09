'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import { mock, grantName } from '@/lib/mock';
export default function PaymentsPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.payments')} />
    <DataTable rows={mock.payments} columns={[
      { key: 'grant', label: t('nav.grants'), render: (p) => grantName(p.grantId) },
      { key: 'trancheNumber', label: t('col.tranche'), render: (p) => `#${p.trancheNumber}` },
      { key: 'date', label: t('common.date') },
      { key: 'amount', label: t('common.amount'), render: (p) => formatMoney(p.amount, p.currency) },
      { key: 'status', label: t('common.status'), render: (p) => (
        <Badge tone={p.status==='confirmed'?'green':p.status==='received'?'brand':'gray'}>{p.status}</Badge>) },
    ]} /></div>);
}
