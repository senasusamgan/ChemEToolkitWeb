import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch06CalculationError,
  calculatePackedBedReactorDesign,
} from '../../src/features/reaction-engineering/batch06/engine.ts'

const example = {
  inletConcentrationA: 1000,
  inletVolumetricFlowRate: 0.01,
  massSpecificFirstOrderRateConstant: 0.00002,
  targetConversion: 0.8,
}

test('matches first-order packed-bed design equation', () => {
  const result =
    calculatePackedBedReactorDesign(
      example,
    )

  const expected =
    0.01 /
    0.00002 *
    -Math.log(0.2)

  assert.ok(
    Math.abs(
      result.requiredCatalystWeight -
      expected,
    ) < 1e-10,
  )
})

test('calculates outlet concentration and molar flow', () => {
  const result =
    calculatePackedBedReactorDesign(
      example,
    )

  assert.ok(
    Math.abs(
      result.outletConcentrationA -
      200,
    ) < 1e-10,
  )

  assert.ok(
    Math.abs(
      result.outletMolarFlowRateA -
      2,
    ) < 1e-10,
  )
})

test('rejects conversion equal to one', () => {
  assert.throws(
    () =>
      calculatePackedBedReactorDesign({
        ...example,
        targetConversion: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch06CalculationError &&
      error.code ===
        'invalidPackedBedDesignInputs',
  )
})
