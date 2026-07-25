import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch04CalculationError,
  calculateHAZOPGuideWordAssistant,
} from '../../src/features/process-safety-economics/batch04/engine.ts'

test('maps guide-word and parameter codes', () => {
  const result =
    calculateHAZOPGuideWordAssistant({
      guideWordCode: 2,
      parameterCode: 1,
      safeguardStrengthRating: 3,
      consequenceSeverityRating: 4,
    })

  assert.equal(
    result.guideWord,
    'More',
  )
  assert.equal(
    result.processParameter,
    'Flow',
  )
  assert.equal(
    result.deviationPhrase,
    'More Flow',
  )
})

test('higher severity raises screening priority', () => {
  const low =
    calculateHAZOPGuideWordAssistant({
      guideWordCode: 1,
      parameterCode: 1,
      safeguardStrengthRating: 3,
      consequenceSeverityRating: 2,
    })

  const high =
    calculateHAZOPGuideWordAssistant({
      guideWordCode: 1,
      parameterCode: 1,
      safeguardStrengthRating: 3,
      consequenceSeverityRating: 5,
    })

  assert.ok(
    high.screeningPriority >
    low.screeningPriority,
  )
})

test('rejects an unsupported guide-word code', () => {
  assert.throws(
    () =>
      calculateHAZOPGuideWordAssistant({
        guideWordCode: 8,
        parameterCode: 1,
        safeguardStrengthRating: 3,
        consequenceSeverityRating: 4,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch04CalculationError &&
      error.code ===
        'invalidHAZOPInputs',
  )
})
