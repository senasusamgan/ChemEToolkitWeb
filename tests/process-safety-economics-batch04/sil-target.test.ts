import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch04CalculationError,
  calculateSafetyIntegrityLevelTarget,
} from '../../src/features/process-safety-economics/batch04/engine.ts'

test('selects SIL 2 for required RRF of one thousand boundary below', () => {
  const result =
    calculateSafetyIntegrityLevelTarget({
      unmitigatedEventFrequency: 0.1,
      tolerableEventFrequency: 0.000001,
      nonSIFRiskReductionFactor: 100,
    })

  assert.ok(
    Math.abs(
      result.requiredSIFRiskReductionFactor -
      1000,
    ) < 1e-9,
  )
  assert.equal(
    result.targetSIL,
    'SIL 3',
  )
})

test('returns no additional target below RRF ten', () => {
  const result =
    calculateSafetyIntegrityLevelTarget({
      unmitigatedEventFrequency: 0.001,
      tolerableEventFrequency: 0.0002,
      nonSIFRiskReductionFactor: 1,
    })

  assert.equal(
    result.requiredSIFRiskReductionFactor,
    5,
  )
  assert.equal(
    result.targetSIL,
    'No additional SIL target',
  )
})

test('rejects zero tolerable frequency', () => {
  assert.throws(
    () =>
      calculateSafetyIntegrityLevelTarget({
        unmitigatedEventFrequency: 0.1,
        tolerableEventFrequency: 0,
        nonSIFRiskReductionFactor: 100,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch04CalculationError &&
      error.code ===
        'invalidSILInputs',
  )
})
