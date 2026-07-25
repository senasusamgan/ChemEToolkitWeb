import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch05CalculationError,
  calculateEventTreeAnalysis,
} from '../../src/features/process-safety-economics/batch05/engine.ts'

const example = {
  initiatingEventFrequency: 0.1,
  barrier1SuccessProbability: 0.9,
  barrier2SuccessProbability: 0.8,
  barrier3SuccessProbability: 0.95,
}

test('calculates sequential outcome frequencies', () => {
  const result =
    calculateEventTreeAnalysis(
      example,
    )

  assert.ok(
    Math.abs(
      result.barrier1FailureOutcomeFrequency -
      0.01,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.barrier2FailureOutcomeFrequency -
      0.018,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.barrier3FailureOutcomeFrequency -
      0.0036,
    ) < 1e-15,
  )
})

test('outcome frequencies conserve initiating frequency', () => {
  const result =
    calculateEventTreeAnalysis(
      example,
    )

  assert.ok(
    result.probabilityConservationError <
    1e-15,
  )

  assert.ok(
    Math.abs(
      result.totalOutcomeFrequency -
      example.initiatingEventFrequency,
    ) < 1e-15,
  )
})

test('rejects probability above one', () => {
  assert.throws(
    () =>
      calculateEventTreeAnalysis({
        ...example,
        barrier2SuccessProbability: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch05CalculationError &&
      error.code ===
        'invalidEventTreeInputs',
  )
})
