import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AdaptiveRungeKutta45CalculationError,
  calculateAdaptiveRungeKutta45,
} from '../../src/features/numerical-methods/adaptive-runge-kutta-45/engine.ts'

test('integrates a linear ODE with adaptive accuracy', () => {
  const result = calculateAdaptiveRungeKutta45({
    initialX: 0,
    finalX: 5,
    initialY: 1,
    coefficientA: -0.8,
    forcingB: 1.5,
    initialStepSize: 0.5,
    absoluteTolerance: 1e-9,
    relativeTolerance: 1e-8,
    maximumSteps: 10000,
  })
  const exact = 1.875 + (1 - 1.875) * Math.exp(-4)
  assert.ok(Math.abs(result.finalY - exact) < 1e-7)
  assert.ok(result.acceptedSteps > 0)
})

test('tighter tolerance requires at least as many accepted steps', () => {
  const loose = calculateAdaptiveRungeKutta45({
    initialX: 0,
    finalX: 3,
    initialY: 1,
    coefficientA: -1,
    forcingB: 0,
    initialStepSize: 0.5,
    absoluteTolerance: 1e-5,
    relativeTolerance: 1e-5,
    maximumSteps: 10000,
  })
  const tight = calculateAdaptiveRungeKutta45({
    initialX: 0,
    finalX: 3,
    initialY: 1,
    coefficientA: -1,
    forcingB: 0,
    initialStepSize: 0.5,
    absoluteTolerance: 1e-10,
    relativeTolerance: 1e-9,
    maximumSteps: 10000,
  })
  assert.ok(tight.acceptedSteps >= loose.acceptedSteps)
})

test('rejects zero tolerance', () => {
  assert.throws(
    () => calculateAdaptiveRungeKutta45({
      initialX: 0,
      finalX: 1,
      initialY: 1,
      coefficientA: -1,
      forcingB: 0,
      initialStepSize: 0.1,
      absoluteTolerance: 0,
      relativeTolerance: 1e-6,
      maximumSteps: 100,
    }),
    (error: unknown) =>
      error instanceof AdaptiveRungeKutta45CalculationError &&
      error.code === 'invalidTolerance',
  )
})
