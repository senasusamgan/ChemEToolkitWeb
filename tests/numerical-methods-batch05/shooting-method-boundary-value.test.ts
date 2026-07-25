import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ShootingMethodBoundaryValueCalculationError,
  calculateShootingMethodBoundaryValue,
} from '../../src/features/numerical-methods/shooting-method-boundary-value/engine.ts'

test('matches the right boundary', () => {
  const result = calculateShootingMethodBoundaryValue({
    domainLength: 1,
    frequencySquared: 1,
    leftBoundaryValue: 0,
    rightBoundaryValue: 1,
    initialSlopeGuess1: 0.5,
    initialSlopeGuess2: 2,
    integrationSteps: 500,
    boundaryTolerance: 1e-12,
    maximumIterations: 50,
  })
  assert.equal(result.converged, true)
  assert.ok(Math.abs(result.boundaryResidual) < 1e-10)
  assert.ok(
    Math.abs(result.initialSlope - 1 / Math.sin(1)) < 1e-7,
  )
})

test('solves the zero-frequency linear boundary problem', () => {
  const result = calculateShootingMethodBoundaryValue({
    domainLength: 2,
    frequencySquared: 0,
    leftBoundaryValue: 1,
    rightBoundaryValue: 5,
    initialSlopeGuess1: 0,
    initialSlopeGuess2: 3,
    integrationSteps: 100,
    boundaryTolerance: 1e-12,
    maximumIterations: 20,
  })
  assert.ok(Math.abs(result.initialSlope - 2) < 1e-10)
  assert.ok(Math.abs(result.centerValue - 3) < 1e-10)
})

test('rejects identical slope guesses', () => {
  assert.throws(
    () => calculateShootingMethodBoundaryValue({
      domainLength: 1,
      frequencySquared: 1,
      leftBoundaryValue: 0,
      rightBoundaryValue: 1,
      initialSlopeGuess1: 1,
      initialSlopeGuess2: 1,
      integrationSteps: 100,
      boundaryTolerance: 1e-8,
      maximumIterations: 20,
    }),
    (error: unknown) =>
      error instanceof ShootingMethodBoundaryValueCalculationError &&
      error.code === 'duplicateSlopeGuesses',
  )
})
