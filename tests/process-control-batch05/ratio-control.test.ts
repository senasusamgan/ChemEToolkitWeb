import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch05CalculationError,
  calculateRatioControl,
} from '../../src/features/process-control/batch05/engine.ts'

test('calculates controlled-flow setpoint and output', () => {
  const result = calculateRatioControl({
    wildFlow: 100,
    desiredRatio: 0.6,
    measuredControlledFlow: 54,
    controllerGain: 2,
    controllerBias: 40,
    minimumOutput: 0,
    maximumOutput: 100,
  })
  assert.equal(result.controlledFlowSetpoint, 60)
  assert.equal(result.flowError, 6)
  assert.equal(result.controllerOutput, 52)
})

test('limits the controller output', () => {
  const result = calculateRatioControl({
    wildFlow: 100,
    desiredRatio: 2,
    measuredControlledFlow: 0,
    controllerGain: 10,
    controllerBias: 40,
    minimumOutput: 0,
    maximumOutput: 100,
  })
  assert.equal(result.controllerOutput, 100)
  assert.equal(result.outputWasLimited, true)
})

test('rejects zero wild flow', () => {
  assert.throws(
    () => calculateRatioControl({
      wildFlow: 0,
      desiredRatio: 1,
      measuredControlledFlow: 1,
      controllerGain: 1,
      controllerBias: 0,
      minimumOutput: 0,
      maximumOutput: 100,
    }),
    (error: unknown) =>
      error instanceof ProcessControlBatch05CalculationError &&
      error.code === 'invalidRatioSettings',
  )
})
