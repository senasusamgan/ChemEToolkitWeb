import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PIControllerCalculationError,
  calculatePIController,
} from '../../src/features/process-control/pi-controller/engine.ts'

test('updates the integral state and output', () => {
  const result = calculatePIController({
    controllerBias: 40,
    controllerGain: 2,
    integralTime: 5,
    currentError: 3,
    previousIntegralState: 4,
    sampleTime: 1,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.proportionalContribution, 6)
  assert.equal(result.updatedIntegralState, 7)
  assert.equal(result.integralContribution, 2.8)
  assert.equal(result.controllerOutput, 48.8)
})

test('limits a saturated PI output', () => {
  const result = calculatePIController({
    controllerBias: 90,
    controllerGain: 5,
    integralTime: 2,
    currentError: 10,
    previousIntegralState: 10,
    sampleTime: 1,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.controllerOutput, 100)
  assert.equal(result.outputWasLimited, true)
})

test('rejects a non-positive integral time', () => {
  assert.throws(
    () => calculatePIController({
      controllerBias: 40,
      controllerGain: 2,
      integralTime: 0,
      currentError: 3,
      previousIntegralState: 4,
      sampleTime: 1,
      minimumOutput: 0,
      maximumOutput: 100,
    }),
    (error: unknown) =>
      error instanceof PIControllerCalculationError &&
      error.code === 'nonPositiveIntegralTime',
  )
})
