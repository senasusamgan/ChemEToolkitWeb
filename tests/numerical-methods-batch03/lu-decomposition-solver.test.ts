import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LUDecompositionSolverCalculationError,
  calculateLUDecompositionSolver,
} from '../../src/features/numerical-methods/lu-decomposition-solver/engine.ts'

test('solves a general linear system', () => {
  const result = calculateLUDecompositionSolver({
    a11: 4, a12: 1, a13: 2,
    a21: 2, a22: 5, a23: 1,
    a31: 1, a32: 2, a33: 4,
    b1: 7, b2: 8, b3: 9,
  })
  assert.ok(result.residualNorm < 1e-12)
  assert.ok(Math.abs(result.determinant - 63) < 1e-12)
})

test('solves a diagonal system exactly', () => {
  const result = calculateLUDecompositionSolver({
    a11: 2, a12: 0, a13: 0,
    a21: 0, a22: 4, a23: 0,
    a31: 0, a32: 0, a33: 8,
    b1: 4, b2: 8, b3: 16,
  })
  assert.equal(result.x1, 2)
  assert.equal(result.x2, 2)
  assert.equal(result.x3, 2)
})

test('rejects a zero leading pivot', () => {
  assert.throws(
    () => calculateLUDecompositionSolver({
      a11: 0, a12: 1, a13: 0,
      a21: 1, a22: 0, a23: 0,
      a31: 0, a32: 0, a33: 1,
      b1: 1, b2: 1, b3: 1,
    }),
    (error: unknown) =>
      error instanceof LUDecompositionSolverCalculationError &&
      error.code === 'singularMatrix',
  )
})
