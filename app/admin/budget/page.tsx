'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney, formatPct } from '@/lib/format';
import { mock, grantName } from '@/lib/mock';
export default function BudgetPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.budget')} />
    <DataTable rows={mock.budget} columns={[
      { key: 'grant', label: t('nav.grants'), render: (b) => grantName(b.grantId) },
      { key: 'category', label: 'Category' },
      { key: 'planned', label: 'Plan', render: (b) => formatMoney(b.planned, 'UAH') },
      { key: 'actual', label: 'Actual', render: (b) => formatMoney(b.actual, 'UAH') },
      { key: 'variancePct', label: 'Variance', render: (b) => (
        <span className={b.flag?'text-red-600 font-medium':'text-ink/60'}>{formatPct(b.variancePct)}{b.flag?' ⚑':''}</span>) },
    ]} /></div>);
}
