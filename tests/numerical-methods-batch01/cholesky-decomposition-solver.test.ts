import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CholeskyDecompositionSolverCalculationError,
  calculateCholeskyDecompositionSolver,
} from '../../src/features/numerical-methods/cholesky-decomposition-solver/engine.ts'

test('solves a symmetric positive-definite system', () => {
  const result = calculateCholeskyDecompositionSolver({
    a11: 4, a12: 1, a13: 1,
    a22: 3, a23: 0.5, a33: 2,
    b1: 1, b2: 2, b3: 3,
  })
  assert.ok(result.residualNorm < 1e-12)
  assert.ok(result.determinant > 0)
})

test('reconstructs the diagonal factor product determinant', () => {
  const result = calculateCholeskyDecompositionSolver({
    a11: 4, a12: 0, a13: 0,
    a22: 9, a23: 0, a33: 16,
    b1: 8, b2: 18, b3: 32,
  })
  assert.ok(Math.abs(result.x1 - 2) < 1e-12)
  assert.ok(Math.abs(result.x2 - 2) < 1e-12)
  assert.ok(Math.abs(result.x3 - 2) < 1e-12)
  assert.ok(Math.abs(result.determinant - 576) < 1e-10)
})

test('rejects a non-positive-definite matrix', () => {
  assert.throws(
    () => calculateCholeskyDecompositionSolver({
      a11: 1, a12: 2, a13: 0,
      a22: 1, a23: 0, a33: 1,
      b1: 1, b2: 1, b3: 1,
    }),
    (error: unknown) =>
      error instanceof CholeskyDecompositionSolverCalculationError &&
      error.code === 'notPositiveDefinite',
  )
})
