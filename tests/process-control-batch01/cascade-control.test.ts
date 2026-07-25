import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CascadeControlCalculationError,
  calculateCascadeControl,
} from '../../src/features/process-control/cascade-control/engine.ts'

const example = {
  primaryControllerGain: 2,
  secondaryControllerGain: 3,
  primaryProcessGain: 1.5,
  secondaryProcessGain: 2,
  primaryMeasurementGain: 1,
  secondaryMeasurementGain: 1,
  primarySetpoint: 10,
  secondaryDisturbance: 2,
}

test('calculates nested loop gains and output', () => {
  const result = calculateCascadeControl(example)
  assert.ok(Math.abs(result.secondaryLoopGain - 6) < 1e-12)
  assert.ok(
    Math.abs(result.secondaryClosedLoopGain - 6 / 7) < 1e-12,
  )
  assert.ok(
    Math.abs(result.primaryClosedLoopGain - 0.72) < 1e-12,
  )
  assert.ok(
    Math.abs(result.disturbanceContribution - 0.12) < 1e-12,
  )
  assert.ok(Math.abs(result.primaryOutput - 7.32) < 1e-12)
})

test('stronger secondary control reduces disturbance transmission', () => {
  const weak = calculateCascadeControl({
    ...example,
    secondaryControllerGain: 0.5,
  })
  const strong = calculateCascadeControl({
    ...example,
    secondaryControllerGain: 5,
  })
  assert.ok(
    Math.abs(strong.disturbanceContribution) <
    Math.abs(weak.disturbanceContribution),
  )
})

test('rejects non-positive gains', () => {
  assert.throws(
    () => calculateCascadeControl({
      ...example,
      secondaryMeasurementGain: 0,
    }),
    (error: unknown) =>
      error instanceof CascadeControlCalculationError &&
      error.code === 'nonPositiveGain',
  )
})
