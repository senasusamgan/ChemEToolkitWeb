import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ConjugateGradientSolverCalculationError,
  calculateConjugateGradientSolver,
} from '../../src/features/numerical-methods/conjugate-gradient-solver/engine.ts'

test('converges on a symmetric positive-definite system', () => {
  const result = calculateConjugateGradientSolver({
    a11: 4, a12: 1, a13: 1,
    a22: 3, a23: 0.5, a33: 2,
    b1: 1, b2: 2, b3: 3,
    initialX1: 0, initialX2: 0, initialX3: 0,
    tolerance: 1e-12,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(result.residualNorm < 1e-10)
  assert.ok(result.iterations <= 3)
})

test('solves a diagonal system', () => {
  const result = calculateConjugateGradientSolver({
    a11: 4, a12: 0, a13: 0,
    a22: 9, a23: 0, a33: 16,
    b1: 8, b2: 18, b3: 32,
    initialX1: 0, initialX2: 0, initialX3: 0,
    tolerance: 1e-12,
    maximumIterations: 100,
  })
  assert.ok(Math.abs(result.x1 - 2) < 1e-10)
  assert.ok(Math.abs(result.x2 - 2) < 1e-10)
  assert.ok(Math.abs(result.x3 - 2) < 1e-10)
})

test('rejects an indefinite matrix', () => {
  assert.throws(
    () => calculateConjugateGradientSolver({
      a11: 1, a12: 2, a13: 0,
      a22: 1, a23: 0, a33: 1,
      b1: 1, b2: 1, b3: 1,
      initialX1: 0, initialX2: 0, initialX3: 0,
      tolerance: 1e-8,
      maximumIterations: 10,
    }),
    (error: unknown) =>
      error instanceof ConjugateGradientSolverCalculationError &&
      error.code === 'notPositiveDefinite',
  )
})
