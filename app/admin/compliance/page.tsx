'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock, donorName } from '@/lib/mock';
import { complianceAlerts } from '@/lib/dashboard';
export default function CompliancePage() {
  const { t } = useLang();
  const alerts = complianceAlerts();
  return (<div><PageHeader title={t('nav.compliance')} subtitle={`${alerts.length} alerts < 90 days`} />
    <DataTable rows={mock.compliance} columns={[
      { key: 'donor', label: t('nav.donors'), render: (c) => donorName(c.donorId) },
      { key: 'sanctionsResult', label: 'Sanctions', render: (c) => (
        <Badge tone={c.sanctionsResult==='clear'?'green':'amber'}>{c.sanctionsResult}</Badge>) },
      { key: 'pep', label: 'PEP', render: (c) => c.pep ? 'Yes' : 'No' },
      { key: 'docsExpiry', label: 'Docs expiry', render: (c) => {
        const days = Math.round((new Date(c.docsExpiry).getTime()-new Date('2026-07-09').getTime())/86400000);
        return <span className={days<60?'text-red-600 font-medium':''}>{c.docsExpiry} ({days}d)</span>; } },
    ]} /></div>);
}
