import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch06CalculationError,
  calculateRateConstant,
} from '../../src/features/reaction-engineering/batch06/engine.ts'

const example = {
  observedReactionRate: 12,
  concentrationA: 2,
  reactionOrderA: 1,
  concentrationB: 3,
  reactionOrderB: 2,
}

test('back-calculates the power-law rate constant', () => {
  const result =
    calculateRateConstant(
      example,
    )

  assert.ok(
    Math.abs(
      result.rateConstant -
      (
        12 /
        18
      ),
    ) < 1e-15,
  )

  assert.equal(
    result.overallReactionOrder,
    3,
  )
})

test('reconstructs the observed reaction rate', () => {
  const result =
    calculateRateConstant(
      example,
    )

  assert.ok(
    Math.abs(
      result.reconstructedReactionRate -
      12,
    ) < 1e-14,
  )

  assert.ok(
    result.relativeReconstructionError <
    1e-14,
  )
})

test('rejects zero concentration', () => {
  assert.throws(
    () =>
      calculateRateConstant({
        ...example,
        concentrationB: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch06CalculationError &&
      error.code ===
        'invalidRateConstantInputs',
  )
})
