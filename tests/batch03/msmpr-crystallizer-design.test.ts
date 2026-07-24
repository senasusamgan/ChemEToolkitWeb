import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MSMPRCrystallizerDesignCalculationError,
  calculateMSMPRCrystallizerDesign,
} from '../../src/features/mass-transfer/msmpr-crystallizer-design/engine.ts'

test('calculates ideal MSMPR moments, loading and production', () => {
  const result = calculateMSMPRCrystallizerDesign({
    residenceTime: 2,
    linearCrystalGrowthRate: 0.0005,
    nucleiPopulationDensity: 100_000_000,
    crystalDensity: 2500,
    crystalVolumeShapeFactor: 0.5,
    slurryVolumetricFlowRate: 0.1,
    evaluationCrystalSize: 0.002,
  })

  assert.ok(
    Math.abs(
      result.characteristicCrystalSize -
      0.001,
    ) < 1e-15,
  )
  assert.ok(
    Math.abs(
      result.totalCrystalNumberConcentration -
      100_000,
    ) < 1e-9,
  )
  assert.ok(
    Math.abs(
      result.solidsVolumeFraction -
      0.0003,
    ) < 1e-15,
  )
  assert.ok(
    Math.abs(
      result.crystalMassConcentration -
      0.75,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.crystalProductionRate -
      0.075,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.populationDensityAtEvaluationSize -
      13_533_528.323661271,
    ) < 1e-6,
  )
  assert.ok(
    Math.abs(
      result.fractionByNumberAboveEvaluationSize -
      0.1353352832366127,
    ) < 1e-15,
  )
})

test('accepts evaluation at zero crystal size', () => {
  const result = calculateMSMPRCrystallizerDesign({
    residenceTime: 2,
    linearCrystalGrowthRate: 0.0005,
    nucleiPopulationDensity: 100_000_000,
    crystalDensity: 2500,
    crystalVolumeShapeFactor: 0.5,
    slurryVolumetricFlowRate: 0.1,
    evaluationCrystalSize: 0,
  })

  assert.equal(
    result.populationDensityAtEvaluationSize,
    100_000_000,
  )
  assert.equal(
    result.fractionByNumberAboveEvaluationSize,
    1,
  )
})

test('rejects invalid inputs and concentrated slurry', () => {
  assert.throws(
    () =>
      calculateMSMPRCrystallizerDesign({
        residenceTime: 0,
        linearCrystalGrowthRate: 0.0005,
        nucleiPopulationDensity: 100_000_000,
        crystalDensity: 2500,
        crystalVolumeShapeFactor: 0.5,
        slurryVolumetricFlowRate: 0.1,
        evaluationCrystalSize: 0.002,
      }),
    (error: unknown) =>
      error instanceof
        MSMPRCrystallizerDesignCalculationError &&
      error.code === 'nonPositiveProperty',
  )

  assert.throws(
    () =>
      calculateMSMPRCrystallizerDesign({
        residenceTime: 10,
        linearCrystalGrowthRate: 0.01,
        nucleiPopulationDensity: 100_000_000,
        crystalDensity: 2500,
        crystalVolumeShapeFactor: 1,
        slurryVolumetricFlowRate: 0.1,
        evaluationCrystalSize: 0.002,
      }),
    (error: unknown) =>
      error instanceof
        MSMPRCrystallizerDesignCalculationError &&
      error.code ===
        'solidsFractionOutsideDiluteModel',
  )
})
