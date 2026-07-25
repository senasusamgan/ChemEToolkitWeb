import assert from 'node:assert/strict'
import test from 'node:test'
import {
  OpenLoopResponseCalculationError,
  calculateOpenLoopResponse,
} from '../../src/features/process-control/open-loop-response/engine.ts'

test('calculates a delayed first-order response', () => {
  const result = calculateOpenLoopResponse({
    processGain: 2,
    timeConstant: 8,
    deadTime: 2,
    inputStepChange: 3,
    initialOutput: 10,
    evaluationTime: 12,
  })

  const expectedFraction = 1 - Math.exp(-10 / 8)

  assert.ok(
    Math.abs(result.responseFraction - expectedFraction) <
    1e-12,
  )
  assert.ok(
    Math.abs(
      result.outputAtEvaluationTime -
      (10 + 6 * expectedFraction),
    ) < 1e-12,
  )
  assert.equal(result.steadyStateOutput, 16)
})

test('holds the initial output before the dead time', () => {
  const result = calculateOpenLoopResponse({
    processGain: 2,
    timeConstant: 8,
    deadTime: 5,
    inputStepChange: 3,
    initialOutput: 10,
    evaluationTime: 3,
  })

  assert.equal(result.responseFraction, 0)
  assert.equal(result.outputAtEvaluationTime, 10)
})

test('rejects a non-positive time constant', () => {
  assert.throws(
    () => calculateOpenLoopResponse({
      processGain: 2,
      timeConstant: 0,
      deadTime: 2,
      inputStepChange: 3,
      initialOutput: 10,
      evaluationTime: 12,
    }),
    (error: unknown) =>
      error instanceof OpenLoopResponseCalculationError &&
      error.code === 'nonPositiveTimeConstant',
  )
})
