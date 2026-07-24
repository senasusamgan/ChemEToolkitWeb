import assert from 'node:assert/strict'
import test from 'node:test'
import {
  GradientDescentOptimizationCalculationError,
  calculateGradientDescentOptimization,
} from '../../src/features/numerical-methods/gradient-descent-optimization/engine.ts'

test('converges to the quadratic optimum', () => {
  const result = calculateGradientDescentOptimization({
    q11: 4,
    q12: 1,
    q22: 3,
    c1: -1,
    c2: -2,
    initialX: 5,
    initialY: -3,
    learningRate: 0.2,
    tolerance: 1e-10,
    maximumIterations: 10000,
  })
  assert.equal(result.converged, true)
  assert.ok(result.distanceToExactOptimum < 1e-8)
  assert.ok(result.gradientNorm < 1e-9)
})

test('starts at the optimum with zero iterations', () => {
  const result = calculateGradientDescentOptimization({
    q11: 2,
    q12: 0,
    q22: 4,
    c1: -2,
    c2: 8,
    initialX: 1,
    initialY: -2,
    learningRate: 0.2,
    tolerance: 1e-10,
    maximumIterations: 100,
  })
  assert.equal(result.iterations, 0)
  assert.equal(result.converged, true)
})

test('rejects an unstable learning rate', () => {
  assert.throws(
    () => calculateGradientDescentOptimization({
      q11: 2,
      q12: 0,
      q22: 4,
      c1: -2,
      c2: 8,
      initialX: 0,
      initialY: 0,
      learningRate: 0.6,
      tolerance: 1e-8,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof GradientDescentOptimizationCalculationError &&
      error.code === 'invalidLearningRate',
  )
})
