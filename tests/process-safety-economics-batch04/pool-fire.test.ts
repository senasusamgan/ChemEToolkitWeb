import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch04CalculationError,
  calculatePoolFireRadiationScreening,
} from '../../src/features/process-safety-economics/batch04/engine.ts'

const example = {
  burningMassRate: 10,
  heatOfCombustion: 44_000_000,
  radiantFraction: 0.2,
  atmosphericTransmissivity: 0.85,
  receptorDistance: 50,
}

test('calculates point-source radiation flux', () => {
  const result =
    calculatePoolFireRadiationScreening(
      example,
    )

  const expected =
    10 *
    44_000_000 *
    0.2 *
    0.85 /
    (
      4 *
      Math.PI *
      50 ** 2
    )

  assert.ok(
    Math.abs(
      result.thermalRadiationFlux -
      expected,
    ) < 1e-9,
  )
})

test('flux decreases with square of distance', () => {
  const near =
    calculatePoolFireRadiationScreening(
      example,
    )

  const far =
    calculatePoolFireRadiationScreening({
      ...example,
      receptorDistance: 100,
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
      calculatePoolFireRadiationScreening({
        ...example,
        radiantFraction: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch04CalculationError &&
      error.code ===
        'invalidPoolFireInputs',
  )
})
