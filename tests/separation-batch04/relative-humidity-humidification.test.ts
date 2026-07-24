import assert from 'node:assert/strict'
import test from 'node:test'
import {
  RelativeHumidityHumidificationCalculationError,
  calculateRelativeHumidityHumidification,
} from '../../src/features/separation-processes/relative-humidity-humidification/engine.ts'

test('calculates water addition for a higher relative humidity', () => {
  const result = calculateRelativeHumidityHumidification({
    dryAirFlowRate: 1000,
    dryBulbTemperature: 25,
    totalPressure: 101.325,
    inletRelativeHumidity: 0.3,
    targetRelativeHumidity: 0.7,
  })
  assert.ok(result.saturationVaporPressure > 3)
  assert.ok(result.targetHumidityRatio > result.inletHumidityRatio)
  assert.ok(result.waterAdditionRate > 0)
})

test('water addition scales with dry-air flow', () => {
  const low = calculateRelativeHumidityHumidification({
    dryAirFlowRate: 500,
    dryBulbTemperature: 25,
    totalPressure: 101.325,
    inletRelativeHumidity: 0.3,
    targetRelativeHumidity: 0.7,
  })
  const high = calculateRelativeHumidityHumidification({
    dryAirFlowRate: 1000,
    dryBulbTemperature: 25,
    totalPressure: 101.325,
    inletRelativeHumidity: 0.3,
    targetRelativeHumidity: 0.7,
  })
  assert.ok(Math.abs(high.waterAdditionRate - 2 * low.waterAdditionRate) < 1e-12)
})

test('rejects a lower target relative humidity', () => {
  assert.throws(
    () => calculateRelativeHumidityHumidification({
      dryAirFlowRate: 1000,
      dryBulbTemperature: 25,
      totalPressure: 101.325,
      inletRelativeHumidity: 0.7,
      targetRelativeHumidity: 0.3,
    }),
    (error: unknown) =>
      error instanceof RelativeHumidityHumidificationCalculationError &&
      error.code === 'targetNotHigher',
  )
})
