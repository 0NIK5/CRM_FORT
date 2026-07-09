# Fortitude CRM — кликабельный концепт. Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать кликабельный frontend-only концепт двух приложений (Admin CRM + Donor Portal) фонда «Фортітьюд ЮА» на Next.js static export, двуязычный UA/EN, с мок-данными, и задеплоить на GitHub Pages.

**Architecture:** Один Next.js (App Router) проект с тремя зонами маршрутов (`/`, `/admin/*`, `/portal/*`). Никакого бэкенда/БД/auth — данные это статические моки с фиксированным сидом. На выходе `next build` даёт статику в `out/`, которую GitHub Actions публикует на GitHub Pages.

**Tech Stack:** Next.js 14 (App Router, `output: 'export'`), TypeScript, Tailwind CSS, Recharts, `next/font/google` (Inter + Inter Tight), GitHub Actions + GitHub Pages.

## Global Constraints

- Всё статическое: **никаких** серверных компонентов с рантайм-фетчем, API-роутов, `cookies()`, `headers()`, ISR/SSR. Только SSG/static export.
- `next.config.mjs`: `output: 'export'`, `basePath: '/CRM_FORT'`, `assetPrefix: '/CRM_FORT/'`, `images.unoptimized: true`, `trailingSlash: true`.
- Все `<Link>`/навигация — относительные к `basePath` (Next сам добавляет basePath к `<Link href>` и `next/font`/`next/image`; в «сырых» `<img src>`/`<a href>` basePath НЕ добавляется — таких не использовать, только `next/link` и `next/image` или импортированные ассеты).
- Бренд: акцент `#FF6900`, фон `#FFFFFF` / `#F9F8F8`, серый `#EBEBEB`, текст `#0A0A0A`. Шрифты: заголовки **Inter Tight**, текст **Inter** (оба через `next/font/google`, self-hosted).
- Языки: UA (по умолчанию) и EN. Переключение — клиентское, состояние в `localStorage` ключ `fortitude-lang`.
- Мок-данные детерминированы: один seeded PRNG, значения не меняются между рендерами.
- **Тестовая модель концепта:** поскольку логики нет, «тест» каждой задачи = `npm run build` завершается успешно И (для страниц) `npm run dev` рендерит страницу без ошибок в консоли браузера. Юнит-тесты пишем только там, где есть чистая функция с логикой (seeded PRNG, форматтеры, агрегации дашборда).
- Node 20+. Менеджер пакетов — npm.
- Коммиты частые, по завершении каждой задачи.

---

## File Structure

```
package.json, next.config.mjs, tsconfig.json, tailwind.config.ts, postcss.config.mjs, .gitignore
.github/workflows/deploy.yml
public/.nojekyll
app/
  layout.tsx                 ← root layout: шрифты, <html>, провайдер языка
  globals.css                ← Tailwind + CSS-переменные бренда
  page.tsx                   ← лендинг-развилка
  admin/
    layout.tsx               ← сайдбар + топбар
    page.tsx                 ← Dashboard
    donors/page.tsx, donors/[id]/page.tsx
    grants/page.tsx, grants/[id]/page.tsx
    payments/page.tsx
    budget/page.tsx
    reports/page.tsx
    compliance/page.tsx
    tasks/page.tsx
  portal/
    layout.tsx               ← лёгкий layout донора
    page.tsx                 ← Dashboard донора
    budget/page.tsx
    impact/page.tsx
    reports/page.tsx
    updates/page.tsx         ← опционально
lib/
  prng.ts                    ← seeded PRNG + helpers (pick, range, money)
  format.ts                  ← форматтеры валюты/дат/процентов
  i18n.ts                    ← словарь ua/en + типы ключей
  i18n-context.tsx           ← React-контекст языка + хук useLang()
  mock/
    index.ts                 ← агрегатор + сид
    donors.ts, grants.ts, payments.ts, budget.ts, reports.ts,
    program.ts, compliance.ts, tasks.ts, state-reporting.ts
  dashboard.ts               ← агрегации для виджетов (pipeline, cashflow, ...)
components/
  brand/Logo.tsx             ← SVG-знак «сердце с крестом» + вордмарк
  brand/LangSwitcher.tsx
  ui/StatCard.tsx, ui/DataTable.tsx, ui/Badge.tsx, ui/Card.tsx,
  ui/PageHeader.tsx, ui/Sidebar.tsx, ui/Topbar.tsx
  charts/FunnelChart.tsx, charts/BarChart.tsx, charts/DonutChart.tsx,
  charts/LineChart.tsx
  map/UkraineImpactMap.tsx   ← карта с сердечками-пинами
```

---

### Task 1: Scaffold проекта (Next.js + TS + Tailwind + static export)

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.github/workflows/.gitkeep`, `public/.nojekyll`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (временная заглушка)

**Interfaces:**
- Produces: рабочий Next.js проект, который собирается в `out/`; CSS-переменные бренда и Tailwind-токены; корневой layout с подключёнными шрифтами Inter / Inter Tight.

- [ ] **Step 1: package.json**

```json
{
  "name": "fortitude-crm-concept",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "recharts": "2.12.7"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.39",
    "tailwindcss": "3.4.6",
    "typescript": "5.5.3"
  }
}
```

- [ ] **Step 2: next.config.mjs**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/CRM_FORT',
  assetPrefix: '/CRM_FORT/',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
```

- [ ] **Step 3: tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: postcss.config.mjs + tailwind.config.ts**

`postcss.config.mjs`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FF6900', dark: '#E45E00', light: '#FFF1E6' },
        surface: { DEFAULT: '#FFFFFF', soft: '#F9F8F8', muted: '#EBEBEB' },
        ink: '#0A0A0A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-inter-tight)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: .gitignore**

```
/node_modules
/.next
/out
next-env.d.ts
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 6: app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { --brand: #FF6900; }
html { scroll-behavior: smooth; }
body { @apply bg-surface-soft text-ink font-sans antialiased; }
```

- [ ] **Step 7: app/layout.tsx (root)**

```tsx
import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });
const interTight = Inter_Tight({ subsets: ['latin', 'cyrillic'], variable: '--font-inter-tight', weight: ['500','600','700','800'] });

export const metadata: Metadata = {
  title: 'Fortitude CRM',
  description: 'Fortitude CRM + Donor Portal — концепт',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${inter.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: app/page.tsx (временная заглушка)**

```tsx
export default function Home() {
  return <main className="p-10 font-display text-3xl text-brand">Fortitude — scaffold OK</main>;
}
```

- [ ] **Step 9: public/.nojekyll** — пустой файл (создать), чтобы GitHub Pages не резал `_next`.

- [ ] **Step 10: Установить зависимости и собрать**

Run: `npm install && npm run build`
Expected: сборка успешна, создаётся папка `out/` с `index.html` и `_next/`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js static-export проекта с брендом Fortitude"
```

---

### Task 2: Seeded PRNG и форматтеры

**Files:**
- Create: `lib/prng.ts`, `lib/format.ts`
- Test: `lib/prng.test.ts` (запуск через `node --test` после компиляции или через ts-node не требуется — см. шаг; используем встроенную проверку)

**Interfaces:**
- Produces:
  - `makeRng(seed: number): () => number` — детерминированный PRNG в [0,1).
  - `pick<T>(rng, arr: T[]): T`, `range(rng, min: number, max: number): number` (целое), `chance(rng, p: number): boolean`.
  - `formatMoney(n: number, currency: 'UAH'|'USD'): string`, `formatDate(iso: string, lang: 'ua'|'en'): string`, `formatPct(n: number): string`.

- [ ] **Step 1: lib/prng.ts**

```ts
// Mulberry32 — детерминированный PRNG.
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
export const range = (rng: () => number, min: number, max: number): number =>
  Math.floor(rng() * (max - min + 1)) + min;
export const chance = (rng: () => number, p: number): boolean => rng() < p;
```

- [ ] **Step 2: lib/format.ts**

```ts
export function formatMoney(n: number, currency: 'UAH' | 'USD'): string {
  const s = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(n));
  return currency === 'USD' ? `$${s}` : `${s} ₴`;
}
export function formatDate(iso: string, lang: 'ua' | 'en'): string {
  return new Intl.DateTimeFormat(lang === 'ua' ? 'uk-UA' : 'en-GB',
    { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}
export const formatPct = (n: number): string => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
```

