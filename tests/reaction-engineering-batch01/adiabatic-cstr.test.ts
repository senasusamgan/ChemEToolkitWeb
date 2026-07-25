import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch01CalculationError,
  calculateAdiabaticCSTR,
} from '../../src/features/reaction-engineering/batch01/engine.ts'

const example = {
  inletConcentration: 1000,
  volumetricFlowRate: 0.01,
  preExponentialFactor: 1_000_000,
  activationEnergy: 50_000,
  inletTemperature: 350,
  adiabaticTemperatureRise: 100,
  targetConversion: 0.8,
}

test('calculates the CSTR design equation', () => {
  const result =
    calculateAdiabaticCSTR(
      example,
    )

  const expected =
    result.inletMolarFlowRate *
    0.8 /
    result.outletReactionRate

  assert.ok(
    Math.abs(
      result.requiredReactorVolume -
      expected,
    ) < 1e-12,
  )
})

test('space time equals volume divided by flow', () => {
  const result =
    calculateAdiabaticCSTR(
      example,
    )

  assert.ok(
    Math.abs(
      result.spaceTime -
      result.requiredReactorVolume /
      example.volumetricFlowRate,
    ) < 1e-12,
  )
})

test('rejects zero flow rate', () => {
  assert.throws(
    () =>
      calculateAdiabaticCSTR({
        ...example,
        volumetricFlowRate: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch01CalculationError &&
      error.code ===
        'invalidAdiabaticCSTRInputs',
  )
})
