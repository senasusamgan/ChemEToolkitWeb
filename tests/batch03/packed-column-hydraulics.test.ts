import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PackedColumnHydraulicsCalculationError,
  calculatePackedColumnHydraulics,
} from '../../src/features/mass-transfer/packed-column-hydraulics/engine.ts'

test('sizes column and calculates dry Ergun pressure drop', () => {
  const result = calculatePackedColumnHydraulics({
    gasVolumetricFlowRate: 0.005,
    liquidVolumetricFlowRate: 0.001,
    floodingGasVelocity: 0.1,
    designFractionOfFlooding: 0.6,
    packedHeight: 3,
    gasDensity: 1.2,
    gasViscosity: 1.8e-5,
    bedVoidFraction: 0.4,
    equivalentPackingDiameter: 0.005,
  })

  assert.ok(
    Math.abs(result.designGasVelocity - 0.06) <
    1e-12,
  )
  assert.ok(
    Math.abs(
      result.columnCrossSectionalArea -
      0.08333333333333334,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.columnDiameter -
      0.32573500793528,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.modifiedParticleReynoldsNumber -
      33.33333333333333,
    ) < 1e-10,
  )
  assert.ok(
    Math.abs(
      result.dryPressureDropPerLength -
      50.625,
    ) < 1e-10,
  )
  assert.ok(
    Math.abs(
      result.totalDryPressureDrop -
      151.875,
    ) < 1e-10,
  )
})

test('accepts conservative modified-Reynolds boundary', () => {
  const result = calculatePackedColumnHydraulics({
    gasVolumetricFlowRate: 0.01,
    liquidVolumetricFlowRate: 0,
    floodingGasVelocity: 0.2,
    designFractionOfFlooding: 0.5,
    packedHeight: 1,
    gasDensity: 1,
    gasViscosity: 4e-6,
    bedVoidFraction: 0.5,
    equivalentPackingDiameter: 0.01,
  })

  assert.ok(
    Math.abs(
      result.modifiedParticleReynoldsNumber -
      500,
    ) < 1e-9,
  )
})

test('rejects invalid fractions and excessive Reynolds number', () => {
  assert.throws(
    () =>
      calculatePackedColumnHydraulics({
        gasVolumetricFlowRate: 0.005,
        liquidVolumetricFlowRate: 0.001,
        floodingGasVelocity: 0.1,
        designFractionOfFlooding: 1,
        packedHeight: 3,
        gasDensity: 1.2,
        gasViscosity: 1.8e-5,
        bedVoidFraction: 0.4,
        equivalentPackingDiameter: 0.005,
      }),
    (error: unknown) =>
      error instanceof
        PackedColumnHydraulicsCalculationError &&
      error.code === 'invalidDesignFraction',
  )

  assert.throws(
    () =>
      calculatePackedColumnHydraulics({
        gasVolumetricFlowRate: 0.01,
        liquidVolumetricFlowRate: 0,
        floodingGasVelocity: 1,
        designFractionOfFlooding: 0.9,
        packedHeight: 1,
        gasDensity: 2,
        gasViscosity: 1e-6,
        bedVoidFraction: 0.4,
        equivalentPackingDiameter: 0.02,
      }),
    (error: unknown) =>
      error instanceof
        PackedColumnHydraulicsCalculationError &&
      error.code === 'modifiedReynoldsOutOfRange',
  )
})
