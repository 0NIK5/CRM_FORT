export function formatMoney(n: number, currency: 'UAH' | 'USD'): string {
  const s = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(n));
  return currency === 'USD' ? `$${s}` : `${s} ₴`;
}
export function formatDate(iso: string, lang: 'ua' | 'en'): string {
  return new Intl.DateTimeFormat(lang === 'ua' ? 'uk-UA' : 'en-GB',
    { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}
export const formatPct = (n: number): string => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
