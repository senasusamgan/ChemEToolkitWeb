import assert from 'node:assert/strict'
import test from 'node:test'
import {
  GaussNewtonNonlinearRegressionCalculationError,
  calculateGaussNewtonNonlinearRegression,
} from '../../src/features/numerical-methods/gauss-newton-nonlinear-regression/engine.ts'

test('recovers exponential-model parameters', () => {
  const a = 2
  const b = 0.4
  const result = calculateGaussNewtonNonlinearRegression({
    x1: 0, y1: a,
    x2: 1, y2: a * Math.exp(b),
    x3: 2, y3: a * Math.exp(2 * b),
    x4: 3, y4: a * Math.exp(3 * b),
    initialA: 1.5,
    initialB: 0.3,
    tolerance: 1e-12,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(Math.abs(result.parameterA - a) < 1e-9)
  assert.ok(Math.abs(result.parameterB - b) < 1e-9)
  assert.ok(result.rootMeanSquareError < 1e-10)
})

test('a closer starting point converges', () => {
  const result = calculateGaussNewtonNonlinearRegression({
    x1: 0, y1: 3,
    x2: 1, y2: 3 * Math.exp(-0.2),
    x3: 2, y3: 3 * Math.exp(-0.4),
    x4: 3, y4: 3 * Math.exp(-0.6),
    initialA: 2.8,
    initialB: -0.15,
    tolerance: 1e-10,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(result.iterations < 20)
})

test('rejects zero tolerance', () => {
  assert.throws(
    () => calculateGaussNewtonNonlinearRegression({
      x1: 0, y1: 1,
      x2: 1, y2: 2,
      x3: 2, y3: 3,
      x4: 3, y4: 4,
      initialA: 1,
      initialB: 0.1,
      tolerance: 0,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof GaussNewtonNonlinearRegressionCalculationError &&
      error.code === 'invalidTolerance',
  )
})
