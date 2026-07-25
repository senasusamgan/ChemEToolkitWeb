import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch01CalculationError,
  calculateLiquidLeakRateScreening,
} from '../../src/features/process-safety-economics/batch01/engine.ts'

const example = {
  upstreamPressure: 500_000,
  downstreamPressure: 101_325,
  liquidDensity: 900,
  orificeDiameter: 0.01,
  dischargeCoefficient: 0.62,
  releaseDuration: 300,
}

test('calculates incompressible orifice leakage', () => {
  const result =
    calculateLiquidLeakRateScreening(
      example,
    )

  const area =
    Math.PI * 0.01 ** 2 / 4

  const expectedFlow =
    0.62 *
    area *
    Math.sqrt(
      2 *
      (500_000 - 101_325) /
      900,
    )

  assert.ok(
    Math.abs(
      result.volumetricLeakRate -
      expectedFlow,
    ) < 1e-15,
  )
  assert.ok(
    Math.abs(
      result.massLeakRate -
      900 * expectedFlow,
    ) < 1e-12,
  )
})

test('integrates released mass over duration', () => {
  const result =
    calculateLiquidLeakRateScreening(
      example,
    )

  assert.ok(
    Math.abs(
      result.releasedMass -
      result.massLeakRate * 300,
    ) < 1e-12,
  )
})

test('rejects reversed pressure conditions', () => {
  assert.throws(
    () =>
      calculateLiquidLeakRateScreening({
        ...example,
        upstreamPressure: 100_000,
        downstreamPressure: 200_000,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch01CalculationError &&
      error.code ===
        'invalidLiquidLeakInputs',
  )
})
