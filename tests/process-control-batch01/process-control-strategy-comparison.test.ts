import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlStrategyComparisonCalculationError,
  calculateProcessControlStrategyComparison,
} from '../../src/features/process-control/process-control-strategy-comparison/engine.ts'

const example = {
  processGain: 2,
  feedbackControllerGain: 3,
  measurementGain: 1,
  disturbanceGain: 4,
  disturbanceMagnitude: 2,
  feedforwardModelGain: 2,
  secondaryControllerGain: 3,
  secondaryProcessGain: 2,
}

test('identifies perfect feedforward compensation', () => {
  const result =
    calculateProcessControlStrategyComparison(example)
  assert.equal(result.uncontrolledDeviation, 8)
  assert.equal(result.feedforwardFeedbackResidual, 0)
  assert.equal(result.bestStrategy, 'Feedforward + feedback')
  assert.equal(result.feedforwardReductionPercent, 100)
})

test('cascade improves on feedback-only disturbance rejection', () => {
  const result = calculateProcessControlStrategyComparison({
    ...example,
    feedforwardModelGain: 0,
  })
  assert.ok(
    Math.abs(result.cascadeResidual) <
    Math.abs(result.feedbackResidual),
  )
  assert.ok(
    result.cascadeReductionPercent >
    result.feedbackReductionPercent,
  )
})

test('rejects zero uncontrolled deviation', () => {
  assert.throws(
    () => calculateProcessControlStrategyComparison({
      ...example,
      disturbanceMagnitude: 0,
    }),
    (error: unknown) =>
      error instanceof
        ProcessControlStrategyComparisonCalculationError &&
      error.code === 'zeroUncontrolledDeviation',
  )
})
