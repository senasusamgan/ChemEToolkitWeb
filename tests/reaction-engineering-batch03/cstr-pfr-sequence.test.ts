import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch03CalculationError,
  calculateCSTRPFRSequence,
} from '../../src/features/reaction-engineering/batch03/engine.ts'

const example = {
  inletConcentration: 1000,
  firstOrderRateConstant: 0.02,
  totalSpaceTime: 100,
  cstrSpaceTimeFraction: 0.4,
}

test('calculates the sequential outlet concentration', () => {
  const result =
    calculateCSTRPFRSequence(
      example,
    )

  const expected =
    1000 /
    (
      1 +
      0.02 *
      40
    ) *
    Math.exp(
      -0.02 *
      60,
    )

  assert.ok(
    Math.abs(
      result.finalOutletConcentration -
      expected,
    ) < 1e-12,
  )
})

test('sequence conversion lies between CSTR and PFR limits', () => {
  const result =
    calculateCSTRPFRSequence(
      example,
    )

  assert.ok(
    result.overallConversion >
    result.equivalentIdealCSTRConversion,
  )

  assert.ok(
    result.overallConversion <
    result.equivalentIdealPFRConversion,
  )
})

test('rejects CSTR fraction above one', () => {
  assert.throws(
    () =>
      calculateCSTRPFRSequence({
        ...example,
        cstrSpaceTimeFraction: 1.1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch03CalculationError &&
      error.code ===
        'invalidSequenceInputs',
  )
})
