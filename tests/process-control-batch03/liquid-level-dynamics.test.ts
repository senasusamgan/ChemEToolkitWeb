import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateLiquidLevelDynamics } from '../../src/features/process-control/batch03/engine.ts'
const example = { tankArea: 4, outletResistance: 3, inletFlowRate: 2, initialLevel: 1, evaluationTime: 12, maximumAllowableLevel: 7 }

test('calculates analytical first-order level response', () => {
  const result = calculateLiquidLevelDynamics(example)
  const expected = 6 + (1 - 6) * Math.exp(-1)
  assert.ok(Math.abs(Number(result.headlineValue) - expected) < 1e-12)
  assert.equal(result.items[0].value, 12)
  assert.equal(result.items[1].value, 6)
})

test('returns initial level at zero time', () => {
  const result = calculateLiquidLevelDynamics({ ...example, evaluationTime: 0 })
  assert.equal(result.headlineValue, 1)
  assert.equal(result.items[3].value, 0)
})

test('flags steady-state overflow risk', () => {
  const result = calculateLiquidLevelDynamics({ ...example, maximumAllowableLevel: 5 })
  assert.equal(result.items[5].value, 'Yes')
})
