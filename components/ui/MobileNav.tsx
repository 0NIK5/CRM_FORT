'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n-context';
import { Logo } from '@/components/brand/Logo';

export function MobileNav({ items }: { items: { href: string; key: string }[] }) {
  const { t } = useLang();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const norm = (p: string) => (p !== '/' ? p.replace(/\/$/, '') : p);
  return (
    <div className="md:hidden">
      <button aria-label="Menu" onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-muted text-ink">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <nav onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between px-2">
              <Logo size="sm" />
              <button aria-label="Close" onClick={() => setOpen(false)}
                className="h-8 w-8 text-lg text-ink/60 hover:text-ink">✕</button>
            </div>
            <div className="space-y-1">
              {items.map((it) => {
                const active = norm(path) === it.href;
                return (
                  <Link key={it.href} href={it.href} onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                      active ? 'bg-brand text-white' : 'text-ink/70 hover:bg-surface-soft'}`}>
                    {t(it.key)}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
