import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch08CalculationError,
  calculateSeriesReactions,
} from '../../src/features/reaction-engineering/batch08/engine.ts'

const example = {
  initialConcentrationA: 1000,
  firstReactionRateConstant: 0.03,
  secondReactionRateConstant: 0.01,
  reactionTime: 50,
}

test('conserves A, B and C concentration', () => {
  const result = calculateSeriesReactions(example)
  assert.ok(result.massBalanceResidual < 1e-12)
  assert.ok(
    Math.abs(
      result.concentrationA +
      result.concentrationIntermediateB +
      result.concentrationFinalC -
      1000,
    ) < 1e-10,
  )
})

test('calculates positive optimum intermediate time', () => {
  const result = calculateSeriesReactions(example)
  assert.ok(result.optimumTimeForIntermediate > 0)
  assert.ok(result.maximumIntermediateConcentration >= result.concentrationIntermediateB)
})

test('rejects zero reaction time', () => {
  assert.throws(
    () => calculateSeriesReactions({ ...example, reactionTime: 0 }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch08CalculationError &&
      error.code === 'invalidSeriesInputs',
  )
})
