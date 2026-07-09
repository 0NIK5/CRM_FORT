import { range } from '../prng';
import type { ProgramRecord, Grant } from './types';
// регионы с примерными координатами в SVG-пространстве карты (0..100 по X/Y)
export const REGIONS = [
  { region: 'Харківська', location: 'Харків', lat: 30, lng: 72 },
  { region: 'Донецька', location: 'Краматорськ', lat: 42, lng: 78 },
  { region: 'Херсонська', location: 'Херсон', lat: 62, lng: 55 },
  { region: 'Запорізька', location: 'Запоріжжя', lat: 50, lng: 66 },
  { region: 'Дніпропетровська', location: 'Дніпро', lat: 42, lng: 62 },
  { region: 'Миколаївська', location: 'Миколаїв', lat: 60, lng: 48 },
];
export function makeProgram(rng: () => number, grants: Grant[]): ProgramRecord[] {
  const out: ProgramRecord[] = []; let id = 1;
  for (const r of REGIONS) {
    const g = grants[range(rng, 0, grants.length - 1)];
    out.push({ id: id++, grantId: g.id, location: r.location, region: r.region,
      lat: r.lat, lng: r.lng, date: `2026-0${range(rng,1,6)}-15`,
      patients: range(rng, 800, 21000), consultations: range(rng, 500, 15000), meds: range(rng, 200, 9000) });
  }
  return out;
}
