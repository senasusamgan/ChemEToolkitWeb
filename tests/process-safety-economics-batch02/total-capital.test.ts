import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch02CalculationError,
  calculateTotalCapitalInvestmentEstimate,
} from '../../src/features/process-safety-economics/batch02/engine.ts'

const example = {
  purchasedEquipmentCost: 2_000_000,
  equipmentInstallationCost: 800_000,
  pipingCost: 700_000,
  instrumentationCost: 400_000,
  electricalCost: 300_000,
  buildingsAndYardCost: 500_000,
  utilitiesAndServiceFacilitiesCost: 600_000,
  engineeringAndConstructionCost: 900_000,
  contingencyFractionOfSubtotal: 0.1,
  workingCapitalFractionOfFixedCapital: 0.15,
}

test('assembles total capital', () => {
  const result = calculateTotalCapitalInvestmentEstimate(example)
  assert.equal(result.directAndIndirectSubtotal, 6_200_000)
  assert.equal(result.totalCapitalInvestment, 7_843_000)
})

test('zero fractions preserve subtotal', () => {
  const result = calculateTotalCapitalInvestmentEstimate({
    ...example,
    contingencyFractionOfSubtotal: 0,
    workingCapitalFractionOfFixedCapital: 0,
  })
  assert.equal(result.totalCapitalInvestment, 6_200_000)
})

test('rejects a negative component', () => {
  assert.throws(
    () => calculateTotalCapitalInvestmentEstimate({
      ...example,
      pipingCost: -1,
    }),
    (error: unknown) =>
      error instanceof ProcessSafetyEconomicsBatch02CalculationError &&
      error.code === 'invalidCapitalInvestmentInputs',
  )
})
