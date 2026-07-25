import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch04CalculationError,
  calculateHeatExchangeCSTR,
} from '../../src/features/reaction-engineering/batch04/engine.ts'

const example = {
  inletConcentrationA: 1000,
  volumetricFlowRate: 0.01,
  preExponentialFactor: 1_000_000,
  activationEnergy: 50_000,
  inletTemperature: 350,
  adiabaticTemperatureRise: 100,
  coolantTemperature: 330,
  heatRemovalNumber: 1.5,
  targetConversion: 0.8,
}

test('calculates the explicit energy-balance temperature', () => {
  const result = calculateHeatExchangeCSTR(example)
  const expected = (350 + 100 * 0.8 + 1.5 * 330) / 2.5
  assert.ok(Math.abs(result.outletTemperature - expected) < 1e-12)
})

test('satisfies the CSTR design equation', () => {
  const result = calculateHeatExchangeCSTR(example)
  const inletMolarFlow = 1000 * 0.01
  assert.ok(
    Math.abs(
      result.requiredReactorVolume -
      inletMolarFlow * 0.8 / result.outletReactionRate,
    ) < 1e-12,
  )
})

test('rejects negative heat-removal number', () => {
  assert.throws(
    () => calculateHeatExchangeCSTR({
      ...example,
      heatRemovalNumber: -1,
    }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch04CalculationError &&
      error.code === 'invalidHeatExchangeCSTRInputs',
  )
})
