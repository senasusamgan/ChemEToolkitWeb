import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch03CalculationError,
  calculateEquivalentAnnualWorth,
} from '../../src/features/process-safety-economics/batch03/engine.ts'

test('converts present worth to annual worth', () => {
  const result =
    calculateEquivalentAnnualWorth({
      initialInvestment: 5_000_000,
      annualNetCashFlow: 950_000,
      terminalValue: 500_000,
      projectLifeYears: 10,
      discountRateFraction: 0.1,
    })

  assert.ok(
    Math.abs(
      result.equivalentAnnualWorth -
      result.presentWorth *
      result.capitalRecoveryFactor,
    ) < 1e-8,
  )
})

test('zero discount rate uses one over life', () => {
  const result =
    calculateEquivalentAnnualWorth({
      initialInvestment: 1000,
      annualNetCashFlow: 300,
      terminalValue: 100,
      projectLifeYears: 4,
      discountRateFraction: 0,
    })

  assert.equal(
    result.capitalRecoveryFactor,
    0.25,
  )
  assert.equal(
    result.equivalentAnnualWorth,
    75,
  )
})

test('rejects non-integer project life', () => {
  assert.throws(
    () =>
      calculateEquivalentAnnualWorth({
        initialInvestment: 1000,
        annualNetCashFlow: 300,
        terminalValue: 100,
        projectLifeYears: 4.5,
        discountRateFraction: 0.1,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch03CalculationError &&
      error.code ===
        'invalidEquivalentAnnualWorthInputs',
  )
})
