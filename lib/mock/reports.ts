import { pick, range } from '../prng';
import type { Report, Grant } from './types';
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
