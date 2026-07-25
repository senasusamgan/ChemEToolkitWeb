import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch05CalculationError,
  calculateSmithPredictor,
} from '../../src/features/process-control/batch05/engine.ts'

test('perfect model gives zero approximate mismatch', () => {
  const result = calculateSmithPredictor({
    actualProcessGain: 2,
    actualTimeConstant: 7,
    actualDeadTime: 2,
    modelProcessGain: 2,
    modelTimeConstant: 7,
    modelDeadTime: 2,
    controllerGain: 1.5,
    setpointStep: 5,
    evaluationTime: 12,
  })
  assert.ok(Math.abs(result.modelMismatch) < 1e-12)
})

test('delay-free prediction responds before delayed model', () => {
  const result = calculateSmithPredictor({
    actualProcessGain: 2,
    actualTimeConstant: 7,
    actualDeadTime: 3,
    modelProcessGain: 2,
    modelTimeConstant: 7,
    modelDeadTime: 3,
    controllerGain: 1.5,
    setpointStep: 5,
    evaluationTime: 2,
  })
  assert.ok(result.delayFreePrediction > 0)
  assert.equal(result.delayedModelPrediction, 0)
})

test('rejects zero process gain', () => {
  assert.throws(
    () => calculateSmithPredictor({
      actualProcessGain: 0,
      actualTimeConstant: 7,
      actualDeadTime: 2,
      modelProcessGain: 2,
      modelTimeConstant: 7,
      modelDeadTime: 2,
      controllerGain: 1,
      setpointStep: 5,
      evaluationTime: 10,
    }),
    (error: unknown) =>
      error instanceof ProcessControlBatch05CalculationError &&
      error.code === 'invalidSmithPredictorSettings',
  )
})
