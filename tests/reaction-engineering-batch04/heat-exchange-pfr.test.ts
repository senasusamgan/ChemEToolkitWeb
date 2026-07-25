import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch04CalculationError,
  calculateHeatExchangePFR,
} from '../../src/features/reaction-engineering/batch04/engine.ts'

const example = {
  inletConcentrationA: 1000,
  volumetricFlowRate: 0.01,
  preExponentialFactor: 1_000_000,
  activationEnergy: 50_000,
  inletTemperature: 350,
  adiabaticTemperatureRise: 100,
  coolantTemperature: 330,
  heatRemovalNumberPerConversion: 2,
  targetConversion: 0.8,
}

test('calculates a positive cooled PFR volume', () => {
  const result = calculateHeatExchangePFR(example)
  assert.ok(result.requiredReactorVolume > 0)
  assert.equal(result.integrationIntervals, 1200)
})

test('stronger cooling lowers the outlet temperature', () => {
  const base = calculateHeatExchangePFR(example)
  const stronger = calculateHeatExchangePFR({
    ...example,
    heatRemovalNumberPerConversion: 5,
  })
  assert.ok(stronger.outletTemperature < base.outletTemperature)
})

test('rejects zero flow rate', () => {
  assert.throws(
    () => calculateHeatExchangePFR({
      ...example,
      volumetricFlowRate: 0,
    }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch04CalculationError &&
      error.code === 'invalidHeatExchangePFRInputs',
  )
})
