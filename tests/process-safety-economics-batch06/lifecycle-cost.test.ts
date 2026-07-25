import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch06CalculationError,
  calculateLifecycleCostAnalysis,
} from '../../src/features/process-safety-economics/batch06/engine.ts'

const example = {
  initialCapitalCost: 5_000_000,
  annualOperatingCost: 600_000,
  annualMaintenanceCost: 150_000,
  replacementCost: 1_000_000,
  replacementYear: 8,
  projectLifeYears: 15,
  discountRateFraction: 0.08,
  terminalSalvageValue: 500_000,
}

test('calculates discounted lifecycle cost', () => {
  const result =
    calculateLifecycleCostAnalysis(
      example,
    )

  const annuity =
    (
      1 -
      1.08 ** -15
    ) /
    0.08

  const expected =
    5_000_000 +
    750_000 *
    annuity +
    1_000_000 /
    1.08 ** 8 -
    500_000 /
    1.08 ** 15

  assert.ok(
    Math.abs(
      result.totalLifecycleCost -
      expected,
    ) < 1e-8,
  )
})

test('cost shares sum to one hundred percent', () => {
  const result =
    calculateLifecycleCostAnalysis(
      example,
    )

  assert.ok(
    Math.abs(
      result.operatingAndMaintenanceSharePercent +
      result.capitalAndReplacementSharePercent -
      100,
    ) < 1e-10,
  )
})

test('rejects replacement after project life', () => {
  assert.throws(
    () =>
      calculateLifecycleCostAnalysis({
        ...example,
        replacementYear: 20,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch06CalculationError &&
      error.code ===
        'invalidLifecycleInputs',
  )
})
