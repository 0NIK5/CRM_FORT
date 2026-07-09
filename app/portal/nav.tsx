'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n-context';
import { Logo } from '@/components/brand/Logo';

const ITEMS = [
  { href: '/portal', key: 'nav.dashboard' }, { href: '/portal/budget', key: 'nav.budget' },
  { href: '/portal/impact', key: 'nav.impact' }, { href: '/portal/reports', key: 'nav.reports' },
  { href: '/portal/updates', key: 'nav.updates' },
];
export function PortalSidebar() {
  const { t } = useLang(); const path = usePathname();
  const norm = (p: string) => (p !== '/' ? p.replace(/\/$/, '') : p);
  return (
    <aside className="hidden w-60 shrink-0 border-r border-surface-muted bg-white p-4 md:block">
      <div className="mb-6 px-2"><Logo size="sm" /></div>
      <nav className="space-y-1">
        {ITEMS.map((it) => {
          const active = norm(path) === it.href;
          return (
            <Link key={it.href} href={it.href}
              className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                active ? 'bg-brand text-white' : 'text-ink/70 hover:bg-surface-soft'}`}>
              {t(it.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
