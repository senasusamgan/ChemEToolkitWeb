import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PsychrometricAirStreamMixingCalculationError,
  calculatePsychrometricAirStreamMixing,
} from '../../src/features/separation-processes/psychrometric-air-stream-mixing/engine.ts'

test('mixes two moist-air streams on a dry-air basis', () => {
  const result = calculatePsychrometricAirStreamMixing({
    dryAirFlowRate1: 1000,
    dryBulbTemperature1: 30,
    humidityRatio1: 0.012,
    dryAirFlowRate2: 500,
    dryBulbTemperature2: 15,
    humidityRatio2: 0.006,
  })
  assert.equal(result.totalDryAirFlowRate, 1500)
  assert.equal(result.mixedHumidityRatio, 0.01)
  assert.ok(result.mixedDryBulbTemperature > 15)
  assert.ok(result.mixedDryBulbTemperature < 30)
  assert.ok(Math.abs(result.energyBalanceResidual) < 1e-10)
})

test('equal streams reproduce the same state', () => {
  const result = calculatePsychrometricAirStreamMixing({
    dryAirFlowRate1: 100,
    dryBulbTemperature1: 25,
    humidityRatio1: 0.01,
    dryAirFlowRate2: 100,
    dryBulbTemperature2: 25,
    humidityRatio2: 0.01,
  })
  assert.ok(Math.abs(result.mixedDryBulbTemperature - 25) < 1e-12)
  assert.equal(result.mixedHumidityRatio, 0.01)
})

test('rejects negative humidity ratio', () => {
  assert.throws(
    () => calculatePsychrometricAirStreamMixing({
      dryAirFlowRate1: 100,
      dryBulbTemperature1: 25,
      humidityRatio1: -0.01,
      dryAirFlowRate2: 100,
      dryBulbTemperature2: 20,
      humidityRatio2: 0.01,
    }),
    (error: unknown) =>
      error instanceof PsychrometricAirStreamMixingCalculationError &&
      error.code === 'negativeHumidityRatio',
  )
})
