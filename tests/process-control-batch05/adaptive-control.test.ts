import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch05CalculationError,
  calculateAdaptiveControl,
} from '../../src/features/process-control/batch05/engine.ts'

test('updates parameters toward the measured output', () => {
  const result = calculateAdaptiveControl({
    currentGainEstimate: 1.5,
    currentBiasEstimate: 0.5,
    manipulatedInput: 4,
    measuredOutput: 8,
    adaptationGain: 0.8,
    sampleTime: 1,
    normalizationConstant: 1,
  })
  assert.ok(result.updatedGainEstimate > 1.5)
  assert.ok(
    Math.abs(8 - result.predictedOutputAfterUpdate) <
    Math.abs(result.predictionError),
  )
})

test('zero prediction error leaves parameters unchanged', () => {
  const result = calculateAdaptiveControl({
    currentGainEstimate: 2,
    currentBiasEstimate: 1,
    manipulatedInput: 3,
    measuredOutput: 7,
    adaptationGain: 0.5,
    sampleTime: 1,
    normalizationConstant: 1,
  })
  assert.equal(result.updatedGainEstimate, 2)
  assert.equal(result.updatedBiasEstimate, 1)
})

test('rejects zero adaptation gain', () => {
  assert.throws(
    () => calculateAdaptiveControl({
      currentGainEstimate: 1,
      currentBiasEstimate: 0,
      manipulatedInput: 2,
      measuredOutput: 4,
      adaptationGain: 0,
      sampleTime: 1,
      normalizationConstant: 1,
    }),
    (error: unknown) =>
      error instanceof ProcessControlBatch05CalculationError &&
      error.code === 'invalidAdaptationSettings',
  )
})
