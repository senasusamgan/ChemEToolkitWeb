import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CentrifugalSettlingCalculationError,
  calculateCentrifugalSettling,
} from '../../src/features/mass-transfer/centrifugal-settling/engine.ts'

test('calculates radial migration and Stokes validity', () => {
  const result = calculateCentrifugalSettling({
    particleDiameter: 4e-6,
    particleDensity: 2500,
    fluidDensity: 1000,
    fluidViscosity: 0.001,
    rotationalSpeedRPM: 3000,
    initialRadius: 0.05,
    finalRadius: 0.15,
  })

  assert.ok(
    Math.abs(result.angularVelocity - 314.1592653589793) <
      1e-12,
  )
  assert.ok(
    Math.abs(
      result.radialResponseCoefficient -
        0.1315947253478581,
    ) < 1e-14,
  )
  assert.ok(
    Math.abs(result.migrationTime - 8.348452308890291) <
      1e-12,
  )
  assert.ok(
    Math.abs(
      result.outerRadialVelocity -
        0.019739208802178713,
    ) < 1e-15,
  )
  assert.ok(
    Math.abs(
      result.outerParticleReynoldsNumber -
        0.07895683520871484,
    ) < 1e-14,
  )
  assert.ok(
    Math.abs(
      result.outerRelativeCentrifugalForce -
        1509.6293435203702,
    ) < 1e-9,
  )
})

test('doubling speed quarters migration time', () => {
  const base = calculateCentrifugalSettling({
    particleDiameter: 2e-6,
    particleDensity: 2500,
    fluidDensity: 1000,
    fluidViscosity: 0.001,
    rotationalSpeedRPM: 3000,
    initialRadius: 0.05,
    finalRadius: 0.15,
  })

  const doubled = calculateCentrifugalSettling({
    particleDiameter: 2e-6,
    particleDensity: 2500,
    fluidDensity: 1000,
    fluidViscosity: 0.001,
    rotationalSpeedRPM: 6000,
    initialRadius: 0.05,
    finalRadius: 0.15,
  })

  assert.ok(
    Math.abs(
      doubled.migrationTime - base.migrationTime / 4,
    ) < 1e-12,
  )
})

test('rejects invalid physical inputs and Stokes violations', () => {
  assert.throws(
    () =>
      calculateCentrifugalSettling({
        particleDiameter: 4e-6,
        particleDensity: 900,
        fluidDensity: 1000,
        fluidViscosity: 0.001,
        rotationalSpeedRPM: 3000,
        initialRadius: 0.05,
        finalRadius: 0.15,
      }),
    (error: unknown) =>
      error instanceof
        CentrifugalSettlingCalculationError &&
      error.code === 'particleNotDenserThanFluid',
  )

  assert.throws(
    () =>
      calculateCentrifugalSettling({
        particleDiameter: 4e-6,
        particleDensity: 2500,
        fluidDensity: 1000,
        fluidViscosity: 0.001,
        rotationalSpeedRPM: 3000,
        initialRadius: 0.15,
        finalRadius: 0.05,
      }),
    (error: unknown) =>
      error instanceof
        CentrifugalSettlingCalculationError &&
      error.code === 'invalidRadiusOrdering',
  )

  assert.throws(
    () =>
      calculateCentrifugalSettling({
        particleDiameter: 20e-6,
        particleDensity: 2500,
        fluidDensity: 1000,
        fluidViscosity: 0.001,
        rotationalSpeedRPM: 5000,
        initialRadius: 0.05,
        finalRadius: 0.15,
      }),
    (error: unknown) =>
      error instanceof
        CentrifugalSettlingCalculationError &&
      error.code === 'stokesRegimeExceeded',
  )
})
