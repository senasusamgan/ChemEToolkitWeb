import assert from 'node:assert/strict'
import test from 'node:test'
import {
  HighOrderFiniteDifferenceCalculationError,
  calculateHighOrderFiniteDifference,
} from '../../src/features/numerical-methods/high-order-finite-difference/engine.ts'

test('calculates quartic derivatives accurately', () => {
  const result = calculateHighOrderFiniteDifference({
    coefficient4: 1,
    coefficient3: -2,
    coefficient2: 3,
    coefficient1: 4,
    coefficient0: 5,
    evaluationX: 1.5,
    stepSize: 0.01,
  })
  assert.ok(result.firstDerivativeAbsoluteError < 1e-9)
  assert.ok(result.secondDerivativeAbsoluteError < 1e-8)
})

test('constant function has zero derivatives', () => {
  const result = calculateHighOrderFiniteDifference({
    coefficient4: 0,
    coefficient3: 0,
    coefficient2: 0,
    coefficient1: 0,
    coefficient0: 7,
    evaluationX: 3,
    stepSize: 0.1,
  })
  assert.ok(Math.abs(result.firstDerivative) < 1e-12)
  assert.ok(Math.abs(result.secondDerivative) < 1e-12)
})

test('rejects zero step size', () => {
  assert.throws(
    () => calculateHighOrderFiniteDifference({
      coefficient4: 1,
      coefficient3: 0,
      coefficient2: 0,
      coefficient1: 0,
      coefficient0: 0,
      evaluationX: 1,
      stepSize: 0,
    }),
    (error: unknown) =>
      error instanceof HighOrderFiniteDifferenceCalculationError &&
      error.code === 'invalidStep',
  )
})
