import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProportionalControllerCalculationError,
  calculateProportionalController,
} from '../../src/features/process-control/proportional-controller/engine.ts'

test('calculates a proportional controller output', () => {
  const result = calculateProportionalController({
    controllerBias: 50,
    controllerGain: 2.5,
    setpoint: 80,
    measuredValue: 72,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.controlError, 8)
  assert.equal(result.proportionalCorrection, 20)
  assert.equal(result.rawOutput, 70)
  assert.equal(result.controllerOutput, 70)
  assert.equal(result.outputPositionPercent, 70)
})

test('limits the proportional output', () => {
  const result = calculateProportionalController({
    controllerBias: 50,
    controllerGain: 10,
    setpoint: 100,
    measuredValue: 0,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.controllerOutput, 100)
  assert.equal(result.outputWasLimited, true)
})

test('rejects invalid output limits', () => {
  assert.throws(
    () => calculateProportionalController({
      controllerBias: 50,
      controllerGain: 2,
      setpoint: 80,
      measuredValue: 72,
      minimumOutput: 100,
      maximumOutput: 0,
    }),
    (error: unknown) =>
      error instanceof
        ProportionalControllerCalculationError &&
      error.code === 'invalidOutputLimits',
  )
})
