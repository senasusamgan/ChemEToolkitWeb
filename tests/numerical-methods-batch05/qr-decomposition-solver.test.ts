import assert from 'node:assert/strict'
import test from 'node:test'
import {
  QRDecompositionSolverCalculationError,
  calculateQRDecompositionSolver,
} from '../../src/features/numerical-methods/qr-decomposition-solver/engine.ts'

test('solves a general linear system', () => {
  const result = calculateQRDecompositionSolver({
    a11: 4, a12: 1, a13: 2,
    a21: 2, a22: 5, a23: 1,
    a31: 1, a32: 2, a33: 4,
    b1: 7, b2: 8, b3: 9,
  })
  assert.ok(result.residualNorm < 1e-10)
  assert.ok(result.orthogonalityError < 1e-12)
})

test('solves a diagonal system', () => {
  const result = calculateQRDecompositionSolver({
    a11: 2, a12: 0, a13: 0,
    a21: 0, a22: 4, a23: 0,
    a31: 0, a32: 0, a33: 8,
    b1: 4, b2: 8, b3: 16,
  })
  assert.ok(Math.abs(result.x1 - 2) < 1e-12)
  assert.ok(Math.abs(result.x2 - 2) < 1e-12)
  assert.ok(Math.abs(result.x3 - 2) < 1e-12)
})

test('rejects linearly dependent columns', () => {
  assert.throws(
    () => calculateQRDecompositionSolver({
      a11: 1, a12: 2, a13: 0,
      a21: 2, a22: 4, a23: 0,
      a31: 3, a32: 6, a33: 1,
      b1: 1, b2: 2, b3: 3,
    }),
    (error: unknown) =>
      error instanceof QRDecompositionSolverCalculationError &&
      error.code === 'rankDeficientMatrix',
  )
})
