'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n-context';
import { Logo } from '@/components/brand/Logo';

export const ADMIN_ITEMS = [
  { href: '/admin', key: 'nav.dashboard' }, { href: '/admin/donors', key: 'nav.donors' },
  { href: '/admin/grants', key: 'nav.grants' }, { href: '/admin/payments', key: 'nav.payments' },
  { href: '/admin/budget', key: 'nav.budget' }, { href: '/admin/reports', key: 'nav.reports' },
  { href: '/admin/compliance', key: 'nav.compliance' }, { href: '/admin/tasks', key: 'nav.tasks' },
];
export function Sidebar() {
  const { t } = useLang(); const path = usePathname();
  const norm = (p: string) => (p !== '/' ? p.replace(/\/$/, '') : p);
  return (
    <aside className="hidden w-60 shrink-0 border-r border-surface-muted bg-white p-4 md:block">
      <div className="mb-6 px-2"><Logo size="sm" /></div>
      <nav className="space-y-1">
        {ADMIN_ITEMS.map((it) => {
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
