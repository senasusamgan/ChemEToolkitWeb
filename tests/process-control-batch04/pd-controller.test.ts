import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PDControllerCalculationError,
  calculatePDController,
} from '../../src/features/process-control/pd-controller/engine.ts'

test('calculates proportional and derivative contributions', () => {
  const result = calculatePDController({
    controllerBias: 50,
    controllerGain: 2,
    derivativeTime: 1.5,
    currentError: 4,
    previousError: 3,
    sampleTime: 0.5,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.errorDerivative, 2)
  assert.equal(result.proportionalContribution, 8)
  assert.equal(result.derivativeContribution, 6)
  assert.equal(result.controllerOutput, 64)
})

test('limits a large PD output', () => {
  const result = calculatePDController({
    controllerBias: 50,
    controllerGain: 10,
    derivativeTime: 5,
    currentError: 20,
    previousError: 0,
    sampleTime: 1,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.controllerOutput, 100)
  assert.equal(result.outputWasLimited, true)
})

test('rejects zero sample time', () => {
  assert.throws(
    () => calculatePDController({
      controllerBias: 50,
      controllerGain: 2,
      derivativeTime: 1,
      currentError: 4,
      previousError: 3,
      sampleTime: 0,
      minimumOutput: 0,
      maximumOutput: 100,
    }),
    (error: unknown) =>
      error instanceof PDControllerCalculationError &&
      error.code === 'nonPositiveSampleTime',
  )
})
