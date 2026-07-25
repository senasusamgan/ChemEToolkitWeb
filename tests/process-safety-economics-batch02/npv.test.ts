import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch02CalculationError,
  calculateNetPresentValueAnalysis,
} from '../../src/features/process-safety-economics/batch02/engine.ts'

test('calculates NPV for uniform annual cash flow', () => {
  const result = calculateNetPresentValueAnalysis({
    initialInvestment: 5_000_000,
    annualNetCashFlow: 950_000,
    terminalValue: 500_000,
    projectLifeYears: 10,
    discountRateFraction: 0.1,
  })
  const annuity = 950_000 * (1 - 1.1 ** -10) / 0.1
  const terminal = 500_000 / 1.1 ** 10
  assert.ok(Math.abs(
    result.netPresentValue -
    (-5_000_000 + annuity + terminal),
  ) < 1e-8)
})

test('zero discount rate uses undiscounted cash flows', () => {
  const result = calculateNetPresentValueAnalysis({
    initialInvestment: 1000,
    annualNetCashFlow: 300,
    terminalValue: 100,
    projectLifeYears: 4,
    discountRateFraction: 0,
  })
  assert.equal(result.netPresentValue, 300)
})

test('rejects non-integer project life', () => {
  assert.throws(
    () => calculateNetPresentValueAnalysis({
      initialInvestment: 1000,
      annualNetCashFlow: 300,
      terminalValue: 100,
      projectLifeYears: 4.5,
      discountRateFraction: 0.1,
    }),
    (error: unknown) =>
      error instanceof ProcessSafetyEconomicsBatch02CalculationError &&
      error.code === 'invalidNPVInputs',
  )
})
