'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock } from '@/lib/mock';
export default function TasksPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.tasks')} />
    <DataTable rows={mock.tasks} columns={[
      { key: 'type', label: 'Type' },
      { key: 'linkedLabel', label: 'Linked' },
      { key: 'assignee', label: 'Assignee' },
      { key: 'deadline', label: t('common.deadline') },
      { key: 'status', label: t('common.status'), render: (x) => (
        <Badge tone={x.status==='done'?'green':x.status==='in_progress'?'brand':'gray'}>{x.status}</Badge>) },
    ]} /></div>);
}
