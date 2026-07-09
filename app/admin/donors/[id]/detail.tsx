'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mock } from '@/lib/mock';

export function DonorDetail({ id }: { id: number }) {
  const d = mock.donors.find((x) => x.id === id);
  if (!d) return <div>—</div>;
  const grants = mock.grants.filter((g) => g.donorId === id);
  return (
    <div>
      <PageHeader title={d.legalName} subtitle={`${d.type} · ${d.country}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display font-bold">Реквізити</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink/50">Status</dt><dd><Badge tone="green">{d.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Currency</dt><dd>{d.currency}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Source</dt><dd>{d.source}</dd></div>
          </dl></Card>
        <Card><h3 className="mb-3 font-display font-bold">Контакти</h3>
          <ul className="space-y-2 text-sm">
            {d.contacts.map((c, i) => <li key={i}>{c.name} — <span className="text-ink/50">{c.position}, {c.role}</span></li>)}
          </ul></Card>
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">Гранти донора</h3>
        <ul className="space-y-1 text-sm">
          {grants.map((g) => <li key={g.id} className="flex justify-between border-b border-surface-muted pb-1">
            <span>{g.projectName}</span><Badge tone="brand">{g.stage}</Badge></li>)}
        </ul></Card>
    </div>
  );
}
