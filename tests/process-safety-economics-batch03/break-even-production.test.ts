import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch03CalculationError,
  calculateBreakEvenProductionAnalysis,
} from '../../src/features/process-safety-economics/batch03/engine.ts'

test('calculates break-even production and profit', () => {
  const result =
    calculateBreakEvenProductionAnalysis({
      fixedAnnualCost: 1_200_000,
      variableCostPerUnit: 45,
      sellingPricePerUnit: 80,
      expectedAnnualProduction: 50_000,
    })

  assert.ok(
    Math.abs(
      result.breakEvenProductionUnits -
      1_200_000 / 35,
    ) < 1e-12,
  )
  assert.equal(
    result.expectedAnnualProfit,
    550_000,
  )
})

test('reports a positive margin of safety', () => {
  const result =
    calculateBreakEvenProductionAnalysis({
      fixedAnnualCost: 1000,
      variableCostPerUnit: 4,
      sellingPricePerUnit: 10,
      expectedAnnualProduction: 200,
    })

  assert.ok(
    result.marginOfSafetyUnits > 0,
  )
  assert.equal(
    result.profitableAtExpectedProduction,
    true,
  )
})

test('rejects price not exceeding variable cost', () => {
  assert.throws(
    () =>
      calculateBreakEvenProductionAnalysis({
        fixedAnnualCost: 1000,
        variableCostPerUnit: 10,
        sellingPricePerUnit: 10,
        expectedAnnualProduction: 200,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch03CalculationError &&
      error.code ===
        'invalidBreakEvenInputs',
  )
})
