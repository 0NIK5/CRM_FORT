import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { LangSwitcher } from '@/components/brand/LangSwitcher';
import { PortalNav } from './nav';
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="flex items-center justify-between border-b border-surface-muted bg-white px-6 py-4">
        <Link href="/"><Logo size="sm" /></Link>
        <div className="flex items-center gap-4"><PortalNav /><LangSwitcher /></div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
