import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch02CalculationError,
  calculateLangFactorCapitalEstimate,
} from '../../src/features/process-safety-economics/batch02/engine.ts'

test('calculates Lang-factor capital estimate', () => {
  const result = calculateLangFactorCapitalEstimate({
    purchasedEquipmentCost: 2_000_000,
    langFactor: 4.7,
    workingCapitalFractionOfFixedCapital: 0.15,
    startupCostFractionOfFixedCapital: 0.05,
    landCost: 400_000,
  })
  assert.equal(result.fixedCapitalInvestment, 9_400_000)
  assert.equal(result.totalCapitalInvestment, 11_680_000)
})

test('supports zero optional fractions', () => {
  const result = calculateLangFactorCapitalEstimate({
    purchasedEquipmentCost: 1000,
    langFactor: 3,
    workingCapitalFractionOfFixedCapital: 0,
    startupCostFractionOfFixedCapital: 0,
    landCost: 0,
  })
  assert.equal(result.totalCapitalInvestment, 3000)
})

test('rejects an invalid fraction', () => {
  assert.throws(
    () => calculateLangFactorCapitalEstimate({
      purchasedEquipmentCost: 1000,
      langFactor: 3,
      workingCapitalFractionOfFixedCapital: 1.2,
      startupCostFractionOfFixedCapital: 0,
      landCost: 0,
    }),
    (error: unknown) =>
      error instanceof ProcessSafetyEconomicsBatch02CalculationError &&
      error.code === 'invalidLangFactorInputs',
  )
})
