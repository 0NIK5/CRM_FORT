import { pick, range, chance } from '../prng';
import type { Grant } from './types';
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
