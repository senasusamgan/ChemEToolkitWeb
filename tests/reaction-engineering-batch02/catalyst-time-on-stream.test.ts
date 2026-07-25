import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch02CalculationError,
  calculateCatalystTimeOnStream,
} from '../../src/features/reaction-engineering/batch02/engine.ts'

const example = {
  initialActivity: 1,
  observedActivity: 0.75,
  observedTime: 100,
  deactivationOrder: 1,
  targetActivity: 0.5,
}

test('infers first-order deactivation constant', () => {
  const result =
    calculateCatalystTimeOnStream(
      example,
    )

  assert.ok(
    Math.abs(
      result.inferredDeactivationRateConstant -
      Math.log(
        1 /
        0.75,
      ) /
      100,
    ) < 1e-15,
  )
})

test('predicts positive remaining time to target', () => {
  const result =
    calculateCatalystTimeOnStream(
      example,
    )

  assert.ok(
    result.remainingTimeToTargetActivity >
    0,
  )

  assert.equal(
    result.observedTargetAlreadyPassed,
    false,
  )
})

test('rejects observed activity above initial activity', () => {
  assert.throws(
    () =>
      calculateCatalystTimeOnStream({
        ...example,
        observedActivity: 1.1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch02CalculationError &&
      error.code ===
        'invalidTimeOnStreamInputs',
  )
})