- [ ] **Step 3: lib/prng.test.ts (детерминизм)**

```ts
import { test } from 'node:test';
import assert from 'node:assert';
import { makeRng, range } from './prng.ts';

test('makeRng детерминирован для одного сида', () => {
  const a = makeRng(42), b = makeRng(42);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
  assert.deepStrictEqual(seqA, seqB);
});
test('range в границах', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 100; i++) { const v = range(rng, 5, 10); assert.ok(v >= 5 && v <= 10); }
});
```

- [ ] **Step 4: Запустить тест**

Run: `node --test --experimental-strip-types lib/prng.test.ts`
Expected: PASS (2 теста). Если версия Node не поддерживает strip-types — пропустить запуск, тест остаётся как документация (отметить в коммите).

- [ ] **Step 5: Commit**

```bash
git add lib/prng.ts lib/format.ts lib/prng.test.ts
git commit -m "feat: seeded PRNG и форматтеры валюты/дат"
```

---

### Task 3: i18n — словарь, контекст, хук

**Files:**
- Create: `lib/i18n.ts`, `lib/i18n-context.tsx`
- Modify: `app/layout.tsx` (обернуть в провайдер)

**Interfaces:**
- Consumes: root layout из Task 1.
- Produces:
  - `type Lang = 'ua' | 'en'`.
  - `dict: Record<Lang, Record<string, string>>` — ключи интерфейса.
  - `LangProvider` (client component) + `useLang(): { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }`.

- [ ] **Step 1: lib/i18n.ts**

```ts
export type Lang = 'ua' | 'en';

export const dict: Record<Lang, Record<string, string>> = {
  ua: {
    'app.title': 'Fortitude CRM',
    'landing.subtitle': 'Платформа управління грантами та кабінет донора',
    'landing.team': 'Команда фонду',
    'landing.teamDesc': 'Внутрішній CRM: донори, гранти, бюджети, звітність',
    'landing.donor': 'Кабінет донора',
    'landing.donorDesc': 'Стан ваших грантів, освоєння бюджету, метрики впливу',
    'nav.dashboard': 'Дашборд', 'nav.donors': 'Донори', 'nav.grants': 'Гранти',
    'nav.payments': 'Платежі', 'nav.budget': 'Бюджети', 'nav.reports': 'Звіти',
    'nav.compliance': 'Комплаєнс', 'nav.tasks': 'Завдання',
    'nav.impact': 'Метрики впливу', 'nav.updates': 'Апдейти з поля',
    'portal.allocated': 'Виділено', 'portal.spent': 'Освоєно', 'portal.balance': 'Залишок',
    'common.download': 'Завантажити', 'common.status': 'Статус', 'common.deadline': 'Дедлайн',
    'common.amount': 'Сума', 'common.date': 'Дата', 'common.viewAll': 'Дивитись усі',
    'dash.pipeline': 'Воронка грантів', 'dash.cashflow': 'Прогноз надходжень',
    'dash.utilization': 'Освоєння бюджету', 'dash.concentration': 'Концентрація донорів',
    'dash.calendar': 'Календар звітності', 'dash.alerts': 'Комплаєнс-алерти'
  },
  en: {
    'app.title': 'Fortitude CRM',
    'landing.subtitle': 'Grant management platform & donor portal',
    'landing.team': 'Foundation team',
    'landing.teamDesc': 'Internal CRM: donors, grants, budgets, reporting',
    'landing.donor': 'Donor portal',
    'landing.donorDesc': 'Your grants status, budget utilization, impact metrics',
    'nav.dashboard': 'Dashboard', 'nav.donors': 'Donors', 'nav.grants': 'Grants',
    'nav.payments': 'Payments', 'nav.budget': 'Budgets', 'nav.reports': 'Reports',
    'nav.compliance': 'Compliance', 'nav.tasks': 'Tasks',
    'nav.impact': 'Impact metrics', 'nav.updates': 'Field updates',
    'portal.allocated': 'Allocated', 'portal.spent': 'Spent', 'portal.balance': 'Balance',
    'common.download': 'Download', 'common.status': 'Status', 'common.deadline': 'Deadline',
    'common.amount': 'Amount', 'common.date': 'Date', 'common.viewAll': 'View all',
    'dash.pipeline': 'Grant pipeline', 'dash.cashflow': 'Cash flow forecast',
    'dash.utilization': 'Budget utilization', 'dash.concentration': 'Donor concentration',
    'dash.calendar': 'Reporting calendar', 'dash.alerts': 'Compliance alerts'
  },
};
```

Примечание для исполнителя: ключи пополняются по мере добавления страниц. Если строка встречается на странице — она ОБЯЗАНА иметь ключ в обоих языках; хардкод текста интерфейса запрещён (кроме имён собственных и чисел).

- [ ] **Step 2: lib/i18n-context.tsx**

```tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { dict, type Lang } from './i18n';

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: 'ua', setLang: () => {}, t: (k) => k,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ua');
  useEffect(() => {
    const saved = localStorage.getItem('fortitude-lang') as Lang | null;
    if (saved === 'ua' || saved === 'en') setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('fortitude-lang', l); };
  const t = (k: string) => dict[lang][k] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
```

- [ ] **Step 3: обернуть root layout**

В `app/layout.tsx` импортировать `LangProvider` и обернуть `{children}`:
```tsx
import { LangProvider } from '@/lib/i18n-context';
// ...
<body><LangProvider>{children}</LangProvider></body>
```

- [ ] **Step 4: Проверка сборки**

