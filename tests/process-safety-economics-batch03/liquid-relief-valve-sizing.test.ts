import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch03CalculationError,
  calculateLiquidReliefValveSizing,
} from '../../src/features/process-safety-economics/batch03/engine.ts'

const example = {
  requiredVolumetricFlowRate: 0.02,
  liquidDensity: 850,
  upstreamAbsolutePressure: 700_000,
  downstreamAbsolutePressure: 200_000,
  dischargeCoefficient: 0.62,
}

test('calculates required liquid relief area', () => {
  const result =
    calculateLiquidReliefValveSizing(
      example,
    )

  const velocity =
    0.62 *
    Math.sqrt(
      2 *
      500_000 /
      850,
    )

  assert.ok(
    Math.abs(
      result.requiredArea -
      0.02 / velocity,
    ) < 1e-15,
  )
})

test('calculates required mass flow', () => {
  const result =
    calculateLiquidReliefValveSizing(
      example,
    )

  assert.equal(
    result.requiredMassFlowRate,
    17,
  )
})

test('rejects invalid discharge coefficient', () => {
  assert.throws(
    () =>
      calculateLiquidReliefValveSizing({
        ...example,
        dischargeCoefficient: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch03CalculationError &&
      error.code ===
        'invalidLiquidReliefInputs',
  )
})
