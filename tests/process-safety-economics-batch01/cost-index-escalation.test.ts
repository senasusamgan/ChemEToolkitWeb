import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch01CalculationError,
  calculateCostIndexEscalation,
} from '../../src/features/process-safety-economics/batch01/engine.ts'

test('escalates cost by index ratio', () => {
  const result =
    calculateCostIndexEscalation({
      historicalCost: 750_000,
      baseCostIndex: 550,
      targetCostIndex: 820,
      elapsedYears: 8,
    })

  assert.ok(
    Math.abs(
      result.escalatedCost -
      750_000 * 820 / 550,
    ) < 1e-9,
  )
})

test('equal indices produce zero change', () => {
  const result =
    calculateCostIndexEscalation({
      historicalCost: 1000,
      baseCostIndex: 500,
      targetCostIndex: 500,
      elapsedYears: 5,
    })

  assert.equal(
    result.costChangePercent,
    0,
  )
  assert.equal(
    result.annualizedEscalationRatePercent,
    0,
  )
})

test('rejects zero elapsed years', () => {
  assert.throws(
    () =>
      calculateCostIndexEscalation({
        historicalCost: 1000,
        baseCostIndex: 500,
        targetCostIndex: 600,
        elapsedYears: 0,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch01CalculationError &&
      error.code ===
        'invalidCostIndexInputs',
  )
})
