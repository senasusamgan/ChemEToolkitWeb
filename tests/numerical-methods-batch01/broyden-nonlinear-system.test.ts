import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BroydenNonlinearSystemCalculationError,
  calculateBroydenNonlinearSystem,
} from '../../src/features/numerical-methods/broyden-nonlinear-system/engine.ts'

test('converges to a root of the nonlinear system', () => {
  const result = calculateBroydenNonlinearSystem({
    circleConstant: 4,
    exponentialConstant: 3,
    initialX: 1,
    initialY: 1,
    tolerance: 1e-10,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(result.residualNorm < 1e-8)
  assert.ok(Math.abs(result.x ** 2 + result.y ** 2 - 4) < 1e-8)
  assert.ok(Math.abs(Math.exp(result.x) + result.y - 3) < 1e-8)
})

test('a nearby initial guess converges rapidly', () => {
  const result = calculateBroydenNonlinearSystem({
    circleConstant: 4,
    exponentialConstant: 3,
    initialX: 1.1,
    initialY: 0.9,
    tolerance: 1e-8,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(result.iterations < 20)
})

test('rejects zero tolerance', () => {
  assert.throws(
    () => calculateBroydenNonlinearSystem({
      circleConstant: 4,
      exponentialConstant: 3,
      initialX: 1,
      initialY: 1,
      tolerance: 0,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof BroydenNonlinearSystemCalculationError &&
      error.code === 'invalidTolerance',
  )
})
