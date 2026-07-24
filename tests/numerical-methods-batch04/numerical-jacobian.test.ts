import assert from 'node:assert/strict'
import test from 'node:test'
import {
  NumericalJacobianCalculationError,
  calculateNumericalJacobian,
} from '../../src/features/numerical-methods/numerical-jacobian/engine.ts'

test('matches the analytical Jacobian closely', () => {
  const result = calculateNumericalJacobian({
    x: 1,
    y: 0.5,
    circleConstant: 4,
    exponentialConstant: 3,
    stepX: 1e-5,
    stepY: 1e-5,
  })
  assert.ok(result.maximumAbsoluteError < 1e-8)
})

test('determinant matches the analytical value', () => {
  const result = calculateNumericalJacobian({
    x: 0.5,
    y: 0.25,
    circleConstant: 1,
    exponentialConstant: 2,
    stepX: 1e-5,
    stepY: 1e-5,
  })
  const expected = 2 * 0.5 - 2 * 0.25 * Math.exp(0.5)
  assert.ok(Math.abs(result.determinant - expected) < 1e-8)
})

test('rejects zero finite-difference step', () => {
  assert.throws(
    () => calculateNumericalJacobian({
      x: 1,
      y: 1,
      circleConstant: 4,
      exponentialConstant: 3,
      stepX: 0,
      stepY: 1e-5,
    }),
    (error: unknown) =>
      error instanceof NumericalJacobianCalculationError &&
      error.code === 'invalidStep',
  )
})
