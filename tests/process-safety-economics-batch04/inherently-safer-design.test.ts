import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch04CalculationError,
  calculateInherentlySaferDesignChecklist,
} from '../../src/features/process-safety-economics/batch04/engine.ts'

test('calculates confidence-adjusted score', () => {
  const result =
    calculateInherentlySaferDesignChecklist({
      minimizeRating: 4,
      substituteRating: 3,
      moderateRating: 2,
      simplifyRating: 4,
      implementationConfidence: 4,
    })

  assert.equal(
    result.averagePrincipleRating,
    3.25,
  )
  assert.equal(
    result.confidenceAdjustedScore,
    2.6,
  )
})

test('identifies strongest and weakest principles', () => {
  const result =
    calculateInherentlySaferDesignChecklist({
      minimizeRating: 5,
      substituteRating: 3,
      moderateRating: 1,
      simplifyRating: 4,
      implementationConfidence: 5,
    })

  assert.equal(
    result.strongestPrinciple,
    'Minimize',
  )
  assert.equal(
    result.weakestPrinciple,
    'Moderate',
  )
})

test('rejects rating above five', () => {
  assert.throws(
    () =>
      calculateInherentlySaferDesignChecklist({
        minimizeRating: 6,
        substituteRating: 3,
        moderateRating: 2,
        simplifyRating: 4,
        implementationConfidence: 4,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch04CalculationError &&
      error.code ===
        'invalidInherentlySaferInputs',
  )
})
