import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch06CalculationError,
  calculateProofTestInterval,
} from '../../src/features/process-safety-economics/batch06/engine.ts'

const example = {
  dangerousFailureRate: 1e-6,
  diagnosticCoverageFraction: 0.7,
  meanRepairTimeHours: 24,
  commonCausePFD: 0.0001,
  targetAveragePFD: 0.001,
}

test('solves the maximum proof-test interval', () => {
  const result =
    calculateProofTestInterval(
      example,
    )

  const fixed =
    0.7e-6 *
    24 +
    0.0001

  const expected =
    2 *
    (
      0.001 -
      fixed
    ) /
    0.3e-6

  assert.ok(
    Math.abs(
      result.maximumProofTestIntervalHours -
      expected,
    ) < 1e-9,
  )
})

test('converts hours to days and years', () => {
  const result =
    calculateProofTestInterval(
      example,
    )

  assert.ok(
    Math.abs(
      result.maximumProofTestIntervalDays -
      result.maximumProofTestIntervalHours /
      24,
    ) < 1e-12,
  )
})

test('rejects an infeasible target', () => {
  assert.throws(
    () =>
      calculateProofTestInterval({
        ...example,
        targetAveragePFD: 0.00005,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch06CalculationError &&
      error.code ===
        'infeasibleProofTestTarget',
  )
})
