import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch09CalculationError,
  calculateStepResponseRTDAnalysis,
} from '../../src/features/reaction-engineering/batch09/engine.ts'

const example = {
  times: [0, 25, 50, 75, 100, 150],
  normalizedOutletResponses: [0.03, 0.12, 0.35, 0.68, 0.9, 0.98],
}

test('normalizes the final response to unity', () => {
  const result =
    calculateStepResponseRTDAnalysis(
      example,
    )

  assert.ok(
    Math.abs(
      result.normalizedResponses.at(-1)! -
      1,
    ) < 1e-15,
  )

  assert.equal(
    result.intervalEValues.length,
    5,
  )
})

test('returns ordered response percentiles', () => {
  const result =
    calculateStepResponseRTDAnalysis(
      example,
    )

  assert.ok(
    result.timeAtTenPercent <
    result.medianResidenceTime,
  )

  assert.ok(
    result.medianResidenceTime <
    result.timeAtNinetyPercent,
  )
})

test('rejects incomplete observation windows', () => {
  assert.throws(
    () =>
      calculateStepResponseRTDAnalysis({
        ...example,
        normalizedOutletResponses: [0, 0.1, 0.3, 0.5, 0.7, 0.9],
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch09CalculationError &&
      error.code ===
        'incompleteStepResponse',
  )
})
