import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch05CalculationError,
  calculateSecondOrderFrequencyResponse,
} from '../../src/features/process-control/batch05/engine.ts'

test('matches the response at natural frequency', () => {
  const result = calculateSecondOrderFrequencyResponse({
    processGain: 2,
    naturalFrequency: 1.5,
    dampingRatio: 0.5,
    angularFrequency: 1.5,
  })
  assert.ok(Math.abs(result.magnitudeRatio - 2) < 1e-12)
  assert.ok(Math.abs(result.phaseDegrees + 90) < 1e-12)
})

test('returns steady-state gain at zero frequency', () => {
  const result = calculateSecondOrderFrequencyResponse({
    processGain: 3,
    naturalFrequency: 2,
    dampingRatio: 0.7,
    angularFrequency: 0,
  })
  assert.equal(result.magnitudeRatio, 3)
  assert.equal(result.phaseDegrees, 0)
})

test('rejects zero damping ratio', () => {
  assert.throws(
    () => calculateSecondOrderFrequencyResponse({
      processGain: 2,
      naturalFrequency: 1,
      dampingRatio: 0,
      angularFrequency: 1,
    }),
    (error: unknown) =>
      error instanceof ProcessControlBatch05CalculationError &&
      error.code === 'invalidSecondOrderSettings',
  )
})
