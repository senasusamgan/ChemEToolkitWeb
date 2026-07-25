import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch05CalculationError,
  calculateTNTEquivalentExplosionScreening,
} from '../../src/features/process-safety-economics/batch05/engine.ts'

const example = {
  flammableMass: 1000,
  heatOfCombustion: 46_000_000,
  explosionEfficiency: 0.05,
  receptorDistance: 100,
}

test('calculates TNT-equivalent mass', () => {
  const result =
    calculateTNTEquivalentExplosionScreening(
      example,
    )

  assert.ok(
    Math.abs(
      result.tntEquivalentMass -
      (
        1000 *
        46_000_000 *
        0.05 /
        4_680_000
      ),
    ) < 1e-12,
  )
})

test('overpressure decreases with distance', () => {
  const near =
    calculateTNTEquivalentExplosionScreening(
      example,
    )

  const far =
    calculateTNTEquivalentExplosionScreening({
      ...example,
      receptorDistance: 200,
    })

  assert.ok(
    near.estimatedPeakOverpressure >
    far.estimatedPeakOverpressure,
  )
})

test('rejects zero explosion efficiency', () => {
  assert.throws(
    () =>
      calculateTNTEquivalentExplosionScreening({
        ...example,
        explosionEfficiency: 0,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch05CalculationError &&
      error.code ===
        'invalidTNTInputs',
  )
})
