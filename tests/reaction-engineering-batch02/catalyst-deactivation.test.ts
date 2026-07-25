import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch02CalculationError,
  calculateCatalystDeactivationKinetics,
} from '../../src/features/reaction-engineering/batch02/engine.ts'

const example = {
  initialActivity: 1,
  deactivationRateConstant: 0.02,
  deactivationOrder: 1,
  elapsedTime: 20,
  targetActivity: 0.5,
}

test('calculates first-order activity decay', () => {
  const result =
    calculateCatalystDeactivationKinetics(
      example,
    )

  assert.ok(
    Math.abs(
      result.currentActivity -
      Math.exp(-0.4),
    ) < 1e-15,
  )
})

test('calculates half-activity time', () => {
  const result =
    calculateCatalystDeactivationKinetics(
      example,
    )

  assert.ok(
    Math.abs(
      result.timeToHalfInitialActivity -
      Math.log(2) /
      0.02,
    ) < 1e-12,
  )
})

test('rejects target equal to initial activity', () => {
  assert.throws(
    () =>
      calculateCatalystDeactivationKinetics({
        ...example,
        targetActivity: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch02CalculationError &&
      error.code ===
        'invalidDeactivationInputs',
  )
})
