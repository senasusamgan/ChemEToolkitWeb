import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CurveFittingCalculationError,
  calculateCurveFitting,
} from '../../src/features/numerical-methods/curve-fitting/engine.ts'

test('recovers an exact quadratic', () => {
  const result = calculateCurveFitting({
    x1: 0, y1: 1,
    x2: 1, y2: 2,
    x3: 2, y3: 5,
    x4: 3, y4: 10,
    x5: 4, y5: 17,
    polynomialDegree: 2,
    predictionX: 2.5,
  })
  assert.ok(Math.abs(result.coefficient0 - 1) < 1e-12)
  assert.ok(Math.abs(result.coefficient1) < 1e-12)
  assert.ok(Math.abs(result.coefficient2 - 1) < 1e-12)
  assert.ok(Math.abs(result.predictionY - 7.25) < 1e-12)
  assert.ok(Math.abs(result.rSquared - 1) < 1e-12)
})

test('recovers an exact line', () => {
  const result = calculateCurveFitting({
    x1: 0, y1: 2,
    x2: 1, y2: 5,
    x3: 2, y3: 8,
    x4: 3, y4: 11,
    x5: 4, y5: 14,
    polynomialDegree: 1,
    predictionX: 5,
  })
  assert.ok(Math.abs(result.coefficient0 - 2) < 1e-12)
  assert.ok(Math.abs(result.coefficient1 - 3) < 1e-12)
  assert.ok(Math.abs(result.predictionY - 17) < 1e-12)
})

test('rejects degree three', () => {
  assert.throws(
    () => calculateCurveFitting({
      x1: 0, y1: 0,
      x2: 1, y2: 1,
      x3: 2, y3: 4,
      x4: 3, y4: 9,
      x5: 4, y5: 16,
      polynomialDegree: 3,
      predictionX: 2,
    }),
    (error: unknown) =>
      error instanceof CurveFittingCalculationError &&
      error.code === 'invalidDegree',
  )
})
