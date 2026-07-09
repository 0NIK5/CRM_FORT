'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { LineChartCard } from '@/components/charts/LineChart';
import { UkraineImpactMap } from '@/components/map/UkraineImpactMap';
import { useLang } from '@/lib/i18n-context';
import { mock } from '@/lib/mock';

export default function PortalImpact() {
  const { t } = useLang();
  const rec = mock.program;
  const patients = rec.reduce((s, r) => s + r.patients, 0);
  const consultations = rec.reduce((s, r) => s + r.consultations, 0);
  const meds = rec.reduce((s, r) => s + r.meds, 0);
  return (
    <div><PageHeader title={t('nav.impact')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t('impact.patients')} value={patients.toLocaleString('uk-UA')} />
        <StatCard label={t('impact.consultations')} value={consultations.toLocaleString('uk-UA')} />
        <StatCard label={t('impact.meds')} value={meds.toLocaleString('uk-UA')} />
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">{t('sect.locations')}</h3>
        <UkraineImpactMap records={rec} metric="patients" /></Card>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">{t('sect.dynamics')}</h3>
        <LineChartCard data={rec.map((r) => ({ name: r.location, value: r.patients }))} /></Card>
    </div>
  );
}
