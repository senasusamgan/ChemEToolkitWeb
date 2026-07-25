import assert from 'node:assert/strict'
import test from 'node:test'
import {
  RichardsonErrorEstimateCalculationError,
  calculateRichardsonErrorEstimate,
} from '../../src/features/numerical-methods/richardson-error-estimate/engine.ts'

test('improves the trapezoidal estimate for x cubed', () => {
  const result = calculateRichardsonErrorEstimate({
    lowerBound: 0,
    upperBound: 2,
    coefficient3: 1,
    coefficient2: 0,
    coefficient1: 0,
    coefficient0: 0,
    coarseIntervals: 4,
    refinementRatio: 2,
    assumedOrder: 2,
  })
  assert.ok(
    Math.abs(result.extrapolatedEstimate - result.exactIntegral) <
    Math.abs(result.fineEstimate - result.exactIntegral),
  )
  assert.ok(Math.abs(result.effectivityIndex - 1) < 1e-12)
})

test('is exact for a linear function', () => {
  const result = calculateRichardsonErrorEstimate({
    lowerBound: 0,
    upperBound: 2,
    coefficient3: 0,
    coefficient2: 0,
    coefficient1: 3,
    coefficient0: 2,
    coarseIntervals: 2,
    refinementRatio: 2,
    assumedOrder: 2,
  })
  assert.ok(Math.abs(result.fineEstimate - result.exactIntegral) < 1e-12)
  assert.ok(Math.abs(result.estimatedFineError) < 1e-12)
})

test('rejects refinement ratio below two', () => {
  assert.throws(
    () => calculateRichardsonErrorEstimate({
      lowerBound: 0,
      upperBound: 1,
      coefficient3: 0,
      coefficient2: 1,
      coefficient1: 0,
      coefficient0: 0,
      coarseIntervals: 4,
      refinementRatio: 1,
      assumedOrder: 2,
    }),
    (error: unknown) =>
      error instanceof RichardsonErrorEstimateCalculationError &&
      error.code === 'invalidRefinementRatio',
  )
})