Run: `npm run build`
Expected: успешно, без ошибок типов.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.ts lib/i18n-context.tsx app/layout.tsx
git commit -m "feat: двуязычный i18n (ua/en) с контекстом и localStorage"
```

---

### Task 4: Бренд-примитивы (логотип, переключатель языка, UI-компоненты)

**Files:**
- Create: `components/brand/Logo.tsx`, `components/brand/LangSwitcher.tsx`
- Create: `components/ui/Card.tsx`, `components/ui/Badge.tsx`, `components/ui/StatCard.tsx`, `components/ui/PageHeader.tsx`, `components/ui/DataTable.tsx`

**Interfaces:**
- Consumes: `useLang()` из Task 3.
- Produces:
  - `<Logo size?: 'sm'|'lg' variant?: 'full'|'mark' />` — SVG.
  - `<LangSwitcher />` — кнопки UA/EN.
  - `<Card>`, `<Badge tone: 'brand'|'green'|'amber'|'red'|'gray'>`, `<StatCard label value hint? />`, `<PageHeader title subtitle? />`.
  - `<DataTable columns={{key,label,render?}[]} rows={T[]} onRowHref?={(row)=>string} />`.

- [ ] **Step 1: components/brand/Logo.tsx**

```tsx
export function Logo({ size = 'lg', variant = 'full' }: { size?: 'sm' | 'lg'; variant?: 'full' | 'mark' }) {
  const h = size === 'lg' ? 40 : 28;
  return (
    <span className="inline-flex items-center gap-2" style={{ height: h }}>
      <svg viewBox="0 0 48 48" height={h} width={h} aria-hidden fill="#FF6900">
        {/* сердце с вырезанным крестом (плюс) */}
        <path d="M24 44 L6 26 A11 11 0 0 1 24 10 A11 11 0 0 1 42 26 Z" />
        <path d="M21 20h6v4h4v6h-4v4h-6v-4h-4v-6h4z" fill="#fff" />
      </svg>
      {variant === 'full' && (
        <span className="font-display font-extrabold tracking-tight text-brand"
              style={{ fontSize: h * 0.7 }}>Fortitude</span>
      )}
    </span>
  );
}
```
Примечание: форма знака приблизительная (не векторная копия оригинала) — это концепт. Главное: оранжевое сердце + белый крест.

- [ ] **Step 2: components/brand/LangSwitcher.tsx**

```tsx
'use client';
import { useLang } from '@/lib/i18n-context';
export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex rounded-full border border-surface-muted overflow-hidden text-sm">
      {(['ua', 'en'] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className={`px-3 py-1 font-medium ${lang === l ? 'bg-brand text-white' : 'bg-white text-ink'}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: components/ui/Card.tsx, Badge.tsx, StatCard.tsx, PageHeader.tsx**

```tsx
// Card.tsx
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white border border-surface-muted p-5 ${className}`}>{children}</div>;
}
```
```tsx
// Badge.tsx
const tones: Record<string, string> = {
  brand: 'bg-brand-light text-brand-dark', green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700', gray: 'bg-surface-muted text-ink',
};
export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
```
```tsx
// StatCard.tsx
import { Card } from './Card';
export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <div className="text-sm text-ink/60">{label}</div>
      <div className="mt-1 font-display text-3xl font-extrabold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-brand-dark">{hint}</div>}
    </Card>
  );
}
```
```tsx
// PageHeader.tsx
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
    </div>
  );
}
```

- [ ] **Step 4: components/ui/DataTable.tsx**

```tsx
import Link from 'next/link';
export type Column<T> = { key: string; label: string; render?: (row: T) => React.ReactNode };
export function DataTable<T extends Record<string, any>>({ columns, rows, rowHref }:
  { columns: Column<T>[]; rows: T[]; rowHref?: (row: T) => string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-surface-muted bg-white">
      <table className="w-full text-sm">
        <thead className="bg-surface-soft text-left text-ink/60">
          <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const cells = columns.map((c) => (
              <td key={c.key} className="px-4 py-3 border-t border-surface-muted">
                {c.render ? c.render(row) : String(row[c.key])}
              </td>
            ));
            return rowHref ? (
              <tr key={i} className="hover:bg-brand-light/40 cursor-pointer">
                {columns.map((c, j) => (
                  <td key={c.key} className="px-4 py-3 border-t border-surface-muted">
                    <Link href={rowHref(row)} className="block">
                      {c.render ? c.render(row) : String(row[c.key])}
                    </Link>
                  </td>
                ))}
              </tr>
            ) : <tr key={i} className="hover:bg-surface-soft">{cells}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Проверка сборки**

Run: `npm run build`
Expected: успешно.

- [ ] **Step 6: Commit**

```bash
git add components/
git commit -m "feat: бренд-примитивы (лого, переключатель языка) и UI-компоненты"
```

---

### Task 5: Мок-данные (все сущности) + агрегатор

**Files:**
- Create: `lib/mock/donors.ts`, `grants.ts`, `payments.ts`, `budget.ts`, `reports.ts`, `program.ts`, `compliance.ts`, `tasks.ts`, `state-reporting.ts`, `index.ts`

**Interfaces:**
- Consumes: `makeRng, pick, range, chance` из Task 2.
- Produces: `mock` — объект со всеми массивами. Точные типы (используются во всех страницах):

```ts
export type Donor = { id: number; legalName: string; type: 'institutional'|'corporate'|'individual'|'in-kind';
  country: string; status: 'prospect'|'active'|'dormant'|'declined'; currency: 'UAH'|'USD';
  source: string; contacts: { name: string; position: string; role: string }[] };
export type Grant = { id: number; donorId: number; projectName: string;
  stage: 'lead'|'proposal'|'negotiation'|'signed'|'active'|'closed'|'renewed';
  amount: number; currency: 'UAH'|'USD'; startDate: string; endDate: string;
  managerName: string; humanitarianFlag: boolean };
export type Payment = { id: number; grantId: number; date: string; amount: number;
  currency: 'UAH'|'USD'; trancheNumber: number; status: 'planned'|'received'|'confirmed'; ref: string };
export type BudgetLine = { id: number; grantId: number; category: string;
  planned: number; actual: number; variancePct: number; flag: boolean };
export type Report = { id: number; grantId: number; type: 'narrative'|'financial'|'combined'|'audit'|'state';
  deadline: string; submitted: string|null; status: 'draft'|'submitted'|'approved'|'rejected'|'revision' };
export type ProgramRecord = { id: number; grantId: number; location: string; region: string;
  lat: number; lng: number; date: string; patients: number; consultations: number; meds: number };
export type Compliance = { id: number; donorId: number; sanctionsDate: string; sanctionsResult: string;
  pep: boolean; docsExpiry: string };
export type Task = { id: number; linkedType: 'donor'|'grant'; linkedLabel: string;
  type: 'call'|'meeting'|'site_visit'|'report_deadline'|'renewal'; assignee: string;
  deadline: string; status: 'open'|'in_progress'|'done' };
export type StateReport = { id: number; period: string; formType: string; deadline: string;
  submitted: string|null; status: 'submitted'|'pending'|'overdue' };
```

- [ ] **Step 1: lib/mock/donors.ts**

```ts
import { makeRng, pick, range } from '../prng';
import type { Donor } from './index';
const NAMES = ['ЄС Гуманітарний Фонд','Global Health Initiative','Deutsche Welle Stiftung',
  'USAID Ukraine','Nova Charitable Trust','Медичний Альянс','Caritas Europa','Open Society Foundations'];
const COUNTRIES = ['Німеччина','США','Польща','Франція','Швейцарія','Україна'];
const ROLES = ['decision_maker','program_officer','finance_officer'];
export function makeDonors(rng: () => number): Donor[] {
  return NAMES.map((legalName, i) => ({
    id: i + 1, legalName,
    type: pick(rng, ['institutional','corporate','individual','in-kind'] as const),
    country: pick(rng, COUNTRIES),
    status: pick(rng, ['prospect','active','active','dormant','declined'] as const),
    currency: pick(rng, ['UAH','USD'] as const),
    source: pick(rng, ['referral','inbound','call_for_proposals','conference']),
    contacts: Array.from({ length: range(rng, 1, 3) }, () => ({
      name: pick(rng, ['Олена Ковальчук','Andreas Weber','Марія Шевченко','John Smith','Петро Мельник']),
      position: pick(rng, ['CEO','Program Director','Finance Lead','Grant Officer']),
      role: pick(rng, ROLES),
    })),
  }));
}
```

- [ ] **Step 2: grants.ts**

```ts
import { makeRng, pick, range, chance } from '../prng';
import type { Grant } from './index';
const PROJECTS = ['Мобільні клініки Схід','Психологічна підтримка','Дитяча реабілітація',
  'Первинна допомога Херсонщина','Медикаменти прифронтових громад','Спорт для юних атлетів'];
export function makeGrants(rng: () => number, donorCount: number): Grant[] {
  return Array.from({ length: 14 }, (_, i) => {
    const startY = 2024 + range(rng, 0, 1);
    return {
      id: i + 1, donorId: range(rng, 1, donorCount),
      projectName: pick(rng, PROJECTS) + ' ' + (i + 1),
      stage: pick(rng, ['lead','proposal','negotiation','signed','active','active','closed','renewed'] as const),
      amount: range(rng, 300, 5000) * 1000,
      currency: pick(rng, ['UAH','USD'] as const),
      startDate: `${startY}-0${range(rng, 1, 9)}-15`,
      endDate: `${startY + 1}-0${range(rng, 1, 9)}-15`,
      managerName: pick(rng, ['Андрій Запітецький','Оксана Гриценко','Дмитро Левченко']),
      humanitarianFlag: chance(rng, 0.4),
    };
  });
}
```

- [ ] **Step 3: payments.ts, budget.ts, reports.ts** — по аналогичному шаблону, привязка к `grantId`:

```ts
// payments.ts
import { makeRng, pick, range } from '../prng';
import type { Payment, Grant } from './index';
export function makePayments(rng: () => number, grants: Grant[]): Payment[] {
  const out: Payment[] = []; let id = 1;
  for (const g of grants) {
    const n = range(rng, 2, 4);
    for (let t = 1; t <= n; t++) out.push({
      id: id++, grantId: g.id, date: `${g.startDate.slice(0,4)}-0${range(rng,1,9)}-10`,
      amount: Math.round(g.amount / n), currency: g.currency, trancheNumber: t,
      status: pick(rng, ['planned','received','confirmed'] as const),
      ref: 'SWIFT-' + range(rng, 100000, 999999),
    });
  }
  return out;
}
```
```ts
// budget.ts
import { makeRng, range } from '../prng';
import type { BudgetLine, Grant } from './index';
const CATS = ['паливо','зарплата','медикаменти','оренда','логістика','амортизація'];
export function makeBudget(rng: () => number, grants: Grant[]): BudgetLine[] {
  const out: BudgetLine[] = []; let id = 1;
  for (const g of grants) for (const category of CATS) {
    const planned = range(rng, 50, 800) * 1000;
    const actual = Math.round(planned * (0.6 + rng() * 0.6));
    const variancePct = ((actual - planned) / planned) * 100;
    out.push({ id: id++, grantId: g.id, category, planned, actual,
      variancePct: Math.round(variancePct * 10) / 10, flag: Math.abs(variancePct) > 20 });
  }
  return out;
}
```
```ts
// reports.ts
import { makeRng, pick, range } from '../prng';
import type { Report, Grant } from './index';
export function makeReports(rng: () => number, grants: Grant[]): Report[] {
  const out: Report[] = []; let id = 1;
  for (const g of grants) {
    const n = range(rng, 1, 3);
    for (let i = 0; i < n; i++) {
      const status = pick(rng, ['draft','submitted','approved','rejected','revision'] as const);
      out.push({ id: id++, grantId: g.id,
        type: pick(rng, ['narrative','financial','combined','audit'] as const),
        deadline: `2026-0${range(rng,1,9)}-28`,
        submitted: status === 'draft' ? null : `2026-0${range(rng,1,9)}-20`, status });
    }
  }
  return out;
}
```

- [ ] **Step 4: program.ts (с координатами для карты)**

```ts
import { makeRng, pick, range } from '../prng';
import type { ProgramRecord, Grant } from './index';
// регионы с примерными координатами в SVG-пространстве карты (0..100 по X/Y)
export const REGIONS = [
  { region: 'Харківська', location: 'Харків', lat: 30, lng: 72 },
  { region: 'Донецька', location: 'Краматорськ', lat: 42, lng: 78 },
  { region: 'Херсонська', location: 'Херсон', lat: 62, lng: 55 },
  { region: 'Запорізька', location: 'Запоріжжя', lat: 50, lng: 66 },
  { region: 'Дніпропетровська', location: 'Дніпро', lat: 42, lng: 62 },
  { region: 'Миколаївська', location: 'Миколаїв', lat: 60, lng: 48 },
];
export function makeProgram(rng: () => number, grants: Grant[]): ProgramRecord[] {
  const out: ProgramRecord[] = []; let id = 1;
  for (const r of REGIONS) {
    const g = grants[range(rng, 0, grants.length - 1)];
    out.push({ id: id++, grantId: g.id, location: r.location, region: r.region,
      lat: r.lat, lng: r.lng, date: `2026-0${range(rng,1,6)}-15`,
      patients: range(rng, 800, 21000), consultations: range(rng, 500, 15000), meds: range(rng, 200, 9000) });
  }
  return out;
}
```

- [ ] **Step 5: compliance.ts, tasks.ts, state-reporting.ts**

```ts
// compliance.ts
import { makeRng, pick, range, chance } from '../prng';
import type { Compliance, Donor } from './index';
export function makeCompliance(rng: () => number, donors: Donor[]): Compliance[] {
  return donors.map((d, i) => ({ id: i + 1, donorId: d.id,
    sanctionsDate: `2026-0${range(rng,1,6)}-10`, sanctionsResult: pick(rng, ['clear','clear','review']),
    pep: chance(rng, 0.2), docsExpiry: `2026-${pick(rng,['08','09','10','11','12'])}-01` }));
}
```
```ts
// tasks.ts
import { makeRng, pick, range } from '../prng';
import type { Task } from './index';
export function makeTasks(rng: () => number): Task[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1, linkedType: pick(rng, ['donor','grant'] as const),
    linkedLabel: pick(rng, ['USAID Ukraine','Мобільні клініки Схід','Caritas Europa','Психологічна підтримка']),
    type: pick(rng, ['call','meeting','site_visit','report_deadline','renewal'] as const),
    assignee: pick(rng, ['Андрій Запітецький','Оксана Гриценко','Дмитро Левченко']),
    deadline: `2026-0${range(rng,7,9)}-${range(rng,10,28)}`,
    status: pick(rng, ['open','in_progress','done'] as const),
  }));
}
```
```ts
// state-reporting.ts
import { makeRng, pick, range } from '../prng';
import type { StateReport } from './index';
export function makeStateReports(rng: () => number): StateReport[] {
  const forms = ['ДПС','форма №1-м','форма №2-м','4ДФ'];
  return forms.map((formType, i) => ({ id: i + 1, period: '2026-Q2', formType,
    deadline: `2026-0${range(rng,7,9)}-20`, submitted: i % 2 ? `2026-07-1${i}` : null,
    status: pick(rng, ['submitted','pending','overdue'] as const) }));
}
```

- [ ] **Step 6: lib/mock/index.ts (агрегатор, единый сид)**

```ts
import { makeRng } from '../prng';
import { makeDonors } from './donors';
import { makeGrants } from './grants';
import { makePayments } from './payments';
import { makeBudget } from './budget';
import { makeReports } from './reports';
import { makeProgram } from './program';
import { makeCompliance } from './compliance';
import { makeTasks } from './tasks';
import { makeStateReports } from './state-reporting';

