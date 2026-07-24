import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MethodOfLinesPDESolverCalculationError,
  calculateMethodOfLinesPDESolver,
} from '../../src/features/numerical-methods/method-of-lines-pde-solver/engine.ts'

test('preserves a uniform field', () => {
  const result = calculateMethodOfLinesPDESolver({
    diffusivity: 0.01,
    domainLength: 1,
    leftBoundary: 5,
    rightBoundary: 5,
    initialInteriorValue: 5,
    finalTime: 0.1,
    interiorNodes: 9,
    timeStep: 0.001,
  })
  assert.ok(result.profile.every(
    (value) => Math.abs(value - 5) < 1e-10,
  ))
})

test('zero boundaries cool the interior', () => {
  const result = calculateMethodOfLinesPDESolver({
    diffusivity: 0.01,
    domainLength: 1,
    leftBoundary: 0,
    rightBoundary: 0,
    initialInteriorValue: 1,
    finalTime: 0.1,
    interiorNodes: 9,
    timeStep: 0.001,
  })
  assert.ok(result.centerValue < 1)
  assert.ok(result.centerValue > 0)
  assert.ok(result.minimumValue >= 0)
})

test('rejects an unstable time step', () => {
  assert.throws(
    () => calculateMethodOfLinesPDESolver({
      diffusivity: 1,
      domainLength: 1,
      leftBoundary: 0,
      rightBoundary: 0,
      initialInteriorValue: 1,
      finalTime: 1,
      interiorNodes: 9,
      timeStep: 1,
    }),
    (error: unknown) =>
      error instanceof MethodOfLinesPDESolverCalculationError &&
      error.code === 'unstableTimeStep',
  )
})
