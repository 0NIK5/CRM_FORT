import { pick, range } from '../prng';
import type { StateReport } from './types';
export function makeStateReports(rng: () => number): StateReport[] {
  const forms = ['ДПС','форма №1-м','форма №2-м','4ДФ'];
  return forms.map((formType, i) => ({ id: i + 1, period: '2026-Q2', formType,
    deadline: `2026-0${range(rng,7,9)}-20`, submitted: i % 2 ? `2026-07-1${i}` : null,
    status: pick(rng, ['submitted','pending','overdue'] as const) }));
}
