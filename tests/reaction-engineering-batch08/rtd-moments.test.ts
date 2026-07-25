import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch08CalculationError,
  calculateRTDMoments,
} from '../../src/features/reaction-engineering/batch08/engine.ts'

const example = {
  times: [0, 50, 100, 150, 200],
  tracerConcentrations: [0, 0.006, 0.012, 0.002, 0],
}

test('normalizes the discrete tracer curve', () => {
  const result = calculateRTDMoments(example)
  let area = 0
  for (let index = 1; index < example.times.length; index += 1) {
    area +=
      (example.times[index] - example.times[index - 1]) *
      (result.normalizedEValues[index] + result.normalizedEValues[index - 1]) /
      2
  }
  assert.ok(Math.abs(area - 1) < 1e-12)
})

test('returns ordered RTD percentiles', () => {
  const result = calculateRTDMoments(example)
  assert.ok(result.timeAtTenPercent < result.medianResidenceTime)
  assert.ok(result.medianResidenceTime < result.timeAtNinetyPercent)
})

test('rejects non-increasing times', () => {
  assert.throws(
    () => calculateRTDMoments({ ...example, times: [0, 50, 50, 150, 200] }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch08CalculationError &&
      error.code === 'invalidRTDMomentInputs',
  )
})
