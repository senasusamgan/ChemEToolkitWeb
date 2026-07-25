import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch07CalculationError,
  calculateReactionOrderDetermination,
} from '../../src/features/reaction-engineering/batch07/engine.ts'

const example = {
  concentrationExperimentOne: 1,
  rateExperimentOne: 2,
  concentrationExperimentTwo: 2,
  rateExperimentTwo: 8,
}

test('determines second-order kinetics', () => {
  const result =
    calculateReactionOrderDetermination(
      example,
    )

  assert.ok(
    Math.abs(
      result.reactionOrder -
      2,
    ) < 1e-15,
  )

  assert.equal(
    result.orderClassification,
    'Approximately second order',
  )
})

test('calculates consistent rate constants', () => {
  const result =
    calculateReactionOrderDetermination(
      example,
    )

  assert.ok(
    Math.abs(
      result.rateConstantExperimentOne -
      2,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.rateConstantExperimentTwo -
      2,
    ) < 1e-15,
  )
})

test('rejects equal experiment concentrations', () => {
  assert.throws(
    () =>
      calculateReactionOrderDetermination({
        ...example,
        concentrationExperimentTwo: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch07CalculationError &&
      error.code ===
        'indeterminateReactionOrder',
  )
})
