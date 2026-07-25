import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateInverseLaplaceTransform, ProcessControlBatch03CalculationError } from '../../src/features/process-control/batch03/engine.ts'

test('evaluates inverse Laplace terms', () => {
  const result = calculateInverseLaplaceTransform({ constantOverS: 2, exponentialNumerator: 3, exponentialPole: 0.5, cosineNumerator: 1.5, sineNumerator: 4, angularFrequency: 2, evaluationTime: 1 })
  const expected = 2 + 3 * Math.exp(-0.5) + 1.5 * Math.cos(2) + 2 * Math.sin(2)
  assert.ok(Math.abs(Number(result.headlineValue) - expected) < 1e-12)
})

test('inverse transform at zero time excludes sine contribution', () => {
  const result = calculateInverseLaplaceTransform({ constantOverS: 2, exponentialNumerator: 3, exponentialPole: 0.5, cosineNumerator: 1.5, sineNumerator: 4, angularFrequency: 2, evaluationTime: 0 })
  assert.equal(result.headlineValue, 6.5)
  assert.equal(result.items[3].value, 0)
})

test('rejects zero frequency', () => {
  assert.throws(() => calculateInverseLaplaceTransform({ constantOverS: 1, exponentialNumerator: 1, exponentialPole: 1, cosineNumerator: 1, sineNumerator: 1, angularFrequency: 0, evaluationTime: 1 }), (error: unknown) => error instanceof ProcessControlBatch03CalculationError && error.code === 'invalidParameter')
})
