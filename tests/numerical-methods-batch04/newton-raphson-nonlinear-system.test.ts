import assert from 'node:assert/strict'
import test from 'node:test'
import {
  NewtonRaphsonNonlinearSystemCalculationError,
  calculateNewtonRaphsonNonlinearSystem,
} from '../../src/features/numerical-methods/newton-raphson-nonlinear-system/engine.ts'

test('converges to a nonlinear-system root', () => {
  const result = calculateNewtonRaphsonNonlinearSystem({
    circleConstant: 4,
    exponentialConstant: 3,
    initialX: 1,
    initialY: 1,
    tolerance: 1e-12,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(result.residualNorm < 1e-10)
  assert.ok(Math.abs(result.x ** 2 + result.y ** 2 - 4) < 1e-10)
})

test('converges from a nearby second starting point', () => {
  const result = calculateNewtonRaphsonNonlinearSystem({
    circleConstant: 4,
    exponentialConstant: 3,
    initialX: 1.2,
    initialY: 0.8,
    tolerance: 1e-10,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(result.iterations < 20)
})

test('rejects zero tolerance', () => {
  assert.throws(
    () => calculateNewtonRaphsonNonlinearSystem({
      circleConstant: 4,
      exponentialConstant: 3,
      initialX: 1,
      initialY: 1,
      tolerance: 0,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof NewtonRaphsonNonlinearSystemCalculationError &&
      error.code === 'invalidTolerance',
  )
})
