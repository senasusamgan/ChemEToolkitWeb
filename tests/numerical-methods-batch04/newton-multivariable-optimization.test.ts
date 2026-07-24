import assert from 'node:assert/strict'
import test from 'node:test'
import {
  NewtonMultivariableOptimizationCalculationError,
  calculateNewtonMultivariableOptimization,
} from '../../src/features/numerical-methods/newton-multivariable-optimization/engine.ts'

test('reaches the quadratic optimum in one step', () => {
  const result = calculateNewtonMultivariableOptimization({
    q11: 4,
    q12: 1,
    q22: 3,
    c1: -1,
    c2: -2,
    initialX: 10,
    initialY: -5,
    tolerance: 1e-12,
    maximumIterations: 10,
  })
  assert.equal(result.converged, true)
  assert.equal(result.iterations, 1)
  assert.ok(result.gradientNorm < 1e-10)
})

test('returns zero iterations at the optimum', () => {
  const result = calculateNewtonMultivariableOptimization({
    q11: 2,
    q12: 0,
    q22: 4,
    c1: -2,
    c2: 8,
    initialX: 1,
    initialY: -2,
    tolerance: 1e-12,
    maximumIterations: 10,
  })
  assert.equal(result.iterations, 0)
  assert.equal(result.converged, true)
})

test('rejects an indefinite Hessian', () => {
  assert.throws(
    () => calculateNewtonMultivariableOptimization({
      q11: 1,
      q12: 2,
      q22: 1,
      c1: 0,
      c2: 0,
      initialX: 1,
      initialY: 1,
      tolerance: 1e-8,
      maximumIterations: 10,
    }),
    (error: unknown) =>
      error instanceof NewtonMultivariableOptimizationCalculationError &&
      error.code === 'notPositiveDefinite',
  )
})
