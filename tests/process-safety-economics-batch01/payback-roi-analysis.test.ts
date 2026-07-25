import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch01CalculationError,
  calculatePaybackAndROIAnalysis,
} from '../../src/features/process-safety-economics/batch01/engine.ts'

const example = {
  initialInvestment: 5_000_000,
  annualRevenue: 2_200_000,
  annualOperatingCost:
    1_100_000,
  annualDepreciation: 400_000,
  incomeTaxRate: 0.25,
  projectLifeYears: 10,
}

test('calculates after-tax annual cash flow', () => {
  const result =
    calculatePaybackAndROIAnalysis(
      example,
    )

  assert.equal(
    result.annualEBITDA,
    1_100_000,
  )
  assert.equal(
    result.taxableIncome,
    700_000,
  )
  assert.equal(
    result.annualTax,
    175_000,
  )
  assert.equal(
    result.annualCashFlow,
    925_000,
  )
})

test('calculates payback and project recovery', () => {
  const result =
    calculatePaybackAndROIAnalysis(
      example,
    )

  assert.ok(
    Math.abs(
      result.simplePaybackPeriodYears -
      5_000_000 / 925_000,
    ) < 1e-12,
  )
  assert.equal(
    result.investmentRecoveredWithinProjectLife,
    true,
  )
})

test('rejects a tax rate above one', () => {
  assert.throws(
    () =>
      calculatePaybackAndROIAnalysis({
        ...example,
        incomeTaxRate: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch01CalculationError &&
      error.code ===
        'invalidPaybackInputs',
  )
})
