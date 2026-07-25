import assert from 'node:assert/strict'
import test from 'node:test'
import {
  GainSchedulingCalculationError,
  calculateGainScheduling,
} from '../../src/features/process-control/gain-scheduling/engine.ts'

const example = {
  operatingPoint: 60,
  lowOperatingPoint: 20,
  highOperatingPoint: 100,
  lowControllerGain: 1,
  highControllerGain: 3,
  lowIntegralTime: 12,
  highIntegralTime: 6,
  lowDerivativeTime: 0,
  highDerivativeTime: 1.5,
}

test('interpolates the midpoint schedule', () => {
  const result = calculateGainScheduling(example)

  assert.equal(result.interpolationFraction, 0.5)
  assert.equal(result.scheduledControllerGain, 2)
  assert.equal(result.scheduledIntegralTime, 9)
  assert.equal(result.scheduledDerivativeTime, 0.75)
  assert.equal(result.wasClamped, false)
})

test('clamps an operating point above the schedule', () => {
  const result = calculateGainScheduling({
    ...example,
    operatingPoint: 150,
  })

  assert.equal(result.interpolationFraction, 1)
  assert.equal(result.effectiveOperatingPoint, 100)
  assert.equal(result.scheduledControllerGain, 3)
  assert.equal(result.wasClamped, true)
})

test('rejects an invalid operating range', () => {
  assert.throws(
    () => calculateGainScheduling({
      ...example,
      lowOperatingPoint: 100,
      highOperatingPoint: 20,
    }),
    (error: unknown) =>
      error instanceof GainSchedulingCalculationError &&
      error.code === 'invalidOperatingRange',
  )
})
