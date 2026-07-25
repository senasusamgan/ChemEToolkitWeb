import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch06CalculationError,
  calculateRiskReductionCostEffectiveness,
} from '../../src/features/process-safety-economics/batch06/engine.ts'

const example = {
  baselineAnnualExpectedLoss: 500_000,
  residualAnnualExpectedLoss: 100_000,
  implementationCost: 1_000_000,
  annualMaintenanceCost: 50_000,
  analysisPeriodYears: 10,
  discountRateFraction: 0.1,
}

test('calculates annual risk-reduction benefit', () => {
  const result =
    calculateRiskReductionCostEffectiveness(
      example,
    )

  assert.equal(
    result.grossAnnualRiskReduction,
    400_000,
  )
  assert.equal(
    result.netAnnualBenefit,
    350_000,
  )
})

test('calculates discounted net present value', () => {
  const result =
    calculateRiskReductionCostEffectiveness(
      example,
    )

  const factor =
    (
      1 -
      1.1 ** -10
    ) /
    0.1

  assert.ok(
    Math.abs(
      result.netPresentValue -
      (
        350_000 *
        factor -
        1_000_000
      ),
    ) < 1e-8,
  )
})

test('rejects non-integer analysis period', () => {
  assert.throws(
    () =>
      calculateRiskReductionCostEffectiveness({
        ...example,
        analysisPeriodYears: 10.5,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch06CalculationError &&
      error.code ===
        'invalidCostEffectivenessInputs',
  )
})
