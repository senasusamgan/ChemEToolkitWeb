import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CrankNicolsonHeatEquationCalculationError,
  calculateCrankNicolsonHeatEquation,
} from '../../src/features/numerical-methods/crank-nicolson-heat-equation/engine.ts'

test('preserves a uniform temperature field', () => {
  const result = calculateCrankNicolsonHeatEquation({
    thermalDiffusivity: 1e-5,
    slabLength: 0.1,
    initialTemperature: 50,
    leftBoundaryTemperature: 50,
    rightBoundaryTemperature: 50,
    finalTime: 100,
    spatialNodes: 9,
    timeStep: 5,
  })
  assert.ok(result.profile.every(
    (value) => Math.abs(value - 50) < 1e-10,
  ))
})

test('symmetric cooling keeps a symmetric profile', () => {
  const result = calculateCrankNicolsonHeatEquation({
    thermalDiffusivity: 1e-5,
    slabLength: 0.1,
    initialTemperature: 100,
    leftBoundaryTemperature: 20,
    rightBoundaryTemperature: 20,
    finalTime: 300,
    spatialNodes: 11,
    timeStep: 5,
  })
  for (let i = 0; i < result.profile.length; i += 1) {
    const mirror = result.profile.length - 1 - i
    assert.ok(Math.abs(
      result.profile[i] - result.profile[mirror],
    ) < 1e-10)
  }
  assert.ok(result.centerTemperature < 100)
  assert.ok(result.centerTemperature > 20)
})

test('rejects fewer than three nodes', () => {
  assert.throws(
    () => calculateCrankNicolsonHeatEquation({
      thermalDiffusivity: 1e-5,
      slabLength: 0.1,
      initialTemperature: 100,
      leftBoundaryTemperature: 20,
      rightBoundaryTemperature: 20,
      finalTime: 10,
      spatialNodes: 2,
      timeStep: 1,
    }),
    (error: unknown) =>
      error instanceof CrankNicolsonHeatEquationCalculationError &&
      error.code === 'invalidNodeCount',
  )
})
