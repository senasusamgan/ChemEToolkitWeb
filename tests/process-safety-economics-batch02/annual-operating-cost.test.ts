import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch02CalculationError,
  calculateAnnualOperatingCostEstimate,
} from '../../src/features/process-safety-economics/batch02/engine.ts'

const example = {
  rawMaterialCost: 3_500_000,
  utilityCost: 900_000,
  operatingLaborCost: 750_000,
  maintenanceCost: 500_000,
  wasteTreatmentCost: 180_000,
  laboratoryAndQualityCost: 90_000,
  plantOverheadFractionOfLaborAndMaintenance: 0.6,
  insuranceAndTaxFractionOfFixedCapital: 0.03,
  fixedCapitalInvestment: 10_000_000,
  annualProduction: 50_000,
}

test('calculates annual operating cost', () => {
  const result = calculateAnnualOperatingCostEstimate(example)
  assert.equal(result.directCashOperatingCost, 5_920_000)
  assert.equal(result.plantOverheadCost, 750_000)
  assert.equal(result.insuranceAndTaxCost, 300_000)
  assert.equal(result.totalAnnualOperatingCost, 6_970_000)
})

test('calculates unit production cost', () => {
  const result = calculateAnnualOperatingCostEstimate(example)
  assert.equal(result.unitProductionCost, 139.4)
})

test('rejects zero annual production', () => {
  assert.throws(
    () => calculateAnnualOperatingCostEstimate({
      ...example,
      annualProduction: 0,
    }),
    (error: unknown) =>
      error instanceof ProcessSafetyEconomicsBatch02CalculationError &&
      error.code === 'invalidOperatingCostInputs',
  )
})