// экспорт типов
export type { Donor } from './donors' assert {};
// (типы объявлены в этом файле — см. блок Interfaces; при желании вынести в types.ts)

const rng = makeRng(20260709);
const donors = makeDonors(rng);
const grants = makeGrants(rng, donors.length);
const payments = makePayments(rng, grants);
const budget = makeBudget(rng, grants);
const reports = makeReports(rng, grants);
const program = makeProgram(rng, grants);
const compliance = makeCompliance(rng, donors);
const tasks = makeTasks(rng);
const stateReports = makeStateReports(rng);

export const mock = { donors, grants, payments, budget, reports, program, compliance, tasks, stateReports };
export const donorName = (id: number) => donors.find((d) => d.id === id)?.legalName ?? '—';
export const grantName = (id: number) => grants.find((g) => g.id === id)?.projectName ?? '—';
```

Примечание исполнителю: типы из блока Interfaces вынести в `lib/mock/types.ts` и импортировать из каждого файла (`import type { Donor } from './types'`), чтобы избежать циклических импортов. Строка `export type { Donor } from './donors'` выше — иллюстративная; заменить на реэкспорт из `types.ts`.

- [ ] **Step 7: Проверка сборки**

Run: `npm run build`
Expected: успешно, типы согласованы.

- [ ] **Step 8: Commit**

```bash
git add lib/mock/
git commit -m "feat: детерминированные мок-данные всех сущностей"
```

---

### Task 6: Агрегации дашборда

**Files:**
- Create: `lib/dashboard.ts`
- Test: `lib/dashboard.test.ts`

**Interfaces:**
- Consumes: `mock` из Task 5.
- Produces:
  - `pipelineByStage(): { stage: string; count: number; amount: number }[]`
  - `cashflowByQuarter(): { quarter: string; planned: number }[]`
  - `utilization(): { grant: string; planned: number; actual: number }[]`
  - `donorConcentration(): { donor: string; amount: number; pct: number }[]`
  - `upcomingReports(): { label: string; deadline: string; kind: 'donor'|'state' }[]`
  - `complianceAlerts(): { donor: string; docsExpiry: string; daysLeft: number }[]`

- [ ] **Step 1: lib/dashboard.ts**

```ts
import { mock, donorName, grantName } from './mock';

export function pipelineByStage() {
  const stages = ['lead','proposal','negotiation','signed','active','closed','renewed'];
  return stages.map((stage) => {
    const g = mock.grants.filter((x) => x.stage === stage);
    return { stage, count: g.length, amount: g.reduce((s, x) => s + x.amount, 0) };
  });
}
export function cashflowByQuarter() {
  const q: Record<string, number> = {};
  mock.payments.filter((p) => p.status === 'planned').forEach((p) => {
    const m = new Date(p.date).getMonth(); const quarter = `Q${Math.floor(m / 3) + 1}`;
    q[quarter] = (q[quarter] ?? 0) + p.amount;
  });
  return ['Q1','Q2','Q3','Q4'].map((quarter) => ({ quarter, planned: q[quarter] ?? 0 }));
}
export function utilization() {
  return mock.grants.filter((g) => g.stage === 'active').slice(0, 6).map((g) => {
    const lines = mock.budget.filter((b) => b.grantId === g.id);
    return { grant: g.projectName, planned: lines.reduce((s, l) => s + l.planned, 0),
      actual: lines.reduce((s, l) => s + l.actual, 0) };
  });
}
export function donorConcentration() {
  const total = mock.grants.reduce((s, g) => s + g.amount, 0);
  const byDonor: Record<number, number> = {};
  mock.grants.forEach((g) => { byDonor[g.donorId] = (byDonor[g.donorId] ?? 0) + g.amount; });
  return Object.entries(byDonor).map(([id, amount]) => ({
    donor: donorName(Number(id)), amount, pct: Math.round((amount / total) * 100),
  })).sort((a, b) => b.amount - a.amount);
}
export function upcomingReports() {
  const donor = mock.reports.filter((r) => !r.submitted).map((r) => ({
    label: grantName(r.grantId) + ' — ' + r.type, deadline: r.deadline, kind: 'donor' as const }));
  const state = mock.stateReports.filter((s) => !s.submitted).map((s) => ({
    label: s.formType, deadline: s.deadline, kind: 'state' as const }));
  return [...donor, ...state].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 8);
}
export function complianceAlerts() {
  const now = new Date('2026-07-09');
  return mock.compliance.map((c) => {
    const daysLeft = Math.round((new Date(c.docsExpiry).getTime() - now.getTime()) / 86400000);
    return { donor: donorName(c.donorId), docsExpiry: c.docsExpiry, daysLeft };
  }).filter((c) => c.daysLeft < 90).sort((a, b) => a.daysLeft - b.daysLeft);
}
```

- [ ] **Step 2: lib/dashboard.test.ts**

```ts
import { test } from 'node:test';
import assert from 'node:assert';
import { pipelineByStage, donorConcentration } from './dashboard.ts';

