import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DryingRateTimeCalculationError,
  calculateDryingRateTime,
} from '../../src/features/mass-transfer/drying-rate-time/engine.ts'

const example = {
  drySolidMass: 100,
  dryingArea: 10,
  constantDryingFlux: 2,
  initialMoistureContent: 0.5,
  criticalMoistureContent: 0.2,
  equilibriumMoistureContent: 0.05,
  finalMoistureContent: 0.1,
}

test('drying computes constant-rate and falling-rate periods', () => {
  const result = calculateDryingRateTime(example)
  assert.ok(Math.abs(result.constantRateTime - 1.5) < 1e-12)
  assert.ok(Math.abs(result.fallingRateTime - 0.8239592165010825) < 1e-12)
  assert.ok(Math.abs(result.totalDryingTime - 2.3239592165010823) < 1e-12)
  assert.ok(Math.abs(result.averageDryingFlux - 1.7212006009392622) < 1e-12)
  assert.ok(Math.abs(result.finalDryingFlux - 0.6666666666666666) < 1e-12)
  assert.ok(Math.abs(result.removedMoistureMass - 40) < 1e-12)
})

test('drying uses only the constant-rate period at the critical boundary', () => {
  const result = calculateDryingRateTime({ ...example, finalMoistureContent: 0.2 })
  assert.ok(Math.abs(result.constantRateTime - 1.5) < 1e-12)
  assert.equal(result.fallingRateTime, 0)
  assert.equal(result.finalDryingFlux, 2)
})

test('drying rejects a target at equilibrium', () => {
  assert.throws(
    () => calculateDryingRateTime({ ...example, finalMoistureContent: 0.05 }),
    (error) => error instanceof DryingRateTimeCalculationError && error.code === 'finalAtOrBelowEquilibrium',
  )
})
