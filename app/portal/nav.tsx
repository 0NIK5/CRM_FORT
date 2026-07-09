'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n-context';
const ITEMS = [
  { href: '/portal', key: 'nav.dashboard' }, { href: '/portal/budget', key: 'nav.budget' },
  { href: '/portal/impact', key: 'nav.impact' }, { href: '/portal/reports', key: 'nav.reports' },
  { href: '/portal/updates', key: 'nav.updates' },
];
export function PortalNav() {
  const { t } = useLang(); const path = usePathname();
  return (
    <nav className="hidden gap-4 text-sm md:flex">
      {ITEMS.map((it) => {
        const active = path === `/CRM_FORT${it.href}` || path === it.href;
        return <Link key={it.href} href={it.href}
          className={`font-medium ${active ? 'text-brand' : 'text-ink/60 hover:text-ink'}`}>{t(it.key)}</Link>;
      })}
    </nav>
  );
}
