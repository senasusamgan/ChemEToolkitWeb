import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch03CalculationError,
  calculateFlammabilityMixtureLimits,
} from '../../src/features/process-safety-economics/batch03/engine.ts'

const example = {
  componentOneFuelFraction: 0.6,
  componentTwoFuelFraction: 0.4,
  componentOneLFLPercent: 5,
  componentOneUFLPercent: 15,
  componentTwoLFLPercent: 2.1,
  componentTwoUFLPercent: 9.5,
  actualFuelConcentrationPercent: 4,
}

test('calculates Le Chatelier mixture limits', () => {
  const result =
    calculateFlammabilityMixtureLimits(
      example,
    )

  const expectedLFL =
    1 /
    (
      0.6 / 5 +
      0.4 / 2.1
    )

  assert.ok(
    Math.abs(
      result.mixtureLFLPercent -
      expectedLFL,
    ) < 1e-12,
  )
})

test('classifies a concentration within the range', () => {
  const result =
    calculateFlammabilityMixtureLimits(
      example,
    )

  assert.equal(
    result.flammableMixture,
    true,
  )
  assert.equal(
    result.concentrationStatus,
    'Within estimated flammable range',
  )
})

test('rejects invalid component limits', () => {
  assert.throws(
    () =>
      calculateFlammabilityMixtureLimits({
        ...example,
        componentOneUFLPercent: 4,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch03CalculationError &&
      error.code ===
        'invalidFlammabilityInputs',
  )
})
