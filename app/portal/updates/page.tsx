'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useLang } from '@/lib/i18n-context';
const UPDATES = [
  { date: '2026-06-15', text: 'Мобільна клініка відвідала Херсонщину: 320 пацієнтів за тиждень.' },
  { date: '2026-05-28', text: 'Психологічна підтримка для дітей у Харкові — новий цикл занять.' },
  { date: '2026-05-10', text: 'Видано партію медикаментів прифронтовим громадам Донеччини.' },
];
export default function PortalUpdates() {
  const { t } = useLang();
  return (
    <div><PageHeader title={t('nav.updates')} />
      <div className="space-y-6">{UPDATES.map((u, i) => (
        <Card key={i}>
          <div className="mb-3 h-40 w-full rounded-xl bg-gradient-to-br from-brand-light to-surface-muted" />
          <div className="text-xs text-ink/50">{u.date}</div>
          <p className="mt-1">{u.text}</p>
        </Card>))}
      </div>
    </div>
  );
}
