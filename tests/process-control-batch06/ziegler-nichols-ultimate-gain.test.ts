import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch06CalculationError,
  calculateZieglerNicholsUltimateGain,
} from '../../src/features/process-control/batch06/engine.ts'

test('calculates classic PID ultimate-gain settings', () => {
  const result =
    calculateZieglerNicholsUltimateGain({
      controllerMode: 3,
      ultimateGain: 8,
      ultimatePeriod: 12,
    })

  assert.equal(
    result.controllerModeName,
    'PID',
  )
  assert.equal(
    result.controllerGain,
    4.8,
  )
  assert.equal(
    result.integralTime,
    6,
  )
  assert.equal(
    result.derivativeTime,
    1.5,
  )
  assert.ok(
    Math.abs(
      result.integralGain -
      0.8,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.derivativeGain -
      7.2,
    ) < 1e-12,
  )
})

test('P mode has no integral or derivative contribution', () => {
  const result =
    calculateZieglerNicholsUltimateGain({
      controllerMode: 1,
      ultimateGain: 10,
      ultimatePeriod: 8,
    })

  assert.equal(result.controllerGain, 5)
  assert.equal(result.integralTime, 0)
  assert.equal(result.derivativeTime, 0)
  assert.equal(result.integralGain, 0)
  assert.equal(result.derivativeGain, 0)
})

test('rejects zero ultimate period', () => {
  assert.throws(
    () =>
      calculateZieglerNicholsUltimateGain({
        controllerMode: 3,
        ultimateGain: 8,
        ultimatePeriod: 0,
      }),
    (error: unknown) =>
      error instanceof
        ProcessControlBatch06CalculationError &&
      error.code ===
        'invalidUltimateGainSettings',
  )
})
