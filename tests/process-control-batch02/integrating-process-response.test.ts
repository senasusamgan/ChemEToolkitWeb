import assert from 'node:assert/strict'
import test from 'node:test'
import {
  IntegratingProcessResponseCalculationError,
  calculateIntegratingProcessResponse,
} from '../../src/features/process-control/integrating-process-response/engine.ts'

test('calculates a delayed ramp response', () => {
  const result = calculateIntegratingProcessResponse({
    integratingGain: 0.4,
    initialOutput: 10,
    inputStepChange: 2,
    deadTime: 3,
    evaluationTime: 13,
  })

  assert.equal(result.rampSlope, 0.8)
  assert.equal(result.activeIntegrationTime, 10)
  assert.equal(result.outputChange, 8)
  assert.equal(result.outputAtEvaluationTime, 18)
  assert.equal(result.deadTimeCompleted, true)
})

test('holds the initial output before dead time', () => {
  const result = calculateIntegratingProcessResponse({
    integratingGain: 0.4,
    initialOutput: 10,
    inputStepChange: 2,
    deadTime: 3,
    evaluationTime: 2,
  })

  assert.equal(result.activeIntegrationTime, 0)
  assert.equal(result.outputChange, 0)
  assert.equal(result.outputAtEvaluationTime, 10)
  assert.equal(result.deadTimeCompleted, false)
})

test('rejects a zero ramp slope', () => {
  assert.throws(
    () => calculateIntegratingProcessResponse({
      integratingGain: 0.4,
      initialOutput: 10,
      inputStepChange: 0,
      deadTime: 3,
      evaluationTime: 13,
    }),
    (error: unknown) =>
      error instanceof
        IntegratingProcessResponseCalculationError &&
      error.code === 'zeroRampSlope',
  )
})
