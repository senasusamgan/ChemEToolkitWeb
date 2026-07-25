import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch02CalculationError,
  calculateStraightLineDepreciation,
} from '../../src/features/process-safety-economics/batch02/engine.ts'

test('calculates book value', () => {
  const result = calculateStraightLineDepreciation({
    initialAssetCost: 1_000_000,
    salvageValue: 100_000,
    usefulLifeYears: 10,
    elapsedYears: 4,
  })
  assert.equal(result.annualDepreciation, 90_000)
  assert.equal(result.bookValue, 640_000)
})

test('does not depreciate below salvage value', () => {
  const result = calculateStraightLineDepreciation({
    initialAssetCost: 1000,
    salvageValue: 100,
    usefulLifeYears: 5,
    elapsedYears: 10,
  })
  assert.equal(result.bookValue, 100)
  assert.equal(result.fullyDepreciated, true)
})

test('rejects salvage above initial cost', () => {
  assert.throws(
    () => calculateStraightLineDepreciation({
      initialAssetCost: 1000,
      salvageValue: 1200,
      usefulLifeYears: 5,
      elapsedYears: 1,
    }),
    (error: unknown) =>
      error instanceof ProcessSafetyEconomicsBatch02CalculationError &&
      error.code === 'invalidDepreciationInputs',
  )
})
