import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch04CalculationError,
  calculateChemicalProcessRiskMatrix,
} from '../../src/features/process-safety-economics/batch04/engine.ts'

test('calculates adjusted risk score', () => {
  const result =
    calculateChemicalProcessRiskMatrix({
      likelihoodRating: 4,
      severityRating: 5,
      existingSafeguardCredit: 2,
    })

  assert.equal(
    result.grossRiskScore,
    20,
  )
  assert.equal(
    result.adjustedRiskScore,
    18,
  )
  assert.equal(
    result.riskBand,
    'Extreme',
  )
})

test('never reduces adjusted score below one', () => {
  const result =
    calculateChemicalProcessRiskMatrix({
      likelihoodRating: 1,
      severityRating: 1,
      existingSafeguardCredit: 4,
    })

  assert.equal(
    result.adjustedRiskScore,
    1,
  )
})

test('rejects fractional likelihood rating', () => {
  assert.throws(
    () =>
      calculateChemicalProcessRiskMatrix({
        likelihoodRating: 2.5,
        severityRating: 4,
        existingSafeguardCredit: 1,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch04CalculationError &&
      error.code ===
        'invalidRiskMatrixInputs',
  )
})
