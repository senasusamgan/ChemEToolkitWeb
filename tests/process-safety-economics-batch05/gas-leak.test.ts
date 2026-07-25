import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch05CalculationError,
  calculateGasLeakRateScreening,
} from '../../src/features/process-safety-economics/batch05/engine.ts'

const example = {
  upstreamAbsolutePressure: 1_000_000,
  downstreamAbsolutePressure: 101_325,
  gasTemperature: 300,
  molecularWeight: 28,
  heatCapacityRatio: 1.4,
  dischargeCoefficient: 0.62,
  orificeDiameter: 0.01,
}

test('identifies choked gas release', () => {
  const result =
    calculateGasLeakRateScreening(
      example,
    )

  assert.equal(
    result.flowIsChoked,
    true,
  )
  assert.ok(
    result.massReleaseRate > 0,
  )
})

test('mass release equals flux times area', () => {
  const result =
    calculateGasLeakRateScreening(
      example,
    )

  assert.ok(
    Math.abs(
      result.massReleaseRate -
      result.massFlux *
      result.orificeArea,
    ) < 1e-15,
  )
})

test('rejects reversed pressure conditions', () => {
  assert.throws(
    () =>
      calculateGasLeakRateScreening({
        ...example,
        upstreamAbsolutePressure: 100_000,
        downstreamAbsolutePressure: 200_000,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch05CalculationError &&
      error.code ===
        'invalidGasLeakInputs',
  )
})
