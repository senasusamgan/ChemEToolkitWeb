import assert from 'node:assert/strict'
import test from 'node:test'
import {
  HydrocycloneSeparationNumberCalculationError,
  calculateHydrocycloneSeparationNumber,
} from '../../src/features/separation-processes/hydrocyclone-separation-number/engine.ts'

test('calculates the hydrocyclone separation number', () => {
  const result = calculateHydrocycloneSeparationNumber({
    particleDensity: 2500,
    fluidDensity: 1000,
    particleDiameter: 1e-4,
    inletVelocity: 5,
    fluidViscosity: 0.001,
    cycloneDiameter: 0.2,
  })
  assert.ok(Math.abs(result.densityDifference - 1500) < 1e-12)
  assert.ok(Math.abs(result.separationNumber - 0.020833333333333336) < 1e-12)
  assert.ok(Math.abs(result.particleReynoldsEstimate - 500) < 1e-10)
})

test('larger particles increase separation number quadratically', () => {
  const small = calculateHydrocycloneSeparationNumber({
    particleDensity: 2500,
    fluidDensity: 1000,
    particleDiameter: 5e-5,
    inletVelocity: 5,
    fluidViscosity: 0.001,
    cycloneDiameter: 0.2,
  })
  const large = calculateHydrocycloneSeparationNumber({
    particleDensity: 2500,
    fluidDensity: 1000,
    particleDiameter: 1e-4,
    inletVelocity: 5,
    fluidViscosity: 0.001,
    cycloneDiameter: 0.2,
  })
  assert.ok(Math.abs(large.separationNumber - 4 * small.separationNumber) < 1e-12)
})

test('rejects particles lighter than the fluid', () => {
  assert.throws(
    () => calculateHydrocycloneSeparationNumber({
      particleDensity: 900,
      fluidDensity: 1000,
      particleDiameter: 1e-4,
      inletVelocity: 5,
      fluidViscosity: 0.001,
      cycloneDiameter: 0.2,
    }),
    (error: unknown) =>
      error instanceof HydrocycloneSeparationNumberCalculationError &&
      error.code === 'invalidDensityOrdering',
  )
})
