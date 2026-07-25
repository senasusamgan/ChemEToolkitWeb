import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FeedforwardControlCalculationError,
  calculateFeedforwardControl,
} from '../../src/features/process-control/feedforward-control/engine.ts'

test('perfect model gives zero feedforward residual', () => {
  const result = calculateFeedforwardControl({
    actualDisturbanceGain: 4,
    actualProcessGain: 2,
    modelDisturbanceGain: 4,
    modelProcessGain: 2,
    disturbanceChange: 5,
    feedbackLoopGain: 4,
  })

  assert.equal(result.idealFeedforwardGain, -2)
  assert.equal(result.implementedFeedforwardGain, -2)
  assert.equal(result.uncompensatedDeviation, 20)
  assert.equal(result.feedforwardResidual, 0)
  assert.equal(result.finalResidualWithFeedback, 0)
  assert.equal(result.compensationPercent, 100)
})

test('feedback attenuates model-mismatch residual', () => {
  const input = {
    actualDisturbanceGain: 4,
    actualProcessGain: 2,
    modelDisturbanceGain: 3,
    modelProcessGain: 2,
    disturbanceChange: 5,
  }

  const open = calculateFeedforwardControl({
    ...input,
    feedbackLoopGain: 0,
  })
  const closed = calculateFeedforwardControl({
    ...input,
    feedbackLoopGain: 4,
  })

  assert.ok(
    Math.abs(closed.finalResidualWithFeedback) <
    Math.abs(open.finalResidualWithFeedback),
  )
})

test('rejects zero model process gain', () => {
  assert.throws(
    () => calculateFeedforwardControl({
      actualDisturbanceGain: 4,
      actualProcessGain: 2,
      modelDisturbanceGain: 4,
      modelProcessGain: 0,
      disturbanceChange: 5,
      feedbackLoopGain: 4,
    }),
    (error: unknown) =>
      error instanceof FeedforwardControlCalculationError &&
      error.code === 'zeroModelProcessGain',
  )
})
