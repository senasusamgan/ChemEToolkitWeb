import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch06CalculationError,
  calculateSIFAveragePFD,
} from '../../src/features/process-safety-economics/batch06/engine.ts'

const example = {
  dangerousFailureRate: 1e-6,
  diagnosticCoverageFraction: 0.7,
  proofTestIntervalHours: 8760,
  meanRepairTimeHours: 24,
  commonCausePFD: 0.0001,
}

test('calculates proof-test and repair contributions', () => {
  const result =
    calculateSIFAveragePFD(
      example,
    )

  assert.ok(
    Math.abs(
      result.proofTestContribution -
      0.3e-6 *
      8760 /
      2,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.repairContribution -
      0.7e-6 *
      24,
    ) < 1e-15,
  )
})

test('risk-reduction factor is reciprocal PFD', () => {
  const result =
    calculateSIFAveragePFD(
      example,
    )

  assert.ok(
    Math.abs(
      result.riskReductionFactor -
      1 /
      result.averageProbabilityOfFailureOnDemand,
    ) < 1e-9,
  )
})

test('rejects diagnostic coverage above one', () => {
  assert.throws(
    () =>
      calculateSIFAveragePFD({
        ...example,
        diagnosticCoverageFraction: 1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch06CalculationError &&
      error.code ===
        'invalidSIFInputs',
  )
})
