import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch04CalculationError,
  calculateFCurveGenerator,
} from '../../src/features/reaction-engineering/batch04/engine.ts'

const example = {
  times: [0, 50, 100, 150, 200],
  eValues: [0, 0.006, 0.012, 0.002, 0],
  evaluationTime: 100,
}

test('normalizes the E-curve area', () => {
  const result = calculateFCurveGenerator(example)
  let area = 0
  for (let i = 1; i < example.times.length; i += 1) {
    area +=
      (example.times[i] - example.times[i - 1]) *
      (result.normalizedEValues[i] + result.normalizedEValues[i - 1]) / 2
  }
  assert.ok(Math.abs(area - 1) < 1e-12)
})

test('generates monotonic cumulative F values', () => {
  const result = calculateFCurveGenerator(example)
  for (let i = 1; i < result.cumulativeFValues.length; i += 1) {
    assert.ok(result.cumulativeFValues[i] >= result.cumulativeFValues[i - 1])
  }
  assert.ok(Math.abs(result.cumulativeFValues.at(-1)! - 1) < 1e-12)
})

test('rejects non-increasing times', () => {
  assert.throws(
    () => calculateFCurveGenerator({
      ...example,
      times: [0, 50, 50, 150, 200],
    }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch04CalculationError &&
      error.code === 'invalidFCurveInputs',
  )
})
