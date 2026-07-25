import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch09CalculationError,
  calculateSeriesParallelReactions,
} from '../../src/features/reaction-engineering/batch09/engine.ts'

const example = {
  initialConcentrationA: 1000,
  desiredRateConstant: 0.03,
  consecutiveRateConstant: 0.01,
  parallelUndesiredRateConstant: 0.005,
  reactionTime: 40,
}

test('conserves concentration across A, B, C and D', () => {
  const result =
    calculateSeriesParallelReactions(
      example,
    )

  assert.ok(
    result.massBalanceResidual <
    1e-10,
  )

  assert.ok(
    Math.abs(
      result.concentrationA +
      result.concentrationDesiredIntermediateB +
      result.concentrationConsecutiveProductC +
      result.concentrationParallelProductD -
      1000,
    ) < 1e-8,
  )
})

test('calculates a positive optimum intermediate time', () => {
  const result =
    calculateSeriesParallelReactions(
      example,
    )

  assert.ok(
    result.optimumTimeForIntermediate >
    0,
  )

  assert.ok(
    result.maximumIntermediateConcentration >=
    result.concentrationDesiredIntermediateB,
  )
})

test('rejects zero parallel rate constant', () => {
  assert.throws(
    () =>
      calculateSeriesParallelReactions({
        ...example,
        parallelUndesiredRateConstant: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch09CalculationError &&
      error.code ===
        'invalidSeriesParallelInputs',
  )
})
