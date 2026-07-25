import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch03CalculationError,
  calculateDeactivatingPackedBedReactor,
} from '../../src/features/reaction-engineering/batch03/engine.ts'

const example = {
  inletMolarFlowRate: 10,
  inletConcentration: 1000,
  catalystWeight: 100,
  rateConstantPerCatalystMass: 0.00002,
  effectivenessFactor: 0.85,
  initialActivity: 1,
  deactivationRateConstant: 0.01,
  timeOnStream: 50,
}

test('calculates exponential activity decay', () => {
  const result =
    calculateDeactivatingPackedBedReactor(
      example,
    )

  assert.ok(
    Math.abs(
      result.currentActivity -
      Math.exp(-0.5),
    ) < 1e-15,
  )
})

test('deactivation lowers conversion relative to fresh catalyst', () => {
  const result =
    calculateDeactivatingPackedBedReactor(
      example,
    )

  assert.ok(
    result.conversion <
    result.freshCatalystConversion,
  )

  assert.ok(
    result.conversionLoss > 0,
  )
})

test('rejects effectiveness above one', () => {
  assert.throws(
    () =>
      calculateDeactivatingPackedBedReactor({
        ...example,
        effectivenessFactor: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch03CalculationError &&
      error.code ===
        'invalidDeactivatingPBRInputs',
  )
})
