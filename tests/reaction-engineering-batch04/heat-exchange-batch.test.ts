import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch04CalculationError,
  calculateHeatExchangeBatchReactor,
} from '../../src/features/reaction-engineering/batch04/engine.ts'

const example = {
  initialConcentrationA: 1000,
  preExponentialFactor: 1_000_000,
  activationEnergy: 50_000,
  initialTemperature: 350,
  adiabaticTemperatureRise: 100,
  coolantTemperature: 330,
  heatRemovalCoefficient: 0.001,
  targetConversion: 0.8,
  maximumTime: 10_000,
}

test('reaches the requested conversion', () => {
  const result = calculateHeatExchangeBatchReactor(example)
  assert.ok(result.requiredBatchTime > 0)
  assert.ok(Math.abs(result.finalConcentrationA - 200) < 1e-10)
})

test('cooling lowers final temperature versus adiabatic limit', () => {
  const result = calculateHeatExchangeBatchReactor(example)
  assert.ok(result.finalTemperature < 430)
  assert.ok(result.maximumTemperature >= result.finalTemperature)
})

test('rejects conversion equal to one', () => {
  assert.throws(
    () => calculateHeatExchangeBatchReactor({
      ...example,
      targetConversion: 1,
    }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch04CalculationError &&
      error.code === 'invalidHeatExchangeBatchInputs',
  )
})
