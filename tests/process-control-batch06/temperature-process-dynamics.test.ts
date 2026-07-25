import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch06CalculationError,
  calculateTemperatureProcessDynamics,
} from '../../src/features/process-control/batch06/engine.ts'

const example = {
  thermalCapacitance: 500,
  heatTransferConductance: 20,
  ambientTemperature: 25,
  heatInputRate: 1000,
  initialTemperature: 25,
  evaluationTime: 30,
  maximumAllowableTemperature: 80,
}

test('calculates the analytical thermal response', () => {
  const result =
    calculateTemperatureProcessDynamics(example)

  assert.equal(
    result.processTimeConstant,
    25,
  )
  assert.equal(
    result.steadyStateTemperature,
    75,
  )

  const expected =
    75 +
    (25 - 75) *
    Math.exp(-30 / 25)

  assert.ok(
    Math.abs(
      result.temperatureAtEvaluationTime -
      expected,
    ) < 1e-12,
  )
})

test('flags a steady-state overtemperature risk', () => {
  const result =
    calculateTemperatureProcessDynamics({
      ...example,
      maximumAllowableTemperature: 70,
    })

  assert.equal(
    result.overtemperatureRisk,
    true,
  )
})

test('rejects zero thermal capacitance', () => {
  assert.throws(
    () =>
      calculateTemperatureProcessDynamics({
        ...example,
        thermalCapacitance: 0,
      }),
    (error: unknown) =>
      error instanceof
        ProcessControlBatch06CalculationError &&
      error.code ===
        'invalidTemperatureProcessSettings',
  )
})
