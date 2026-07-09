import { pick, range, chance } from '../prng';
import type { Compliance, Donor } from './types';
export function makeCompliance(rng: () => number, donors: Donor[]): Compliance[] {
  return donors.map((d, i) => ({ id: i + 1, donorId: d.id,
    sanctionsDate: `2026-0${range(rng,1,6)}-10`, sanctionsResult: pick(rng, ['clear','clear','review']),
    pep: chance(rng, 0.2), docsExpiry: `2026-${pick(rng,['08','09','10','11','12'])}-01` }));
}
