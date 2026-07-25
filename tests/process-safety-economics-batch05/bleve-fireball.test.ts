import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch05CalculationError,
  calculateBLEVEFireballScreening,
} from '../../src/features/process-safety-economics/batch05/engine.ts'

const example = {
  flammableMass: 10_000,
  heatOfCombustion: 46_000_000,
  radiantFraction: 0.3,
  atmosphericTransmissivity: 0.85,
  receptorDistance: 150,
}

test('calculates empirical fireball size and duration', () => {
  const result =
    calculateBLEVEFireballScreening(
      example,
    )

  assert.ok(
    Math.abs(
      result.fireballDiameter -
      6.48 * 10_000 ** 0.325,
    ) < 1e-12,
  )

  assert.ok(
    Math.abs(
      result.fireballDuration -
      0.852 * 10_000 ** 0.26,
    ) < 1e-12,
  )
})

test('radiation flux follows inverse-square distance', () => {
  const near =
    calculateBLEVEFireballScreening(
      example,
    )

  const far =
    calculateBLEVEFireballScreening({
      ...example,
      receptorDistance: 300,
    })

  assert.ok(
    Math.abs(
      near.thermalRadiationFlux /
      far.thermalRadiationFlux -
      4,
    ) < 1e-12,
  )
})

test('rejects radiant fraction above one', () => {
  assert.throws(
    () =>
      calculateBLEVEFireballScreening({
        ...example,
        radiantFraction: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch05CalculationError &&
      error.code ===
        'invalidBLEVEInputs',
  )
})
