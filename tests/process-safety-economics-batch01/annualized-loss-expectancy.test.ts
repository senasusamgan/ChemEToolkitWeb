import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch01CalculationError,
  calculateAnnualizedLossExpectancy,
} from '../../src/features/process-safety-economics/batch01/engine.ts'

const example = {
  eventFrequencyPerYear: 0.02,
  assetDamageCost: 2_000_000,
  businessInterruptionCost:
    1_000_000,
  environmentalRemediationCost:
    500_000,
  injuryAndLiabilityCost:
    750_000,
  insuranceRecoveryFraction: 0.4,
}

test('calculates retained annualized loss', () => {
  const result =
    calculateAnnualizedLossExpectancy(
      example,
    )

  assert.equal(
    result.grossConsequenceCost,
    4_250_000,
  )
  assert.equal(
    result.retainedConsequenceCost,
    2_550_000,
  )
  assert.equal(
    result.annualizedLossExpectancy,
    51_000,
  )
})

test('zero frequency produces zero annualized loss', () => {
  const result =
    calculateAnnualizedLossExpectancy({
      ...example,
      eventFrequencyPerYear: 0,
    })

  assert.equal(
    result.annualizedLossExpectancy,
    0,
  )
})

test('rejects insurance recovery above one', () => {
  assert.throws(
    () =>
      calculateAnnualizedLossExpectancy({
        ...example,
        insuranceRecoveryFraction: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch01CalculationError &&
      error.code ===
        'invalidAnnualizedLossInputs',
  )
})
