import { test } from 'node:test';
import assert from 'node:assert';
import { makeRng, range } from './prng.ts';

test('makeRng детерминирован для одного сида', () => {
  const a = makeRng(42), b = makeRng(42);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
  assert.deepStrictEqual(seqA, seqB);
});
test('range в границах', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 100; i++) { const v = range(rng, 5, 10); assert.ok(v >= 5 && v <= 10); }
});
