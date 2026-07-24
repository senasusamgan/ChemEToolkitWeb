import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CombinedDryerTimeCalculationError,
  calculateCombinedDryerTime,
} from '../../src/features/separation-processes/combined-dryer-time/engine.ts'

test('calculates constant and falling drying periods', () => {
  const result = calculateCombinedDryerTime({
    drySolidMass: 100,
    dryingArea: 10,
    constantDryingRate: 5,
    initialMoistureContent: 0.5,
    criticalMoistureContent: 0.2,
    finalMoistureContent: 0.05,
    equilibriumMoistureContent: 0.02,
  })
  assert.ok(Math.abs(result.constantRateTime - 0.6) < 1e-12)
  assert.ok(result.fallingRateTime > 0)
  assert.ok(Math.abs(result.totalMoistureRemoved - 45) < 1e-12)
})

test('lower final moisture increases falling-rate time', () => {
  const wet = calculateCombinedDryerTime({
    drySolidMass: 100,
    dryingArea: 10,
    constantDryingRate: 5,
    initialMoistureContent: 0.5,
    criticalMoistureContent: 0.2,
    finalMoistureContent: 0.08,
    equilibriumMoistureContent: 0.02,
  })
  const dry = calculateCombinedDryerTime({
    drySolidMass: 100,
    dryingArea: 10,
    constantDryingRate: 5,
    initialMoistureContent: 0.5,
    criticalMoistureContent: 0.2,
    finalMoistureContent: 0.04,
    equilibriumMoistureContent: 0.02,
  })
  assert.ok(dry.fallingRateTime > wet.fallingRateTime)
})

test('rejects invalid moisture ordering', () => {
  assert.throws(
    () => calculateCombinedDryerTime({
      drySolidMass: 100,
      dryingArea: 10,
      constantDryingRate: 5,
      initialMoistureContent: 0.5,
      criticalMoistureContent: 0.2,
      finalMoistureContent: 0.25,
      equilibriumMoistureContent: 0.02,
    }),
    (error: unknown) =>
      error instanceof CombinedDryerTimeCalculationError &&
      error.code === 'invalidMoistureOrdering',
  )
})
