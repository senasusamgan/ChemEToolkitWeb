import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch06CalculationError,
  calculateNonIsothermalCSTRSteadyStates,
} from '../../src/features/reaction-engineering/batch06/engine.ts'

const example = {
  spaceTime: 100,
  preExponentialFactor: 100_000_000,
  activationEnergy: 70_000,
  inletTemperature: 350,
  adiabaticTemperatureRise: 250,
  coolantTemperature: 330,
  heatRemovalNumber: 0.4,
  minimumSearchTemperature: 300,
  maximumSearchTemperature: 700,
}

test('finds at least one thermal steady state', () => {
  const result =
    calculateNonIsothermalCSTRSteadyStates(
      example,
    )

  assert.ok(
    result.steadyStateCount >= 1,
  )

  assert.equal(
    result.steadyStateCount,
    result.steadyStateTemperatures.length,
  )
})

test('all reported conversions lie between zero and one', () => {
  const result =
    calculateNonIsothermalCSTRSteadyStates(
      example,
    )

  assert.ok(
    result.steadyStateConversions.every(
      (conversion) =>
        conversion >= 0 &&
        conversion < 1,
    ),
  )
})

test('rejects reversed temperature bounds', () => {
  assert.throws(
    () =>
      calculateNonIsothermalCSTRSteadyStates({
        ...example,
        minimumSearchTemperature: 700,
        maximumSearchTemperature: 300,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch06CalculationError &&
      error.code ===
        'invalidNonIsothermalCSTRInputs',
  )
})
