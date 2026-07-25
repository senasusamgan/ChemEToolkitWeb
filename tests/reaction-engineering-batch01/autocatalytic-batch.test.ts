import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch01CalculationError,
  calculateAutocatalyticBatchReactor,
} from '../../src/features/reaction-engineering/batch01/engine.ts'

const example = {
  initialReactantConcentration: 1000,
  initialAutocatalystConcentration: 50,
  rateConstant: 0.00001,
  targetConversion: 0.9,
}

test('calculates autocatalytic batch time', () => {
  const result =
    calculateAutocatalyticBatchReactor(
      example,
    )

  const expected =
    Math.log(
      950 /
      (
        50 *
        0.1
      ),
    ) /
    (
      0.00001 *
      1050
    )

  assert.ok(
    Math.abs(
      result.requiredBatchTime -
      expected,
    ) < 1e-10,
  )
})

test('conserves total reactive concentration', () => {
  const result =
    calculateAutocatalyticBatchReactor(
      example,
    )

  assert.ok(
    Math.abs(
      result.outletReactantConcentration +
      result.outletAutocatalystConcentration -
      result.totalReactiveConcentration,
    ) < 1e-10,
  )
})

test('rejects zero initial autocatalyst', () => {
  assert.throws(
    () =>
      calculateAutocatalyticBatchReactor({
        ...example,
        initialAutocatalystConcentration: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch01CalculationError &&
      error.code ===
        'invalidAutocatalyticInputs',
  )
})
