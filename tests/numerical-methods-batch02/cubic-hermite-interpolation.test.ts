import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CubicHermiteInterpolationCalculationError,
  calculateCubicHermiteInterpolation,
} from '../../src/features/numerical-methods/cubic-hermite-interpolation/engine.ts'

test('matches the left endpoint value and derivative', () => {
  const result = calculateCubicHermiteInterpolation({
    x0: 0,
    x1: 2,
    y0: 1,
    y1: 5,
    derivative0: 0,
    derivative1: 4,
    evaluationX: 0,
  })
  assert.equal(result.interpolatedValue, 1)
  assert.equal(result.interpolatedDerivative, 0)
})

test('reproduces a quadratic exactly with exact slopes', () => {
  const result = calculateCubicHermiteInterpolation({
    x0: 0,
    x1: 2,
    y0: 1,
    y1: 5,
    derivative0: 0,
    derivative1: 4,
    evaluationX: 1,
  })
  assert.ok(Math.abs(result.interpolatedValue - 2) < 1e-12)
  assert.ok(Math.abs(result.interpolatedDerivative - 2) < 1e-12)
})

test('rejects extrapolation', () => {
  assert.throws(
    () => calculateCubicHermiteInterpolation({
      x0: 0,
      x1: 1,
      y0: 0,
      y1: 1,
      derivative0: 1,
      derivative1: 1,
      evaluationX: 2,
    }),
    (error: unknown) =>
      error instanceof CubicHermiteInterpolationCalculationError &&
      error.code === 'evaluationOutsideInterval',
  )
})
