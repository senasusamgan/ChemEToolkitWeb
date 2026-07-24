import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LevenbergMarquardtRegressionCalculationError,
  calculateLevenbergMarquardtRegression,
} from '../../src/features/numerical-methods/levenberg-marquardt-regression/engine.ts'

test('recovers exponential parameters', () => {
  const a = 2
  const b = 0.4
  const result = calculateLevenbergMarquardtRegression({
    x1: 0, y1: a,
    x2: 1, y2: a * Math.exp(b),
    x3: 2, y3: a * Math.exp(2 * b),
    x4: 3, y4: a * Math.exp(3 * b),
    initialA: 1,
    initialB: 0.1,
    initialDamping: 0.01,
    tolerance: 1e-12,
    maximumIterations: 200,
  })
  assert.equal(result.converged, true)
  assert.ok(Math.abs(result.parameterA - a) < 1e-8)
  assert.ok(Math.abs(result.parameterB - b) < 1e-8)
  assert.ok(result.rootMeanSquareError < 1e-8)
})

test('records accepted optimization steps', () => {
  const result = calculateLevenbergMarquardtRegression({
    x1: 0, y1: 3,
    x2: 1, y2: 3 * Math.exp(-0.2),
    x3: 2, y3: 3 * Math.exp(-0.4),
    x4: 3, y4: 3 * Math.exp(-0.6),
    initialA: 2,
    initialB: 0,
    initialDamping: 1,
    tolerance: 1e-10,
    maximumIterations: 200,
  })
  assert.ok(result.acceptedSteps > 0)
  assert.ok(result.residualSumOfSquares < 1e-10)
})

test('rejects zero damping', () => {
  assert.throws(
    () => calculateLevenbergMarquardtRegression({
      x1: 0, y1: 1,
      x2: 1, y2: 2,
      x3: 2, y3: 3,
      x4: 3, y4: 4,
      initialA: 1,
      initialB: 0.1,
      initialDamping: 0,
      tolerance: 1e-8,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof LevenbergMarquardtRegressionCalculationError &&
      error.code === 'invalidDamping',
  )
})
