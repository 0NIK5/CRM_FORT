'use client';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { LangSwitcher } from '@/components/brand/LangSwitcher';
import { useLang } from '@/lib/i18n-context';

export default function Home() {
  const { t } = useLang();
  return (
    <main className="min-h-screen bg-surface-soft">
      <header className="flex items-center justify-between px-8 py-6">
        <Logo />
        <LangSwitcher />
      </header>
      <section className="mx-auto max-w-4xl px-6 pt-10 text-center">
        <h1 className="font-display text-4xl font-extrabold text-ink">{t('app.title')}</h1>
        <p className="mt-3 text-ink/60">{t('landing.subtitle')}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            { href: '/admin', title: t('landing.team'), desc: t('landing.teamDesc') },
            { href: '/portal', title: t('landing.donor'), desc: t('landing.donorDesc') },
          ].map((c) => (
            <Link key={c.href} href={c.href}
              className="group rounded-3xl border border-surface-muted bg-white p-8 text-left transition hover:border-brand hover:shadow-lg">
              <div className="font-display text-2xl font-extrabold text-ink group-hover:text-brand">{c.title}</div>
              <p className="mt-2 text-sm text-ink/60">{c.desc}</p>
              <span className="mt-6 inline-block font-medium text-brand">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