test('pipeline покрывает все стадии', () => {
  assert.strictEqual(pipelineByStage().length, 7);
});
test('концентрация донора: суммы pct положительны', () => {
  const d = donorConcentration();
  assert.ok(d.length > 0);
  assert.ok(d.every((x) => x.pct >= 0));
});
```

- [ ] **Step 3: Запустить тест (если Node поддерживает strip-types)**

Run: `node --test --experimental-strip-types lib/dashboard.test.ts`
Expected: PASS. Иначе — тест как документация (см. Task 2 Step 4).

- [ ] **Step 4: Проверка сборки + Commit**

Run: `npm run build` → Expected: успешно.
```bash
git add lib/dashboard.ts lib/dashboard.test.ts
git commit -m "feat: агрегации для виджетов дашборда"
```

---

### Task 7: Лендинг-развилка `/`

**Files:**
- Modify: `app/page.tsx` (заменить заглушку)

**Interfaces:**
- Consumes: `<Logo>`, `<LangSwitcher>`, `useLang()`.
- Produces: страница с двумя карточками-ссылками на `/admin` и `/portal`.

- [ ] **Step 1: app/page.tsx**

```tsx
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
```

- [ ] **Step 2: Проверка в dev**

Run: `npm run dev`, открыть `http://localhost:3000/CRM_FORT/`
Expected: лендинг с логотипом, переключателем UA/EN (переключение меняет тексты), две кликабельные карточки.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: лендинг-развилка с выбором роли и языка"
```

---

### Task 8: Admin layout (сайдбар + топбар)

**Files:**
- Create: `app/admin/layout.tsx`, `components/ui/Sidebar.tsx`, `components/ui/Topbar.tsx`

**Interfaces:**
- Consumes: `useLang()`, `<Logo>`, `<LangSwitcher>`.
- Produces: layout-обёртка для всех `/admin/*` страниц с навигацией по 8 разделам.

- [ ] **Step 1: components/ui/Sidebar.tsx**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n-context';
import { Logo } from '@/components/brand/Logo';

const ITEMS = [
  { href: '/admin', key: 'nav.dashboard' }, { href: '/admin/donors', key: 'nav.donors' },
  { href: '/admin/grants', key: 'nav.grants' }, { href: '/admin/payments', key: 'nav.payments' },
  { href: '/admin/budget', key: 'nav.budget' }, { href: '/admin/reports', key: 'nav.reports' },
  { href: '/admin/compliance', key: 'nav.compliance' }, { href: '/admin/tasks', key: 'nav.tasks' },
];
export function Sidebar() {
  const { t } = useLang(); const path = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-surface-muted bg-white p-4 md:block">
      <div className="mb-6 px-2"><Logo size="sm" /></div>
      <nav className="space-y-1">
        {ITEMS.map((it) => {
          const active = path === `/CRM_FORT${it.href}` || path === it.href;
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
```

- [ ] **Step 2: components/ui/Topbar.tsx**

```tsx
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
```

- [ ] **Step 3: app/admin/layout.tsx**

```tsx
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-soft">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Проверка** — после Task 9 dashboard появится; сейчас `npm run build` должен пройти (layout без страницы допустим, но добавим временную `app/admin/page.tsx` заглушку `export default () => null` если сборка требует). 

Run: `npm run build`
Expected: успешно.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx components/ui/Sidebar.tsx components/ui/Topbar.tsx
git commit -m "feat: admin layout — сайдбар и топбар с навигацией"
```

---

### Task 9: Charts-компоненты (Recharts-обёртки)

**Files:**
- Create: `components/charts/BarChart.tsx`, `DonutChart.tsx`, `LineChart.tsx`, `FunnelChart.tsx`

**Interfaces:**
- Produces (все — client components, бренд-цвет `#FF6900`):
  - `<BarChartCard data={{name:string; value:number}[]} />`
  - `<DonutChartCard data={{name:string; value:number}[]} />`
  - `<LineChartCard data={{name:string; value:number}[]} />`
  - `<FunnelBars data={{stage:string; count:number; amount:number}[]} />` (горизонтальные бары — «воронка»)

- [ ] **Step 1: components/charts/BarChart.tsx**

```tsx
'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
export function BarChartCard({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
        <Tooltip /><Bar dataKey="value" fill="#FF6900" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: DonutChart.tsx**

```tsx
'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
const COLORS = ['#FF6900','#FF8B3D','#FFB27A','#E45E00','#FFC9A3','#B84B00'];
export function DonutChartCard({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 3: LineChart.tsx**

```tsx
'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
export function LineChartCard({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
        <Tooltip /><Line type="monotone" dataKey="value" stroke="#FF6900" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 4: FunnelChart.tsx**

```tsx
'use client';
import { formatMoney } from '@/lib/format';
export function FunnelBars({ data }: { data: { stage: string; count: number; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.stage} className="flex items-center gap-3">
          <div className="w-24 shrink-0 text-xs capitalize text-ink/60">{d.stage}</div>
          <div className="h-7 flex-1 rounded-lg bg-surface-muted">
            <div className="flex h-7 items-center rounded-lg bg-brand px-2 text-xs font-medium text-white"
                 style={{ width: `${Math.max((d.amount / max) * 100, 8)}%` }}>{d.count}</div>
          </div>
          <div className="w-28 shrink-0 text-right text-xs text-ink/60">{formatMoney(d.amount, 'UAH')}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Проверка сборки + Commit**

Run: `npm run build` → Expected: успешно.
```bash
git add components/charts/
git commit -m "feat: charts-обёртки на Recharts в фирменном цвете"
```

---

### Task 10: Admin Dashboard `/admin`

**Files:**
- Create/Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `dashboard.ts` (Task 6), charts (Task 9), `StatCard`, `Card`, `PageHeader`, `useLang`, `formatMoney`.

- [ ] **Step 1: app/admin/page.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { FunnelBars } from '@/components/charts/FunnelChart';
import { BarChartCard } from '@/components/charts/BarChart';
import { DonutChartCard } from '@/components/charts/DonutChart';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import * as D from '@/lib/dashboard';
import { mock } from '@/lib/mock';

export default function AdminDashboard() {
  const { t } = useLang();
  const totalGrants = mock.grants.reduce((s, g) => s + g.amount, 0);
  const active = mock.grants.filter((g) => g.stage === 'active').length;
  return (
    <div>
      <PageHeader title={t('nav.dashboard')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('nav.grants')} value={String(mock.grants.length)} hint={`${active} active`} />
        <StatCard label={t('nav.donors')} value={String(mock.donors.length)} />
        <StatCard label="Portfolio" value={formatMoney(totalGrants, 'UAH')} />
        <StatCard label={t('dash.alerts')} value={String(D.complianceAlerts().length)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.pipeline')}</h3><FunnelBars data={D.pipelineByStage()} /></Card>
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.cashflow')}</h3>
          <BarChartCard data={D.cashflowByQuarter().map((q) => ({ name: q.quarter, value: q.planned }))} /></Card>
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.concentration')}</h3>
          <DonutChartCard data={D.donorConcentration().slice(0, 6).map((d) => ({ name: d.donor, value: d.amount }))} /></Card>
        <Card><h3 className="mb-3 font-display font-bold">{t('dash.calendar')}</h3>
          <ul className="space-y-2 text-sm">
            {D.upcomingReports().map((r, i) => (
              <li key={i} className="flex justify-between border-b border-surface-muted pb-1">
                <span>{r.label}</span><span className="text-ink/50">{r.deadline}</span></li>
            ))}
          </ul></Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Проверка в dev** — открыть `/CRM_FORT/admin/`, убедиться что виджеты рендерятся, консоль без ошибок.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin dashboard с KPI и виджетами"
```

---

### Task 11: Admin — Донори (список + карточка)

**Files:**
- Create: `app/admin/donors/page.tsx`, `app/admin/donors/[id]/page.tsx`

**Interfaces:**
- Consumes: `mock.donors`, `DataTable`, `Badge`, `PageHeader`, `Card`.
- Static export для динамического роута требует `generateStaticParams`.

- [ ] **Step 1: список — app/admin/donors/page.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock } from '@/lib/mock';

export default function DonorsPage() {
  const { t } = useLang();
  return (
    <div>
      <PageHeader title={t('nav.donors')} />
      <DataTable rows={mock.donors} rowHref={(d) => `/admin/donors/${d.id}`}
        columns={[
          { key: 'legalName', label: 'Name' },
          { key: 'type', label: 'Type' },
          { key: 'country', label: 'Country' },
          { key: 'status', label: t('common.status'), render: (d) => (
            <Badge tone={d.status === 'active' ? 'green' : d.status === 'declined' ? 'red' : 'gray'}>{d.status}</Badge>) },
        ]} />
    </div>
  );
}
```

- [ ] **Step 2: карточка — app/admin/donors/[id]/page.tsx**

```tsx
import { mock } from '@/lib/mock';
import { DonorDetail } from './detail';
export function generateStaticParams() { return mock.donors.map((d) => ({ id: String(d.id) })); }
export default function Page({ params }: { params: { id: string } }) {
  return <DonorDetail id={Number(params.id)} />;
}
```

Create `app/admin/donors/[id]/detail.tsx`:
```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mock } from '@/lib/mock';

export function DonorDetail({ id }: { id: number }) {
  const d = mock.donors.find((x) => x.id === id);
  if (!d) return <div>—</div>;
  const grants = mock.grants.filter((g) => g.donorId === id);
  return (
    <div>
      <PageHeader title={d.legalName} subtitle={`${d.type} · ${d.country}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display font-bold">Реквізити</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink/50">Status</dt><dd><Badge tone="green">{d.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Currency</dt><dd>{d.currency}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Source</dt><dd>{d.source}</dd></div>
          </dl></Card>
        <Card><h3 className="mb-3 font-display font-bold">Контакти</h3>
          <ul className="space-y-2 text-sm">
            {d.contacts.map((c, i) => <li key={i}>{c.name} — <span className="text-ink/50">{c.position}, {c.role}</span></li>)}
          </ul></Card>
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">Гранти донора</h3>
        <ul className="space-y-1 text-sm">
          {grants.map((g) => <li key={g.id} className="flex justify-between border-b border-surface-muted pb-1">
            <span>{g.projectName}</span><Badge tone="brand">{g.stage}</Badge></li>)}
        </ul></Card>
    </div>
  );
}
```

- [ ] **Step 3: Проверка в dev** — `/CRM_FORT/admin/donors/` кликается в карточку `/admin/donors/1/`; `npm run build` генерирует статические страницы по `generateStaticParams`.

- [ ] **Step 4: Commit**

```bash
git add app/admin/donors/
git commit -m "feat: admin — список и карточка донора"
```

---

### Task 12: Admin — Гранти (список + карточка)

**Files:**
- Create: `app/admin/grants/page.tsx`, `app/admin/grants/[id]/page.tsx`, `app/admin/grants/[id]/detail.tsx`

**Interfaces:**
- Consumes: `mock.grants/payments/budget/reports`, `donorName`, `DataTable`, `Badge`, `formatMoney`, `FunnelBars`.

- [ ] **Step 1: список — app/admin/grants/page.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import { mock, donorName } from '@/lib/mock';

export default function GrantsPage() {
  const { t } = useLang();
  return (
    <div>
      <PageHeader title={t('nav.grants')} />
      <DataTable rows={mock.grants} rowHref={(g) => `/admin/grants/${g.id}`}
        columns={[
          { key: 'projectName', label: 'Project' },
          { key: 'donor', label: t('nav.donors'), render: (g) => donorName(g.donorId) },
          { key: 'stage', label: 'Stage', render: (g) => <Badge tone="brand">{g.stage}</Badge> },
          { key: 'amount', label: t('common.amount'), render: (g) => formatMoney(g.amount, g.currency) },
        ]} />
    </div>
  );
}
```

- [ ] **Step 2: page.tsx с generateStaticParams**

```tsx
import { mock } from '@/lib/mock';
import { GrantDetail } from './detail';
export function generateStaticParams() { return mock.grants.map((g) => ({ id: String(g.id) })); }
export default function Page({ params }: { params: { id: string } }) {
  return <GrantDetail id={Number(params.id)} />;
}
```

- [ ] **Step 3: detail.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatMoney, formatPct } from '@/lib/format';
import { mock, donorName } from '@/lib/mock';

export function GrantDetail({ id }: { id: number }) {
  const g = mock.grants.find((x) => x.id === id);
  if (!g) return <div>—</div>;
  const payments = mock.payments.filter((p) => p.grantId === id);
  const budget = mock.budget.filter((b) => b.grantId === id);
  const reports = mock.reports.filter((r) => r.grantId === id);
  return (
    <div>
      <PageHeader title={g.projectName} subtitle={`${donorName(g.donorId)} · ${formatMoney(g.amount, g.currency)}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display font-bold">Транші</h3>
          <ul className="space-y-1 text-sm">{payments.map((p) => (
            <li key={p.id} className="flex justify-between border-b border-surface-muted pb-1">
              <span>#{p.trancheNumber} · {p.date}</span>
              <span>{formatMoney(p.amount, p.currency)} <Badge tone={p.status==='confirmed'?'green':'gray'}>{p.status}</Badge></span></li>))}
          </ul></Card>
        <Card><h3 className="mb-3 font-display font-bold">Бюджет (план/факт)</h3>
          <ul className="space-y-1 text-sm">{budget.map((b) => (
            <li key={b.id} className="flex justify-between border-b border-surface-muted pb-1">
              <span>{b.category}</span>
              <span>{formatMoney(b.actual,g.currency)} / {formatMoney(b.planned,g.currency)}
                <span className={b.flag?'text-red-600':'text-ink/50'}> {formatPct(b.variancePct)}</span></span></li>))}
          </ul></Card>
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">Звіти</h3>
        <ul className="space-y-1 text-sm">{reports.map((r) => (
          <li key={r.id} className="flex justify-between border-b border-surface-muted pb-1">
            <span>{r.type} · {r.deadline}</span><Badge tone={r.status==='approved'?'green':'amber'}>{r.status}</Badge></li>))}
        </ul></Card>
    </div>
  );
}
```

- [ ] **Step 4: Проверка в dev + Commit**

Run: `npm run dev` → `/CRM_FORT/admin/grants/` → карточка. `npm run build` OK.
```bash
git add app/admin/grants/
git commit -m "feat: admin — список и карточка гранта (транши, бюджет, отчёты)"
```

---

### Task 13: Admin — Платежі, Бюджети, Завдання (три списочные страницы)

**Files:**
- Create: `app/admin/payments/page.tsx`, `app/admin/budget/page.tsx`, `app/admin/tasks/page.tsx`

**Interfaces:**
- Consumes: `mock.payments/budget/tasks`, `DataTable`, `Badge`, `formatMoney`, `formatPct`, `grantName`.

- [ ] **Step 1: payments/page.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import { mock, grantName } from '@/lib/mock';
export default function PaymentsPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.payments')} />
    <DataTable rows={mock.payments} columns={[
      { key: 'grant', label: t('nav.grants'), render: (p) => grantName(p.grantId) },
      { key: 'trancheNumber', label: 'Tranche', render: (p) => `#${p.trancheNumber}` },
      { key: 'date', label: t('common.date') },
      { key: 'amount', label: t('common.amount'), render: (p) => formatMoney(p.amount, p.currency) },
      { key: 'status', label: t('common.status'), render: (p) => (
        <Badge tone={p.status==='confirmed'?'green':p.status==='received'?'brand':'gray'}>{p.status}</Badge>) },
    ]} /></div>);
}
```

- [ ] **Step 2: budget/page.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney, formatPct } from '@/lib/format';
import { mock, grantName } from '@/lib/mock';
export default function BudgetPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.budget')} />
    <DataTable rows={mock.budget} columns={[
      { key: 'grant', label: t('nav.grants'), render: (b) => grantName(b.grantId) },
      { key: 'category', label: 'Category' },
      { key: 'planned', label: 'Plan', render: (b) => formatMoney(b.planned, 'UAH') },
      { key: 'actual', label: 'Actual', render: (b) => formatMoney(b.actual, 'UAH') },
      { key: 'variancePct', label: 'Variance', render: (b) => (
        <span className={b.flag?'text-red-600 font-medium':'text-ink/60'}>{formatPct(b.variancePct)}{b.flag?' ⚑':''}</span>) },
    ]} /></div>);
}
```

- [ ] **Step 3: tasks/page.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock } from '@/lib/mock';
export default function TasksPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.tasks')} />
    <DataTable rows={mock.tasks} columns={[
      { key: 'type', label: 'Type' },
      { key: 'linkedLabel', label: 'Linked' },
      { key: 'assignee', label: 'Assignee' },
      { key: 'deadline', label: t('common.deadline') },
      { key: 'status', label: t('common.status'), render: (x) => (
        <Badge tone={x.status==='done'?'green':x.status==='in_progress'?'brand':'gray'}>{x.status}</Badge>) },
    ]} /></div>);
}
```

- [ ] **Step 4: Проверка сборки + Commit**

Run: `npm run build` → Expected: успешно.
```bash
git add app/admin/payments app/admin/budget app/admin/tasks
git commit -m "feat: admin — платежи, бюджеты, задачи"
```

---

### Task 14: Admin — Звіти (+ держзвітність) и Комплаєнс

**Files:**
- Create: `app/admin/reports/page.tsx`, `app/admin/compliance/page.tsx`

**Interfaces:**
- Consumes: `mock.reports/stateReports/compliance`, `dashboard.complianceAlerts`, `DataTable`, `Badge`, `Card`, `grantName`, `donorName`.

- [ ] **Step 1: reports/page.tsx (два блока)**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock, grantName } from '@/lib/mock';
export default function ReportsPage() {
  const { t } = useLang();
  return (<div><PageHeader title={t('nav.reports')} />
    <DataTable rows={mock.reports} columns={[
      { key: 'grant', label: t('nav.grants'), render: (r) => grantName(r.grantId) },
      { key: 'type', label: 'Type' },
      { key: 'deadline', label: t('common.deadline') },
      { key: 'status', label: t('common.status'), render: (r) => (
        <Badge tone={r.status==='approved'?'green':r.status==='rejected'?'red':'amber'}>{r.status}</Badge>) },
    ]} />
    <h2 className="mb-3 mt-8 font-display text-lg font-bold">Державна звітність</h2>
    <DataTable rows={mock.stateReports} columns={[
      { key: 'formType', label: 'Form' }, { key: 'period', label: 'Period' },
      { key: 'deadline', label: t('common.deadline') },
      { key: 'status', label: t('common.status'), render: (s) => (
        <Badge tone={s.status==='submitted'?'green':s.status==='overdue'?'red':'amber'}>{s.status}</Badge>) },
    ]} /></div>);
}
```

- [ ] **Step 2: compliance/page.tsx**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock, donorName } from '@/lib/mock';
import { complianceAlerts } from '@/lib/dashboard';
export default function CompliancePage() {
  const { t } = useLang();
  const alerts = complianceAlerts();
  return (<div><PageHeader title={t('nav.compliance')} subtitle={`${alerts.length} alerts < 90 days`} />
    <DataTable rows={mock.compliance} columns={[
      { key: 'donor', label: t('nav.donors'), render: (c) => donorName(c.donorId) },
      { key: 'sanctionsResult', label: 'Sanctions', render: (c) => (
        <Badge tone={c.sanctionsResult==='clear'?'green':'amber'}>{c.sanctionsResult}</Badge>) },
      { key: 'pep', label: 'PEP', render: (c) => c.pep ? 'Yes' : 'No' },
      { key: 'docsExpiry', label: 'Docs expiry', render: (c) => {
        const days = Math.round((new Date(c.docsExpiry).getTime()-new Date('2026-07-09').getTime())/86400000);
        return <span className={days<60?'text-red-600 font-medium':''}>{c.docsExpiry} ({days}d)</span>; } },
    ]} /></div>);
}
```

- [ ] **Step 3: Проверка сборки + Commit**

Run: `npm run build` → Expected: успешно, все 8 admin-разделов открываются.
```bash
git add app/admin/reports app/admin/compliance
git commit -m "feat: admin — звіти, держзвітність и комплаєнс"
```

---

### Task 15: Ukraine impact map (компонент карты с сердечками-пинами)

**Files:**
- Create: `components/map/UkraineImpactMap.tsx`

**Interfaces:**
- Consumes: `ProgramRecord[]`.
- Produces: `<UkraineImpactMap records={ProgramRecord[]} metric='patients'|'consultations'|'meds' />` — SVG-«карта» (стилизованный контур-плейсхолдер) с оранжевыми сердечками и числами в координатах `lng`(X 0..100)/`lat`(Y 0..100).

- [ ] **Step 1: components/map/UkraineImpactMap.tsx**

```tsx
export function UkraineImpactMap({ records, metric = 'patients' }:
  { records: { location: string; region: string; lat: number; lng: number;
    patients: number; consultations: number; meds: number }[]; metric?: 'patients'|'consultations'|'meds' }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-surface-soft" style={{ aspectRatio: '3 / 2' }}>
      <svg viewBox="0 0 100 67" className="h-full w-full">
        {/* стилизованный контур-плейсхолдер Украины */}
        <path d="M8 25 Q20 10 45 14 Q70 8 92 22 Q88 40 78 46 Q60 60 40 56 Q18 52 10 40 Z"
              fill="#EBEBEB" stroke="#DcDcDc" strokeWidth="0.5" />
        {records.map((r, i) => {
          const x = r.lng * 0.9 + 3, y = r.lat * 0.6 + 4;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 3 L-3 0 A2 2 0 0 1 0 -2 A2 2 0 0 1 3 0 Z" fill="#FF6900" />
              <text x="4" y="1.5" fontSize="3" fill="#0A0A0A" fontWeight="600">
                {r[metric].toLocaleString('uk-UA')}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```
Примечание: контур — стилизованный плейсхолдер (концепт), не географически точный. Сердечки-пины повторяют фирменный мотив сайта.

- [ ] **Step 2: Проверка сборки + Commit**

Run: `npm run build` → Expected: успешно.
```bash
git add components/map/
git commit -m "feat: карта Украины с сердечками-пинами (фирменный мотив)"
```

---

### Task 16: Portal layout + Dashboard донора `/portal`

**Files:**
- Create: `app/portal/layout.tsx`, `app/portal/page.tsx`

**Interfaces:**
- Consumes: `useLang`, `<Logo>`, `<LangSwitcher>`, `StatCard`, `Card`, `mock`, charts, `formatMoney`.
- Один «условный донор» для портала — `PORTAL_DONOR_ID = 4` (USAID Ukraine из сида); показываем только его гранты.

- [ ] **Step 1: app/portal/layout.tsx**

```tsx
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
```

Create `app/portal/nav.tsx`:
```tsx
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
```

- [ ] **Step 2: app/portal/page.tsx (dashboard донора)**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { formatMoney } from '@/lib/format';
import { mock } from '@/lib/mock';

export const PORTAL_DONOR_ID = 4;
export default function PortalDashboard() {
  const { t } = useLang();
  const grants = mock.grants.filter((g) => g.donorId === PORTAL_DONOR_ID);
  const grantIds = grants.map((g) => g.id);
  const allocated = grants.reduce((s, g) => s + g.amount, 0);
  const spent = mock.budget.filter((b) => grantIds.includes(b.grantId)).reduce((s, b) => s + b.actual, 0);
  const payments = mock.payments.filter((p) => grantIds.includes(p.grantId));
  return (
    <div>
      <PageHeader title={t('landing.donor')} subtitle="USAID Ukraine" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t('portal.allocated')} value={formatMoney(allocated, 'USD')} />
        <StatCard label={t('portal.spent')} value={formatMoney(spent, 'USD')} />
        <StatCard label={t('portal.balance')} value={formatMoney(Math.max(allocated - spent, 0), 'USD')} />
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">Часова шкала виплат</h3>
        <ul className="space-y-2 text-sm">{payments.map((p) => (
          <li key={p.id} className="flex justify-between border-b border-surface-muted pb-1">
            <span>#{p.trancheNumber} · {p.date}</span>
            <span>{formatMoney(p.amount, p.currency)} <Badge tone={p.status==='confirmed'?'green':'gray'}>{p.status}</Badge></span></li>))}
        </ul></Card>
    </div>
  );
}
```

- [ ] **Step 3: Проверка в dev** — `/CRM_FORT/portal/` показывает виділено/освоєно/залишок и таймлайн.

- [ ] **Step 4: Commit**

```bash
git add app/portal/layout.tsx app/portal/nav.tsx app/portal/page.tsx
git commit -m "feat: portal layout и dashboard донора"
```

---

### Task 17: Portal — Бюджет, Метрики впливу, Звіти, Апдейти

**Files:**
- Create: `app/portal/budget/page.tsx`, `app/portal/impact/page.tsx`, `app/portal/reports/page.tsx`, `app/portal/updates/page.tsx`

**Interfaces:**
- Consumes: `mock`, `PORTAL_DONOR_ID`, `UkraineImpactMap`, `BarChartCard`, `LineChartCard`, `StatCard`, `Card`, `Badge`, `formatMoney`.

- [ ] **Step 1: budget/page.tsx (агрегированный план vs факт по статьям)**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { BarChartCard } from '@/components/charts/BarChart';
import { useLang } from '@/lib/i18n-context';
import { formatMoney, formatPct } from '@/lib/format';
import { mock } from '@/lib/mock';
import { PORTAL_DONOR_ID } from '../page';

export default function PortalBudget() {
  const { t } = useLang();
  const grantIds = mock.grants.filter((g) => g.donorId === PORTAL_DONOR_ID).map((g) => g.id);
  const lines = mock.budget.filter((b) => grantIds.includes(b.grantId));
  const byCat: Record<string, { planned: number; actual: number }> = {};
  lines.forEach((l) => { (byCat[l.category] ??= { planned: 0, actual: 0 });
    byCat[l.category].planned += l.planned; byCat[l.category].actual += l.actual; });
  const rows = Object.entries(byCat).map(([category, v]) => ({ category, ...v,
    pct: ((v.actual - v.planned) / v.planned) * 100 }));
  return (
    <div><PageHeader title={t('nav.budget')} />
      <Card className="mb-6"><BarChartCard data={rows.map((r) => ({ name: r.category, value: r.actual }))} /></Card>
      <Card><ul className="space-y-1 text-sm">{rows.map((r) => (
        <li key={r.category} className="flex justify-between border-b border-surface-muted pb-1">
          <span>{r.category}</span>
          <span>{formatMoney(r.actual,'USD')} / {formatMoney(r.planned,'USD')}
            <span className="text-ink/50"> {formatPct(r.pct)}</span></span></li>))}
      </ul></Card>
    </div>
  );
}
```

- [ ] **Step 2: impact/page.tsx (карта + счётчики + график)**

```tsx
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
        <StatCard label="Пацієнти" value={patients.toLocaleString('uk-UA')} />
        <StatCard label="Консультації" value={consultations.toLocaleString('uk-UA')} />
        <StatCard label="Видано медикаментів" value={meds.toLocaleString('uk-UA')} />
      </div>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">Локації</h3>
        <UkraineImpactMap records={rec} metric="patients" /></Card>
      <Card className="mt-6"><h3 className="mb-3 font-display font-bold">Динаміка</h3>
        <LineChartCard data={rec.map((r) => ({ name: r.location, value: r.patients }))} /></Card>
    </div>
  );
}
```

- [ ] **Step 3: reports/page.tsx (библиотека PDF, кнопки-заглушки)**

```tsx
'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n-context';
import { mock, grantName } from '@/lib/mock';
import { PORTAL_DONOR_ID } from '../page';

export default function PortalReports() {
  const { t } = useLang();
  const grantIds = mock.grants.filter((g) => g.donorId === PORTAL_DONOR_ID).map((g) => g.id);
  const reports = mock.reports.filter((r) => grantIds.includes(r.grantId) && r.status === 'approved');
  return (
    <div><PageHeader title={t('nav.reports')} />
      <div className="grid gap-4 sm:grid-cols-2">{reports.map((r) => (
        <Card key={r.id} className="flex items-center justify-between">
          <div><div className="font-medium">{grantName(r.grantId)}</div>
            <div className="text-sm text-ink/50">{r.type} · {r.deadline}</div></div>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            {t('common.download')}</button>
        </Card>))}
      </div>
      {reports.length === 0 && <p className="text-ink/50">—</p>}
    </div>
  );
}
```

- [ ] **Step 4: updates/page.tsx (лента фото+текст; фото — плейсхолдер-блоки)**

```tsx
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
```

- [ ] **Step 5: Проверка сборки + Commit**

Run: `npm run build` → Expected: успешно, все portal-страницы открываются.
```bash
git add app/portal/
git commit -m "feat: portal — бюджет, метрики впливу с картой, звіти, апдейти"
```

---

### Task 18: GitHub Actions деплой на GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: собранный `out/` от `npm run build`.
- Produces: публичный сайт на `https://0nik5.github.io/CRM_FORT/`.

- [ ] **Step 1: .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: touch out/.nojekyll
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Убедиться, что package-lock.json закоммичен** (нужен для `npm ci`).

Run: `git add package-lock.json` (если ещё не в git).

- [ ] **Step 3: Включить Pages в режиме GitHub Actions**

Через gh CLI:
Run: `gh api -X POST repos/0NIK5/CRM_FORT/pages -f build_type=workflow` (если Pages ещё не включён; при 409 — уже включён, пропустить).

- [ ] **Step 4: Commit + push, дождаться workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: деплой static export на GitHub Pages"
git push
```
Run: `gh run watch` (дождаться success).
Expected: workflow зелёный; сайт доступен на `https://0nik5.github.io/CRM_FORT/`.

- [ ] **Step 5: Финальная проверка ссылки**

Открыть `https://0nik5.github.io/CRM_FORT/` — лендинг, переходы в `/admin` и `/portal`, переключение языка, все страницы с данными. Готово к отправке человеку.

---

## Self-Review (заполняется при написании; для исполнителя — контекст)

**Spec coverage:**
- Лендинг + развилка + язык → Task 7 ✓
- Admin: Dashboard/виджеты → Task 6,9,10 ✓; Донори → 11 ✓; Гранти → 12 ✓;
  Платежі/Бюджети/Завдання → 13 ✓; Звіти+держзвітність → 14 ✓; Комплаєнс → 14 ✓
- Donor Portal: layout+dashboard → 16 ✓; Бюджет → 17 ✓; Метрики+карта → 15,17 ✓;
  Звіти → 17 ✓; Апдейти (опц.) → 17 ✓
- Бренд (цвета/шрифты/лого/карта) → Task 1,4,15 ✓
- i18n UA/EN → Task 3 + ключи по страницам ✓
- Static export + basePath → Task 1 ✓
- Деплой GitHub Actions/Pages → Task 18 ✓

**Замечания исполнителю:**
1. Типы мок-данных вынести в `lib/mock/types.ts` (см. примечание в Task 5 Step 6),
   импортировать `import type { ... } from './types'` во всех mock-файлах и на страницах.
2. Все текстовые подписи интерфейса — только через `t('...')`; при добавлении новых
   подписей добавлять ключ в оба языка в `lib/i18n.ts` (Task 3).
3. Для динамических роутов (`donors/[id]`, `grants/[id]`) обязателен
   `generateStaticParams` — иначе static export упадёт.
4. `'use client'` обязателен на всех страницах, использующих `useLang()`/Recharts/hooks.
5. Проверять консоль браузера на каждой странице — hydration-ошибок быть не должно
   (детерминированный сид это обеспечивает).
