import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch06CalculationError,
  calculateTransferFunctionBuilder,
} from '../../src/features/process-control/batch06/engine.ts'

test('returns steady-state gain without an integrator', () => {
  const result =
    calculateTransferFunctionBuilder({
      processGain: 2,
      firstTimeConstant: 5,
      secondTimeConstant: 2,
      deadTime: 1,
      integratorOrder: 0,
      angularFrequency: 0,
    })

  assert.equal(
    result.magnitudeRatio,
    2,
  )
  assert.equal(
    result.phaseDegrees,
    0,
  )
  assert.equal(result.realPart, 2)
  assert.equal(result.imaginaryPart, 0)
})

test('includes both lag poles', () => {
  const result =
    calculateTransferFunctionBuilder({
      processGain: 2,
      firstTimeConstant: 5,
      secondTimeConstant: 2,
      deadTime: 1,
      integratorOrder: 0,
      angularFrequency: 0.2,
    })

  assert.equal(result.poleOne, -0.2)
  assert.equal(result.poleTwo, -0.5)
  assert.ok(result.magnitudeRatio > 0)
})

test('rejects an integrator at zero frequency', () => {
  assert.throws(
    () =>
      calculateTransferFunctionBuilder({
        processGain: 2,
        firstTimeConstant: 5,
        secondTimeConstant: 2,
        deadTime: 1,
        integratorOrder: 1,
        angularFrequency: 0,
      }),
    (error: unknown) =>
      error instanceof
        ProcessControlBatch06CalculationError &&
      error.code ===
        'invalidTransferFunctionSettings',
  )
})
