// Mulberry32 — детерминированный PRNG.
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
export const range = (rng: () => number, min: number, max: number): number =>
  Math.floor(rng() * (max - min + 1)) + min;
export const chance = (rng: () => number, p: number): boolean => rng() < p;
