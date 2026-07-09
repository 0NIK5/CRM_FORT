import { pick, range } from '../prng';
import type { Task } from './types';
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
