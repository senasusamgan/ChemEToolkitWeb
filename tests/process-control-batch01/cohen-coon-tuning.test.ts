import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CohenCoonTuningCalculationError,
  calculateCohenCoonTuning,
} from '../../src/features/process-control/cohen-coon-tuning/engine.ts'

test('calculates the Cohen-Coon PID reference case', () => {
  const result = calculateCohenCoonTuning({
    processGain: 2,
    processTimeConstant: 10,
    processDeadTime: 2,
  })
  assert.ok(Math.abs(result.deadTimeRatio - 0.2) < 1e-12)
  assert.ok(
    Math.abs(result.controllerGain - 3.458333333333333) <
    1e-12,
  )
  assert.ok(
    Math.abs(result.integralTime - 4.5479452054794525) <
    1e-12,
  )
  assert.ok(
    Math.abs(result.derivativeTime - 0.7017543859649122) <
    1e-12,
  )
})

test('controller gain scales inversely with process gain', () => {
  const first = calculateCohenCoonTuning({
    processGain: 1,
    processTimeConstant: 10,
    processDeadTime: 2,
  })
  const second = calculateCohenCoonTuning({
    processGain: 2,
    processTimeConstant: 10,
    processDeadTime: 2,
  })
  assert.ok(
    Math.abs(first.controllerGain / 2 - second.controllerGain) <
    1e-12,
  )
})

test('rejects zero dead time', () => {
  assert.throws(
    () => calculateCohenCoonTuning({
      processGain: 2,
      processTimeConstant: 10,
      processDeadTime: 0,
    }),
    (error: unknown) =>
      error instanceof CohenCoonTuningCalculationError &&
      error.code === 'nonPositiveDeadTime',
  )
})
