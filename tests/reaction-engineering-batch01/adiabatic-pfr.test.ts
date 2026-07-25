import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch01CalculationError,
  calculateAdiabaticPFR,
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

test('calculates a positive integrated PFR volume', () => {
  const result =
    calculateAdiabaticPFR(
      example,
    )

  assert.ok(
    result.requiredReactorVolume > 0,
  )

  assert.equal(
    result.integrationIntervals,
    1200,
  )
})

test('higher adiabatic rise reduces required PFR volume', () => {
  const heated =
    calculateAdiabaticPFR(
      example,
    )

  const isothermal =
    calculateAdiabaticPFR({
      ...example,
      adiabaticTemperatureRise: 0,
    })

  assert.ok(
    heated.requiredReactorVolume <
    isothermal.requiredReactorVolume,
  )
})

test('rejects negative temperature rise', () => {
  assert.throws(
    () =>
      calculateAdiabaticPFR({
        ...example,
        adiabaticTemperatureRise: -1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch01CalculationError &&
      error.code ===
        'invalidAdiabaticPFRInputs',
  )
})
