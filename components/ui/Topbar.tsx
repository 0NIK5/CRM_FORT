'use client';
import Link from 'next/link';
import { LangSwitcher } from '@/components/brand/LangSwitcher';
export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-surface-muted bg-white px-6 py-3">
      <Link href="/" className="text-sm text-ink/50 hover:text-brand">← Fortitude</Link>
      <div className="flex items-center gap-3">
        <LangSwitcher />
        <div className="h-8 w-8 rounded-full bg-brand-light text-center font-display font-bold leading-8 text-brand-dark">Ф</div>
      </div>
    </header>
  );
}
