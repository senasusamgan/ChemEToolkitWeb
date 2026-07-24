import assert from 'node:assert/strict'
import test from 'node:test'
import {
  HumidificationPsychrometricsCalculationError,
  calculateHumidificationPsychrometrics,
} from '../../src/features/mass-transfer/humidification-psychrometrics/engine.ts'

test('calculates humidity ratios, water addition and heat duty', () => {
  const result = calculateHumidificationPsychrometrics({
    dryAirMassFlowRate: 1000,
    dryBulbTemperatureCelsius: 25,
    totalPressureKPa: 101.325,
    inletRelativeHumidity: 0.3,
    outletRelativeHumidity: 0.6,
  })

  assert.ok(Math.abs(result.saturationVaporPressureKPa - 3.1617360356966913) < 1e-12)
  assert.ok(Math.abs(result.inletHumidityRatio - 0.005877482240956408) < 1e-14)
  assert.ok(Math.abs(result.outletHumidityRatio - 0.011867104252477001) < 1e-14)
  assert.ok(Math.abs(result.signedWaterTransferRate - 5.989622011520592) < 1e-12)
  assert.ok(Math.abs(result.signedIsothermalHeatDuty - 15255.567263342953) < 1e-9)
})

test('handles zero humidity and an unchanged state', () => {
  const result = calculateHumidificationPsychrometrics({
    dryAirMassFlowRate: 100,
    dryBulbTemperatureCelsius: 20,
    totalPressureKPa: 101.325,
    inletRelativeHumidity: 0,
    outletRelativeHumidity: 0,
  })

  assert.equal(result.inletHumidityRatio, 0)
  assert.equal(result.outletHumidityRatio, 0)
  assert.equal(result.signedWaterTransferRate, 0)
  assert.equal(result.inletDewPointCelsius, null)
  assert.equal(result.outletDewPointCelsius, null)
})

test('rejects invalid temperature and humidity', () => {
  assert.throws(
    () =>
      calculateHumidificationPsychrometrics({
        dryAirMassFlowRate: 100,
        dryBulbTemperatureCelsius: 80,
        totalPressureKPa: 101.325,
        inletRelativeHumidity: 0.3,
        outletRelativeHumidity: 0.6,
      }),
    (error: unknown) =>
      error instanceof HumidificationPsychrometricsCalculationError &&
      error.code === 'temperatureOutsideCorrelationRange',
  )

  assert.throws(
    () =>
      calculateHumidificationPsychrometrics({
        dryAirMassFlowRate: 100,
        dryBulbTemperatureCelsius: 25,
        totalPressureKPa: 101.325,
        inletRelativeHumidity: 1.1,
        outletRelativeHumidity: 0.6,
      }),
    (error: unknown) =>
      error instanceof HumidificationPsychrometricsCalculationError &&
      error.code === 'relativeHumidityOutOfRange',
  )
})
