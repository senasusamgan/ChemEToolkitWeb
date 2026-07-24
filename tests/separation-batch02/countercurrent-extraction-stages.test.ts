import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CountercurrentExtractionStagesCalculationError,
  calculateCountercurrentExtractionStages,
} from '../../src/features/separation-processes/countercurrent-extraction-stages/engine.ts'

test('estimates ideal countercurrent stages', () => {
  const result = calculateCountercurrentExtractionStages({
    distributionCoefficient: 3,
    solventToRaffinateRatio: 0.5,
    targetSoluteRecoveryFraction: 0.95,
  })
  assert.equal(result.extractionFactor, 1.5)
  assert.ok(result.requiredIntegerStages >= 1)
  assert.ok(result.achievedRecoveryFraction >= 0.95)
})

test('uses the E equals one limiting relation', () => {
  const result = calculateCountercurrentExtractionStages({
    distributionCoefficient: 2,
    solventToRaffinateRatio: 0.5,
    targetSoluteRecoveryFraction: 0.8,
  })
  assert.equal(result.limitingCaseUsed, true)
})

test('rejects invalid distribution coefficient', () => {
  assert.throws(
    () => calculateCountercurrentExtractionStages({
      distributionCoefficient: 0,
      solventToRaffinateRatio: 0.5,
      targetSoluteRecoveryFraction: 0.8,
    }),
    (error: unknown) =>
      error instanceof CountercurrentExtractionStagesCalculationError &&
      error.code === 'nonPositiveProperty',
  )
})
