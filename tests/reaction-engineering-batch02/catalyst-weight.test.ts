import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch02CalculationError,
  calculateCatalystWeightFromRateData,
} from '../../src/features/reaction-engineering/batch02/engine.ts'

const example = {
  inletMolarFlowRate: 10,
  inletConcentration: 1000,
  targetConversion: 0.8,
  rateConstantPerCatalystMass: 0.00002,
  reactionOrder: 1,
  effectivenessFactor: 0.85,
}

test('matches first-order analytical catalyst weight', () => {
  const result =
    calculateCatalystWeightFromRateData(
      example,
    )

  const expected =
    10 /
    (
      0.85 *
      0.00002 *
      1000
    ) *
    -Math.log(
      1 -
      0.8,
    )

  assert.ok(
    Math.abs(
      result.requiredCatalystWeight -
      expected,
    ) < 1e-8,
  )
})

test('lower effectiveness requires more catalyst', () => {
  const base =
    calculateCatalystWeightFromRateData(
      example,
    )

  const reduced =
    calculateCatalystWeightFromRateData({
      ...example,
      effectivenessFactor: 0.5,
    })

  assert.ok(
    reduced.requiredCatalystWeight >
    base.requiredCatalystWeight,
  )
})

test('rejects conversion equal to one', () => {
  assert.throws(
    () =>
      calculateCatalystWeightFromRateData({
        ...example,
        targetConversion: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch02CalculationError &&
      error.code ===
        'invalidCatalystWeightInputs',
  )
})
