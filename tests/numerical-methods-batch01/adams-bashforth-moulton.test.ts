import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AdamsBashforthMoultonCalculationError,
  calculateAdamsBashforthMoulton,
} from '../../src/features/numerical-methods/adams-bashforth-moulton/engine.ts'

test('integrates a linear ODE accurately', () => {
  const result = calculateAdamsBashforthMoulton({
    initialX: 0,
    finalX: 2,
    initialY: 1,
    coefficientA: -1,
    forcingB: 2,
    stepSize: 0.1,
  })
  const exact = 2 - Math.exp(-2)
  assert.ok(Math.abs(result.finalY - exact) < 2e-4)
  assert.equal(result.stepCount, 20)
})

test('constant derivative is integrated exactly', () => {
  const result = calculateAdamsBashforthMoulton({
    initialX: 0,
    finalX: 1,
    initialY: 2,
    coefficientA: 0,
    forcingB: 3,
    stepSize: 0.1,
  })
  assert.ok(Math.abs(result.finalY - 5) < 1e-12)
})

test('rejects a non-dividing step size', () => {
  assert.throws(
    () => calculateAdamsBashforthMoulton({
      initialX: 0,
      finalX: 1,
      initialY: 1,
      coefficientA: -1,
      forcingB: 0,
      stepSize: 0.3,
    }),
    (error: unknown) =>
      error instanceof AdamsBashforthMoultonCalculationError &&
      error.code === 'invalidStep',
  )
})
