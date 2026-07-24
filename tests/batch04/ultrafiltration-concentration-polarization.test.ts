import assert from 'node:assert/strict'
import test from 'node:test'
import {
  UltrafiltrationConcentrationPolarizationCalculationError,
  calculateUltrafiltrationConcentrationPolarization,
} from '../../src/features/mass-transfer/ultrafiltration-concentration-polarization/engine.ts'

test('calculates gel-polarization performance', () => {
  const result =
    calculateUltrafiltrationConcentrationPolarization({
      feedVolumetricFlowRate: 5,
      membraneArea: 20,
      liquidSideMassTransferCoefficient: 0.02,
      bulkSoluteConcentration: 10,
      gelConcentration: 100,
      observedSievingCoefficient: 0.02,
    })

  assert.ok(
    Math.abs(
      result.limitingFluxLMH -
        46.051701859880914,
    ) < 1e-10,
  )
  assert.ok(
    Math.abs(
      result.permeateFlowRate -
        0.9210340371976183,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.volumetricRecoveryFraction -
        0.18420680743952366,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.permeateSoluteConcentration - 0.2,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.retentateSoluteConcentration -
        12.212848463764923,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(result.observedRejection - 0.98) <
      1e-12,
  )
})

test('handles total observed rejection', () => {
  const result =
    calculateUltrafiltrationConcentrationPolarization({
      feedVolumetricFlowRate: 5,
      membraneArea: 20,
      liquidSideMassTransferCoefficient: 0.02,
      bulkSoluteConcentration: 10,
      gelConcentration: 100,
      observedSievingCoefficient: 0,
    })

  assert.equal(
    result.permeateSoluteConcentration,
    0,
  )
  assert.equal(result.observedRejection, 1)
})

test('rejects gel, sieving and high-recovery violations', () => {
  assert.throws(
    () =>
      calculateUltrafiltrationConcentrationPolarization({
        feedVolumetricFlowRate: 5,
        membraneArea: 20,
        liquidSideMassTransferCoefficient: 0.02,
        bulkSoluteConcentration: 10,
        gelConcentration: 10,
        observedSievingCoefficient: 0.02,
      }),
    (error: unknown) =>
      error instanceof
        UltrafiltrationConcentrationPolarizationCalculationError &&
      error.code ===
        'gelConcentrationNotAboveBulk',
  )

  assert.throws(
    () =>
      calculateUltrafiltrationConcentrationPolarization({
        feedVolumetricFlowRate: 5,
        membraneArea: 20,
        liquidSideMassTransferCoefficient: 0.02,
        bulkSoluteConcentration: 10,
        gelConcentration: 100,
        observedSievingCoefficient: 1.1,
      }),
    (error: unknown) =>
      error instanceof
        UltrafiltrationConcentrationPolarizationCalculationError &&
      error.code ===
        'sievingCoefficientOutOfRange',
  )

  assert.throws(
    () =>
      calculateUltrafiltrationConcentrationPolarization({
        feedVolumetricFlowRate: 1,
        membraneArea: 20,
        liquidSideMassTransferCoefficient: 0.02,
        bulkSoluteConcentration: 10,
        gelConcentration: 100,
        observedSievingCoefficient: 0.02,
      }),
    (error: unknown) =>
      error instanceof
        UltrafiltrationConcentrationPolarizationCalculationError &&
      error.code ===
        'recoveryOutsideLowRecoveryModel',
  )
})
