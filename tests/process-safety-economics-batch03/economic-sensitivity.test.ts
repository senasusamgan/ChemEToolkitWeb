import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch03CalculationError,
  calculateEconomicSensitivityAnalysis,
} from '../../src/features/process-safety-economics/batch03/engine.ts'

const base = {
  baseAnnualRevenue: 2_200_000,
  baseAnnualOperatingCost: 1_100_000,
  baseInitialInvestment: 5_000_000,
  revenueChangeFraction: -0.1,
  operatingCostChangeFraction: 0.1,
  capitalChangeFraction: 0.05,
  projectLifeYears: 10,
  discountRateFraction: 0.1,
}

test('applies revenue, cost and capital changes', () => {
  const result =
    calculateEconomicSensitivityAnalysis(
      base,
    )

  assert.equal(
    result.adjustedAnnualRevenue,
    1_980_000,
  )
  assert.ok(
    Math.abs(
      result.adjustedAnnualOperatingCost -
      1_210_000,
    ) < 1e-9,
  )
  assert.equal(
    result.adjustedInitialInvestment,
    5_250_000,
  )
})

test('adverse changes reduce NPV', () => {
  const result =
    calculateEconomicSensitivityAnalysis(
      base,
    )

  assert.ok(
    result.adjustedNetPresentValue <
    result.baseNetPresentValue,
  )
  assert.ok(
    result.netPresentValueChange < 0,
  )
})

test('rejects a negative adjusted revenue', () => {
  assert.throws(
    () =>
      calculateEconomicSensitivityAnalysis({
        ...base,
        revenueChangeFraction: -1.5,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch03CalculationError &&
      error.code ===
        'invalidSensitivityInputs',
  )
})
