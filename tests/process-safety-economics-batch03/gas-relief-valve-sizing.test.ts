import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch03CalculationError,
  calculateGasReliefValveSizing,
} from '../../src/features/process-safety-economics/batch03/engine.ts'

const example = {
  requiredMassFlowRate: 2,
  relievingAbsolutePressure: 1_000_000,
  backAbsolutePressure: 101_325,
  relievingTemperature: 350,
  molecularWeight: 28,
  compressibilityFactor: 0.95,
  heatCapacityRatio: 1.4,
  dischargeCoefficient: 0.9,
}

test('identifies choked gas flow', () => {
  const result =
    calculateGasReliefValveSizing(
      example,
    )

  assert.equal(
    result.chokedFlow,
    true,
  )
  assert.ok(
    result.requiredArea > 0,
  )
})

test('area and equivalent diameter are consistent', () => {
  const result =
    calculateGasReliefValveSizing(
      example,
    )

  assert.ok(
    Math.abs(
      result.requiredArea -
      Math.PI *
      result.equivalentDiameter ** 2 /
      4,
    ) < 1e-15,
  )
})

test('rejects pressure not exceeding back pressure', () => {
  assert.throws(
    () =>
      calculateGasReliefValveSizing({
        ...example,
        relievingAbsolutePressure:
          100_000,
        backAbsolutePressure:
          200_000,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch03CalculationError &&
      error.code ===
        'invalidGasReliefInputs',
  )
})
