import { range } from '../prng';
import type { BudgetLine, Grant } from './types';
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
