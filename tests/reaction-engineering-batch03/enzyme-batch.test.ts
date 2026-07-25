import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch03CalculationError,
  calculateEnzymeBatchReactor,
} from '../../src/features/reaction-engineering/batch03/engine.ts'

const example = {
  initialSubstrateConcentration: 100,
  maximumReactionRate: 2,
  michaelisConstant: 20,
  targetConversion: 0.9,
}

test('calculates integrated Michaelis-Menten batch time', () => {
  const result =
    calculateEnzymeBatchReactor(
      example,
    )

  const expected =
    (
      90 +
      20 *
      Math.log(10)
    ) /
    2

  assert.ok(
    Math.abs(
      result.requiredBatchTime -
      expected,
    ) < 1e-12,
  )
})

test('reaction rate falls as substrate is consumed', () => {
  const result =
    calculateEnzymeBatchReactor(
      example,
    )

  assert.ok(
    result.finalReactionRate <
    result.initialReactionRate,
  )

  assert.ok(
    Math.abs(
      result.finalSubstrateConcentration -
      10,
    ) < 1e-12,
  )
})

test('rejects zero Michaelis constant', () => {
  assert.throws(
    () =>
      calculateEnzymeBatchReactor({
        ...example,
        michaelisConstant: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch03CalculationError &&
      error.code ===
        'invalidEnzymeBatchInputs',
  )
})
