import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateLaplaceTransform, ProcessControlBatch03CalculationError } from '../../src/features/process-control/batch03/engine.ts'

test('evaluates common Laplace terms', () => {
  const result = calculateLaplaceTransform({ constantAmplitude: 2, rampSlope: 1, exponentialAmplitude: 3, exponentialDecayRate: 0.5, sineAmplitude: 4, cosineAmplitude: 1.5, angularFrequency: 2, evaluationS: 1 })
  const expected = 2 + 1 + 3 / 1.5 + 8 / 5 + 1.5 / 5
  assert.ok(Math.abs(Number(result.headlineValue) - expected) < 1e-12)
})

test('constant input transforms to A over s', () => {
  const result = calculateLaplaceTransform({ constantAmplitude: 6, rampSlope: 0, exponentialAmplitude: 0, exponentialDecayRate: 0, sineAmplitude: 0, cosineAmplitude: 0, angularFrequency: 2, evaluationS: 3 })
  assert.equal(result.headlineValue, 2)
})

test('rejects non-positive s', () => {
  assert.throws(() => calculateLaplaceTransform({ constantAmplitude: 1, rampSlope: 0, exponentialAmplitude: 0, exponentialDecayRate: 0, sineAmplitude: 0, cosineAmplitude: 0, angularFrequency: 1, evaluationS: 0 }), (error: unknown) => error instanceof ProcessControlBatch03CalculationError && error.code === 'invalidParameter')
})
