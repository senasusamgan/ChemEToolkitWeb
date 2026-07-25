import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ClosedLoopFeedbackAnalysisCalculationError,
  calculateClosedLoopFeedbackAnalysis,
} from '../../src/features/process-control/closed-loop-feedback-analysis/engine.ts'

const example = {
  controllerGain: 2,
  processGain: 3,
  measurementGain: 1,
  processTimeConstant: 10,
  setpointStep: 5,
  loadDisturbance: 1,
  evaluationTime: 10,
}

test('calculates first-order closed-loop quantities', () => {
  const result = calculateClosedLoopFeedbackAnalysis(example)
  assert.equal(result.loopGain, 6)
  assert.ok(
    Math.abs(result.closedLoopSetpointGain - 6 / 7) < 1e-12,
  )
  assert.ok(
    Math.abs(result.closedLoopDisturbanceGain - 1 / 7) <
    1e-12,
  )
  assert.ok(
    Math.abs(result.closedLoopTimeConstant - 10 / 7) < 1e-12,
  )
  assert.ok(
    result.outputAtEvaluationTime < result.steadyStateOutput,
  )
  assert.ok(result.responseFraction > 0.99)
})

test('higher controller gain improves disturbance rejection', () => {
  const low = calculateClosedLoopFeedbackAnalysis({
    ...example,
    controllerGain: 0.5,
  })
  const high = calculateClosedLoopFeedbackAnalysis({
    ...example,
    controllerGain: 5,
  })
  assert.ok(
    high.closedLoopDisturbanceGain <
    low.closedLoopDisturbanceGain,
  )
  assert.ok(
    high.closedLoopTimeConstant <
    low.closedLoopTimeConstant,
  )
})

test('rejects negative evaluation time', () => {
  assert.throws(
    () => calculateClosedLoopFeedbackAnalysis({
      ...example,
      evaluationTime: -1,
    }),
    (error: unknown) =>
      error instanceof
        ClosedLoopFeedbackAnalysisCalculationError &&
      error.code === 'negativeEvaluationTime',
  )
})
