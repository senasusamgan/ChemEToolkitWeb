import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CoolingCrystallizerYieldCalculationError,
  calculateCoolingCrystallizerYield,
} from '../../src/features/separation-processes/cooling-crystallizer-yield/engine.ts'

test('calculates cooling crystallizer yield', () => {
  const result = calculateCoolingCrystallizerYield({
    feedSolutionMass: 1000,
    hotSolubility: 0.5,
    coldSolubility: 0.2,
    crystalPurity: 0.98,
  })
  assert.ok(Math.abs(result.solventMass - 666.6666666666666) < 1e-10)
  assert.ok(Math.abs(result.pureCrystalMass - 200) < 1e-10)
  assert.ok(Math.abs(result.productCrystalMass - 204.08163265306123) < 1e-10)
})

test('gives lower product mass at perfect purity', () => {
  const result = calculateCoolingCrystallizerYield({
    feedSolutionMass: 1000,
    hotSolubility: 0.5,
    coldSolubility: 0.2,
    crystalPurity: 1,
  })
  assert.ok(Math.abs(result.productCrystalMass - 200) < 1e-10)
})

test('rejects non-cooling solubility data', () => {
  assert.throws(
    () => calculateCoolingCrystallizerYield({
      feedSolutionMass: 1000,
      hotSolubility: 0.2,
      coldSolubility: 0.5,
      crystalPurity: 1,
    }),
    (error: unknown) =>
      error instanceof CoolingCrystallizerYieldCalculationError &&
      error.code === 'coldSolubilityNotLower',
  )
})
