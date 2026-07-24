import assert from 'node:assert/strict'
import test from 'node:test'
import {
  NelderMeadOptimizationCalculationError,
  calculateNelderMeadOptimization,
} from '../../src/features/numerical-methods/nelder-mead-optimization/engine.ts'

test('converges near the convex quadratic optimum', () => {
  const result = calculateNelderMeadOptimization({
    q11: 4,
    q12: 1,
    q22: 3,
    c1: -1,
    c2: -2,
    initialX: 4,
    initialY: -3,
    initialSimplexSize: 1,
    tolerance: 1e-10,
    maximumIterations: 5000,
  })
  assert.equal(result.converged, true)
  assert.ok(result.distanceToExactOptimum < 1e-4)
})

test('works for a diagonal quadratic', () => {
  const result = calculateNelderMeadOptimization({
    q11: 2,
    q12: 0,
    q22: 4,
    c1: -2,
    c2: 8,
    initialX: 5,
    initialY: 5,
    initialSimplexSize: 1,
    tolerance: 1e-10,
    maximumIterations: 5000,
  })
  assert.ok(Math.abs(result.optimumX - 1) < 1e-4)
  assert.ok(Math.abs(result.optimumY + 2) < 1e-4)
})

test('rejects zero simplex size', () => {
  assert.throws(
    () => calculateNelderMeadOptimization({
      q11: 2,
      q12: 0,
      q22: 2,
      c1: 0,
      c2: 0,
      initialX: 1,
      initialY: 1,
      initialSimplexSize: 0,
      tolerance: 1e-8,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof NelderMeadOptimizationCalculationError &&
      error.code === 'invalidSimplexSize',
  )
})
