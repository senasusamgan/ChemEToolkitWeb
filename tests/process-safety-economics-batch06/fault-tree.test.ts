import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch06CalculationError,
  calculateFaultTreeProbability,
} from '../../src/features/process-safety-economics/batch06/engine.ts'

test('calculates an OR-gate probability', () => {
  const result =
    calculateFaultTreeProbability({
      gateTypeCode: 1,
      basicEventOneProbability: 0.1,
      basicEventTwoProbability: 0.05,
      basicEventThreeProbability: 0.02,
    })

  const expected =
    1 -
    0.9 *
    0.95 *
    0.98

  assert.ok(
    Math.abs(
      result.topEventProbability -
      expected,
    ) < 1e-15,
  )
})

test('calculates an AND-gate probability', () => {
  const result =
    calculateFaultTreeProbability({
      gateTypeCode: 2,
      basicEventOneProbability: 0.1,
      basicEventTwoProbability: 0.05,
      basicEventThreeProbability: 0.02,
    })

  assert.ok(
    Math.abs(
      result.topEventProbability -
      0.0001,
    ) < 1e-15,
  )
})

test('rejects probability above one', () => {
  assert.throws(
    () =>
      calculateFaultTreeProbability({
        gateTypeCode: 1,
        basicEventOneProbability: 1.2,
        basicEventTwoProbability: 0.05,
        basicEventThreeProbability: 0.02,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch06CalculationError &&
      error.code ===
        'invalidFaultTreeInputs',
  )
})
