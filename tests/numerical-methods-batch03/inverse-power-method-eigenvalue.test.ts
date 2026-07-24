import assert from 'node:assert/strict'
import test from 'node:test'
import {
  InversePowerMethodEigenvalueCalculationError,
  calculateInversePowerMethodEigenvalue,
} from '../../src/features/numerical-methods/inverse-power-method-eigenvalue/engine.ts'

test('finds the smallest eigenvalue with zero shift', () => {
  const result = calculateInversePowerMethodEigenvalue({
    a11: 4, a12: 1, a13: 0,
    a21: 1, a22: 3, a23: 0,
    a31: 0, a32: 0, a33: 1,
    shift: 0,
    initialX1: 1, initialX2: 1, initialX3: 1,
    tolerance: 1e-12,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(Math.abs(result.eigenvalue - 1) < 1e-9)
  assert.ok(result.residualNorm < 1e-6)
})

test('a shift near the upper eigenvalue selects it', () => {
  const result = calculateInversePowerMethodEigenvalue({
    a11: 2, a12: 0, a13: 0,
    a21: 0, a22: 5, a23: 0,
    a31: 0, a32: 0, a33: 9,
    shift: 5.2,
    initialX1: 1, initialX2: 1, initialX3: 1,
    tolerance: 1e-12,
    maximumIterations: 100,
  })
  assert.ok(Math.abs(result.eigenvalue - 5) < 1e-9)
})

test('rejects a zero initial vector', () => {
  assert.throws(
    () => calculateInversePowerMethodEigenvalue({
      a11: 1, a12: 0, a13: 0,
      a21: 0, a22: 2, a23: 0,
      a31: 0, a32: 0, a33: 3,
      shift: 0,
      initialX1: 0, initialX2: 0, initialX3: 0,
      tolerance: 1e-8,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof InversePowerMethodEigenvalueCalculationError &&
      error.code === 'zeroInitialVector',
  )
})
