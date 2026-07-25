import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PressureProcessDynamicsCalculationError,
  calculatePressureProcessDynamics,
} from '../../src/features/process-control/pressure-process-dynamics/engine.ts'

const example = {
  vesselVolume: 10,
  gasTemperature: 350,
  gasConstant: 8.314,
  molarInflowRate: 2,
  outletPressure: 100,
  pressureFlowResistance: 30,
  initialPressure: 100,
  evaluationTime: 0.5,
  maximumAllowablePressure: 175,
}

test('calculates the analytical vessel-pressure response', () => {
  const result = calculatePressureProcessDynamics(example)

  const tau = 10 * 30 / (8.314 * 350)
  const steady = 160
  const expected =
    steady + (100 - steady) * Math.exp(-0.5 / tau)

  assert.ok(
    Math.abs(result.processTimeConstant - tau) < 1e-12,
  )
  assert.equal(result.steadyStatePressure, steady)
  assert.ok(
    Math.abs(result.pressureAtEvaluationTime - expected) <
    1e-12,
  )
})

test('flags a steady-state overpressure risk', () => {
  const result = calculatePressureProcessDynamics({
    ...example,
    maximumAllowablePressure: 150,
  })

  assert.equal(result.overpressureRisk, true)
})

test('rejects zero pressure-flow resistance', () => {
  assert.throws(
    () => calculatePressureProcessDynamics({
      ...example,
      pressureFlowResistance: 0,
    }),
    (error: unknown) =>
      error instanceof
        PressureProcessDynamicsCalculationError &&
      error.code === 'nonPositiveResistance',
  )
})
