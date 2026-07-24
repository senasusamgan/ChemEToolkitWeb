import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DryerThermalDutyCalculationError,
  calculateDryerThermalDuty,
} from '../../src/features/separation-processes/dryer-thermal-duty/engine.ts'

test('calculates dryer mass and energy duties', () => {
  const result = calculateDryerThermalDuty({
    wetFeedMassFlowRate: 1000,
    initialMoistureDryBasis: 0.5,
    finalMoistureDryBasis: 0.05,
    inletTemperature: 25,
    outletTemperature: 80,
    drySolidHeatCapacity: 1.5,
    liquidWaterHeatCapacity: 4.18,
    latentHeatOfVaporization: 2300,
    heatLossFraction: 0.15,
  })
  assert.ok(Math.abs(result.drySolidFlowRate - 666.6666666666666) < 1e-10)
  assert.ok(Math.abs(result.waterEvaporationRate - 300) < 1e-10)
  assert.ok(result.requiredHeaterDuty > result.processDuty)
})

test('zero heat loss leaves process and heater duty equal', () => {
  const result = calculateDryerThermalDuty({
    wetFeedMassFlowRate: 100,
    initialMoistureDryBasis: 0.4,
    finalMoistureDryBasis: 0.1,
    inletTemperature: 20,
    outletTemperature: 60,
    drySolidHeatCapacity: 1.2,
    liquidWaterHeatCapacity: 4.18,
    latentHeatOfVaporization: 2300,
    heatLossFraction: 0,
  })
  assert.ok(Math.abs(result.requiredHeaterDuty - result.processDuty) < 1e-12)
})

test('rejects moisture increase', () => {
  assert.throws(
    () => calculateDryerThermalDuty({
      wetFeedMassFlowRate: 100,
      initialMoistureDryBasis: 0.1,
      finalMoistureDryBasis: 0.2,
      inletTemperature: 20,
      outletTemperature: 60,
      drySolidHeatCapacity: 1.2,
      liquidWaterHeatCapacity: 4.18,
      latentHeatOfVaporization: 2300,
      heatLossFraction: 0,
    }),
    (error: unknown) =>
      error instanceof DryerThermalDutyCalculationError &&
      error.code === 'finalMoistureNotLower',
  )
})
