import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch07CalculationError,
  calculateRateLawBuilder,
} from '../../src/features/reaction-engineering/batch07/engine.ts'

const example = {
  stoichiometricCoefficientA: 1,
  stoichiometricCoefficientB: 2,
  reactionOrderA: 1,
  reactionOrderB: 2,
}

test('builds the overall order and k exponent', () => {
  const result =
    calculateRateLawBuilder(
      example,
    )

  assert.equal(
    result.overallReactionOrder,
    3,
  )

  assert.equal(
    result.rateConstantConcentrationExponent,
    -2,
  )
})

test('builds power-law and stoichiometric expressions', () => {
  const result =
    calculateRateLawBuilder(
      example,
    )

  assert.equal(
    result.powerLawExpression,
    'r = k C_A^1 C_B^2',
  )

  assert.match(
    result.stoichiometricRateRelationship,
    /dC_A\/dt/,
  )
})

test('rejects negative reaction order', () => {
  assert.throws(
    () =>
      calculateRateLawBuilder({
        ...example,
        reactionOrderB: -1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch07CalculationError &&
      error.code ===
        'invalidRateLawInputs',
  )
})
