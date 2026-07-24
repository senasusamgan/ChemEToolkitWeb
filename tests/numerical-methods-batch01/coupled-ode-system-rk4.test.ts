import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CoupledODESystemRK4CalculationError,
  calculateCoupledODESystemRK4,
} from '../../src/features/numerical-methods/coupled-ode-system-rk4/engine.ts'

test('integrates two uncoupled exponential decays', () => {
  const result = calculateCoupledODESystemRK4({
    initialX: 0,
    finalX: 1,
    initialY1: 1,
    initialY2: 2,
    a11: -1,
    a12: 0,
    a21: 0,
    a22: -2,
    b1: 0,
    b2: 0,
    stepSize: 0.01,
  })
  assert.ok(Math.abs(result.finalY1 - Math.exp(-1)) < 1e-8)
  assert.ok(Math.abs(result.finalY2 - 2 * Math.exp(-2)) < 1e-8)
})

test('constant forcing is handled', () => {
  const result = calculateCoupledODESystemRK4({
    initialX: 0,
    finalX: 1,
    initialY1: 0,
    initialY2: 0,
    a11: 0,
    a12: 0,
    a21: 0,
    a22: 0,
    b1: 2,
    b2: -1,
    stepSize: 0.1,
  })
  assert.ok(Math.abs(result.finalY1 - 2) < 1e-12)
  assert.ok(Math.abs(result.finalY2 + 1) < 1e-12)
})

test('rejects an invalid interval', () => {
  assert.throws(
    () => calculateCoupledODESystemRK4({
      initialX: 1,
      finalX: 0,
      initialY1: 0,
      initialY2: 0,
      a11: 0,
      a12: 0,
      a21: 0,
      a22: 0,
      b1: 0,
      b2: 0,
      stepSize: 0.1,
    }),
    (error: unknown) =>
      error instanceof CoupledODESystemRK4CalculationError &&
      error.code === 'invalidInterval',
  )
})
