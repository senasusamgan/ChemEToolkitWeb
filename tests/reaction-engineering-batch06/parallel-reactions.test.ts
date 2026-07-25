import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch06CalculationError,
  calculateParallelReactions,
} from '../../src/features/reaction-engineering/batch06/engine.ts'

const example = {
  reactantConcentration: 2,
  desiredRateConstant: 0.5,
  desiredReactionOrder: 1,
  undesiredRateConstant: 0.1,
  undesiredReactionOrder: 2,
}

test('calculates desired and undesired rates', () => {
  const result =
    calculateParallelReactions(
      example,
    )

  assert.equal(
    result.desiredReactionRate,
    1,
  )

  assert.ok(
    Math.abs(
      result.undesiredReactionRate -
      0.4,
    ) < 1e-15,
  )
})

test('product fractions sum to one', () => {
  const result =
    calculateParallelReactions(
      example,
    )

  assert.ok(
    Math.abs(
      result.desiredProductFraction +
      result.undesiredProductFraction -
      1,
    ) < 1e-15,
  )
})

test('rejects negative reaction order', () => {
  assert.throws(
    () =>
      calculateParallelReactions({
        ...example,
        desiredReactionOrder: -1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch06CalculationError &&
      error.code ===
        'invalidParallelReactionInputs',
  )
})
