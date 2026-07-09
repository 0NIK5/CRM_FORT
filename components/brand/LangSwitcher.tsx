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
