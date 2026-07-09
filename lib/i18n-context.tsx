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
