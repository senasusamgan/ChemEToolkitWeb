import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch05CalculationError,
  calculateMultipleReactionsCSTR,
} from '../../src/features/reaction-engineering/batch05/engine.ts'

const example = {
  inletConcentrationA: 1000,
  volumetricFlowRate: 0.01,
  desiredReactionRateConstant: 0.03,
  undesiredReactionRateConstant: 0.01,
  targetConversion: 0.8,
}

test('calculates CSTR space time for parallel reactions', () => {
  const result =
    calculateMultipleReactionsCSTR(
      example,
    )

  assert.ok(
    Math.abs(
      result.requiredSpaceTime -
      100,
    ) < 1e-12,
  )

  assert.ok(
    Math.abs(
      result.requiredReactorVolume -
      1,
    ) < 1e-12,
  )
})

test('splits products by rate-constant fraction', () => {
  const result =
    calculateMultipleReactionsCSTR(
      example,
    )

  assert.equal(
    result.desiredProductFraction,
    0.75,
  )

  assert.ok(
    Math.abs(
      result.outletConcentrationDesiredProduct -
      600,
    ) < 1e-10,
  )

  assert.ok(
    Math.abs(
      result.outletConcentrationUndesiredProduct -
      200,
    ) < 1e-10,
  )
})

test('rejects zero undesired rate constant', () => {
  assert.throws(
    () =>
      calculateMultipleReactionsCSTR({
        ...example,
        undesiredReactionRateConstant: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch05CalculationError &&
      error.code ===
        'invalidMultipleCSTRInputs',
  )
})
