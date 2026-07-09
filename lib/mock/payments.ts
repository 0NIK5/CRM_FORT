import { pick, range } from '../prng';
import type { Payment, Grant } from './types';
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
