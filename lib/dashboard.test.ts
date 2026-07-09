import { test } from 'node:test';
import assert from 'node:assert';
import { pipelineByStage, donorConcentration } from './dashboard.ts';

test('pipeline покрывает все стадии', () => {
  assert.strictEqual(pipelineByStage().length, 7);
});
test('концентрация донора: суммы pct положительны', () => {
  const d = donorConcentration();
  assert.ok(d.length > 0);
  assert.ok(d.every((x) => x.pct >= 0));
});
