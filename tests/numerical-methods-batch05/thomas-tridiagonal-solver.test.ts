import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ThomasTridiagonalSolverCalculationError,
  calculateThomasTridiagonalSolver,
} from '../../src/features/numerical-methods/thomas-tridiagonal-solver/engine.ts'

test('solves a diagonally dominant system', () => {
  const result = calculateThomasTridiagonalSolver({
    lower1: -1,
    lower2: -1,
    lower3: -1,
    diagonal1: 4,
    diagonal2: 4,
    diagonal3: 4,
    diagonal4: 4,
    upper1: -1,
    upper2: -1,
    upper3: -1,
    rhs1: 5,
    rhs2: 5,
    rhs3: 10,
    rhs4: 23,
  })
  assert.ok(result.residualNorm < 1e-12)
})

test('solves a diagonal system', () => {
  const result = calculateThomasTridiagonalSolver({
    lower1: 0,
    lower2: 0,
    lower3: 0,
    diagonal1: 2,
    diagonal2: 4,
    diagonal3: 8,
    diagonal4: 16,
    upper1: 0,
    upper2: 0,
    upper3: 0,
    rhs1: 4,
    rhs2: 8,
    rhs3: 16,
    rhs4: 32,
  })
  assert.equal(result.x1, 2)
  assert.equal(result.x2, 2)
  assert.equal(result.x3, 2)
  assert.equal(result.x4, 2)
})

test('rejects a zero first pivot', () => {
  assert.throws(
    () => calculateThomasTridiagonalSolver({
      lower1: 1,
      lower2: 1,
      lower3: 1,
      diagonal1: 0,
      diagonal2: 2,
      diagonal3: 2,
      diagonal4: 2,
      upper1: 1,
      upper2: 1,
      upper3: 1,
      rhs1: 1,
      rhs2: 1,
      rhs3: 1,
      rhs4: 1,
    }),
    (error: unknown) =>
      error instanceof ThomasTridiagonalSolverCalculationError &&
      error.code === 'zeroPivot',
  )
})
