'use client';
import Link from 'next/link';
import { LangSwitcher } from '@/components/brand/LangSwitcher';
import { MobileNav } from '@/components/ui/MobileNav';
export function Topbar({ items }: { items: { href: string; key: string }[] }) {
  return (
    <header className="flex items-center justify-between border-b border-surface-muted bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        <MobileNav items={items} />
        <Link href="/" className="text-sm text-ink/50 hover:text-brand">← Fortitude</Link>
      </div>
      <div className="flex items-center gap-3">
        <LangSwitcher />
        <div className="h-8 w-8 rounded-full bg-brand-light text-center font-display font-bold leading-8 text-brand-dark">Ф</div>
      </div>
    </header>
  );
}
