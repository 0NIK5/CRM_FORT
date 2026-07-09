'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock, grantName } from '@/lib/mock';
export default function ReportsPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.reports')} />
    <DataTable rows={mock.reports} columns={[
      { key: 'grant', label: t('nav.grants'), render: (r) => grantName(r.grantId) },
      { key: 'type', label: 'Type' },
      { key: 'deadline', label: t('common.deadline') },
      { key: 'status', label: t('common.status'), render: (r) => (
        <Badge tone={r.status==='approved'?'green':r.status==='rejected'?'red':'amber'}>{r.status}</Badge>) },
    ]} />
    <h2 className="mb-3 mt-8 font-display text-lg font-bold">Державна звітність</h2>
    <DataTable rows={mock.stateReports} columns={[
      { key: 'formType', label: 'Form' }, { key: 'period', label: 'Period' },
      { key: 'deadline', label: t('common.deadline') },
      { key: 'status', label: t('common.status'), render: (s) => (
        <Badge tone={s.status==='submitted'?'green':s.status==='overdue'?'red':'amber'}>{s.status}</Badge>) },
    ]} /></div>);
}
