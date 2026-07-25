import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch07CalculationError,
  calculateRateConstantTemperatureShift,
} from '../../src/features/reaction-engineering/batch07/engine.ts'

const example = {
  referenceRateConstant: 0.02,
  activationEnergy: 50_000,
  referenceTemperature: 350,
  targetTemperature: 400,
}

test('matches the two-temperature Arrhenius equation', () => {
  const result =
    calculateRateConstantTemperatureShift(
      example,
    )

  const ratio =
    Math.exp(
      -50_000 /
      8.314462618 *
      (
        1 /
        400 -
        1 /
        350
      ),
    )

  assert.ok(
    Math.abs(
      result.shiftedRateConstant -
      0.02 *
      ratio,
    ) < 1e-15,
  )
})

test('higher temperature raises the rate constant', () => {
  const result =
    calculateRateConstantTemperatureShift(
      example,
    )

  assert.ok(
    result.rateConstantRatio > 1,
  )

  assert.ok(
    result.shiftedRateConstant >
    example.referenceRateConstant,
  )
})

test('rejects zero absolute temperature', () => {
  assert.throws(
    () =>
      calculateRateConstantTemperatureShift({
        ...example,
        targetTemperature: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch07CalculationError &&
      error.code ===
        'invalidTemperatureShiftInputs',
  )
})
