import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FirstOrderFrequencyResponseCalculationError,
  calculateFirstOrderFrequencyResponse,
} from '../../src/features/process-control/first-order-frequency-response/engine.ts'

test('matches the corner-frequency response', () => {
  const result = calculateFirstOrderFrequencyResponse({
    processGain: 2,
    timeConstant: 5,
    angularFrequency: 0.2,
  })

  assert.ok(
    Math.abs(result.normalizedFrequency - 1) < 1e-12,
  )
  assert.ok(
    Math.abs(result.magnitudeRatio - Math.sqrt(2)) <
    1e-12,
  )
  assert.ok(
    Math.abs(result.phaseDegrees + 45) < 1e-12,
  )
  assert.ok(
    Math.abs(result.realPart - 1) < 1e-12,
  )
  assert.ok(
    Math.abs(result.imaginaryPart + 1) < 1e-12,
  )
})

test('zero frequency returns the steady-state gain', () => {
  const result = calculateFirstOrderFrequencyResponse({
    processGain: 3,
    timeConstant: 4,
    angularFrequency: 0,
  })

  assert.equal(result.magnitudeRatio, 3)
  assert.equal(result.phaseDegrees, 0)
  assert.equal(result.realPart, 3)
  assert.equal(result.imaginaryPart, 0)
})

test('rejects negative angular frequency', () => {
  assert.throws(
    () => calculateFirstOrderFrequencyResponse({
      processGain: 2,
      timeConstant: 5,
      angularFrequency: -1,
    }),
    (error: unknown) =>
      error instanceof
        FirstOrderFrequencyResponseCalculationError &&
      error.code === 'negativeAngularFrequency',
  )
})
