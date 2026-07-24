import assert from 'node:assert/strict'
import test from 'node:test'
import {
  NaturalCubicSplineInterpolationCalculationError,
  calculateNaturalCubicSplineInterpolation,
} from '../../src/features/numerical-methods/natural-cubic-spline-interpolation/engine.ts'

test('interpolates the original data points exactly', () => {
  const result = calculateNaturalCubicSplineInterpolation({
    x1: 0, y1: 0,
    x2: 1, y2: 1,
    x3: 2, y3: 0,
    x4: 3, y4: 1,
    evaluationX: 2,
  })
  assert.ok(Math.abs(result.interpolatedValue) < 1e-12)
})

test('natural endpoint second derivatives are zero', () => {
  const result = calculateNaturalCubicSplineInterpolation({
    x1: 0, y1: 0,
    x2: 1, y2: 1,
    x3: 2, y3: 0,
    x4: 3, y4: 1,
    evaluationX: 1.5,
  })
  assert.equal(result.secondDerivative1, 0)
  assert.equal(result.secondDerivative4, 0)
  assert.ok(Number.isFinite(result.interpolatedValue))
})

test('rejects unordered coordinates', () => {
  assert.throws(
    () => calculateNaturalCubicSplineInterpolation({
      x1: 0, y1: 0,
      x2: 2, y2: 1,
      x3: 1, y3: 0,
      x4: 3, y4: 1,
      evaluationX: 1.5,
    }),
    (error: unknown) =>
      error instanceof NaturalCubicSplineInterpolationCalculationError &&
      error.code === 'nonIncreasingCoordinates',
  )
})
