import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch01CalculationError,
  calculateAdiabaticBatchReactor,
} from '../../src/features/reaction-engineering/batch01/engine.ts'

const example = {
  initialConcentration: 1000,
  preExponentialFactor: 1_000_000,
  activationEnergy: 50_000,
  reactionOrder: 1,
  inletTemperature: 350,
  adiabaticTemperatureRise: 100,
  targetConversion: 0.8,
}

test('calculates positive batch time and outlet state', () => {
  const result =
    calculateAdiabaticBatchReactor(
      example,
    )

  assert.ok(
    result.requiredBatchTime > 0,
  )

  assert.equal(
    result.outletTemperature,
    430,
  )

  assert.ok(
    Math.abs(
      result.outletConcentration -
      200,
    ) < 1e-10,
  )
})

test('adiabatic heating raises the rate constant', () => {
  const result =
    calculateAdiabaticBatchReactor(
      example,
    )

  assert.ok(
    result.outletRateConstant >
    result.initialRateConstant,
  )
})

test('rejects conversion equal to one', () => {
  assert.throws(
    () =>
      calculateAdiabaticBatchReactor({
        ...example,
        targetConversion: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch01CalculationError &&
      error.code ===
        'invalidAdiabaticBatchInputs',
  )
})
