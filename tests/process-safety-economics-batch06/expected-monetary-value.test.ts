import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch06CalculationError,
  calculateExpectedMonetaryValueDecision,
} from '../../src/features/process-safety-economics/batch06/engine.ts'

const example = {
  optionASuccessProbability: 0.7,
  optionASuccessValue: 2_000_000,
  optionAFailureValue: -500_000,
  optionBSuccessProbability: 0.9,
  optionBSuccessValue: 1_200_000,
  optionBFailureValue: -200_000,
}

test('calculates both expected monetary values', () => {
  const result =
    calculateExpectedMonetaryValueDecision(
      example,
    )

  assert.equal(
    result.optionAExpectedMonetaryValue,
    1_250_000,
  )

  assert.equal(
    result.optionBExpectedMonetaryValue,
    1_060_000,
  )
})

test('selects the higher expected-value option', () => {
  const result =
    calculateExpectedMonetaryValueDecision(
      example,
    )

  assert.equal(
    result.preferredOption,
    'Option A',
  )

  assert.equal(
    result.expectedValueDifference,
    190_000,
  )
})

test('rejects success probability above one', () => {
  assert.throws(
    () =>
      calculateExpectedMonetaryValueDecision({
        ...example,
        optionASuccessProbability: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch06CalculationError &&
      error.code ===
        'invalidEMVInputs',
  )
})
